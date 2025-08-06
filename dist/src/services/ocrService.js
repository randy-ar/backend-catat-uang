"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performOcr = void 0;
// services/ocrService.ts
const tesseract_js_1 = require("tesseract.js");
const performOcr = async (imagePathOrBuffer) => {
    const worker = await (0, tesseract_js_1.createWorker)('eng');
    const ret = await worker.recognize(imagePathOrBuffer);
    await worker.terminate();
    return ret.data.text;
};
exports.performOcr = performOcr;
