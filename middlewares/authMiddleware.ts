// middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { AuthUser } from '../src/types/model'; // Import AuthUser type

// Perluas antarmuka Request dari Express
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser; // Tambahkan properti user opsional
    }
  }
}

const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const idToken = authHeader && authHeader.split(' ')[1];

  if (!idToken) {
    return res.status(401).json({ message: 'Firebase ID token required' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = { uid: decodedToken.uid, email: decodedToken.email || null }; // Atur req.user
    next();
  } catch (error: any) { // Menggunakan 'any' sementara untuk error
    console.error('Error verifying Firebase ID token:', error);
    if (error.code === 'auth/id-token-expired') {
      return res.status(403).json({ message: 'Firebase ID token expired' });
    }
    return res.status(403).json({ message: 'Invalid Firebase ID token' });
  }
};

export default authenticateToken;