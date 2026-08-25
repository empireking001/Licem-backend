const router = require('express').Router();
const TeamMember = require('../models/TeamMember');
const { protect, adminOnly } = require('../middleware/auth');

const DEFAULT_TEAM = [
  {
    name: 'Rev. Oluwaseye Oduwale',
    role: 'LICEM General Overseer Worldwide',
    image: 'https://licem.org/wp-content/uploads/2022/10/WhatsApp-Image-2022-09-18-at-6.18.30-PM.jpeg',
    bio: 'Leading LICEM with a passion for biblical teaching, soul winning, and community transformation.',
  },
  {
    name: 'Rev. Toyin H. Oduwale',
    role: 'Love District Head Minister',
    image: 'https://licem.org/wp-content/uploads/2022/10/WhatsApp-Image-2022-09-18-at-6.16.24-PM-1.jpeg',
    bio: "Overseeing women's ministry and discipleship programs with warmth, wisdom and deep pastoral care.",
  },
  {
    name: 'Rev. Oduwusi',
    role: 'Love District Head Minister',
    image: 'https://licem.org/wp-content/uploads/2023/06/mama-oduwusi.jpg',
    bio: "Overseeing women's ministry and discipleship programs with warmth, wisdom and deep pastoral care.",
  },
  {
    name: 'Rev. Itunu Oluokun',
    role: 'Comfort District Head Minister',
    image: 'https://licem.org/wp-content/uploads/2023/06/pastor-itunu-oluokun2.jpg',
    bio: 'Passionate about raising a generation of young people who live boldly for Christ in every sphere.',
  },
  {
    name: 'Rev. Festus Akindunmade',
    role: 'Prosperity District Head Minister',
    image: 'https://licem.org/wp-content/uploads/2023/06/rev.-festus-akindunmade.jpg',
    bio: 'Passionate about raising a generation of young people who live boldly for Christ in every sphere.',
  },
  {
    name: 'Evang. Oluwanisola Ola',
    role: 'National Evangelist',
    image: 'https://licem.org/wp-content/uploads/2023/06/evangelist-oluwanisola-ola.jpg',
    bio: 'Passionate about raising a generation of young people who live boldly for Christ in every sphere.',
  },
].map((member, index) => ({ ...member, sortOrder: index, consentConfirmed: true, published: true }));

async function ensureDefaults() {
  const count = await TeamMember.countDocuments();
  if (count === 0) await TeamMember.insertMany(DEFAULT_TEAM);
}

// Public: only published ministers are displayed.
router.get('/public', async (req, res) => {
  try {
    await ensureDefaults();
    const members = await TeamMember.find({ published: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: manage the complete roster, including unpublished entries.
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    await ensureDefaults();
    const members = await TeamMember.find().sort({ sortOrder: 1, createdAt: 1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, role, bio, image, sortOrder, published, consentConfirmed } = req.body;
    if (!name?.trim() || !role?.trim()) return res.status(400).json({ message: 'Name and role are required.' });
    if (!consentConfirmed) return res.status(400).json({ message: 'Please confirm publication consent for this person.' });
    const member = await TeamMember.create({
      name: name.trim(), role: role.trim(), bio: bio?.trim() || '', image: image?.trim() || '',
      sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
      published: published !== false, consentConfirmed: true, createdBy: req.user?._id, updatedBy: req.user?._id,
    });
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, role, bio, image, sortOrder, published, consentConfirmed } = req.body;
    if (!name?.trim() || !role?.trim()) return res.status(400).json({ message: 'Name and role are required.' });
    if (!consentConfirmed) return res.status(400).json({ message: 'Please confirm publication consent for this person.' });
    const member = await TeamMember.findByIdAndUpdate(req.params.id, {
      name: name.trim(), role: role.trim(), bio: bio?.trim() || '', image: image?.trim() || '',
      sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
      published: published !== false, consentConfirmed: true, updatedBy: req.user?._id,
    }, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ message: 'Team member not found.' });
    res.json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: 'Team member not found.' });
    res.json({ message: 'Team member removed.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
