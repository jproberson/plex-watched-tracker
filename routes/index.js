const express = require('express');
const plexController = require('../controllers/plexController');
const { plexServerIp, plexServerPort, plexToken } = require('../server-config');
const path = require('path');
const axios = require('axios');

const router = express.Router();

router.get('/images/*', async (req, res) => {
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

router.get('/', plexController.getPlexShows);
router.post('/save-order', plexController.saveOrder);

module.exports = router;
