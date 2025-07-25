// api/index.ts
import serverless from 'serverless-http';
import app from '../app'; // Pastikan path ini benar ke file `app.ts` Express Anda

// Vercel secara default mendengarkan HTTP requests.
// serverless-http adalah library yang membantu mengadaptasi aplikasi Express ke serverless environment.
const handler = serverless(app);

// Export handler sebagai fungsi serverless.
// Vercel secara otomatis mendeteksi ini sebagai Node.js Serverless Function.
export default handler; // Gunakan default export untuk Vercel