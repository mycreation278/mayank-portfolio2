// api/video/stream/showreel.js
const path = require('path');
const fs = require('fs');

const REEL_PATH = path.join(__dirname, '../../../public/videos/showreel/showreel.mp4');
const MIME = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.ogg': 'video/ogg' };

module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  if (!fs.existsSync(REEL_PATH)) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const ext = path.extname(REEL_PATH).toLowerCase();
  const mime = MIME[ext] || 'video/mp4';
  const size = fs.statSync(REEL_PATH).size;
  const range = req.headers.range;

  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : size - 1;
    
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': mime,
    });
    fs.createReadStream(REEL_PATH, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': size,
      'Content-Type': mime,
    });
    fs.createReadStream(REEL_PATH).pipe(res);
  }
};
