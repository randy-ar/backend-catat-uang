// services/ocrService.ts
import { createWorker } from 'tesseract.js';

const performOcr = async (imagePathOrBuffer: string | Buffer): Promise<string> => {
  const worker = await createWorker('eng');
  const ret = await worker.recognize(imagePathOrBuffer);
  await worker.terminate();
  return ret.data.text;
};

export { performOcr };