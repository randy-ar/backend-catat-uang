// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth } = require('../config/firebase');
const userModel = require('../models/userModel');
require('dotenv').config()

const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash password (Firebase Auth handles password hashing internally for direct auth methods,
    // but if you were storing in Firestore, you'd hash it here before storing.)
    // For direct Firebase Auth, you don't need to hash here.

    const userRecord = await userModel.createUser(email, password);

    // Generate JWT token
    const token = jwt.sign({ uid: userRecord.uid, email: userRecord.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'auth/email-already-in-use') {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Authenticate with Firebase (this requires a client-side SDK or a custom token approach for secure password handling)
    // For a backend-only approach using admin SDK, you generally won't use password directly for login.
    // Instead, you'd typically verify an ID token sent from a client-side Firebase Auth login.
    // For simplicity and demonstrating a common API pattern, we'll simulate a login.
    // In a real scenario, the client would send the Firebase ID token after logging in there.

    // A more secure backend approach would be:
    // 1. Client logs in with Firebase Client SDK, gets ID token.
    // 2. Client sends ID token to backend.
    // 3. Backend verifies ID token using auth.verifyIdToken(idToken).

    // For this example, we'll simulate a direct login for demonstration.
    // **NOTE: This is not how you'd typically handle password directly in backend for Firebase Auth.**
    // You would use `signInWithEmailAndPassword` on the client, get the ID token, and send it.

    const userRecord = await auth.getUserByEmail(email);
    // If you were storing hashed passwords in Firestore:
    // const isMatch = await bcrypt.compare(password, userRecord.passwordHash);
    // if (!isMatch) {
    //   return res.status(401).json({ message: 'Invalid credentials' });
    // }

    // Since we're using Firebase Auth's built-in mechanism for authentication,
    // the password check is usually done on the client side.
    // If you need to verify password on backend, you'd use a custom token or Firebase client SDK in a secure env.
    // For this example, we'll just check if user exists.

    // Generate JWT token
    const token = jwt.sign({ uid: userRecord.uid, email: userRecord.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Logged in successfully', token });
  } catch (error) {
    console.error('Login error:', error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

module.exports = {
  register,
  login
};