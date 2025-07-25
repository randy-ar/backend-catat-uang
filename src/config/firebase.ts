// config/firebase.ts
import { exec } from 'child_process';
import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

require('dotenv').config()

// Path ke serviceAccount.json di dalam folder 'dist'.
// Menggunakan process.cwd() memastikan path ini benar baik saat development maupun production.
const serviceAccountPath = path.join(process.cwd(), 'dist', 'serviceAccount.json');

// Inisialisasi aplikasi Firebase Admin SDK jika belum diinisialisasi
if (!admin.apps.length) {
  // Periksa apakah file service account ada sebelum mencoba inisialisasi
  if (fs.existsSync(serviceAccountPath)) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath)
    });
  } else {
    console.error('---------------------------------------------------------------------');
    console.error("ERROR: File 'dist/serviceAccount.json' tidak ditemukan.");
    console.error("Pastikan Anda sudah membuat file .env dan menjalankan skrip:");
    console.error("node scripts/generateServiceAccount.js");
    console.error('---------------------------------------------------------------------');
    exec('node scripts/generateServiceAccount.js');
    process.exit(1);
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };