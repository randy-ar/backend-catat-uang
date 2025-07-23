import { Request, Response } from 'express';

const verifySession = async (req: Request, res: Response) => {
  return res.status(200).json({ message: 'Session verified' });
}

export { 
  verifySession
};