import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';
import { MASTERS } from '../config/masters.js';
import { models } from '../models/index.js';
import * as cropDetailRepo from '../repositories/admin/cropDetail.repository.js';
import * as productRepo from '../repositories/admin/product.repository.js';
import { logger } from '../services/logger.service.js';
import { toUploadPath } from '../services/upload.service.js';
import { makeSlug } from '../utils/index.js';
import { paragraphsToHtml } from '../utils/richText.util.js';
import { DEFAULT_VIDEO_SEED, HOME_BANNER_SEED } from './data/banner.js';
import { CROP_DESCRIPTION, CROP_DETAIL_SEEDS } from './data/crops.js';
import { MASTER_SEEDS } from './data/masters.js';
import { PRODUCT_SEEDS } from './data/products.js';

export const seedAdmin = async () => {
  const { name, email, password } = config.seedAdmin;
  if (!email || !password) {
    logger.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set; skipping admin seed.');
    return;
  }

  const existing = await models.Admin.findOne({ where: { email: email.trim().toLowerCase() } });
  if (existing) {
    logger.info(`Admin already exists: ${existing.email}`);
    return;
  }

  await models.Admin.create({ name, email, password: await bcrypt.hash(password, 10) });
  logger.info(`Seeded admin: ${email}`);
};

// Only an empty table is seeded, so rows the admin deleted are not re-created on restart.
export const seedMasters = async () => {
  for (const { model, plural } of MASTERS) {
    const names = MASTER_SEEDS[model] || [];
    if (!names.length || (await models[model].count())) continue;

    await models[model].bulkCreate(
      names.map((name, index) => ({ name, slug: makeSlug(name), sort_order: (index + 1) * 10 }))
    );
    logger.info(`Seeded ${names.length} ${plural.toLowerCase()}`);
  }
};

const SEED_DATA = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');

// Masters a seeded product names are created when missing, after the existing rows.
const masterId = async (modelName, name) => {
  const slug = makeSlug(name);
  const existing = await models[modelName].findOne({ where: { slug } });
  if (existing) return existing.id;

  const last = (await models[modelName].max('sort_order')) || 0;
  return (await models[modelName].create({ name, slug, sort_order: last + 10 })).id;
};

const masterIds = async (modelName, names) => {
  const ids = [];
  for (const name of names) ids.push(await masterId(modelName, name));
  return ids;
};

// Seed photos and videos live in data/<folder> and are copied to uploads/<folder>.
const copySeedFile = async (file, folder = 'products') => {
  const dir = path.join(config.uploads.dir, folder);
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.copyFile(path.join(SEED_DATA, folder, file), path.join(dir, `seed-${file}`));
  return toUploadPath(folder, `seed-${file}`);
};

// Like the masters, products are only seeded into an empty table.
export const seedProducts = async () => {
  if (await models.Product.count()) return;

  for (const [index, seed] of PRODUCT_SEEDS.entries()) {
    const { category, brand, applications, crops, recommended_crops, image, body, ...fields } = seed;
    await productRepo.create(
      {
        ...fields,
        body: paragraphsToHtml(body),
        category_id: await masterId('Category', category),
        brand_id: await masterId('Brand', brand),
        image: await copySeedFile(image),
        sort_order: (index + 1) * 10,
      },
      {
        application_ids: await masterIds('Application', applications),
        crop_ids: await masterIds('Crop', crops),
        recommended_crop_ids: await masterIds('Crop', recommended_crops),
      }
    );
  }
  logger.info(`Seeded ${PRODUCT_SEEDS.length} products`);
};

// Crops a crop page needs are added to the Crop master when missing. No schedules are seeded,
// because the live site shows the same placeholder schedule for every crop.
export const seedCropDetails = async () => {
  if (await models.CropDetail.count()) return;

  for (const { crop, image, types } of CROP_DETAIL_SEEDS) {
    await cropDetailRepo.create(
      {
        crop_id: await masterId('Crop', crop),
        image: await copySeedFile(image, 'crops'),
        description: CROP_DESCRIPTION,
      },
      { type_ids: await masterIds('CropType', types), schedules: [] }
    );
  }
  logger.info(`Seeded ${CROP_DETAIL_SEEDS.length} crop details`);
};

export const seedHomeBanner = async () => {
  if (await models.HomeBanner.count()) return;
  await models.HomeBanner.create(HOME_BANNER_SEED);
  logger.info('Seeded the home banner');
};

// The live video becomes the default. The server converts it on start (see requeuePending).
export const seedBannerVideos = async () => {
  if (await models.BannerVideo.count()) return;
  const { name, video, poster } = DEFAULT_VIDEO_SEED;
  await models.BannerVideo.create({
    name,
    is_default: true,
    sort_order: 10,
    status: 'processing',
    pending_video: await copySeedFile(video, 'banners'),
    pending_poster: await copySeedFile(poster, 'banners'),
  });
  logger.info('Seeded the default banner video');
};

export const runSeeders = async () => {
  await seedAdmin();
  await seedMasters();
  await seedProducts();
  await seedCropDetails();
  await seedHomeBanner();
  await seedBannerVideos();
};
