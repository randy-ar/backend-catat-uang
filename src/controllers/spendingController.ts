// controllers/spendingController.ts
import { Request, Response } from 'express';
import multer from 'multer';
import * as spendingModel from '../models/spendingModel';
import { performOcr } from '../services/ocrService';
import { convertOcrToSpendingData } from '../services/geminiService';
import { SpendingType } from '../types/model'; // Import SpendingType

// Konfigurasi Multer
const upload = multer({ storage: multer.memoryStorage() });

const addSpendingFromReceipt = async (req: Request, res: Response) => {
  const userId = req.user?.uid;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated or UID not available.' });
  }

  // req.file hanya ada jika middleware upload.single() digunakan
  const file = req.file as Express.Multer.File; // Type assertion for multer file

  if (!file) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }

  try {
    const imageBuffer = file.buffer;
    const ocrText = await performOcr(imageBuffer);
    console.log('OCR Result:', ocrText);

    const spendingDataFromGemini = await convertOcrToSpendingData(ocrText);

    if (!spendingDataFromGemini) {
      return res.status(400).json({ message: 'Could not extract spending data from receipt.' });
    }

    // Map the extracted data to your SpendingType
    const spendingData: Omit<SpendingType, 'id'> = {
      name: spendingDataFromGemini.name || 'Unknown Store',
      amount: parseFloat(spendingDataFromGemini.amount.toString()),
      date: spendingDataFromGemini.date || new Date().toISOString().split('T')[0],
      category: spendingDataFromGemini.category ? { name: spendingDataFromGemini.category, id: 0 } : undefined, // Assign ID as needed
      items: spendingDataFromGemini.items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1
      }))
    };

    const newSpending = await spendingModel.addSpending(userId, spendingData);
    res.status(201).json({ message: 'Spending added from receipt successfully', spending: newSpending });
  } catch (error: any) {
    console.error('Error processing receipt:', error);
    res.status(500).json({ message: 'Failed to process receipt and add spending', error: error.message });
  }
};

const getSpendings = async (req: Request, res: Response) => {
  const userId = req.user?.uid;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated or UID not available.' });
  }

  try {
    const spendings = await spendingModel.getSpendingsByUserId(userId);
    res.status(200).json(spendings);
  } catch (error: any) {
    console.error('Error fetching spendings:', error);
    res.status(500).json({ message: 'Failed to fetch spendings', error: error.message });
  }
};

const getMonthlySpendingReport = async (req: Request, res: Response) => {
  const userId = req.user?.uid;
  const { year, month } = req.query;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated or UID not available.' });
  }

  if (!year || !month) {
    return res.status(400).json({ message: 'Year and month are required for the report.' });
  }

  try {
    const parsedYear = parseInt(year as string);
    const parsedMonth = parseInt(month as string);

    if (isNaN(parsedYear) || isNaN(parsedMonth)) {
        return res.status(400).json({ message: 'Invalid year or month format.' });
    }

    const spendings = await spendingModel.getMonthlySpendings(userId, parsedYear, parsedMonth);

    const totalMonthlySpending = spendings.reduce((sum, s) => sum + s.amount, 0);

    // --- BARIS YANG DIUBAH DI SINI ---
    // Deklarasikan tipe indeks untuk objek: string sebagai kunci, number sebagai nilai
    const spendingByCategory: { [key: string]: number } = spendings.reduce((acc: { [key: string]: number }, current) => {
      const category = current.category?.name || 'Uncategorized';
      acc[category] = (acc[category] || 0) + current.amount;
      return acc;
    }, {});
    // --- AKHIR PERUBAHAN ---

    res.status(200).json({
      month: `${parsedYear}-${parsedMonth}`,
      totalMonthlySpending,
      spendingByCategory,
      details: spendings
    });
  } catch (error: any) {
    console.error('Error generating monthly spending report:', error);
    res.status(500).json({ message: 'Failed to generate monthly spending report', error: error.message });
  }
};
export {
  upload,
  addSpendingFromReceipt,
  getSpendings,
  getMonthlySpendingReport
};