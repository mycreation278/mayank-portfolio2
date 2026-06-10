require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const fs        = require('fs');
const rateLimit = require('express-rate-limit');

const contactRouter = require('./routes/contact');
const videoRouter   = require('./routes/video');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*', methods: ['GET','POST'] }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({ windowMs: 15*60*1000, max: 300 }));

// Serve everything in /public as static
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/contact', contactRouter);
app.use('/api/video',   videoRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('*', (_req, res) =>
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`\n🚀  Portfolio → http://localhost:${PORT}`);
  console.log(`    Put videos in: public/videos/projects/`);
  console.log(`    Put thumbnails in: public/videos/thumbnails/`);
  console.log(`    Put showreel in: public/videos/showreel/showreel.mp4\n`);
});
