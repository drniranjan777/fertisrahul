import * as cropDetailRepo from '../../repositories/admin/cropDetail.repository.js';
import { deleteUpload, uploadedPath } from '../../services/upload.service.js';
import { successResponse, errorResponse, HTTP_STATUS } from '../../utils/index.js';
import { toAdminCropDetail, toAdminCropDetailRow } from '../../utils/cropDetail.util.js';

const FOLDER = 'crops';
const NOT_FOUND = 'Crop detail not found';

const findMissingLink = async ({ crop_id, type_ids, schedules }) => {
  if (crop_id && !(await cropDetailRepo.allExist('Crop', [crop_id]))) return 'Crop not found';
  if (type_ids && !(await cropDetailRepo.allExist('CropType', type_ids))) return 'Some crop types were not found';
  if (schedules) {
    const methodIds = schedules.map((schedule) => schedule.application_id);
    if (!(await cropDetailRepo.allExist('Application', methodIds))) return 'Some methods were not found';

    const productIds = [...new Set(schedules.flatMap((schedule) => schedule.rows.map((row) => row.product_id)))];
    if (!(await cropDetailRepo.allExist('Product', productIds))) return 'Some products were not found';
  }
  return null;
};

const findConflict = async ({ crop_id }, currentId = null) => {
  const existing = crop_id ? await cropDetailRepo.findByCropId(crop_id) : null;
  return existing && existing.id != currentId ? 'This crop already has crop details' : null;
};

const splitBody = ({ type_ids, schedules, ...payload }) => ({
  payload,
  lists: {
    type_ids,
    schedules: schedules?.map(({ application_id, rows }) => ({
      application_id,
      rows: rows.map((row) => ({
        ...row,
        label: row.label || null,
        applications: row.applications || null,
        dose: row.dose || null,
      })),
    })),
  },
});

const fetched = async (id) => toAdminCropDetail(await cropDetailRepo.findById(id));

export const list = async (req, res) => {
  const page = await cropDetailRepo.findAll(req.query);
  return successResponse(res, 'Crop details fetched', { ...page, rows: page.rows.map(toAdminCropDetailRow) });
};

export const getById = async (req, res) => {
  const detail = await cropDetailRepo.findById(req.params.id);
  if (!detail) return errorResponse(res, NOT_FOUND, null, HTTP_STATUS.NOT_FOUND);
  return successResponse(res, 'Crop detail fetched', toAdminCropDetail(detail));
};

export const create = async (req, res) => {
  const image = uploadedPath(req, FOLDER, 'image');
  if (!image) return errorResponse(res, 'Upload a crop photo', null, HTTP_STATUS.BAD_REQUEST);

  const missing = await findMissingLink(req.body);
  if (missing) return errorResponse(res, missing, null, HTTP_STATUS.BAD_REQUEST);

  const conflict = await findConflict(req.body);
  if (conflict) return errorResponse(res, conflict, null, HTTP_STATUS.CONFLICT);

  const { payload, lists } = splitBody(req.body);
  const id = await cropDetailRepo.create({ ...payload, image }, lists);
  return successResponse(res, 'Crop detail created', await fetched(id), HTTP_STATUS.CREATED);
};

export const update = async (req, res) => {
  const detail = await cropDetailRepo.findById(req.params.id);
  if (!detail) return errorResponse(res, NOT_FOUND, null, HTTP_STATUS.NOT_FOUND);

  const missing = await findMissingLink(req.body);
  if (missing) return errorResponse(res, missing, null, HTTP_STATUS.BAD_REQUEST);

  const conflict = await findConflict(req.body, detail.id);
  if (conflict) return errorResponse(res, conflict, null, HTTP_STATUS.CONFLICT);

  const { payload, lists } = splitBody(req.body);
  const image = uploadedPath(req, FOLDER, 'image');
  const oldImage = detail.image;
  if (image) payload.image = image;

  await cropDetailRepo.update(detail, payload, lists);
  if (image) await deleteUpload(oldImage);

  return successResponse(res, 'Crop detail updated', await fetched(detail.id));
};

export const remove = async (req, res) => {
  const detail = await cropDetailRepo.findById(req.params.id);
  if (!detail) return errorResponse(res, NOT_FOUND, null, HTTP_STATUS.NOT_FOUND);

  await cropDetailRepo.remove(detail);
  await deleteUpload(detail.image);
  return successResponse(res, 'Crop detail deleted');
};
