const express = require('express');
const path = require('path');
const plexController = require('./controllers/plexController');
const { plexServerIp, plexServerPort, plexToken } = require('./server-config');
const axios = require('axios');
require('dotenv').config();

const app = express();
const configDir = path.join(__dirname, 'data');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/thumbnails', express.static(path.join(configDir, 'thumbnails')));

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

app.get('/', plexController.getPlexShows);
app.post('/save-order', plexController.saveOrder);

app.get('/tier', (req, res) => {
  const tiers = ['S', 'A', 'B', 'C', 'D'];
  const items = [
    { name: 'Item 1', imageUrl: '/images/item1.png' },
    { name: 'Item 2', imageUrl: '/images/item2.png' },
    { name: 'Item 3', imageUrl: '/images/item3.png' },
  ];
  res.render('tier-list', { tiers, items });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
