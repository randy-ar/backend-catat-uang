// controllers/incomeController.ts
import { Request, Response } from 'express';
import * as incomeModel from '../models/incomeModel'; // Import sebagai namespace
import { IncomeType, SpendingCategoryType } from '../types/model';
import { body, validationResult } from 'express-validator/lib';
import SpendingCategoriesData from '../constant/SpendingCategories';
import IncomeCategoryData from '../constant/IncomeCategories';

const validateIncome = [
  body('name')
    .notEmpty().withMessage('Nama income tidak boleh kosong')
    .isString().withMessage('Nama income harus berupa teks'),
  body('amount')
    .notEmpty().withMessage('Jumlah income tidak boleh kosong')
    .isNumeric().withMessage('Jumlah income harus berupa angka')
    .toFloat()
    .custom((value: number) => value > 0).withMessage('Jumlah income harus lebih besar dari 0'),
  body('description')
    .optional()
    .isString().withMessage('Deskripsi harus berupa teks'),
  body('category.name')
    .optional()
    .isString().withMessage('Nama kategori harus berupa teks'),
  body('category.id')
    .optional()
    .isInt().withMessage('ID kategori harus berupa angka bulat')
    .toInt()
]

const addIncome = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, amount, description, category, date } = req.body;
  console.log(req.body);

  const userId = req.user?.uid; // Gunakan optional chaining karena user bisa undefined
  const incomeCategoryData = IncomeCategoryData.find((c: SpendingCategoryType) => c.id === category.id)
  console.log("CATEGORY: ", incomeCategoryData);
  if(!incomeCategoryData){
    return res.status(400).json({ message: 'Invalid income category' });
  }

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated or UID not available.' });
  }

  const incomeData: Omit<IncomeType, 'id'> = { // Pastikan tipe data sesuai
    name,
    amount: parseFloat(amount),
    description,
    category: incomeCategoryData,
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

const getIncomesById = async (req: Request, res: Response) => {
  const userId = req.user?.uid;
  const incomeId = req.params.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated or UID not available.' });
  }

  try{
    const income = await incomeModel.getIncomeById(userId, incomeId);
    if(!income){
      return res.status(404).json({ message: 'Income not found' });
    }
    res.status(200).json(income);
  } catch (error: any) {

  }
}

const getCategories = async (req: Request, res: Response) => {
  return res.status(200).json(IncomeCategoryData);
}

const deleteIncome = async (req: Request, res: Response) => {
  const userId = req.user?.uid;
  const incomeId = req.params.id;
  console.log("DELETE INCOME:", incomeId);
  if (!userId) {
    return res.status(404).json({ message: 'User not authenticated or UID not available.' });
  }
  try {
    const result = await incomeModel.deleteIncome(userId, incomeId);
    console.log("RESULT: ", result);
    res.status(200).json(result);
  }catch{
    res.status(500).json({ message: 'Failed to delete income' });
  }
}

const getReportMonthly = async (req: Request, res: Response) => {
  const userId = req.user?.uid;
  const { year, month } = req.query;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated or UID not available.' });
  }

  if (!year || !month) {
    return res.status(400).json({ message: 'Query parameter "year" dan "month" dibutuhkan.' });
  }

  try {
    const parsedYear = parseInt(year as string);
    const parsedMonth = parseInt(month as string);

    if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({ message: 'Format "year" atau "month" tidak valid.' });
    }

    // Hitung bulan sebelumnya
    let prevYear = parsedYear;
    let prevMonth = parsedMonth - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }

    const currentMonthIncomes = await incomeModel.getMonthlyIncomes(userId, parsedYear, parsedMonth);
    const previousMonthIncomes = await incomeModel.getMonthlyIncomes(userId, prevYear, prevMonth);

    const totalCurrentMonth = currentMonthIncomes.reduce((sum, income) => sum + income.amount, 0);
    const totalPreviousMonth = previousMonthIncomes.reduce((sum, income) => sum + income.amount, 0);

    let percentageChange = 0;
    if (totalPreviousMonth > 0) {
      percentageChange = ((totalCurrentMonth - totalPreviousMonth) / totalPreviousMonth) * 100;
    } else if (totalCurrentMonth > 0) {
      percentageChange = 100; // Jika bulan lalu 0 dan bulan ini ada pemasukan, anggap naik 100%
    }

    res.status(200).json({
      summary: {
        totalCurrentMonth,
        totalPreviousMonth,
        percentageChange: parseFloat(percentageChange.toFixed(2)),
      },
      details: {
        currentMonthIncomes,
        previousMonthIncomes,
      }
    });
  } catch (error: any) {
    console.error('Error generating monthly income report:', error);
    res.status(500).json({ message: 'Failed to generate monthly income report', error: error.message });
  }
}

export {
  validateIncome,
  addIncome,
  getIncomes,
  getIncomesById,
  getCategories,
  deleteIncome,
  getReportMonthly
};