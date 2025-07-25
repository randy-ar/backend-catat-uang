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

export interface WalletType {
  amount: number;
  spendingPercent: number | string;
}

// Tipe untuk dot yang akan ditampilkan di kalender
export interface CalendarDotType {
  key: string;
  color: string;
  selectedDotColor: string;
  type: 'income' | 'spending'; // Tipe transaksi (income atau spending)
}

// Tipe untuk data yang ditandai di kalender
export interface MarkedDatesType {
  [date: string]: { // Kunci adalah tanggal dalam format 'YYYY-MM-DD'
    dots?: CalendarDotType[];
    marked?: boolean; // Jika Anda ingin menandai hari tanpa dot
    selected?: boolean; // Jika Anda ingin menandai hari sebagai terpilih
    selectedColor?: string;
    // Tambahkan properti lain yang mungkin digunakan oleh react-native-calendars
  };
}

export interface AreaChartDatasetType {
  data: number[];
  color: (opacity?: number) => string; // Fungsi untuk warna
  strokeWidth: number;
}

export interface AreaChartSeriesType {
  labels: string[]; // Label untuk sumbu X (bulan)
  datasets: AreaChartDatasetType[];
}

export interface PieChartSeriesType {
  labels: string[]; // Label untuk setiap segmen (nama kategori)
  data: number[]; // Proporsi atau nilai mentah
  colors?: string[]; // Warna untuk setiap segmen (optional, jika Anda ingin kontrol dari backend)
}

// Tipe untuk respons API laporan bulanan
export interface MonthlyReportResponse {
  message: string;
  wallet: WalletType;
  markedDates: MarkedDatesType;
  areaChartData: AreaChartSeriesType;
  pieChartData: PieChartSeriesType;
}
