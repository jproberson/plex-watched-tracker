const plexService = require('../services/plexService');

const getPlexShows = async (req, res, next) => {
  try {
    const { watchedShows, genresSet, countriesSet } =
      await plexService.fetchPlexShows();
    res.render('index', {
      watchedShows,
      genresSet: Array.from(genresSet),
      countriesSet: Array.from(countriesSet),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlexShows,
};
