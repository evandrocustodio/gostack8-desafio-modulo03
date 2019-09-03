import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import auth from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'User not Authorized !!!' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decode = await promisify(jwt.verify)(token, auth.secret);
    req.userId = decode.id;
  } catch (err) {
    return res.status(401).json({ error: 'Invalid Token !!!' });
  }

  return next();
};
