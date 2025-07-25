import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const {getTextFromImage, isSupportedFile} = require('@shelf/aws-lambda-tesseract');

const performOcr = async (imagePathOrBuffer: string | Buffer): Promise<string> => {

  // If a buffer is provided, save it to a temporary file first.
  // This is a good practice in serverless environments like Vercel/AWS Lambda,
  // as some libraries (especially those wrapping native binaries) work more reliably with file paths.
  if (Buffer.isBuffer(imagePathOrBuffer)) {
    const tempFileName = `${crypto.randomBytes(16).toString('hex')}.png`; // Assuming png, adjust if needed
    const tempFilePath = path.join(os.tmpdir(), tempFileName);

    if (!isSupportedFile(tempFileName)) {
      throw new Error('Unsupported file type');
    }

    try {
      await fs.writeFile(tempFilePath, imagePathOrBuffer);
      // Perform OCR on the file path
      return await getTextFromImage(tempFilePath);
    } finally {
      // Clean up the temporary file
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        console.error(`Failed to delete temporary OCR file: ${tempFilePath}`, cleanupError);
      }
    }
  }

  // If it's already a file path (string), process it directly.
  return getTextFromImage(imagePathOrBuffer);
};

export { performOcr };