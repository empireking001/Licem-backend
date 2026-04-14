const router = require('express').Router();
const SiteSettings = require('../models/SiteSettings');
const { protect, superAdminOnly } = require('../middleware/auth');

// Public: get settings (frontend needs these for colors, favicon, etc.)
router.get('/', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});
    res.json(settings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: update settings
router.put('/', protect, superAdminOnly, async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json(settings);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
