import * as homeBannerRepo from '../../repositories/admin/homeBanner.repository.js';
import { successResponse, errorResponse, HTTP_STATUS } from '../../utils/index.js';

const FIELDS = [
  'title_line1',
  'title_line2',
  'title_line3',
  'highlight',
  'primary_label',
  'primary_link',
  'secondary_label',
  'secondary_link',
];

const EMPTY = { ...Object.fromEntries(FIELDS.map((field) => [field, null])), title_line1: '' };

const toAdminBanner = (banner) => (banner ? Object.fromEntries(FIELDS.map((field) => [field, banner[field]])) : EMPTY);

const findProblem = (banner) => {
  const lines = [banner.title_line1, banner.title_line2, banner.title_line3].filter(Boolean);
  if (banner.highlight && !lines.some((line) => line.includes(banner.highlight))) {
    return 'The highlight must be part of one of the headline lines';
  }
  if (!banner.secondary_label != !banner.secondary_link) {
    return 'Give the second button both a label and a link, or leave both empty';
  }
  return null;
};

export const get = async (req, res) =>
  successResponse(res, 'Home banner fetched', toAdminBanner(await homeBannerRepo.find()));

export const save = async (req, res) => {
  const payload = Object.fromEntries(FIELDS.map((field) => [field, req.body[field] || null]));
  const problem = findProblem(payload);
  if (problem) return errorResponse(res, problem, null, HTTP_STATUS.BAD_REQUEST);

  return successResponse(res, 'Home banner saved', toAdminBanner(await homeBannerRepo.save(payload)));
};
