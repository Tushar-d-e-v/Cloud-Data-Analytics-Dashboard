import jwt from 'jsonwebtoken';

export const generateToken = (payload: { id: string; email: string }): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '7d'
  });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};