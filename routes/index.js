const axios = require('axios');
const express = require("express");
const {
  fetchPlexShows,
  loadOrder,
  saveOrder,
  loadShows,
} = require("../controllers/plexController");
const { plexServerIp, plexServerPort, plexToken, adminToken } = require("../server-config");
const path = require("path");

const router = express.Router();

router.get("/images/*", async (req, res) => {
  try {
    const imagePath = req.params[0];
    const imageUrl = `http://${plexServerIp}:${plexServerPort}/${imagePath}?X-Plex-Token=${plexToken}`;
    const imageResponse = await axios.get(imageUrl, { responseType: "stream" });
    imageResponse.data.pipe(res);
  } catch (error) {
    console.error("Error fetching image:", error.message);
    res.status(500).send("Error fetching image");
  }
});

router.get("/", async (req, res) => {
  try {
    const {
      watchedShows: plexWatchedShows,
      genresSet: plexGenresSet,
      countriesSet: plexCountriesSet,
    } = await fetchPlexShows();

    const additionalShows = loadShows();
    additionalShows.forEach((show) => {
      show.genre.forEach((genre) => plexGenresSet.add(genre));
      plexCountriesSet.add(show.country);
      plexWatchedShows.push({
        title: show.title,
        thumb: `/thumbnails/${path.basename(show.thumbnail)}`,
        genres: show.genre,
        countries: [show.country],
        key: show.title,
      });
    });

    const order = loadOrder();
    if (!Array.isArray(order)) {
      throw new Error("Order data is not an array");
    }

    plexWatchedShows.sort((a, b) => {
      const aIndex = order.indexOf(a.title);
      const bIndex = order.indexOf(b.title);
      return (
        (aIndex !== -1 ? aIndex : Number.MAX_SAFE_INTEGER) -
        (bIndex !== -1 ? bIndex : Number.MAX_SAFE_INTEGER)
      );
    });

    res.render("index", {
      watchedShows: plexWatchedShows,
      PLEX_TOKEN: plexToken,
      genres: Array.from(plexGenresSet),
      countries: Array.from(plexCountriesSet),
      ADMIN_TOKEN: adminToken,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send(`Error: ${error.message}`);
  }
});

router.post("/save-order", (req, res) => {
  const { order, token } = req.body;
  if (token !== adminToken) {
    return res.status(403).send("Forbidden");
  }

  saveOrder(order);
  res.send("Order saved");
});

module.exports = router;
