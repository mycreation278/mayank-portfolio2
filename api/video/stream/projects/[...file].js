const path = require('path');
const fs = require('fs');

const PROJ_DIR = path.join(__dirname, '../../../public/videos/projects');
const ALLOWED = ['.mp4', '.webm', '.mov', '.ogg'];
const MIME = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.ogg': 'video/ogg' };

function safePath(dir, file) {
  const full = path.resolve(path.join(dir, file));
  if (!full.startsWith(path.resolve(dir))) return null;
  return full;
}

function normalizeFileParam(fileParam) {
  if (!fileParam) return null;
  if (Array.isArray(fileParam)) {
    return fileParam.join('/');
  }
  return String(fileParam);
}

module.exports = function handler(req, res) {
  let file = normalizeFileParam(req.query && req.query.file);
  if (!file) {
    file = normalizeFileParam(req.query && req.query.filename);
  }
  if (!file && req.query && req.query.filePath) {
    file = normalizeFileParam(req.query.filePath);
  }

  if (!file) {
    const urlPath = req.url ? req.url.split('?')[0] : '';
    const match = urlPath.match(/\/api\/video\/stream\/projects\/(.+)$/);
    if (match) {
      file = decodeURIComponent(match[1]);
    }
  }

  if (!file) {
    return res.status(400).json({ error: 'Video filename required: /api/video/stream/projects/<file>.mp4 or ?file=<file>.mp4' });
  }

  const filePath = safePath(PROJ_DIR, file);
  if (!filePath) return res.status(403).json({ error: 'Invalid file path' });

  const ext = path.extname(filePath).toLowerCase();
  if (!ALLOWED.includes(ext)) return res.status(403).json({ error: 'File type not allowed' });

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const mime = MIME[ext] || 'video/mp4';
  const size = fs.statSync(filePath).size;
  const range = req.headers.range;

  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : size - 1;

    if (isNaN(start) || start >= size || end >= size) {
      res.status(416).setHeader('Content-Range', `bytes */${size}`).end();
      return;
    }

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': mime,
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': size,
      'Content-Type': mime,
    });
    fs.createReadStream(filePath).pipe(res);
  }
};
