"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = require("../config/firebase");
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const idToken = authHeader && authHeader.split(' ')[1];
    if (!idToken) {
        return res.status(401).json({ message: 'Firebase ID token required' });
    }
    try {
        const decodedToken = await firebase_1.auth.verifyIdToken(idToken);
        req.user = { uid: decodedToken.uid, email: decodedToken.email || null }; // Atur req.user
        next();
    }
    catch (error) { // Menggunakan 'any' sementara untuk error
        console.error('Error verifying Firebase ID token:', error);
        if (error.code === 'auth/id-token-expired') {
            return res.status(403).json({ message: 'Firebase ID token expired' });
        }
        return res.status(403).json({ message: 'Invalid Firebase ID token' });
    }
};
exports.default = authenticateToken;
