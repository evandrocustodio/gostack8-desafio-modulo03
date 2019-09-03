import jwt from 'jsonwebtoken';
import auth from '../../config/auth';
import User from '../models/User';
import * as Yup from 'yup';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().required(),
      name: Yup.string().required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails !!!' });
    }

    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user) {
      return res.status(401).json({ error: 'User already exists.' });
    }

    const userAdded = await User.create(req.body).catch(e => {
      return res.status(401).json({ error: `${e.original.detail}` });
    });

    const { id, name } = userAdded;

    return res.json({
      user: {
        id,
        name,
        email,
      },
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().required(),
      oldPassword: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails !!!' });
    }

    const { userId } = req;
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(userId);

    if (user) {
      if (user.email !== email) {
        const mailExists = await User.findOne({ where: { email } });
        if (mailExists) {
          return res.status(400).json({ error: `Mail already exists.` });
        }
      }

      if (oldPassword && !(await user.checkPassword(oldPassword))) {
        return res.status(400).json({ error: 'User ou password errors.' });
      }
    } else {
      return res.status(400).json({ error: 'User does not exists.' });
    }

    const { id, name } = await user.update(req.body).catch(e => {
      return res.status(401).json({ error: `${e.original.detail}` });
    });

    return res.json({
      user: {
        id,
        name,
      },
    });
  }
}

export default new UserController();
