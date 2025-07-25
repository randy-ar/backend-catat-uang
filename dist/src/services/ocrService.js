"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performOcr = void 0;
// services/ocrService.ts
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const performOcr = async (imagePathOrBuffer) => {
    const worker = await tesseract_js_1.default.createWorker('ind');
    const ret = await worker.recognize(imagePathOrBuffer);
    await worker.terminate();
    return ret.data.text;
};
exports.performOcr = performOcr;
