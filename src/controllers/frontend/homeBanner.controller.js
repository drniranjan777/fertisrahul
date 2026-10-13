import * as homeBannerRepo from '../../repositories/frontend/homeBanner.repository.js';
import { successResponse } from '../../utils/index.js';

const toPublicVideo = (video) =>
  video ? { poster: video.poster, duration: video.duration, sources: video.sources } : null;

const buttonsOf = (banner) =>
  [
    { label: banner?.primary_label, link: banner?.primary_link, style: 'primary' },
    { label: banner?.secondary_label, link: banner?.secondary_link, style: 'secondary' },
  ].filter((button) => button.label && button.link);

// Never a 404: an unknown or unset state gets the default video.
export const get = async (req, res) => {
  const { state } = req.query;
  const [banner, stateVideo] = await Promise.all([
    homeBannerRepo.findBanner(),
    state ? homeBannerRepo.findStateVideo(state) : null,
  ]);
  const video = stateVideo ?? (await homeBannerRepo.findDefaultVideo());

  return successResponse(res, 'Home banner fetched', {
    title: [banner?.title_line1, banner?.title_line2, banner?.title_line3].filter(Boolean),
    highlight: banner?.highlight ?? null,
    buttons: buttonsOf(banner),
    state: stateVideo ? state : null,
    video: toPublicVideo(video),
  });
};
