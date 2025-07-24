// controllers/spendingController.ts
import { Request, Response } from 'express';
import multer from 'multer';
import * as spendingModel from '../models/spendingModel';
import { performOcr } from '../services/ocrService';
import { convertOcrToSpendingData } from '../services/geminiService';
import { SpendingCategoryType, SpendingItemsType, SpendingType } from '../types/model'; // Import SpendingType
import SpendingCategoriesData from '../constant/SpendingCategories';
import { body, validationResult } from 'express-validator/lib';

// Konfigurasi Multer

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Batasi ukuran file hingga 5MB
  },
});

const validateScannedSpending = [
  body('name')
    .notEmpty().withMessage('Nama pengeluaran tidak boleh kosong')
    .isString().withMessage('Nama pengeluaran harus berupa teks'),
  body('amount')
    .notEmpty().withMessage('Jumlah pengeluaran tidak boleh kosong')
    .isNumeric().withMessage('Jumlah pengeluaran harus berupa angka')
    .toFloat()
    .custom((value: number) => value > 0).withMessage('Jumlah pengeluaran harus lebih besar dari 0'),
  body('date')
    .notEmpty().withMessage('Tanggal pengeluaran tidak boleh kosong')
    .isISO8601().withMessage('Format tanggal tidak valid (YYYY-MM-DD)')
    .toDate(), // Konversi ke objek Date
  body('category.name')
    .notEmpty().withMessage('Nama kategori tidak boleh kosong')
    .isString().withMessage('Nama kategori harus berupa teks'),
  body('category.id')
    .notEmpty().withMessage('ID kategori tidak boleh kosong')
    .isInt().withMessage('ID kategori harus berupa angka bulat')
    .toInt(),
  body('items')
    .isArray().withMessage('Item harus berupa array')
    .custom((items: SpendingItemsType[]) => {
      if (!items.every(item => typeof item.name === 'string' && item.price !== undefined && typeof item.price === 'number' && item.price >= 0)) {
        throw new Error('Setiap item harus memiliki nama (teks) dan harga (angka positif).');
      }
      return true;
    }).withMessage('Setiap item harus memiliki nama dan harga yang valid.')
];


const scanFromReceipt = async (req: Request, res: Response) => {
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
      category: spendingDataFromGemini.category,
      items: spendingDataFromGemini.items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1
      }))
    };

    res.status(201).json({ message: 'Receipt scanned successfully', spending: spendingData });
  } catch (error: any) {
    console.error('Error processing receipt:', error);
    res.status(500).json({ message: 'Failed to process receipt and add spending', error: error.message });
  }
};

const saveScannedSpending = async (req: Request, res: Response) => {
  const userId = req.user?.uid;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated or UID not available.' });
  }

  // Periksa hasil validasi dari express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Data yang diterima dari klien sudah divalidasi dan mungkin telah diubah/disempurnakan
  const { name, amount, date, category, items, receiptImageUrl } = req.body; // Jika Anda mengirim imageUrl dari klien
  console.log("BODY : ",req.body)

  const spendingData: Omit<SpendingType, 'id'> = {
    name,
    amount: parseFloat(amount), // Pastikan ini angka
    date: date, // Tanggal sudah berupa string YYYY-MM-DD atau objek Date jika di-toDate()
    category,
    items,
    // receiptImageUrl, // Tambahkan jika Anda menyimpannya bersamaan
  };

  try {
    const newSpending = await spendingModel.addSpending(userId, spendingData);
    res.status(201).json({ message: 'Pengeluaran berhasil disimpan', spending: newSpending });
  } catch (error: any) {
    console.error('Error menyimpan pengeluaran (saveScannedSpending):', error);
    res.status(500).json({ message: 'Gagal menyimpan pengeluaran', error: error.message });
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

const getSpendingById = async (req: Request, res: Response) => {
  const userId = req.user?.uid;
  const spendingId = req.params.id;
  console.log("SPENDING ID: ", spendingId);
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated or UID not available.' })
  }

  try{
    const spending = await spendingModel.getSpendingById(userId, spendingId);
    if(!spending){
      return res.status(404).json({ message: 'Spending not found' });
    }
    res.status(200).json(spending);
  } catch (error: any) {
    console.error('Error fetching spending:', error);
    res.status(500).json({ message: 'Failed to fetch spending', error: error.message });
  }
}

const deleteSpending = async (req: Request, res: Response) => {
  const userId = req.user?.uid;
  const spendingId = req.params.id;
  console.log("DELETE SPENDING:", spendingId);
  if (!userId) {
    return res.status(404).json({ message: 'User not authenticated or UID not available.' });
  }
  try {
    const result = await spendingModel.deleteSpending(userId, spendingId);
    console.log("RESULT: ", result);
    res.status(200).json(result);
  }catch{
    res.status(500).json({ message: 'Failed to delete spending' });
  }
}

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

    const spendingByCategory: { [key: string]: number } = spendings.reduce((acc: { [key: string]: number }, current) => {
      const category = current.category?.name || 'Uncategorized';
      acc[category] = (acc[category] || 0) + current.amount;
      return acc;
    }, {});

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

    const currentMonthSpendings = await spendingModel.getMonthlySpendings(userId, parsedYear, parsedMonth);
    const previousMonthSpendings = await spendingModel.getMonthlySpendings(userId, prevYear, prevMonth);

    const totalCurrentMonth = currentMonthSpendings.reduce((sum, income) => sum + income.amount, 0);
    const totalPreviousMonth = previousMonthSpendings.reduce((sum, income) => sum + income.amount, 0);

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
        currentMonthSpendings,
        previousMonthSpendings,
      }
    });
  } catch (error: any) {
    console.error('Error generating monthly spending report:', error);
    res.status(500).json({ message: 'Failed to generate monthly spending report', error: error.message });
  }
}

const getCategories = async (req: Request, res: Response) => {
  return res.status(200).json(SpendingCategoriesData);
}

export {
  upload,
  validateScannedSpending,
  scanFromReceipt,
  saveScannedSpending,
  getCategories,
  getSpendings,
  getSpendingById,
  getMonthlySpendingReport,
  getReportMonthly,
  deleteSpending
};