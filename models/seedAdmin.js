const mongoose = require("mongoose");
const User = require("./User"); // This file lives inside models/
require("dotenv").config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

    // Check if the admin already exists to avoid duplicates
    const adminExists = await User.findOne({ email: "pastor@gracelife.org" });

    if (!adminExists) {
      await User.create({
        name: "Head Pastor",
        email: "pastor@gracelife.org",
        password: "admin123", // Mongoose hook will hash this automatically
        role: "Super Admin",
        status: "Active",
      });
      console.log("--- Super Admin created successfully ---");
    } else {
      console.log("--- Admin already exists ---");
    }

    process.exit();
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
