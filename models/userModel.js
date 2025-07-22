// models/userModel.js
const { db, auth } = require('../config/firebase');

const createUser = async (email, password) => {
  // Create user in Firebase Authentication
  const userRecord = await auth.createUser({ email, password });
  // Store additional user data in Firestore if needed
  await db.collection('users').doc(userRecord.uid).set({
    email: userRecord.email,
    createdAt: new Date()
  });
  return userRecord;
};

const findUserByEmail = async (email) => {
  // Note: Firebase Auth doesn't have a direct 'findByEmail' equivalent for custom logic.
  // You would typically use a signInWithEmailAndPassword for authentication
  // or query Firestore for additional user data.
  // For simplicity, we'll assume Firebase Auth handles the primary user lookup for login.
  // For checking if email exists during registration, you can attempt to create a user
  // or use admin.auth().getUserByEmail() (admin SDK only).
  try {
    const userRecord = await auth.getUserByEmail(email);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
};

module.exports = {
  createUser,
  findUserByEmail
};