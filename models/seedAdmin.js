const mongoose = require("mongoose");
const User = require("./User"); // This file lives inside models/
require("dotenv").config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

    const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
    if (!email || !password) throw new Error('Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD before seeding');

    // Check if the explicitly configured admin already exists to avoid duplicates
    const adminExists = await User.findOne({ email });

    if (!adminExists) {
      await User.create({
        name: process.env.ADMIN_BOOTSTRAP_NAME || "LICEM Administrator",
        email,
        password,
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
