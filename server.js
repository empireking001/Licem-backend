require('dotenv').config({ path: require('path').resolve(__dirname, '.env.development.local') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Devotional = require('./models/Devotional');

const publishDueDevotionals = async () => {
  await Devotional.updateMany(
    { status: 'scheduled', skipPublication: false, publishAt: { $lte: new Date() } },
    { $set: { status: 'published' } },
  );
};

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS ||
  (process.env.NODE_ENV === 'production'
    ? 'https://licem-frontend.vercel.app'
    : 'http://localhost:3000,https://licem-frontend.vercel.app'))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// ── Middleware ──────────────────────────────────────────────────────────────
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'production' &&
    (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)) {
  console.error('❌ Cloudinary configuration is required in production.');
  process.exit(1);
}

// Serve uploaded files as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/sermons',   require('./routes/sermons'));
app.use('/api/books',     require('./routes/books'));
app.use('/api/devotionals', require('./routes/devotionals'));
app.use('/api/radio-analytics', require('./routes/radioAnalytics'));
app.use('/api/events',    require('./routes/events'));
app.use('/api/posts',     require('./routes/posts'));
app.use('/api/comments',  require('./routes/comments'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/gallery',   require('./routes/gallery'));
app.use('/api/settings',  require('./routes/settings'));
app.use('/api/prayers',   require('./routes/prayers'));
app.use("/api/announcements", require("./routes/announcements"));
app.use("/api/testimonies", require("./routes/testimonies"));
app.use("/api/connect", require("./routes/connect"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/subscribers", require("./routes/subscribers"));
app.use('/api/media',     require('./routes/media'));
app.use("/api/birthdays", require("./routes/birthdays"));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'Licem API is running ✅', time: new Date() });
});

// ── MongoDB connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await publishDueDevotionals();
    setInterval(() => publishDueDevotionals().catch((err) => console.error('Devotional scheduler error:', err.message)), 15 * 60 * 1000);
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
  // TEMPORARY SEED LOGIC - Delete after one successful run
const seedAdminOnStartup = async () => {
  if (process.env.ENABLE_ADMIN_BOOTSTRAP !== 'true') {
    console.log('ℹ️ Admin bootstrap disabled.');
    return;
  }

  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.error('❌ ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD are required when ENABLE_ADMIN_BOOTSTRAP=true');
    return;
  }

  try {
    const User = require('./models/User');
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: process.env.ADMIN_BOOTSTRAP_NAME || 'LICEM Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'Super Admin',
        status: 'Active',
      });
      console.log('✅ SEED: Explicitly configured Super Admin created successfully');
    } else {
      console.log('ℹ️ SEED: Explicitly configured admin already exists, skipping...');
    }
  } catch (err) {
    console.error('❌ SEED ERROR:', err);
  }
};

// Call it after the connection is established
mongoose.connection.once('open', () => {
  seedAdminOnStartup();
});
