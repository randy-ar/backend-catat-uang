// services/ocrService.js
const { createWorker } = require('tesseract.js');

const performOcr = async (imagePathOrBuffer) => {
  const worker = await createWorker('eng'); // 'eng' for English, you might need 'ind' for Indonesian if available
  const ret = await worker.recognize(imagePathOrBuffer);
  await worker.terminate();
  return ret.data.text;
};

module.exports = { performOcr };