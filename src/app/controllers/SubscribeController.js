import Meetup from '../models/Meetup';
import { Op } from 'sequelize';
import { format, isBefore } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import Subscribe from '../models/Subscribe';
import Mail from '../../lib/Mail';
import User from '../models/User';

class SubscribeController {
  async index(req, res) {
    const subscriptions = await Subscribe.findAll({
      where: { user_id: req.userId },
      attributes: [],
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['title', 'date'],
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          required: true,
        },
      ],
      order: [['meetup', 'date']],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const { userId } = req;
    const meetupId = req.params.id;

    const meetup = await Meetup.findByPk(meetupId);

    if (!meetup) {
      return res.status(401).json({ error: `Meetup doesn't exists.` });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({ error: `This meetup was finished !!!` });
    }

    if (meetup.user_id === userId) {
      return res
        .status(400)
        .json({ error: `You can't subscribe to your owner meetup !!!` });
    }

    const subscribe = await Subscribe.findOne({
      where: {
        user_id: userId,
        meetup_id: meetupId,
      },
    });

    if (subscribe) {
      return res
        .status(400)
        .json({ error: `You already subscribe to this meetup !!!` });
    }

    const subscribeSameDate = await Subscribe.findOne({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (subscribeSameDate) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to two meetups at the same date" });
    }

    const subscribed = await Subscribe.create({
      user_id: userId,
      meetup_id: meetupId,
    }).catch(e => {
      return res.status(401).json({ error: `${e.original.detail}` });
    });

    const subs = await Subscribe.findByPk(subscribed.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['title', 'description', 'date'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name', 'email'],
            },
          ],
        },
      ],
    });

    await Mail.sendMail({
      to: `${subs.user.name} <${subs.user.email}>`,
      subject: 'Nova Inscrição',
      template: 'subscription',
      context: {
        username: subs.meetup.user.name,
        name: subs.meetup.title,
        description: subs.meetup.description,
        user: subs.user.name,
        date: format(subs.meetup.date, "'dia ' dd 'de' MMMM", {
          locale: pt,
        }),
      },
    });
    return res.json(subs);
  }
}

export default new SubscribeController();
