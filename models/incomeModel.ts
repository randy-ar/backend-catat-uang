// models/incomeModel.ts
import { db } from '../config/firebase';
import { IncomeType } from '../src/types/model'; // Import tipe

const addIncome = async (userId: string, incomeData: Omit<IncomeType, 'id'>): Promise<IncomeType> => {
  const docRef = await db.collection('users').doc(userId).collection('incomes').add({
    name: incomeData.name,
    amount: incomeData.amount,
    description: incomeData.description,
    category: incomeData.category,
    date: new Date(incomeData.date),
    createdAt: new Date()
  });
  return { 
    id: docRef.id,
    name: incomeData.name,
    amount: incomeData.amount,
    description: incomeData.description,
    category: incomeData.category,
    date: new Date(incomeData.date).toISOString().split('T')[0],
  } as IncomeType;
};

const getIncomesByUserId = async (userId: string): Promise<IncomeType[]> => {
  const snapshot = await db.collection('users').doc(userId).collection('incomes').orderBy('date', 'desc').get(); 
  console.log(snapshot.docs);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    name: doc.data().name, 
    amount: doc.data().amount, 
    description: doc.data().description, 
    category: {
      id: doc.data().category.id,
      name: doc.data().category.name
    },
    date: new Date(doc.data().date).toISOString().split('T')[0],
   } as IncomeType)
  );
};

const updateIncome = async (userId: string, incomeId: string, updateData: Partial<IncomeType>): Promise<IncomeType> => {
  await db.collection('users').doc(userId).collection('incomes').doc(incomeId).update(updateData);
  return { id: incomeId, ...updateData as IncomeType };
};

const deleteIncome = async (userId: string, incomeId: string): Promise<{ message: string }> => {
  await db.collection('users').doc(userId).collection('incomes').doc(incomeId).delete();
  return { message: 'Income deleted successfully' };
};

export {
  addIncome,
  getIncomesByUserId,
  updateIncome,
  deleteIncome
};