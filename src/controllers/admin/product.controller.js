import * as productRepo from '../../repositories/admin/product.repository.js';
import { deleteUpload, uploadedPath } from '../../services/upload.service.js';
import { successResponse, errorResponse, HTTP_STATUS, makeSlug } from '../../utils/index.js';
import { toAdminProduct } from '../../utils/product.util.js';
import { cleanRichText } from '../../utils/richText.util.js';

const FOLDER = 'products';
const NOT_FOUND = 'Product not found';
const NO_SLUG = 'Could not build a slug from the name';
const LINK_KEYS = ['application_ids', 'crop_ids', 'recommended_crop_ids'];

const findConflict = async ({ name, slug }, currentId = null) => {
  const byName = name ? await productRepo.findByName(name) : null;
  if (byName && byName.id != currentId) return 'A product with this name already exists';

  const bySlug = slug ? await productRepo.findBySlug(slug) : null;
  if (bySlug && bySlug.id != currentId) return 'A product with this slug already exists';

  return null;
};

const findMissingLink = async (body) => {
  if (body.category_id && !(await productRepo.allExist('Category', [body.category_id]))) return 'Category not found';
  if (body.brand_id && !(await productRepo.allExist('Brand', [body.brand_id]))) return 'Brand not found';
  if (body.application_ids && !(await productRepo.allExist('Application', body.application_ids))) {
    return 'Some applications were not found';
  }
  if (body.crop_ids && !(await productRepo.allExist('Crop', body.crop_ids))) return 'Some crops were not found';
  if (body.recommended_crop_ids && !(await productRepo.allExist('Crop', body.recommended_crop_ids))) {
    return 'Some recommended crops were not found';
  }
  return null;
};

const splitBody = (body) => {
  const payload = { ...body };
  const links = {};
  LINK_KEYS.forEach((key) => {
    links[key] = payload[key];
    delete payload[key];
  });
  if ('headline' in payload) payload.headline = payload.headline || null;
  if ('body' in payload) payload.body = cleanRichText(payload.body);
  if (payload.application) {
    payload.application = payload.application.map(({ stage, recommendation }) => ({
      stage: stage || null,
      recommendation,
    }));
  }
  return { payload, links };
};

const fetched = async (id) => toAdminProduct(await productRepo.findById(id));

export const list = async (req, res) =>
  successResponse(res, 'Products fetched', await productRepo.findAll(req.query));

export const getById = async (req, res) => {
  const product = await productRepo.findById(req.params.id);
  if (!product) return errorResponse(res, NOT_FOUND, null, HTTP_STATUS.NOT_FOUND);
  return successResponse(res, 'Product fetched', toAdminProduct(product));
};

export const create = async (req, res) => {
  const image = uploadedPath(req, FOLDER, 'image');
  if (!image) return errorResponse(res, 'Upload a product image', null, HTTP_STATUS.BAD_REQUEST);

  const slug = makeSlug(req.body.slug || req.body.name);
  if (!slug) return errorResponse(res, NO_SLUG, null, HTTP_STATUS.BAD_REQUEST);

  const missing = await findMissingLink(req.body);
  if (missing) return errorResponse(res, missing, null, HTTP_STATUS.BAD_REQUEST);

  const conflict = await findConflict({ name: req.body.name, slug });
  if (conflict) return errorResponse(res, conflict, null, HTTP_STATUS.CONFLICT);

  const { payload, links } = splitBody({ ...req.body, slug });
  const id = await productRepo.create({ ...payload, image, pdf: uploadedPath(req, FOLDER, 'pdf') ?? null }, links);
  return successResponse(res, 'Product created', await fetched(id), HTTP_STATUS.CREATED);
};

// An empty or missing slug keeps the current one, so renaming never breaks website links.
export const update = async (req, res) => {
  const product = await productRepo.findById(req.params.id);
  if (!product) return errorResponse(res, NOT_FOUND, null, HTTP_STATUS.NOT_FOUND);

  const { remove_pdf, ...body } = req.body;
  if (body.slug) {
    body.slug = makeSlug(body.slug);
    if (!body.slug) return errorResponse(res, NO_SLUG, null, HTTP_STATUS.BAD_REQUEST);
  } else {
    delete body.slug;
  }

  const missing = await findMissingLink(body);
  if (missing) return errorResponse(res, missing, null, HTTP_STATUS.BAD_REQUEST);

  const conflict = await findConflict(body, product.id);
  if (conflict) return errorResponse(res, conflict, null, HTTP_STATUS.CONFLICT);

  const { payload, links } = splitBody(body);
  const image = uploadedPath(req, FOLDER, 'image');
  const pdf = uploadedPath(req, FOLDER, 'pdf');
  if (image) payload.image = image;
  if (pdf) payload.pdf = pdf;
  else if (remove_pdf) payload.pdf = null;

  const replacedFiles = [image && product.image, (pdf || remove_pdf) && product.pdf].filter(Boolean);
  await productRepo.update(product, payload, links);
  await Promise.all(replacedFiles.map(deleteUpload));

  return successResponse(res, 'Product updated', await fetched(product.id));
};

export const remove = async (req, res) => {
  const product = await productRepo.findById(req.params.id);
  if (!product) return errorResponse(res, NOT_FOUND, null, HTTP_STATUS.NOT_FOUND);

  const used = await productRepo.countCropDetailsUsing(product.id);
  if (used) {
    const users = used == 1 ? '1 crop detail uses' : `${used} crop details use`;
    return errorResponse(
      res,
      `Can't delete this product: ${users} it in a schedule. Deactivate it instead.`,
      null,
      HTTP_STATUS.CONFLICT
    );
  }

  await productRepo.remove(product);
  await Promise.all([product.image, product.pdf].filter(Boolean).map(deleteUpload));
  return successResponse(res, 'Product deleted');
};
