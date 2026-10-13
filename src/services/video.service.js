import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import ffmpegPath from 'ffmpeg-static';
import ffprobe from 'ffprobe-static';

const run = promisify(execFile);

export const MAX_VIDEO_SECONDS = 30;
const MAX_FPS = 30;
const POSTER_WIDTH = 1280;
const POSTER_QUALITY = 70;

// Lightest first. A version is never taller than the source.
export const VERSIONS = [
  { quality: 'low', height: 360, bitrate: 250, maxrate: 300 },
  { quality: 'medium', height: 540, bitrate: 700, maxrate: 850 },
  { quality: 'high', height: 720, bitrate: 1500, maxrate: 1800 },
];

const badRequest = (message) => Object.assign(new Error(message), { statusCode: 400 });

const ffmpeg = (args) => run(ffmpegPath, ['-v', 'error', '-nostdin', '-y', ...args], { timeout: 10 * 60 * 1000 });

const frameRate = (rate) => {
  const [num, den] = String(rate || '').split('/').map(Number);
  return num && den ? num / den : 0;
};

export const probeVideo = async (file) => {
  try {
    const { stdout } = await run(ffprobe.path, [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height,avg_frame_rate:stream_tags=rotate:format=duration',
      '-of', 'json',
      file,
    ]);
    const info = JSON.parse(stdout);
    const stream = info.streams?.[0];
    const duration = Number(info.format?.duration);
    if (!stream?.width || !stream?.height || !duration) return null;

    // Phone clips are often stored sideways with a rotate tag; ffmpeg turns them upright when encoding.
    const sideways = [90, 270].includes(Math.abs(Number(stream.tags?.rotate)));
    return {
      duration: Math.round(duration * 10) / 10,
      width: sideways ? stream.height : stream.width,
      height: sideways ? stream.width : stream.height,
      fps: frameRate(stream.avg_frame_rate),
    };
  } catch {
    return null;
  }
};

export const checkVideo = async (file) => {
  const info = await probeVideo(file);
  if (!info) throw badRequest('This file is not a readable video');
  if (info.duration > MAX_VIDEO_SECONDS) throw badRequest(`Video must be ${MAX_VIDEO_SECONDS} seconds or shorter`);
  return info;
};

const versionsFor = (sourceHeight) => {
  const even = sourceHeight - (sourceHeight % 2);
  const versions = [];
  VERSIONS.forEach((version) => {
    const height = Math.min(version.height, even);
    if (height > (versions.at(-1)?.height ?? 0)) versions.push({ ...version, height });
  });
  return versions;
};

const encodeVersion = (input, output, version, fps) => {
  const filters = [`scale=-2:${version.height}`];
  if (fps > MAX_FPS) filters.push(`fps=${MAX_FPS}`);
  return ffmpeg([
    '-i', input,
    '-an',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-profile:v', 'main',
    '-pix_fmt', 'yuv420p',
    '-vf', filters.join(','),
    '-b:v', `${version.bitrate}k`,
    '-maxrate', `${version.maxrate}k`,
    '-bufsize', `${version.maxrate * 2}k`,
    '-movflags', '+faststart',
    output,
  ]);
};

let webpSupport;
const hasWebp = async () => {
  webpSupport ??= run(ffmpegPath, ['-hide_banner', '-encoders']).then(({ stdout }) => /\blibwebp\b/.test(stdout));
  return webpSupport;
};

// From the uploaded image when there is one, otherwise from the frame at 1 second.
const makePoster = async (video, duration, outBase, image) => {
  const webp = await hasWebp();
  const output = `${outBase}.${webp ? 'webp' : 'jpg'}`;
  const input = image ? ['-i', image] : ['-ss', String(Math.min(1, duration / 2)), '-i', video];
  const codec = webp
    ? ['-c:v', 'libwebp', '-quality', String(POSTER_QUALITY)]
    : ['-q:v', String(Math.round(2 + ((100 - POSTER_QUALITY) / 100) * 29))];
  await ffmpeg([...input, '-frames:v', '1', '-vf', `scale=w='min(${POSTER_WIDTH},iw)':h=-1`, ...codec, output]);
  return output;
};

// A new poster for a video that is already converted.
export const makePosterImage = async (image, outDir) => {
  await fs.promises.mkdir(outDir, { recursive: true });
  try {
    return await makePoster(null, 0, path.join(outDir, `${Date.now()}-poster`), image);
  } catch {
    throw badRequest('This poster image could not be read');
  }
};

const lastLine = (text) =>
  String(text || '')
    .trim()
    .split(/\r?\n/)
    .at(-1)
    ?.slice(0, 200);

// Makes the light versions and a poster in outDir. File names carry a stamp so a
// replacement never overwrites the versions that are still being served.
export const makeVersions = async (file, outDir, { poster } = {}) => {
  const info = await probeVideo(file);
  if (!info) throw new Error('This file is not a readable video');

  await fs.promises.mkdir(outDir, { recursive: true });
  const stamp = Date.now();
  const made = [];
  try {
    const sources = [];
    for (const version of versionsFor(info.height)) {
      const output = path.join(outDir, `${stamp}-${version.quality}.mp4`);
      made.push(output);
      await encodeVersion(file, output, version, info.fps);
      const result = await probeVideo(output);
      const { size } = await fs.promises.stat(output);
      sources.push({ quality: version.quality, file: output, width: result.width, height: result.height, size });
    }
    const posterBase = path.join(outDir, `${stamp}-poster`);
    made.push(`${posterBase}.webp`, `${posterBase}.jpg`);
    const posterFile = await makePoster(file, info.duration, posterBase, poster);
    return { duration: info.duration, sources, poster: posterFile };
  } catch (err) {
    await Promise.all(made.map((output) => fs.promises.rm(output, { force: true })));
    throw new Error(`Video conversion failed: ${lastLine(err.stderr) || err.message}`);
  }
};
