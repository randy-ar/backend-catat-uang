// services/ocrService.ts
import Tesseract, { OEM } from "tesseract.js";

const performOcr = async (imagePathOrBuffer: string | Buffer): Promise<string> => {
  const worker = await Tesseract.createWorker('ind', {} as OEM, {
    corePath: 'dist/tesseract.js-core',
  });
  const ret = await worker.recognize(imagePathOrBuffer);
  await worker.terminate();
  return ret.data.text;
};

export { performOcr };