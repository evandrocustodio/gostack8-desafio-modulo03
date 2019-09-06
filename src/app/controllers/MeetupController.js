import Meetup from '../models/Meetup';
import * as Yup from 'yup';
import { isBefore, isAfter, parseISO } from 'date-fns';

class MeetupController {
  async index(req, res) {
    const meetups = await Meetup.findAll({ where: { user_id: req.userId } });
    return res.status(200).json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      localization: Yup.string().required(),
      date: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails !!!' });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Verify meetup date !!!' });
    }

    const meetup = await Meetup.findOne({ where: { title: req.body.title } });

    if (meetup) {
      return res.status(401).json({ error: 'Meetup already exists.' });
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

  async update(req, res) {
    const { title, date } = req.body;
    const _id = req.params.id;

    const meetup = await Meetup.findOne({
      where: { id: _id, user_id: req.userId },
    });

    if (!meetup) {
      return res.status(403).json({ error: `You can't update this Meetup.` });
    }

    if (date) {
      if (isBefore(parseISO(date), new Date())) {
        return res.status(400).json({ error: 'Verify meetup date !!!' });
      }
    }

    if (isBefore(meetup.date, new Date())) {
      return res
        .status(403)
        .json({ error: `You can't update this Meetup. It's was finished.` });
    }

    if (title) {
      const meetupTitleExists = await Meetup.findOne({
        where: { title: req.body.title },
      });

      if (meetupTitleExists && isAfter(meetup.date, new Date())) {
        return res.status(401).json({ error: 'Meetup already exists.' });
      }
    }

    const meetupToUpdate = { ...req.body, user_id: req.userId };

    await meetup.update(meetupToUpdate);
    return res.status(200).json({ message: 'Meetup was updated.' });
  }

  async delete(req, res) {
    const _id = req.params.id;
    const meetupToDelete = await Meetup.findOne({
      where: { id: _id, user_id: req.userId },
    });

    if (!meetupToDelete) {
      return res.status(403).json({ error: `You can't delete this Meetup.` });
    }

    if (isBefore(meetupToDelete.date, new Date())) {
      return res
        .status(403)
        .json({ error: `You can't delete this Meetup. It's was finished.` });
    }

    await meetupToDelete.destroy();
    return res.status(200).json({ message: 'Meetup deleted with successful.' });
  }
}

export default new MeetupController();
