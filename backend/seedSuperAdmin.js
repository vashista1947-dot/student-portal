const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Check if super admin already exists
    const existing = await User.findOne({ role: 'super_admin' });
    if (existing) {
      console.log('Super Admin already exists:');
      console.log(`  Email: ${existing.email}`);
      console.log(`  Name: ${existing.name}`);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@nsut.ac.in',
      password: 'SuperAdmin@2026',
      role: 'super_admin'
    });

    console.log('✅ Super Admin created successfully!');
    console.log(`  Name: ${superAdmin.name}`);
    console.log(`  Email: ${superAdmin.email}`);
    console.log(`  Password: SuperAdmin@2026`);
    console.log(`  Role: super_admin`);
    console.log('\n⚠️  Change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding super admin:', error.message);
    process.exit(1);
  }
};

seedSuperAdmin();