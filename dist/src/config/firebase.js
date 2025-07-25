"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.db = void 0;
// config/firebase.ts
const admin = __importStar(require("firebase-admin"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
require('dotenv').config();
// Path ke serviceAccount.json di dalam folder 'dist'.
// Menggunakan process.cwd() memastikan path ini benar baik saat development maupun production.
const serviceAccountPath = path_1.default.join(process.cwd(), 'dist', 'serviceAccount.json');
// Inisialisasi aplikasi Firebase Admin SDK jika belum diinisialisasi
if (!admin.apps.length) {
    // Periksa apakah file service account ada sebelum mencoba inisialisasi
    if (fs_1.default.existsSync(serviceAccountPath)) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath)
        });
    }
    else {
        console.error('---------------------------------------------------------------------');
        console.error("ERROR: File 'dist/serviceAccount.json' tidak ditemukan.");
        console.error("Pastikan Anda sudah membuat file .env dan menjalankan skrip:");
        console.error("node scripts/generateServiceAccount.js");
        console.error('---------------------------------------------------------------------');
        process.exit(1);
    }
}
const db = admin.firestore();
exports.db = db;
const auth = admin.auth();
exports.auth = auth;
