import { extname, resolve } from 'path';
import crypto from 'crypto';
import multer from 'multer';

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'files'),
    filename: (rec, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
