import { Request, Response, NextFunction } from 'express';
import { processShows } from '../services/plexService/plexService.js';
import { ShowTrackerData } from '../services/plexService/plexTypes.js';
import { saveOrder } from '../services/plexService/plexOrder.js';

interface SaveOrderRequest extends Request {
  body: {
    updatedShows: ShowTrackerData[];
    token: string;
  };
}

export const saveShowOrder = (req: SaveOrderRequest, res: Response) => {
  const { updatedShows, token } = req.body;

  if (!updatedShows || !token) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    saveOrder(updatedShows);
    res.status(200).json({ message: 'Order saved successfully' });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error saving order:', error.message);
      res.status(500).json({ error: 'Failed to save order' });
    } else {
      console.error('Unknown error saving order');
      res.status(500).json({ error: 'Unknown error saving order' });
    }
  }
};

export const getTierList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { watchedShows } = await processShows();
    res.render('tier-list', {
      watchedShows,
      ADMIN_TOKEN: process.env.ADMIN_TOKEN,
    });
  } catch (error) {
    next(error);
  }
};
