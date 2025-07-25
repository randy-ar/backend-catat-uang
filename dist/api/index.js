"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// api/index.ts
const serverless_http_1 = __importDefault(require("serverless-http"));
const app_1 = __importDefault(require("../app")); // Pastikan path ini benar ke file `app.ts` Express Anda
// Vercel secara default mendengarkan HTTP requests.
// serverless-http adalah library yang membantu mengadaptasi aplikasi Express ke serverless environment.
const handler = (0, serverless_http_1.default)(app_1.default);
// Export handler sebagai fungsi serverless.
// Vercel secara otomatis mendeteksi ini sebagai Node.js Serverless Function.
exports.default = handler; // Gunakan default export untuk Vercel
