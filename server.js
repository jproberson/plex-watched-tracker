// @ts-check

import express, { json, urlencoded, static as serveStatic } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  getPlexShows,
  saveOrder,
  getTierList,
} from './controllers/plexController.js';
import {
  plexServerIp,
  plexServerPort,
  plexToken,
  dataDir,
  port,
} from './server-config.js';
import axios from 'axios';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(serveStatic(join(__dirname, 'public')));

app.use('/thumbnails', serveStatic(join(dataDir, 'thumbnails')));

/**
 * Fetches an image from the Plex server.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
app.get('/images/*', async (req, res) => {
  try {
    const imagePath = req.params[0];
    const imageUrl = `http://${plexServerIp}:${plexServerPort}/${imagePath}?X-Plex-Token=${plexToken}`;
    const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
    imageResponse.data.pipe(res);
  } catch (error) {
    console.error('Error fetching image:', error.message);
    res.status(500).send('Error fetching image');
  }
});

/**
 * Route to get Plex shows.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
app.get('/', getPlexShows);

/**
 * Route to save the order of shows.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
app.post('/save-order', saveOrder);

/**
 * Route to get the tier list.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
app.get('/tier', getTierList);

/**
 * Error handling middleware.
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(3000, () => {
  console.log(`Plex watched tracker running at http://localhost:${port}`);
});
