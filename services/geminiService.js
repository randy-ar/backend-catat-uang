// services/geminiService.js
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config()

const genAI = new GoogleGenAI({apiKey: process.env.GENAI_API_KEY});

const convertOcrToSpendingData = async (ocrText) => {
  const prompt = `Convert the following OCR text from a receipt into a JSON object with the following structure:
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
  If an item's quantity is not specified, assume it's 1. If date or amount cannot be extracted, return null for those fields.
  OCR Text:
  "${ocrText}"`;

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });
    const response = await result.response;
    const text = response.text();
    // Gemini might return markdown formatted JSON, so we need to extract it
    const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
};

module.exports = { convertOcrToSpendingData };