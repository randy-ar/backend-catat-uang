// scripts/generateServiceAccount.js
const fs = require('fs');
const path = require('path');

// Muat variabel lingkungan dari file .env
require('dotenv').config();

// Definisikan objek service account dari variabel lingkungan
// Pastikan variabel ini ada di file .env Anda
const serviceAccount = {
  type: "service_account",
  project_id: process.env.PROJECT_ID || "backend-catat-uang",
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_CERT_URL,
  universe_domain: "googleapis.com"
};

// Validasi bahwa semua kunci yang diperlukan ada
const requiredKeys = ['project_id', 'private_key_id', 'private_key', 'client_email', 'client_id', 'auth_uri', 'token_uri'];
for (const key of requiredKeys) {
  if (!serviceAccount[key]) {
    console.error(`Error: Variabel lingkungan untuk service account tidak ditemukan: ${key.toUpperCase()}`);
    process.exit(1); // Keluar dengan kode error
  }
}

// Tentukan path output untuk file JSON di direktori 'dist'
const outputDir = path.join(__dirname, '..', 'dist');
const outputPath = path.join(outputDir, 'serviceAccount.json');

// Pastikan direktori output 'dist' ada. Jika tidak, buat direktorinya.
if (!fs.existsSync(outputDir)) {
  console.log(`Membuat direktori: ${outputDir}`);
  fs.mkdirSync(outputDir, { recursive: true });
}

// Tulis objek ke file JSON
fs.writeFile(outputPath, JSON.stringify(serviceAccount, null, 2), 'utf8', (err) => {
  if (err) {
    return console.error('Gagal menulis file service account:', err);
  }
  console.log(`✅ File serviceAccount.json berhasil dibuat di: ${outputPath} ${JSON.stringify(serviceAccount, null, 2)}`);
});