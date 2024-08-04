import {
  processShows,
  saveOrder as saveOrderService,
} from '../services/plexService.ts';

export const saveOrder = (req, res) => {
  const { updatedShows, token } = req.body;

  if (!updatedShows || !token) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    saveOrderService(updatedShows);
    res.status(200).json({ message: 'Order saved successfully' });
  } catch (error) {
    console.error('Error saving order:', error.message);
    res.status(500).json({ error: 'Failed to save order' });
  }
};

export const getTierList = async (req, res, next) => {
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
