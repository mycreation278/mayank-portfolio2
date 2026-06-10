// ─────────────────────────────────────────────────────────────
//  server/routes/contact.js
// ─────────────────────────────────────────────────────────────
const express   = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const mailer    = require('../services/mailer');

const router = express.Router();

// ── Strict rate limit on contact endpoint (5 submissions / hour)
const contactLimiter = rateLimit({
  windowMs : 60 * 60 * 1000,
  max      : 5,
  message  : {
    success : false,
    message : 'Too many messages sent. Please wait an hour before trying again.',
  },
});

// ── Validation rules ──────────────────────────────────────────
const validateContact = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ max: 100 }).withMessage('Name too long.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('projectType')
    .trim()
    .notEmpty().withMessage('Project type is required.')
    .isLength({ max: 100 }).withMessage('Project type too long.'),

  body('budget')
    .trim()
    .optional()
    .isLength({ max: 100 }).withMessage('Budget field too long.'),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required.')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Message must be between 20 and 2000 characters.'),
];

// ── POST /api/contact ─────────────────────────────────────────
router.post('/', contactLimiter, validateContact, async (req, res) => {
  // Return validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success : false,
      message : 'Please fix the errors below.',
      errors  : errors.array().map(e => ({ field: e.path, msg: e.msg })),
    });
  }

  const { name, email, projectType, budget, message } = req.body;

  try {
    await mailer.sendContactEmail({ name, email, projectType, budget, message });

    return res.status(200).json({
      success : true,
      message : "Thanks for reaching out! I'll get back to you within 24 hours.",
    });
  } catch (err) {
    console.error('[Contact API] Mail error:', err.message);
    return res.status(500).json({
      success : false,
      message : 'Something went wrong sending your message. Please try emailing me directly.',
    });
  }
});

module.exports = router;
