"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyIncomes = exports.deleteIncome = exports.updateIncome = exports.getIncomeById = exports.getIncomesByUserId = exports.addIncome = void 0;
// models/incomeModel.ts
const firebase_1 = require("../config/firebase");
const addIncome = async (userId, incomeData) => {
    const docRef = await firebase_1.db.collection('users').doc(userId).collection('incomes').add({
        name: incomeData.name,
        amount: incomeData.amount,
        description: incomeData.description,
        category: incomeData.category,
        date: new Date(incomeData.date).toISOString().split('T')[0],
        createdAt: new Date()
    });
    return {
        id: docRef.id,
        name: incomeData.name,
        amount: incomeData.amount,
        description: incomeData.description,
        category: incomeData.category,
        date: new Date(incomeData.date).toISOString().split('T')[0],
    };
};
exports.addIncome = addIncome;
const getIncomesByUserId = async (userId) => {
    const snapshot = await firebase_1.db.collection('users').doc(userId).collection('incomes').orderBy('date', 'desc').get();
    console.log(snapshot.docs);
    return snapshot.docs.map(doc => ({
        id: doc.ref.id,
        name: doc.data().name,
        amount: doc.data().amount,
        description: doc.data().description,
        category: {
            id: doc.data().category.id,
            name: doc.data().category.name
        },
        date: new Date(doc.data().date).toISOString().split('T')[0],
    }));
};
exports.getIncomesByUserId = getIncomesByUserId;
const getIncomeById = async (userId, incomeId) => {
    const snapshot = await firebase_1.db.collection('users').doc(userId).collection('incomes').doc(incomeId).get();
    if (!snapshot.exists) {
        return null;
    }
    return {
        id: snapshot.ref.id,
        name: snapshot.data()?.name,
        amount: snapshot.data()?.amount,
        description: snapshot.data()?.description,
        category: snapshot.data()?.category,
        date: new Date(snapshot.data()?.date).toISOString().split('T')[0],
    };
};
exports.getIncomeById = getIncomeById;
const updateIncome = async (userId, incomeId, updateData) => {
    await firebase_1.db.collection('users').doc(userId).collection('incomes').doc(incomeId).update(updateData);
    return { id: incomeId, ...updateData };
};
exports.updateIncome = updateIncome;
const deleteIncome = async (userId, incomeId) => {
    await firebase_1.db.collection('users').doc(userId).collection('incomes').doc(incomeId).delete();
    return { message: 'Income deleted successfully' };
};
exports.deleteIncome = deleteIncome;
const getMonthlyIncomes = async (userId, year, month) => {
    // Bulan di JavaScript Date object adalah 0-indexed (0=Jan, 11=Dec), jadi kita kurangi 1.
    const startDate = new Date(year, month - 1, 1);
    // Untuk mendapatkan akhir bulan, kita ambil hari pertama bulan berikutnya lalu query < dari tanggal itu.
    const endDate = new Date(year, month, 1);
    const startString = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const endString = endDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const snapshot = await firebase_1.db.collection('users').doc(userId).collection('incomes')
        .where('date', '>=', startString)
        .where('date', '<', endString)
        .orderBy('date', 'desc')
        .get();
    return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        amount: doc.data().amount,
        description: doc.data().description,
        category: doc.data().category,
        date: new Date(doc.data().date).toISOString().split('T')[0],
    }));
};
exports.getMonthlyIncomes = getMonthlyIncomes;
