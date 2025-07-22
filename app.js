// app.js
const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const spendingRoutes = require('./routes/spendingRoutes');

dotenv.config('.env'); // Load environment variables

const app = express();

// Middleware
app.use(express.json()); // For parsing application/json

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/spendings', spendingRoutes);

// Basic root route
app.get('/', (req, res) => {
  res.send('Welcome to the Financial Tracker API!');
});

module.exports = app;