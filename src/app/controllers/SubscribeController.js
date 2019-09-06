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
    const { id: meetupId } = req.params.id;

    const meetup = await Meetup.findByPk(meetupId);

    if (!meetup) {
      return res.status(401).json({ error: `Meetup doesn't exists.` });
    }

    if ((isBefore(meetup.date), new Date())) {
      return res.status(400).json({ error: `This meetup was finished !!!` });
    }

    //Configura o usuário criador do Meetup
    const meetupToAdd = { ...req.body, user_id: req.userId };

    const meetupAdded = await Meetup.create(meetupToAdd).catch(e => {
      return res.status(401).json({ error: `${e.original.detail}` });
    });

    const { id, title, description, date, localization } = meetupAdded;

    return res.status(201).json({
      meetup: {
        id,
        title,
        description,
        localization,
        date,
      },
    });
  }
}

export default new SubscribeController();
