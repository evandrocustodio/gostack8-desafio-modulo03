import jwt from 'jsonwebtoken';
import auth from '../../config/auth';
import User from '../models/User';

class AutenticationController {
  async store(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'User Not found.' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'E-mail or Password not match!!!' });
    }

    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, auth.secret, {
        expiresIn: auth.expiresIn,
      }),
    });
  }
}

export default new AutenticationController();
