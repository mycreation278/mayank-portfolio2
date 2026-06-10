// server/routes/video.js
// GET /api/video/stream/projects/:file   — streams a project video with seek support
// GET /api/video/stream/showreel         — streams showreel.mp4
// GET /api/video/list                    — returns JSON list of all project videos

const express = require('express');
const path    = require('path');
const fs      = require('fs');
const router  = express.Router();

const PUBLIC   = path.join(__dirname, '..', '..', 'public');
const PROJ_DIR = path.join(PUBLIC, 'videos', 'projects');
const REEL_DIR = path.join(PUBLIC, 'videos', 'showreel');
const ALLOWED  = ['.mp4', '.webm', '.mov', '.ogg'];
const MIME     = { '.mp4':'video/mp4', '.webm':'video/webm', '.mov':'video/quicktime', '.ogg':'video/ogg' };

// Security: block path traversal
function safePath(dir, file) {
  const full = path.resolve(path.join(dir, file));
  if (!full.startsWith(path.resolve(dir))) return null;
  return full;
}

// Core streaming function with Range support (allows video seeking)
function streamVideo(filePath, req, res) {
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video file not found. Check the filename in the projects folder.' });
  }
  const ext  = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'video/mp4';
  const size = fs.statSync(filePath).size;
  const range = req.headers.range;

  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end   = endStr ? parseInt(endStr, 10) : size - 1;
    if (start >= size || end >= size) {
      return res.status(416).set('Content-Range', `bytes */${size}`).end();
    }
    res.writeHead(206, {
      'Content-Range' : `bytes ${start}-${end}/${size}`,
      'Accept-Ranges' : 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type'  : mime,
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': size,
      'Content-Type'  : mime,
      'Accept-Ranges' : 'bytes',
    });
    fs.createReadStream(filePath).pipe(res);
  }
}

// Stream a project video: /api/video/stream/projects/filename.mp4
router.get('/stream/projects/:file', (req, res) => {
  const filePath = safePath(PROJ_DIR, req.params.file);
  if (!filePath) return res.status(403).json({ error: 'Forbidden' });
  const ext = path.extname(filePath).toLowerCase();
  if (!ALLOWED.includes(ext)) return res.status(400).json({ error: 'File type not allowed' });
  streamVideo(filePath, req, res);
});

// Stream showreel: /api/video/stream/showreel
router.get('/stream/showreel', (req, res) => {
  const filePath = path.join(REEL_DIR, 'showreel.mp4');
  streamVideo(filePath, req, res);
});

// List all project videos: /api/video/list
router.get('/list', (_req, res) => {
  if (!fs.existsSync(PROJ_DIR)) return res.json({ videos: [] });
  const files = fs.readdirSync(PROJ_DIR)
    .filter(f => ALLOWED.includes(path.extname(f).toLowerCase()))
    .map(f => ({
      filename : f,
      streamUrl: `/api/video/stream/projects/${encodeURIComponent(f)}`,
      thumbUrl : `/videos/thumbnails/${path.basename(f, path.extname(f))}.jpg`,
      size     : fs.statSync(path.join(PROJ_DIR, f)).size,
    }));
  res.json({ videos: files });
});

module.exports = router;
