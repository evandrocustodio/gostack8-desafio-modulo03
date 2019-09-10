import Meetup from '../models/Meetup';

class MeetupController {
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
}
