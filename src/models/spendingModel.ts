// models/spendingModel.ts
import { db } from '../config/firebase';
import { SpendingType, SpendingItemsType } from '../types/model'; // Import tipe
import { QueryDocumentSnapshot } from 'firebase-admin/firestore'; // Import untuk tipe data Firestore

const addSpending = async (userId: string, spendingData: Omit<SpendingType, 'id'>): Promise<SpendingType> => {
  const docRef = await db.collection('users').doc(userId).collection('spendings').add({
    ...spendingData,
    date: new Date(spendingData.date),
    createdAt: new Date()
  });
  return { id: docRef.id, ...spendingData };
};

const getSpendingsByUserId = async (userId: string): Promise<SpendingType[]> => {
  const snapshot = await db.collection('users').doc(userId).collection('spendings').orderBy('date', 'desc').get();
  return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() } as SpendingType));
};

const getMonthlySpendings = async (userId: string, year: number, month: number): Promise<SpendingType[]> => {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const snapshot = await db.collection('users').doc(userId).collection('spendings')
    .where('date', '>=', startOfMonth)
    .where('date', '<=', endOfMonth)
    .orderBy('date', 'asc')
    .get();

  return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() } as SpendingType));
};

export {
  addSpending,
  getSpendingsByUserId,
  getMonthlySpendings
};