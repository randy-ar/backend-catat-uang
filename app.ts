// app.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Import CORS
import authRoutes from './src/routes/authRoutes';
import incomeRoutes from './src/routes/incomeRoutes';
import spendingRoutes from './src/routes/spendingRoutes';
import reportRoutes from './src/routes/reportRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Gunakan CORS middleware

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/spendings', spendingRoutes);
app.use('/api/reports', reportRoutes)

// Basic root route
app.get('/', (req, res) => {
  res.send('Welcome to the Financial Tracker API!');
});

export default app;