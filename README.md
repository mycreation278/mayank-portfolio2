# Mayank Sharma — Portfolio
### CGI Artist & Video Editor

A professional full-stack portfolio website with a working Node.js/Express backend, contact form with email delivery, and cinematic dark UI.

---

## 📁 Project Structure

```
mayank-portfolio/
│
├── public/                  ← Static frontend (served by Express)
│   ├── index.html           ← Main HTML page
│   ├── css/
│   │   └── style.css        ← All styles
│   ├── js/
│   │   └── main.js          ← All frontend JS (cursor, modal, form, filters, animations)
│   └── images/              ← Put your project thumbnails & resume here
│       └── resume.pdf       ← Your CV (linked from About section)
│
├── server/                  ← Node.js backend
│   ├── index.js             ← Express app entry point
│   ├── routes/
│   │   └── contact.js       ← POST /api/contact — validates & sends email
│   └── services/
│       └── mailer.js        ← Nodemailer Gmail config + HTML email templates
│
├── .env.example             ← Copy to .env and fill in your credentials
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### 1. Install Node.js
Download and install Node.js (v18+) from https://nodejs.org

### 2. Install dependencies
```bash
cd mayank-portfolio
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```
Open `.env` and fill in:
```
PORT=3000
GMAIL_USER=your.gmail@gmail.com
GMAIL_PASS=your_16char_app_password
CONTACT_RECEIVER=hello@mayanksharma.in
```

**How to get a Gmail App Password:**
1. Go to your Google Account → Security
2. Enable 2-Step Verification (if not already)
3. Go to Security → App Passwords
4. Select "Mail" + "Windows/Mac" → Generate
5. Copy the 16-character password → paste as `GMAIL_PASS`

### 4. Run the site
```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

Open your browser at: **http://localhost:3000**

---

## ✅ Working Features

| Feature | Status | Notes |
|---|---|---|
| Custom animated cursor | ✅ | Desktop only, hidden on mobile |
| Sticky navigation | ✅ | Changes style on scroll |
| Mobile hamburger menu | ✅ | Full-screen overlay |
| Hero scroll animations | ✅ | CSS keyframe + JS reveal |
| Stat count-up | ✅ | Triggers on scroll into view |
| Showreel modal | ✅ | Replace SHOWREEL_URL in main.js |
| Project filter | ✅ | CGI / 3D / Travel / AI / VFX |
| Project video modal | ✅ | Click "View Project" on each card |
| Scroll reveal sections | ✅ | IntersectionObserver |
| Contact form validation | ✅ | Client + server-side |
| Contact form email send | ✅ | Gmail SMTP via Nodemailer |
| Auto-reply to visitor | ✅ | Styled HTML email |
| Rate limiting | ✅ | 5 submissions/hour per IP |
| Toast notifications | ✅ | Success and error states |
| Back-to-top button | ✅ | Appears after 400px scroll |
| Smooth scroll | ✅ | All anchor links |
| Keyboard accessibility | ✅ | Project cards, modal close |
| Fully responsive | ✅ | Mobile / tablet / desktop |

---

## 🎬 Customise Your Content

### Add your real video links
In `public/js/main.js`, find and replace:
```js
// Line ~57
const SHOWREEL_URL = 'https://www.youtube.com/embed/YOUR_SHOWREEL_ID?autoplay=1&rel=0';
```

For each project card in `index.html`, update the `data-video` attribute:
```html
<button class="proj-view-btn" data-video="https://www.youtube.com/embed/YOUR_VIDEO_ID">
```

**YouTube embed URL format:**
`https://www.youtube.com/embed/VIDEO_ID`

**Vimeo embed URL format:**
`https://player.vimeo.com/video/VIDEO_ID`

### Add your real project thumbnails
Place images in `public/images/` and replace the SVG placeholders in each `.proj-inner` div with:
```html
<img src="images/project1.jpg" alt="Commercial Product Advertisement" loading="lazy">
```

### Update contact details
In `index.html`, find and replace:
- `hello@mayanksharma.in` → your real email
- `+91 99999 99999` → your real phone
- Social media links (Instagram, YouTube, LinkedIn, Behance)
- Calendly link

### Add your resume
Place your resume PDF at: `public/images/resume.pdf`

---

## 🌐 Deployment

### Deploy to Railway (free + easy)
1. Push this folder to a GitHub repo
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Add environment variables in Railway dashboard
4. Done — Railway auto-detects Node.js and runs `npm start`

### Deploy to Render (free tier)
1. Push to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo, set `npm start` as start command
4. Add environment variables
5. Deploy

### Deploy to VPS (DigitalOcean / Hostinger)
```bash
# On your server:
git clone your-repo
cd mayank-portfolio
npm install --production
cp .env.example .env   # fill in your credentials
npm start

# Keep alive with PM2:
npm install -g pm2
pm2 start server/index.js --name "portfolio"
pm2 startup
pm2 save
```

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JS (no frameworks) |
| Backend  | Node.js + Express |
| Email    | Nodemailer (Gmail SMTP) |
| Security | express-rate-limit, express-validator, CORS |
| Fonts    | Google Fonts (Playfair Display + Outfit) |

---

© 2026 Mayank Sharma. All rights reserved.
