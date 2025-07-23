// services/geminiService.ts
import { GoogleGenAI } from '@google/genai';
import { SpendingType, SpendingItemsType, SpendingCategoryType } from '../types/model'; // Import your types

require('dotenv').config()

// Define an interface for the expected JSON structure from Gemini
interface GeminiSpendingOutput {
  name: string;
  date: string;
  amount: number;
  category?: string; // Gemini might return string for category
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
    "category": "string (e.g., Food, Shopping, Transport)",
    "items": [
      {
        "name": "string (item name)",
        "price": "number (item price)",
        "quantity": "number (optional, default to 1 if not specified)"
      }
    ]
  }
  Jika jumlah item tidak tentu, asumsikan itu berjumlah 1.  Jika tanggal tidak bisa diekstrak, pakai tanggal saat ini.
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