// controllers/incomeController.ts
import { Request, Response } from 'express';
import * as incomeModel from '../models/incomeModel'; // Import sebagai namespace
import { IncomeType, SpendingCategoryType } from '../src/types/model';
import SpendingCategoriesData from '../src/constant/SpendingCategories';

const addIncome = async (req: Request, res: Response) => {
  const { name, amount, description, category_id, date } = req.body;
  console.log(req.body);

  const userId = req.user?.uid; // Gunakan optional chaining karena user bisa undefined
  const category = SpendingCategoriesData.find((c: SpendingCategoryType) => c.id === category_id)
  console.log("CATEGORY: ", category);

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated or UID not available.' });
  }

  if (!name || !amount) {
    return res.status(400).json({ message: 'Name and amount are required.' });
  }

  const incomeData: Omit<IncomeType, 'id'> = { // Pastikan tipe data sesuai
    name,
    amount: parseFloat(amount),
    description,
    category,
    date: new Date(date).toISOString().split('T')[0],
  };

  try {
    const newIncome = await incomeModel.addIncome(userId, incomeData);
    res.status(201).json({ message: 'Income added successfully', income: newIncome });
  } catch (error: any) {
    console.error('Error adding income:', error);
    res.status(500).json({ message: 'Failed to add income', error: error.message });
  }
};

const getIncomes = async (req: Request, res: Response) => {
  const userId = req.user?.uid;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated or UID not available.' });
  }

  try {
    const incomes = await incomeModel.getIncomesByUserId(userId);
    res.status(200).json(incomes);
  } catch (error: any) {
    console.error('Error fetching incomes:', error);
    res.status(500).json({ message: 'Failed to fetch incomes', error: error.message });
  }
};

export {
  addIncome,
  getIncomes
};