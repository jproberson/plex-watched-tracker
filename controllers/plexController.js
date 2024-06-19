const plexService = require('../services/plexService');

const getPlexShows = async (req, res, next) => {
  try {
    const { watchedShows, genresSet, countriesSet } =
      await plexService.processShows();
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

const saveOrder = (req, res) => {
  const { order, token } = req.body;
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(403).send('Forbidden');
  }
  plexService.saveOrder(order);
  res.send('Order saved');
};

module.exports = {
  getPlexShows,
  saveOrder,
};
