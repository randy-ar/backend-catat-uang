// src/types/models.ts

export interface IncomeCategoryType {
  name: string;
  id: number;
}

export interface IncomeType {
  name: string;
  id?: string; // ID biasanya string dari Firebase
  date: string;
  amount: number;
  description?: string;
  category?: IncomeCategoryType;
}

export interface SpendingCategoryType {
  name: string;
  id: number;
}

export interface SpendingItemsType {
  name: string;
  id?: number; // ID untuk item dalam struk mungkin tidak selalu ada atau dari database
  price: number;
  quantity?: number;
}

export interface SpendingType {
  name: string;
  id?: string; // ID biasanya string dari Firebase
  date: string;
  amount: number;
  category?: SpendingCategoryType;
  receiptImageUrl?: string;
  items: SpendingItemsType[];
}

// Tambahkan tipe untuk objek user yang diinject oleh middleware
export interface AuthUser {
  uid: string;
  email: string | null;
}