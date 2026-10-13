import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { config } from '../config/index.js';

export const MAX_FILE_MB = 10;

const FILE_RULES = {
  image: {
    types: { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' },
    message: 'Image must be a JPG, PNG or WebP file',
  },
  pdf: {
    types: { '.pdf': 'application/pdf' },
    message: 'Product info must be a PDF file',
  },
};

const badRequest = (message) => Object.assign(new Error(message), { statusCode: 400 });

export const toUploadPath = (folder, filename) => `/uploads/${folder}/${filename}`;

const toDiskPath = (uploadPath) => path.join(config.uploads.dir, uploadPath.replace(/^\/uploads\//, ''));

export const deleteUpload = async (uploadPath) => {
  if (!uploadPath?.startsWith('/uploads/')) return;
  await fs.promises.rm(toDiskPath(uploadPath), { force: true });
};

// A request that ends in an error keeps none of its files.
const removeFilesOnFailure = (req, res) => {
  res.on('finish', () => {
    if (res.statusCode < 400) return;
    Object.values(req.files || {})
      .flat()
      .forEach((file) => fs.rmSync(file.path, { force: true }));
  });
};

export const uploadFiles = (folder, fields) => {
  const dir = path.join(config.uploads.dir, folder);
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => fs.mkdir(dir, { recursive: true }, (err) => cb(err, dir)),
      filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
      },
    }),
    limits: { fileSize: MAX_FILE_MB * 1024 * 1024, files: fields.length },
    fileFilter: (req, file, cb) => {
      const rule = FILE_RULES[file.fieldname];
      const ext = path.extname(file.originalname).toLowerCase();
      if (rule.types[ext] && rule.types[ext] == file.mimetype) return cb(null, true);
      cb(badRequest(rule.message));
    },
  }).fields(fields.map((name) => ({ name, maxCount: 1 })));

  return (req, res, next) => {
    removeFilesOnFailure(req, res);
    upload(req, res, next);
  };
};

export const uploadedPath = (req, folder, field) => {
  const file = req.files?.[field]?.[0];
  return file ? toUploadPath(folder, file.filename) : undefined;
};
