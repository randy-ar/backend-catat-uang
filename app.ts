// app.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Import CORS
import authRoutes from './routes/authRoutes';
import incomeRoutes from './routes/incomeRoutes';
import spendingRoutes from './routes/spendingRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Gunakan CORS middleware

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/spendings', spendingRoutes);

// Basic root route
app.get('/', (req, res) => {
  res.send('Welcome to the Financial Tracker API!');
});

export default app;