const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.log('⚠️ MONGO_URI is not set. Trying default localhost MongoDB...');
      mongoUri = 'mongodb://127.0.0.1:27017/student-portal';
    }

    try {
      console.log(`Trying to connect to MongoDB at: ${mongoUri}`);
      const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (localError) {
      console.log('⚠️ Local MongoDB connection failed or service not running.');
      console.log('🚀 Starting an In-Memory MongoDB Server instead...');
      
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      
      console.log(`ℹ️ In-Memory MongoDB running at: ${inMemoryUri}`);
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
    }

    // Auto-seed Super Admin if it does not exist
    const existing = await User.findOne({ role: 'super_admin' });
    if (!existing) {
      await User.create({
        name: 'Super Admin',
        email: 'superadmin@nsut.ac.in',
        password: 'SuperAdmin@2026',
        role: 'super_admin'
      });
      console.log('✅ Database Auto-Seeded: Super Admin created!');
    }
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;