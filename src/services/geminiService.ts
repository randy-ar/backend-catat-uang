// services/geminiService.ts
import { GoogleGenAI } from '@google/genai';
import { SpendingType, SpendingItemsType, SpendingCategoryType } from '../types/model'; // Import your types

require('dotenv').config()

// Define an interface for the expected JSON structure from Gemini
interface GeminiSpendingOutput {
  name: string;
  date: string;
  amount: number;
  category?: {
    id: number;
    name: string;
  }; // Gemini might return string for category
  items: Array<{
    name: string;
    price: number;
    quantity?: number;
  }>;
}

console.log("GEMINI_API_KEY: ", process.env.GEMINI_API_KEY);


const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY as string}); // Type assertion for process.env

const convertOcrToSpendingData = async (ocrText: string): Promise<GeminiSpendingOutput | null> => {
  const prompt = `Konversi teks OCR dari struk belanja menjadi objek JSON dengan struktur berikut:
  {
    "name": "string (name of the store/merchant)",
    "date": "YYYY-MM-DD (date of transaction)",
    "amount": "number (total amount)",
    "category": "object(id: number, name: string)",
    "items": [
      {
        "name": "string (item name)",
        "price": "number (item price)",
        "quantity": "number (optional, default to 1 if not specified)"
      }
    ]
  }
  Jika jumlah item tidak tentu, asumsikan itu berjumlah 1.  Jika tanggal tidak bisa diekstrak, pakai tanggal saat ini. Pilih salah satu category dari array berikut yang menurut anda cocok: [{ id: 1, name: 'Foods' },{ id: 2, name: 'Transportation' },{ id: 3, name: 'Health' },{ id: 4, name: 'Education' },{ id: 5, name: 'Communication' },{ id: 6, name: 'Hobbies' },{ id: 7, name: 'Utilities' },{ id: 8, name: 'Travel' },{ id: 9, name: 'Gifts' },{ id: 10, name: 'Bills' },{ id: 11, name: 'Entertainment' },{ id: 12, name: 'Shoppings' },{ id: 13, name: 'Clothing' },{ id: 14, name: 'Other' }]
  Teks OCR:
  "${ocrText}"`;

  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    const response = await result.text;
    const text = response!;

    // Try to parse the text as JSON, handling potential markdown
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    let jsonString = jsonMatch ? jsonMatch[1] : text;

    // Fallback if it's just raw JSON string without markdown block
    if (!jsonMatch && text.startsWith('{') && text.endsWith('}')) {
        jsonString = text;
    }

    const parsedData: GeminiSpendingOutput = JSON.parse(jsonString);

    // Basic validation of parsed data
    if (typeof parsedData.name !== 'string' || typeof parsedData.amount !== 'number' || !Array.isArray(parsedData.items)) {
        console.warn('Gemini output did not match expected structure:', parsedData);
        return null;
    }

    return parsedData;
  } catch (error) {
    console.error('Error calling Gemini API or parsing response:', error);
    return null;
  }
};

export { convertOcrToSpendingData };