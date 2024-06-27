// @ts-check

import {
  processShows,
  saveOrder as saveOrderService,
} from '../services/plexService.js';

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

/**
 * Gets Plex shows and renders the index page.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export const getPlexShows = async (req, res, next) => {
  try {
    const { watchedShows, genresSet, countriesSet } = await processShows();
    res.render('index', {
      watchedShows,
      genres: Array.from(genresSet),
      countries: Array.from(countriesSet),
      PLEX_TOKEN: process.env.PLEX_TOKEN,
      ADMIN_TOKEN: process.env.ADMIN_TOKEN,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Saves the order of shows.
 * @param {Request} req
 * @param {Response} res
 */
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

/**
 * Gets the tier list and renders the tier list page.
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export const getTierList = async (req, res, next) => {
  try {
    const { watchedShows } = await processShows();
    res.render('tier-list', { watchedShows });
  } catch (error) {
    next(error);
  }
};
