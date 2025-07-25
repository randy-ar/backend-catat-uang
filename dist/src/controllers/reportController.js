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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportMonth = void 0;
const incomeModel = __importStar(require("../models/incomeModel"));
const spendingModel = __importStar(require("../models/spendingModel"));
const getReportMonth = async (req, res) => {
    const userId = req.user?.uid;
    const { year, month } = req.query; // Query params diharapkan 'year' dan 'month'
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated or UID not available.' });
    }
    if (!year || !month) {
        return res.status(400).json({ message: 'Year and month are required for the report.' });
    }
    const parsedYear = parseInt(year);
    const parsedMonth = parseInt(month);
    if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({ message: 'Invalid year or month format.' });
    }
    try {
        // Ambil data income dan spending untuk bulan ini
        const incomeThisMonth = await incomeModel.getMonthlyIncomes(userId, parsedYear, parsedMonth);
        const spendingThisMonth = await spendingModel.getMonthlySpendings(userId, parsedYear, parsedMonth);
        const incomeThisUser = await incomeModel.getIncomesByUserId(userId);
        const spendingThisUser = await spendingModel.getSpendingsByUserId(userId);
        const totalIncomeThisMonth = incomeThisMonth.reduce((sum, income) => sum + income.amount, 0);
        const totalSpendingThisMonth = spendingThisMonth.reduce((sum, spending) => sum + spending.amount, 0);
        const totalIncomeThisUser = incomeThisUser.reduce((sum, income) => sum + income.amount, 0);
        const totalSpendingThisUser = spendingThisUser.reduce((sum, spending) => sum + spending.amount, 0);
        // --- 1. Data Wallet ---
        const wallet = {
            amount: totalIncomeThisUser - totalSpendingThisUser, // Saldo bersih bulan ini
            spendingPercent: 0
        };
        if (totalIncomeThisMonth > 0) {
            wallet.spendingPercent = (totalSpendingThisMonth / totalIncomeThisMonth) * 100;
            // Opsional: Batasi hingga 2 desimal
            wallet.spendingPercent = parseFloat(wallet.spendingPercent.toFixed(2));
        }
        else if (totalSpendingThisMonth > 0) {
            // Jika ada pengeluaran tapi tidak ada pendapatan, anggap 100% (atau lebih) terpakai
            wallet.spendingPercent = 100;
        }
        // Jika keduanya 0, spendingPercent tetap 0 (default)
        // --- 2. Data Marked Dates (Calendar) - Untuk 3 bulan (sebelum, sekarang, sesudah) ---
        const markedDates = {};
        let transactionsForMarkedDates = [];
        // Mengumpulkan data 1 bulan ke belakang, bulan ini, dan 1 bulan ke depan (total 3 bulan)
        for (let i = -1; i <= 1; i++) {
            let currentLoopMonth = parsedMonth + i;
            let currentLoopYear = parsedYear;
            // Handle year rollovers
            if (currentLoopMonth <= 0) {
                currentLoopMonth += 12;
                currentLoopYear -= 1;
            }
            else if (currentLoopMonth > 12) {
                currentLoopMonth -= 12;
                currentLoopYear += 1;
            }
            // Fetch incomes and spendings for the current month in the loop
            const incomes = await incomeModel.getMonthlyIncomes(userId, currentLoopYear, currentLoopMonth);
            const spendings = await spendingModel.getMonthlySpendings(userId, currentLoopYear, currentLoopMonth);
            transactionsForMarkedDates = transactionsForMarkedDates.concat(incomes, spendings);
        }
        transactionsForMarkedDates.forEach(transaction => {
            const date = new Date(transaction.date);
            // Perhatikan: getMonth() mengembalikan 0-11, jadi tambahkan 1
            const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            if (!markedDates[dateKey]) {
                markedDates[dateKey] = { dots: [] };
            }
            const dotColorIncome = '#008236'; // Contoh warna hijau untuk income
            const dotColorSpending = '#c70036'; // Contoh warna merah untuk spending
            // Menggunakan type guards untuk membedakan IncomeType dan SpendingType
            // Properti 'description' biasanya ada di IncomeType, 'items' di SpendingType
            if ('description' in transaction && typeof transaction.amount === 'number') {
                markedDates[dateKey].dots?.push({
                    key: `income-${transaction.id}`,
                    color: dotColorIncome,
                    selectedDotColor: dotColorIncome,
                    type: 'income'
                });
            }
            else if ('items' in transaction && Array.isArray(transaction.items)) {
                markedDates[dateKey].dots?.push({
                    key: `spending-${transaction.id}`,
                    color: dotColorSpending,
                    selectedDotColor: dotColorSpending,
                    type: 'spending'
                });
            }
        });
        // --- 3. Data Area Chart (Cash flow on half year) - 3 bulan ke belakang, bulan ini, 2 bulan ke depan ---
        const areaChartLabels = [];
        const incomeDataPoints = [];
        const spendingDataPoints = [];
        // Loop dari 3 bulan sebelum bulan yang diminta hingga 2 bulan setelahnya (total 6 bulan)
        for (let i = -3; i <= 2; i++) {
            let currentMonth = parsedMonth + i;
            let currentYear = parsedYear;
            // Handle year rollovers
            if (currentMonth <= 0) {
                currentMonth += 12; // Adjusted month (e.g., 0 becomes 12, -1 becomes 11)
                currentYear -= 1; // Adjusted year
            }
            else if (currentMonth > 12) {
                currentMonth -= 12; // Adjusted month (e.g., 13 becomes 1)
                currentYear += 1; // Adjusted year
            }
            const d = new Date(currentYear, currentMonth - 1, 1);
            const monthName = d.toLocaleString('en-US', { month: 'short' });
            areaChartLabels.push(monthName);
            const monthlyIncomeData = await incomeModel.getMonthlyIncomes(userId, currentYear, currentMonth);
            const monthlySpendingData = await spendingModel.getMonthlySpendings(userId, currentYear, currentMonth);
            incomeDataPoints.push(monthlyIncomeData.reduce((sum, inc) => sum + inc.amount, 0));
            spendingDataPoints.push(monthlySpendingData.reduce((sum, sp) => sum + sp.amount, 0));
        }
        const areaChartData = {
            labels: areaChartLabels,
            datasets: [
                {
                    data: incomeDataPoints,
                    color: (opacity = 1) => `rgba(0, 130, 54, ${opacity})`,
                    strokeWidth: 4,
                },
                {
                    data: spendingDataPoints,
                    color: (opacity = 1) => `rgba(199, 0, 54, ${opacity})`,
                    strokeWidth: 4,
                }
            ],
        };
        // --- 4. Data Pie Chart (Spending category on July) - Ambil 5 kategori terbesar ---
        const spendingByCategoryRaw = spendingThisMonth.reduce((acc, current) => {
            const categoryName = current.category?.name || 'Other';
            acc[categoryName] = (acc[categoryName] || 0) + current.amount;
            return acc;
        }, {});
        // Ubah objek ke array, urutkan berdasarkan jumlah, dan ambil 5 teratas
        let categoryBreakdown = Object.entries(spendingByCategoryRaw).map(([name, amount]) => ({ name, amount }));
        categoryBreakdown.sort((a, b) => b.amount - a.amount); // Urutkan dari terbesar ke terkecil
        const topCategories = categoryBreakdown.slice(0, 5);
        let otherAmount = 0;
        // Jika ada lebih dari 5 kategori, hitung total dari sisanya sebagai 'Other'
        if (categoryBreakdown.length > 5) {
            otherAmount = categoryBreakdown.slice(5).reduce((sum, cat) => sum + cat.amount, 0);
            topCategories.push({ name: 'Other', amount: otherAmount }); // Tambahkan kategori 'Other'
        }
        const pieChartLabels = topCategories.map(cat => cat.name);
        const pieChartDataValues = topCategories.map(cat => cat.amount);
        // Konversi nilai mentah menjadi proporsi (0.0 - 1.0) untuk ProgressChart
        const totalPieChartAmount = pieChartDataValues.reduce((sum, val) => sum + val, 0);
        const pieChartProportions = pieChartDataValues.map(val => totalPieChartAmount > 0 ? val / totalPieChartAmount : 0);
        const pieChartData = {
            labels: pieChartLabels,
            data: pieChartProportions,
        };
        // --- Kirim Respons Akhir ---
        const responseData = {
            message: `Laporan bulanan untuk ${parsedMonth}/${parsedYear} berhasil diambil.`,
            wallet,
            markedDates,
            areaChartData,
            pieChartData,
        };
        res.status(200).json(responseData);
    }
    catch (error) {
        console.error('Error fetching monthly report:', error);
        res.status(500).json({ message: 'Gagal mengambil laporan bulanan', error: error.message });
    }
};
exports.getReportMonth = getReportMonth;
