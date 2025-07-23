// config/firebase.ts
import * as admin from 'firebase-admin';

// Ganti dengan path ke serviceAccountKey.json Anda
// Pastikan file JSON ini ada dan dapat diakses
const serviceAccount = require('../../keys/serviceAccountKey.json');

// Inisialisasi aplikasi Firebase Admin SDK jika belum diinisialisasi
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };