import fs from 'node:fs';
import path from 'node:path';
import { Op } from 'sequelize';
import { config } from '../config/index.js';
import { models } from '../models/index.js';
import { logger } from './logger.service.js';
import { deleteUpload, toDiskPath, toUploadPath } from './upload.service.js';
import { makeVersions } from './video.service.js';

export const BANNER_FOLDER = 'banners';

// Converted files live in a folder per video: /uploads/banners/<id>/<stamp>-low.mp4
export const videoFolder = (id) => `${BANNER_FOLDER}/${id}`;
const videoDir = (id) => path.join(config.uploads.dir, BANNER_FOLDER, String(id));
const toVideoPath = (id, file) => toUploadPath(videoFolder(id), path.basename(file));

// Videos are converted one at a time so the server stays responsive.
let chain = Promise.resolve();
const waiting = new Set();
let converting = [];

// Uploads being converted right now may be locked, so only their job deletes them.
export const isConverting = (uploadPath) => converting.includes(uploadPath);

export const liveFiles = (video) => [video.poster, ...(video.sources || []).map((source) => source.src)].filter(Boolean);

const removeFiles = (files) => Promise.all(files.map((file) => fs.promises.rm(file, { force: true })));

const convert = async (id) => {
  waiting.delete(id);
  const video = await models.BannerVideo.findByPk(id);
  if (!video?.pending_video) return;

  const upload = video.pending_video;
  const posterUpload = video.pending_poster;
  converting = [upload, posterUpload].filter(Boolean);
  try {
    let result;
    let failure;
    try {
      result = await makeVersions(toDiskPath(upload), videoDir(id), {
        poster: posterUpload ? toDiskPath(posterUpload) : undefined,
      });
    } catch (err) {
      failure = err.message.slice(0, 255);
    }

    // The video may have been deleted or given a newer upload while this one was converting.
    const current = await models.BannerVideo.findByPk(id);
    const stillWanted = current?.pending_video == upload;
    if (!stillWanted) {
      if (result) await removeFiles([result.poster, ...result.sources.map((source) => source.file)]);
      if (!current) await fs.promises.rm(videoDir(id), { recursive: true, force: true });
    } else if (failure) {
      logger.warn(`Banner video ${id} failed to convert: ${failure}`);
      await current.update({ status: 'failed', error: failure, pending_video: null, pending_poster: null });
    } else {
      const oldFiles = liveFiles(current);
      await current.update({
        status: 'ready',
        error: null,
        duration: result.duration,
        poster: toVideoPath(id, result.poster),
        sources: result.sources.map(({ quality, file, width, height, size }) => ({
          quality,
          src: toVideoPath(id, file),
          width,
          height,
          size,
        })),
        pending_video: null,
        pending_poster: null,
      });
      await Promise.all(oldFiles.map(deleteUpload));
    }

    await deleteUpload(upload);
    if (posterUpload && current?.pending_poster != posterUpload) await deleteUpload(posterUpload);
  } finally {
    converting = [];
  }
};

export const enqueue = (id) => {
  if (waiting.has(id)) return;
  waiting.add(id);
  chain = chain
    .then(() => convert(id))
    .catch((err) => logger.error(`Banner video ${id} conversion crashed: ${err.stack || err.message}`));
};

// Resolves once every queued conversion has finished.
export const idle = async () => {
  let current;
  do {
    current = chain;
    await current;
  } while (current != chain);
};

// Uploads still waiting when the server stopped.
export const requeuePending = async () => {
  const videos = await models.BannerVideo.findAll({
    where: { pending_video: { [Op.ne]: null } },
    attributes: ['id'],
    order: [['id', 'ASC']],
  });
  videos.forEach((video) => enqueue(video.id));
  return videos.length;
};
