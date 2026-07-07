const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: function (origin, callback) {
      const allowed = [
        "http://localhost:3000",
        "https://licem-frontend.vercel.app",
      ];
      if (!origin || allowed.indexOf(origin) !== -1) {
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

// Serve uploaded files as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/sermons',   require('./routes/sermons'));
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
app.use('/api/media',     require('./routes/media'));
app.use("/api/birthdays", require("./routes/birthdays"));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'Licem API is running ✅', time: new Date() });
});

// ── MongoDB connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
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
  try {
    const User = require("./models/User"); // Ensure this path matches your file structure
    const adminEmail = 'pastor@gracelife.org';
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'Head Pastor',
        email: adminEmail,
        password: 'admin123', // Your pre-save hook will hash this
        role: 'Super Admin',
        status: 'Active'
      });
      console.log('✅ SEED: Super Admin created successfully');
    } else if (!['Super Admin', 'Editor', 'Moderator'].includes(existingAdmin.role)) {
      // Repair legacy accounts saved with an invalid role (e.g. 'admin')
      await User.updateOne(
        { _id: existingAdmin._id },
        { $set: { role: 'Super Admin', status: 'Active' } }
      );
      console.log('✅ SEED: Existing admin role repaired to Super Admin');
    } else {
      console.log('ℹ️ SEED: Admin already exists, skipping...');
    }
  } catch (err) {
    console.error('❌ SEED ERROR:', err);
  }
};

// Call it after the connection is established
mongoose.connection.once('open', () => {
  seedAdminOnStartup();
});
