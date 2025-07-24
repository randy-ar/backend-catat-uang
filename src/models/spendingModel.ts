// models/spendingModel.ts
import { db } from '../config/firebase';
import { SpendingType, SpendingItemsType } from '../types/model'; // Import tipe
import { QueryDocumentSnapshot } from 'firebase-admin/firestore'; // Import untuk tipe data Firestore

const addSpending = async (userId: string, spendingData: Omit<SpendingType, 'id'>): Promise<SpendingType> => {
  console.log("SPENDING DATA: ", spendingData);
  const docRef = await db.collection('users').doc(userId).collection('spendings').add({
    ...spendingData,
    date: new Date(spendingData.date).toISOString().split('T')[0],
    createdAt: new Date()
  });
  return { id: docRef.id, ...spendingData };
};

const getSpendingsByUserId = async (userId: string): Promise<SpendingType[]> => {
  const snapshot = await db.collection('users').doc(userId).collection('spendings').orderBy('date', 'desc').get();
  return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({ 
    id: doc.id, 
    name: doc.data().name, 
    amount: doc.data().amount, 
    date: new Date(doc.data().date).toISOString().split('T')[0],
    category: doc.data().category,
    items: doc.data().items.map((item: SpendingItemsType) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    } as SpendingItemsType))
  } as SpendingType));
};

const getSpendingById = async (userId: string, spendingId: string): Promise<SpendingType | null> => {
  const snapshot = await db.collection('users').doc(userId).collection('spendings').doc(spendingId).get();
  if (!snapshot.exists) {
    return null;
  }
  return {
    id: snapshot.id,
    name: snapshot.data()?.name,
    amount: snapshot.data()?.amount,
    date: new Date(snapshot.data()?.date).toISOString().split('T')[0],
    category: snapshot.data()?.category,
    items: snapshot.data()?.items as SpendingItemsType[]
  } as SpendingType
}

const getMonthlySpendings = async (userId: string, year: number, month: number): Promise<SpendingType[]> => {
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
  const endString = endDate.toISOString().split('T')[0];   // YYYY-MM-DD

  const snapshot = await db.collection('users').doc(userId).collection('spendings')
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
    items: doc.data().items.map((item: SpendingItemsType) => ({ 
      id: item.id, 
      name: item.name, 
      price: item.price,
      quantity: item.quantity,
    } as SpendingItemsType))
  } as SpendingType));
};

const deleteSpending = async (userId: string, spendingId: string): Promise<{ message: string }> => {
  await db.collection('users').doc(userId).collection('spendings').doc(spendingId).delete();
  return { message: 'Income deleted successfully' };
}

export {
  addSpending,
  getSpendingsByUserId,
  getSpendingById,
  getMonthlySpendings,
  deleteSpending
};