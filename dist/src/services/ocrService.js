"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performOcr = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const crypto_1 = __importDefault(require("crypto"));
const { getTextFromImage, isSupportedFile } = require('@shelf/aws-lambda-tesseract');
const performOcr = async (imagePathOrBuffer) => {
    // If a buffer is provided, save it to a temporary file first.
    // This is a good practice in serverless environments like Vercel/AWS Lambda,
    // as some libraries (especially those wrapping native binaries) work more reliably with file paths.
    if (Buffer.isBuffer(imagePathOrBuffer)) {
        const tempFileName = `${crypto_1.default.randomBytes(16).toString('hex')}.png`; // Assuming png, adjust if needed
        const tempFilePath = path_1.default.join(os_1.default.tmpdir(), tempFileName);
        if (!isSupportedFile(tempFileName)) {
            throw new Error('Unsupported file type');
        }
        try {
            await fs_1.promises.writeFile(tempFilePath, imagePathOrBuffer);
            // Perform OCR on the file path
            return await getTextFromImage(tempFilePath);
        }
        finally {
            // Clean up the temporary file
            try {
                await fs_1.promises.unlink(tempFilePath);
            }
            catch (cleanupError) {
                console.error(`Failed to delete temporary OCR file: ${tempFilePath}`, cleanupError);
            }
        }
    }
    // If it's already a file path (string), process it directly.
    return getTextFromImage(imagePathOrBuffer);
};
exports.performOcr = performOcr;
