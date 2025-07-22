// models/spendingModel.js
const { db } = require('../config/firebase');

const addSpending = async (userId, spendingData) => {
  const docRef = await db.collection('users').doc(userId).collection('spendings').add({
    ...spendingData,
    date: new Date(spendingData.date), // Store date as Firestore Timestamp
    createdAt: new Date()
  });
  return { id: docRef.id, ...spendingData };
};

const getSpendingsByUserId = async (userId) => {
  const snapshot = await db.collection('users').doc(userId).collection('spendings').orderBy('date', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const getMonthlySpendings = async (userId, year, month) => {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0); // Last day of the month

  const snapshot = await db.collection('users').doc(userId).collection('spendings')
    .where('date', '>=', startOfMonth)
    .where('date', '<=', endOfMonth)
    .orderBy('date', 'asc')
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};


module.exports = {
  addSpending,
  getSpendingsByUserId,
  getMonthlySpendings
};