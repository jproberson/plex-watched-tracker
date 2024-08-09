import express, { json, NextFunction, Request, Response, static as serveStatic, urlencoded } from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getTierList, saveShowOrder } from './controllers/plexController.js';
import { dataDir, plexServerIp, plexServerPort, plexToken, port } from './server-config.js';
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
app.use('/public', serveStatic(join(__dirname, 'public')));

app.get('/images/*', async (req: Request, res: Response) => {
  try {
    const imagePath = req.params[0];
    const imageUrl = `http://${plexServerIp}:${plexServerPort}/${imagePath}?X-Plex-Token=${plexToken}`;
    const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
    imageResponse.data.pipe(res);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching image:', error.message);
      res.status(500).send('Error fetching image');
    } else {
      console.error('Unknown error fetching image');
      res.status(500).send('Unknown error fetching image');
    }
  }
})

app.post('/save-order', saveShowOrder);

app.get('/', getTierList);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  } else {
    console.error('Unknown error');
    res.status(500).send('Unknown error');
  }
});

app.listen(port, () => {
  console.log(`Plex watched tracker running at http://localhost:${port}`);
});
