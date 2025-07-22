// models/incomeModel.js
const { db } = require('../config/firebase');

const addIncome = async (userId, incomeData) => {
  const docRef = await db.collection('users').doc(userId).collection('incomes').add({
    ...incomeData,
    date: new Date(incomeData.date), // Store date as Firestore Timestamp
    createdAt: new Date()
  });
  return { id: docRef.id, ...incomeData };
};

const getIncomesByUserId = async (userId) => {
  const snapshot = await db.collection('users').doc(userId).collection('incomes').orderBy('date', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

module.exports = {
  addIncome,
  getIncomesByUserId
};