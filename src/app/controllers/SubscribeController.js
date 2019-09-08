import Meetup from '../models/Meetup';
import { isBefore } from 'date-fns';
import Subscribe from '../models/Subscribe';

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

    return res.json(subscribed);
  }
}

export default new SubscribeController();
