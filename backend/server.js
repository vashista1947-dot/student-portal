const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const { runScheduler } = require('./utils/scheduler');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Connect to Database
connectDB().then(() => {
  // Start background scheduler
  runScheduler();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Disable caching for API responses to prevent cross-session leaks
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/student', require('./routes/student'));
app.use('/api/companies', require('./routes/company'));
app.use('/api/events', require('./routes/event'));
app.use('/api/announcements', require('./routes/announcement'));
app.use('/api/dispatch', require('./routes/dispatch'));

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'T&P Portal Backend API Running', status: 'active' });
});

// Global error handler (must be after routes)
app.use(errorHandler);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
  console.error(err.stack);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});