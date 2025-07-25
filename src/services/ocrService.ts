// services/ocrService.ts
import Tesseract, { OEM } from "tesseract.js";

const performOcr = async (imagePathOrBuffer: string | Buffer): Promise<string> => {
  const worker = await Tesseract.createWorker('ind');
  const ret = await worker.recognize(imagePathOrBuffer);
  await worker.terminate();
  return ret.data.text;
};

export { performOcr };