// controllers/incomeController.js
const incomeModel = require('../models/incomeModel');

const addIncome = async (req, res) => {
  const { name, amount, description, category } = req.body;
  const userId = req.user.uid; // From authMiddleware

  if (!name || !amount) {
    return res.status(400).json({ message: 'Name and amount are required.' });
  }

  const incomeData = {
    name,
    amount: parseFloat(amount),
    description,
    category,
    date: new Date().toISOString().split('T')[0], // Current date YYYY-MM-DD
  };

  try {
    const newIncome = await incomeModel.addIncome(userId, incomeData);
    res.status(201).json({ message: 'Income added successfully', income: newIncome });
  } catch (error) {
    console.error('Error adding income:', error);
    res.status(500).json({ message: 'Failed to add income', error: error.message });
  }
};

const getIncomes = async (req, res) => {
  const userId = req.user.uid;

  try {
    const incomes = await incomeModel.getIncomesByUserId(userId);
    res.status(200).json(incomes);
  } catch (error) {
    console.error('Error fetching incomes:', error);
    res.status(500).json({ message: 'Failed to fetch incomes', error: error.message });
  }
};

module.exports = {
  addIncome,
  getIncomes
};