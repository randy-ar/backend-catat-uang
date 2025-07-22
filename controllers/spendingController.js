// controllers/spendingController.js
const multer = require('multer');
const spendingModel = require('../models/spendingModel');
const { performOcr } = require('../services/ocrService');
const { convertOcrToSpendingData } = require('../services/geminiService');

const upload = multer({ storage: multer.memoryStorage() }); // Store image in memory

const addSpendingFromReceipt = async (req, res) => {
  const userId = req.user.uid; // From authMiddleware

  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }

  try {
    const imageBuffer = req.file.buffer;
    const ocrText = await performOcr(imageBuffer);
    console.log('OCR Result:', ocrText);

    const spendingData = await convertOcrToSpendingData(ocrText);
    console.log('Gemini Processed Spending Data:', spendingData);

    if (!spendingData) {
      return res.status(400).json({ message: 'Could not extract spending data from receipt.' });
    }

    // Add current date if not extracted by Gemini
    if (!spendingData.date) {
      spendingData.date = new Date().toISOString().split('T')[0];
    }
    // Ensure amount is a number
    spendingData.amount = parseFloat(spendingData.amount);

    const newSpending = await spendingModel.addSpending(userId, spendingData);
    res.status(201).json({ message: 'Spending added from receipt successfully', spending: newSpending });
  } catch (error) {
    console.error('Error processing receipt:', error);
    res.status(500).json({ message: 'Failed to process receipt and add spending', error: error.message });
  }
};

const getSpendings = async (req, res) => {
  const userId = req.user.uid;

  try {
    const spendings = await spendingModel.getSpendingsByUserId(userId);
    res.status(200).json(spendings);
  } catch (error) {
    console.error('Error fetching spendings:', error);
    res.status(500).json({ message: 'Failed to fetch spendings', error: error.message });
  }
};

const getMonthlySpendingReport = async (req, res) => {
  const userId = req.user.uid;
  const { year, month } = req.query; // e.g., /report?year=2024&month=7

  if (!year || !month) {
    return res.status(400).json({ message: 'Year and month are required for the report.' });
  }

  try {
    const spendings = await spendingModel.getMonthlySpendings(userId, parseInt(year), parseInt(month));

    // You can process this data further to create a summary or aggregated report
    const totalMonthlySpending = spendings.reduce((sum, s) => sum + s.amount, 0);

    // Group by category for a breakdown (example)
    const spendingByCategory = spendings.reduce((acc, current) => {
      const category = current.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + current.amount;
      return acc;
    }, {});

    res.status(200).json({
      month: `${year}-${month}`,
      totalMonthlySpending,
      spendingByCategory,
      details: spendings // Include detailed spendings if needed
    });
  } catch (error) {
    console.error('Error generating monthly spending report:', error);
    res.status(500).json({ message: 'Failed to generate monthly spending report', error: error.message });
  }
};


module.exports = {
  upload, // Export multer upload middleware
  addSpendingFromReceipt,
  getSpendings,
  getMonthlySpendingReport
};