const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Use your Atlas URI with the encoded password
const ATLAS_URI =
  "mongodb+srv://legendempire:Oluwagbogo1998%29@cluster0.hjhed5y.mongodb.net/church?retryWrites=true&w=majority";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" }, // Matches your current schema
  isActive: { type: Boolean, default: true },
});

// Password hashing hook
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

async function seed() {
  try {
    await mongoose.connect(ATLAS_URI);
    console.log("Connected to MongoDB Atlas...");

    // Remove existing user if they exist to avoid 'already exists' errors
    await User.deleteOne({ email: "pastor@gracelife.org" });

    await User.create({
      name: "Head Pastor",
      email: "pastor@gracelife.org",
      password: "admin123",
      role: "admin",
      isActive: true,
    });

    console.log("✅ Super Admin created in CLOUD database!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
