"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSpending = exports.getReportMonthly = exports.getMonthlySpendingReport = exports.getSpendingById = exports.getSpendings = exports.getCategories = exports.adjustSpendingData = exports.saveScannedSpending = exports.scanFromReceipt = exports.validateAdjustedSpending = exports.validateScannedSpending = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const spendingModel = __importStar(require("../models/spendingModel"));
const ocrService_1 = require("../services/ocrService");
const geminiService_1 = require("../services/geminiService");
const SpendingCategories_1 = __importDefault(require("../constant/SpendingCategories"));
const lib_1 = require("express-validator/lib");
// Konfigurasi Multer
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // Batasi ukuran file hingga 5MB
    },
});
exports.upload = upload;
const validateScannedSpending = [
    (0, lib_1.body)('name')
        .notEmpty().withMessage('Nama pengeluaran tidak boleh kosong')
        .isString().withMessage('Nama pengeluaran harus berupa teks'),
    (0, lib_1.body)('amount')
        .notEmpty().withMessage('Jumlah pengeluaran tidak boleh kosong')
        .isNumeric().withMessage('Jumlah pengeluaran harus berupa angka')
        .toFloat()
        .custom((value) => value > 0).withMessage('Jumlah pengeluaran harus lebih besar dari 0'),
    (0, lib_1.body)('date')
        .notEmpty().withMessage('Tanggal pengeluaran tidak boleh kosong')
        .isISO8601().withMessage('Format tanggal tidak valid (YYYY-MM-DD)')
        .toDate(), // Konversi ke objek Date
    (0, lib_1.body)('category.name')
        .notEmpty().withMessage('Nama kategori tidak boleh kosong')
        .isString().withMessage('Nama kategori harus berupa teks'),
    (0, lib_1.body)('category.id')
        .notEmpty().withMessage('ID kategori tidak boleh kosong')
        .isInt().withMessage('ID kategori harus berupa angka bulat')
        .toInt(),
    (0, lib_1.body)('items')
        .isArray().withMessage('Item harus berupa array')
        .custom((items) => {
        if (!items.every(item => typeof item.name === 'string' && item.price !== undefined && typeof item.price === 'number' && item.price >= 0)) {
            throw new Error('Setiap item harus memiliki nama (teks) dan harga (angka positif).');
        }
        return true;
    }).withMessage('Setiap item harus memiliki nama dan harga yang valid.')
];
exports.validateScannedSpending = validateScannedSpending;
const validateAdjustedSpending = [
    (0, lib_1.body)('adjustAmount')
        .notEmpty().withMessage('Jumlah pengeluaran tidak boleh kosong')
        .isNumeric().withMessage('Jumlah pengeluaran harus berupa angka')
        .toFloat()
        .custom((value) => value > 0).withMessage('Jumlah pengeluaran harus lebih besar dari 0'),
    (0, lib_1.body)('name')
        .notEmpty().withMessage('Nama pengeluaran tidak boleh kosong')
        .isString().withMessage('Nama pengeluaran harus berupa teks'),
    (0, lib_1.body)('amount')
        .notEmpty().withMessage('Jumlah pengeluaran tidak boleh kosong')
        .isNumeric().withMessage('Jumlah pengeluaran harus berupa angka')
        .toFloat()
        .custom((value) => value > 0).withMessage('Jumlah pengeluaran harus lebih besar dari 0'),
    (0, lib_1.body)('date')
        .notEmpty().withMessage('Tanggal pengeluaran tidak boleh kosong')
        .isISO8601().withMessage('Format tanggal tidak valid (YYYY-MM-DD)')
        .toDate(), // Konversi ke objek Date
    (0, lib_1.body)('category.name')
        .notEmpty().withMessage('Nama kategori tidak boleh kosong')
        .isString().withMessage('Nama kategori harus berupa teks'),
    (0, lib_1.body)('category.id')
        .notEmpty().withMessage('ID kategori tidak boleh kosong')
        .isInt().withMessage('ID kategori harus berupa angka bulat')
        .toInt(),
    (0, lib_1.body)('items')
        .isArray().withMessage('Item harus berupa array')
        .custom((items) => {
        if (!items.every(item => typeof item.name === 'string' && item.price !== undefined && typeof item.price === 'number' && item.price >= 0)) {
            throw new Error('Setiap item harus memiliki nama (teks) dan harga (angka positif).');
        }
        return true;
    }).withMessage('Setiap item harus memiliki nama dan harga yang valid.')
];
exports.validateAdjustedSpending = validateAdjustedSpending;
const scanFromReceipt = async (req, res) => {
    const userId = req.user?.uid;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated or UID not available.' });
    }
    // req.file hanya ada jika middleware upload.single() digunakan
    const file = req.file; // Type assertion for multer file
    if (!file) {
        return res.status(400).json({ message: 'No image file uploaded.' });
    }
    try {
        const imageBuffer = file.buffer;
        const ocrText = await (0, ocrService_1.performOcr)(imageBuffer);
        console.log('OCR Result:', ocrText);
        const spendingDataFromGemini = await (0, geminiService_1.convertOcrToSpendingData)(ocrText);
        if (!spendingDataFromGemini) {
            return res.status(400).json({ message: 'Could not extract spending data from receipt.' });
        }
        // Map the extracted data to your SpendingType
        const spendingData = {
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
    }
    catch (error) {
        console.error('Error processing receipt:', error);
        res.status(500).json({ message: 'Failed to process receipt and add spending', error: error.message });
    }
};
exports.scanFromReceipt = scanFromReceipt;
const saveScannedSpending = async (req, res) => {
    const userId = req.user?.uid;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated or UID not available.' });
    }
    // Periksa hasil validasi dari express-validator
    const errors = (0, lib_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // Data yang diterima dari klien sudah divalidasi dan mungkin telah diubah/disempurnakan
    const { name, amount, date, category, items, receiptImageUrl } = req.body; // Jika Anda mengirim imageUrl dari klien
    console.log("BODY : ", req.body);
    const spendingData = {
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
    }
    catch (error) {
        console.error('Error menyimpan pengeluaran (saveScannedSpending):', error);
        res.status(500).json({ message: 'Gagal menyimpan pengeluaran', error: error.message });
    }
};
exports.saveScannedSpending = saveScannedSpending;
const adjustSpendingData = async (req, res) => {
    const userId = req.user?.uid;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated or UID not available.' });
    }
    // Periksa hasil validasi dari express-validator
    const errors = (0, lib_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // Data yang diterima dari klien sudah divalidasi dan mungkin telah diubah/disempurnakan
    const { name, amount, date, category, items, adjustAmount } = req.body; // Jika Anda mengirim imageUrl dari klien
    console.log("BODY : ", req.body);
    const spendingData = {
        name,
        amount: parseFloat(amount), // Pastikan ini angka
        date: new Date(date).toISOString().split('T')[0], // Tanggal sudah berupa string YYYY-MM-DD atau objek Date jika di-toDate()
        category,
        items,
        // receiptImageUrl, // Tambahkan jika Anda menyimpannya bersamaan
    };
    try {
        const adjustSpending = await (0, geminiService_1.adjustAmountSpendingData)(adjustAmount, spendingData);
        if (!adjustSpending) {
            return res.status(400).json({ message: 'Could not extract spending data from receipt.' });
        }
        res.status(201).json({ message: 'Pengeluaran berhasil diupdate', spending: adjustSpending });
    }
    catch (error) {
        console.error('Error menyimpan pengeluaran (adjustSpendingData):', error);
        res.status(500).json({ message: 'Gagal menyimpan pengeluaran', error: error.message });
    }
};
exports.adjustSpendingData = adjustSpendingData;
const getSpendings = async (req, res) => {
    const userId = req.user?.uid;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated or UID not available.' });
    }
    try {
        const spendings = await spendingModel.getSpendingsByUserId(userId);
        res.status(200).json(spendings);
    }
    catch (error) {
        console.error('Error fetching spendings:', error);
        res.status(500).json({ message: 'Failed to fetch spendings', error: error.message });
    }
};
exports.getSpendings = getSpendings;
const getSpendingById = async (req, res) => {
    const userId = req.user?.uid;
    const spendingId = req.params.id;
    console.log("SPENDING ID: ", spendingId);
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated or UID not available.' });
    }
    try {
        const spending = await spendingModel.getSpendingById(userId, spendingId);
        if (!spending) {
            return res.status(404).json({ message: 'Spending not found' });
        }
        res.status(200).json(spending);
    }
    catch (error) {
        console.error('Error fetching spending:', error);
        res.status(500).json({ message: 'Failed to fetch spending', error: error.message });
    }
};
exports.getSpendingById = getSpendingById;
const deleteSpending = async (req, res) => {
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
    }
    catch {
        res.status(500).json({ message: 'Failed to delete spending' });
    }
};
exports.deleteSpending = deleteSpending;
const getMonthlySpendingReport = async (req, res) => {
    const userId = req.user?.uid;
    const { year, month } = req.query;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated or UID not available.' });
    }
    if (!year || !month) {
        return res.status(400).json({ message: 'Year and month are required for the report.' });
    }
    try {
        const parsedYear = parseInt(year);
        const parsedMonth = parseInt(month);
        if (isNaN(parsedYear) || isNaN(parsedMonth)) {
            return res.status(400).json({ message: 'Invalid year or month format.' });
        }
        const spendings = await spendingModel.getMonthlySpendings(userId, parsedYear, parsedMonth);
        const totalMonthlySpending = spendings.reduce((sum, s) => sum + s.amount, 0);
        const spendingByCategory = spendings.reduce((acc, current) => {
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
    }
    catch (error) {
        console.error('Error generating monthly spending report:', error);
        res.status(500).json({ message: 'Failed to generate monthly spending report', error: error.message });
    }
};
exports.getMonthlySpendingReport = getMonthlySpendingReport;
const getReportMonthly = async (req, res) => {
    const userId = req.user?.uid;
    const { year, month } = req.query;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated or UID not available.' });
    }
    if (!year || !month) {
        return res.status(400).json({ message: 'Query parameter "year" dan "month" dibutuhkan.' });
    }
    try {
        const parsedYear = parseInt(year);
        const parsedMonth = parseInt(month);
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
        }
        else if (totalCurrentMonth > 0) {
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
    }
    catch (error) {
        console.error('Error generating monthly spending report:', error);
        res.status(500).json({ message: 'Failed to generate monthly spending report', error: error.message });
    }
};
exports.getReportMonthly = getReportMonthly;
const getCategories = async (req, res) => {
    return res.status(200).json(SpendingCategories_1.default);
};
exports.getCategories = getCategories;
