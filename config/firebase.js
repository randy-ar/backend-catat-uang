// config/firebase.js
const admin = require('firebase-admin');

// Ganti dengan path ke serviceAccountKey.json Anda
const serviceAccount = require('../keys/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.firestore();

module.exports = { db, auth };