import { Request, Response } from 'express';
import mongoose from 'mongoose';

const getSessionsCollection = () => mongoose.connection.collection('sessions');

//get sessions
export const getSession = async (req: Request, res: Response) => {
  try {
    const email = req.session?.email;

    const sessionsCollection = getSessionsCollection();
    if (!sessionsCollection) {
      return res.status(500).json({ message: 'Session store not initialized' });
    }

    const sessions = await sessionsCollection
      .find({ 'session.email': email })
      .toArray()
      .then((docs) =>
        docs
          .map((doc) => {
            if (doc._id.toString() === req.sessionID) {
              return { ...doc, status: 1 }; // Mark the current session as active
            } else return { ...doc, status: 0 };
          })
          .sort((a, b) => b.status - a.status),
      );

    return res.status(200).json(sessions);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

//remove session
export const removeSession = async (req: Request, res: Response) => {
  try {
    const sessionsCollection = getSessionsCollection();
    if (!sessionsCollection) {
      return res.status(500).json({ message: 'Session store not initialized' });
    }

    const sessionId = req.params
      .sessionId as unknown as mongoose.Types.ObjectId; // Replace with the actual session ID you want to remove

    await sessionsCollection.findOneAndDelete({
      _id: sessionId,
    });
    return res.status(200).json({ message: 'Session removed successfully' });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
