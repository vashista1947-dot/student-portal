const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed Super Admin if it does not exist
    const existing = await User.findOne({ role: 'super_admin' });
    if (!existing) {
      await User.create({
        name: 'Super Admin',
        email: 'superadmin@nsut.ac.in',
        password: 'SuperAdmin@2026',
        role: 'super_admin'
      });
      console.log('✅ Cloud Database Auto-Seeded: Super Admin created!');
    }
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;