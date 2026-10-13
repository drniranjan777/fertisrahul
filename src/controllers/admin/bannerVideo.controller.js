import fs from 'node:fs';
import path from 'node:path';
import { config } from '../../config/index.js';
import * as bannerVideoRepo from '../../repositories/admin/bannerVideo.repository.js';
import { deleteUpload, toUploadPath, uploadedPath } from '../../services/upload.service.js';
import { checkVideo, makePosterImage } from '../../services/video.service.js';
import {
  BANNER_FOLDER,
  enqueue,
  isConverting,
  liveFiles,
  videoFolder,
} from '../../services/videoQueue.service.js';
import { successResponse, errorResponse, HTTP_STATUS } from '../../utils/index.js';

const NOT_FOUND = 'Banner video not found';
const KEEP_DEFAULT = 'Make another video the default first';

const bySortOrder = (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name);

export const toAdminBannerVideo = (video) => {
  const states = [...(video.states || [])].sort(bySortOrder).map(({ id, name, slug }) => ({ id, name, slug }));
  return {
    id: video.id,
    name: video.name,
    is_default: video.is_default,
    is_active: video.is_active,
    sort_order: video.sort_order,
    status: video.status,
    error: video.error,
    pending: Boolean(video.pending_video),
    duration: video.duration,
    poster: video.poster,
    sources: video.sources,
    states,
    state_ids: states.map((state) => state.id),
  };
};

const fetched = async (id) => toAdminBannerVideo(await bannerVideoRepo.findById(id));

const findConflict = async ({ name }, currentId = null) => {
  const existing = name ? await bannerVideoRepo.findByName(name) : null;
  return existing && existing.id != currentId ? 'A banner video with this name already exists' : null;
};

// The saved video after this request: { is_default, is_active, state_ids }.
const findProblem = async ({ is_default, is_active, state_ids }, current) => {
  if (current?.is_default && !is_default) return KEEP_DEFAULT;
  if (is_default && !is_active) return "The default video can't be turned off";
  if (is_default && state_ids.length) {
    return "The default video is shown for every other state, so it can't have states.";
  }
  if (!is_default && !state_ids.length) return 'Pick at least one state.';
  if ((await bannerVideoRepo.countStates(state_ids)) != state_ids.length) return 'Some states were not found.';

  const clashes = await bannerVideoRepo.findStateClashes(state_ids, current?.id);
  return clashes.map(({ state, video }) => `${state} already uses the video "${video}".`).join(' ') || null;
};

const uploadedFile = (req, field) => req.files?.[field]?.[0]?.path;

// An upload replaced before its turn in the queue is deleted now; one being converted is deleted by its job.
const discard = (upload) => (upload && !isConverting(upload) ? deleteUpload(upload) : null);

export const list = async (req, res) => {
  const videos = await bannerVideoRepo.findAll();
  return successResponse(res, 'Banner videos fetched', videos.map(toAdminBannerVideo));
};

export const getById = async (req, res) => {
  const video = await bannerVideoRepo.findById(req.params.id);
  if (!video) return errorResponse(res, NOT_FOUND, null, HTTP_STATUS.NOT_FOUND);
  return successResponse(res, 'Banner video fetched', toAdminBannerVideo(video));
};

export const create = async (req, res) => {
  const file = uploadedFile(req, 'video');
  if (!file) return errorResponse(res, 'Upload a video', null, HTTP_STATUS.BAD_REQUEST);

  const { state_ids, ...payload } = req.body;
  const problem = await findProblem(req.body);
  if (problem) return errorResponse(res, problem, null, HTTP_STATUS.BAD_REQUEST);

  const conflict = await findConflict(req.body);
  if (conflict) return errorResponse(res, conflict, null, HTTP_STATUS.CONFLICT);

  await checkVideo(file);

  const id = await bannerVideoRepo.create(
    {
      ...payload,
      status: 'processing',
      pending_video: uploadedPath(req, BANNER_FOLDER, 'video'),
      pending_poster: uploadedPath(req, BANNER_FOLDER, 'poster') ?? null,
    },
    state_ids
  );
  enqueue(id);
  return successResponse(res, 'Banner video created', await fetched(id), HTTP_STATUS.CREATED);
};

export const update = async (req, res) => {
  const video = await bannerVideoRepo.findById(req.params.id);
  if (!video) return errorResponse(res, NOT_FOUND, null, HTTP_STATUS.NOT_FOUND);

  const { state_ids, ...payload } = req.body;
  const problem = await findProblem(
    {
      is_default: payload.is_default ?? video.is_default,
      is_active: payload.is_active ?? video.is_active,
      state_ids: state_ids ?? (await bannerVideoRepo.stateIdsOf(video.id)),
    },
    video
  );
  if (problem) return errorResponse(res, problem, null, HTTP_STATUS.BAD_REQUEST);

  const conflict = await findConflict(req.body, video.id);
  if (conflict) return errorResponse(res, conflict, null, HTTP_STATUS.CONFLICT);

  const newVideo = uploadedPath(req, BANNER_FOLDER, 'video');
  const newPoster = uploadedPath(req, BANNER_FOLDER, 'poster');
  const replaced = [];

  if (newVideo) {
    await checkVideo(uploadedFile(req, 'video'));
    replaced.push(video.pending_video, video.pending_poster);
    Object.assign(payload, { status: 'processing', error: null, pending_video: newVideo, pending_poster: newPoster ?? null });
  } else if (newPoster && video.pending_video) {
    replaced.push(video.pending_poster);
    payload.pending_poster = newPoster;
  } else if (newPoster) {
    const poster = await makePosterImage(uploadedFile(req, 'poster'), path.join(config.uploads.dir, videoFolder(video.id)));
    replaced.push(video.poster);
    payload.poster = toUploadPath(videoFolder(video.id), path.basename(poster));
    await deleteUpload(newPoster);
  }

  await bannerVideoRepo.update(video, payload, state_ids);
  await Promise.all(replaced.map(discard));
  if (newVideo) enqueue(video.id);

  return successResponse(res, 'Banner video updated', await fetched(video.id));
};

export const remove = async (req, res) => {
  const video = await bannerVideoRepo.findById(req.params.id);
  if (!video) return errorResponse(res, NOT_FOUND, null, HTTP_STATUS.NOT_FOUND);
  if (video.is_default) return errorResponse(res, KEEP_DEFAULT, null, HTTP_STATUS.CONFLICT);

  await bannerVideoRepo.remove(video);
  await Promise.all([...liveFiles(video), video.pending_video, video.pending_poster].map(discard));
  await fs.promises.rm(path.join(config.uploads.dir, videoFolder(video.id)), { recursive: true, force: true });
  return successResponse(res, 'Banner video deleted');
};
