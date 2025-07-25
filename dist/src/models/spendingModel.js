"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSpending = exports.getMonthlySpendings = exports.getSpendingById = exports.getSpendingsByUserId = exports.updateSpending = exports.addSpending = void 0;
// models/spendingModel.ts
const firebase_1 = require("../config/firebase");
const addSpending = async (userId, spendingData) => {
    console.log("SPENDING DATA: ", spendingData);
    const docRef = await firebase_1.db.collection('users').doc(userId).collection('spendings').add({
        ...spendingData,
        date: new Date(spendingData.date).toISOString().split('T')[0],
        createdAt: new Date()
    });
    return { id: docRef.id, ...spendingData };
};
exports.addSpending = addSpending;
const updateSpending = async (userId, spendingId, updateData) => {
    await firebase_1.db.collection('users').doc(userId).collection('spendings').doc(spendingId).update(updateData);
    return { id: spendingId, ...updateData };
};
exports.updateSpending = updateSpending;
const getSpendingsByUserId = async (userId) => {
    const snapshot = await firebase_1.db.collection('users').doc(userId).collection('spendings').orderBy('date', 'desc').get();
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        amount: doc.data().amount,
        date: new Date(doc.data().date).toISOString().split('T')[0],
        category: doc.data().category,
        items: doc.data().items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        }))
    }));
};
exports.getSpendingsByUserId = getSpendingsByUserId;
const getSpendingById = async (userId, spendingId) => {
    const snapshot = await firebase_1.db.collection('users').doc(userId).collection('spendings').doc(spendingId).get();
    if (!snapshot.exists) {
        return null;
    }
    return {
        id: snapshot.id,
        name: snapshot.data()?.name,
        amount: snapshot.data()?.amount,
        date: new Date(snapshot.data()?.date).toISOString().split('T')[0],
        category: snapshot.data()?.category,
        items: snapshot.data()?.items
    };
};
exports.getSpendingById = getSpendingById;
const getMonthlySpendings = async (userId, year, month) => {
    // const startOfMonth = new Date(year, month - 1, 1);
    // const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    // const snapshot = await db.collection('users').doc(userId).collection('spendings')
    //   .where('date', '>=', startOfMonth)
    //   .where('date', '<=', endOfMonth)
    //   .orderBy('date', 'asc')
    //   .get();
    // return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() } as SpendingType));
    // Bulan di JavaScript Date object adalah 0-indexed (0=Jan, 11=Dec), jadi kita kurangi 1.
    const startDate = new Date(year, month - 1, 1);
    // Untuk mendapatkan akhir bulan, kita ambil hari pertama bulan berikutnya lalu query < dari tanggal itu.
    const endDate = new Date(year, month, 1);
    const startString = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const endString = endDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const snapshot = await firebase_1.db.collection('users').doc(userId).collection('spendings')
        .where('date', '>=', startString)
        .where('date', '<', endString)
        .orderBy('date', 'desc')
        .get();
    return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        amount: doc.data().amount,
        category: doc.data().category,
        date: new Date(doc.data().date).toISOString().split('T')[0],
        items: doc.data().items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        }))
    }));
};
exports.getMonthlySpendings = getMonthlySpendings;
const deleteSpending = async (userId, spendingId) => {
    await firebase_1.db.collection('users').doc(userId).collection('spendings').doc(spendingId).delete();
    return { message: 'Income deleted successfully' };
};
exports.deleteSpending = deleteSpending;
