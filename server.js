const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

const PLEX_SERVER_IP = process.env.PLEX_SERVER_IP || "192.168.0.180";
const PLEX_SERVER_PORT = process.env.PLEX_SERVER_PORT || 32400;
const PLEX_TOKEN = process.env.PLEX_TOKEN || "L_JC9WjTCoEcm4ZvbVCf&";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin_secret_token";

const configDir = path.join(__dirname, "config");
const orderFilePath = path.join(configDir, "order.json");
const showsFilePath = path.join(configDir, "shows.json");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

// Serve the images from the local directory
app.use(
  "/thumbnails",
  express.static(path.join(configDir, "thumbnails"))
);

function loadOrder() {
  if (fs.existsSync(orderFilePath)) {
    const orderData = fs.readFileSync(orderFilePath);
    return JSON.parse(orderData);
  }
  return [];
}

function saveOrder(order) {
  fs.writeFileSync(orderFilePath, JSON.stringify(order, null, 2));
}

// Load the shows from the JSON file
function loadShows() {
  if (fs.existsSync(showsFilePath)) {
    const showsData = fs.readFileSync(showsFilePath);
    return JSON.parse(showsData);
  }
  return [];
}

// Fetch Plex shows
async function fetchPlexShows() {
  const sectionsUrl = `http://${PLEX_SERVER_IP}:${PLEX_SERVER_PORT}/library/sections?X-Plex-Token=${PLEX_TOKEN}`;
  const sectionsResponse = await axios.get(sectionsUrl);

  if (sectionsResponse.status !== 200) {
    throw new Error(`Failed to fetch sections: ${sectionsResponse.status}`);
  }

  const sections = sectionsResponse.data;
  const showSections = sections.MediaContainer.Directory.filter(
    (dir) => dir.type === "show"
  );

  let watchedShows = [];
  let genresSet = new Set();
  let countriesSet = new Set();

  for (const section of showSections) {
    const sectionKey = section.key;
    if (!sectionKey) {
      console.warn("Section key is missing for section:", section);
      continue;
    }
    const sectionUrl = `http://${PLEX_SERVER_IP}:${PLEX_SERVER_PORT}/library/sections/${sectionKey}/all?X-Plex-Token=${PLEX_TOKEN}`;
    const sectionResponse = await axios.get(sectionUrl);

    if (sectionResponse.status !== 200) {
      throw new Error(
        `Failed to fetch section data: ${sectionResponse.status}`
      );
    }

    const sectionData = sectionResponse.data;

    for (const show of sectionData.MediaContainer.Metadata || []) {
      const showTitle = show.title;
      const showKey = show.key;
      const showThumb = show.thumb;

      if (!showTitle || !showKey || !showThumb) {
        console.warn("Show data is incomplete for show:", show);
        continue;
      }

      const showUrl = `http://${PLEX_SERVER_IP}:${PLEX_SERVER_PORT}${showKey}?X-Plex-Token=${PLEX_TOKEN}`;
      const showResponse = await axios.get(showUrl);

      if (showResponse.status !== 200) {
        throw new Error(`Failed to fetch show data: ${showResponse.status}`);
      }

      const showData = showResponse.data;
      let allEpisodesWatched = true;

      const seasons = Array.isArray(showData.MediaContainer.Metadata)
        ? showData.MediaContainer.Metadata
        : [showData.MediaContainer.Metadata];

      for (const season of seasons) {
        if (!season) {
          console.warn("Season data is missing for show:", showTitle);
          continue;
        }
        const seasonKey = season.key;
        if (!seasonKey) {
          console.warn("Season key is missing for season:", season);
          continue;
        }

        const seasonUrl = `http://${PLEX_SERVER_IP}:${PLEX_SERVER_PORT}${seasonKey}?X-Plex-Token=${PLEX_TOKEN}`;
        const seasonResponse = await axios.get(seasonUrl);

        if (seasonResponse.status !== 200) {
          throw new Error(
            `Failed to fetch season data: ${seasonResponse.status}`
          );
        }

        const seasonData = seasonResponse.data;

        const episodes = Array.isArray(seasonData.MediaContainer.Metadata)
          ? seasonData.MediaContainer.Metadata
          : [seasonData.MediaContainer.Metadata];

        for (const episode of episodes) {
          if (!episode) {
            console.warn("Episode data is missing for season:", seasonKey);
            continue;
          }
          if (!episode.viewCount || parseInt(episode.viewCount) === 0) {
            allEpisodesWatched = false;
            break;
          }
        }

        if (!allEpisodesWatched) break;
      }

      if (allEpisodesWatched) {
        let genres = [];
        let countries = [];
        if (show.Genre) {
          genres = Array.isArray(show.Genre)
            ? show.Genre.map((g) => g.tag)
            : [show.Genre.tag];
          genres.forEach((genre) => genresSet.add(genre));
        }
        if (show.Country) {
          countries = Array.isArray(show.Country)
            ? show.Country.map((c) => c.tag)
            : [show.Country.tag];
          countries.forEach((country) => countriesSet.add(country));
        }
        watchedShows.push({
          title: showTitle,
          thumb: `images${showThumb}`,
          genres,
          countries,
          key: showKey,
        });
      }
    }
  }

  return { watchedShows, genresSet, countriesSet };
}

app.get("/images/*", async (req, res) => {
  try {
    const imagePath = req.params[0];
    const imageUrl = `http://${PLEX_SERVER_IP}:${PLEX_SERVER_PORT}/${imagePath}?X-Plex-Token=${PLEX_TOKEN}`;
    const imageResponse = await axios.get(imageUrl, { responseType: "stream" });
    imageResponse.data.pipe(res);
  } catch (error) {
    console.error("Error fetching image:", error.message);
    res.status(500).send("Error fetching image");
  }
});

app.get("/", async (req, res) => {
  try {
    // Fetch Plex shows
    const {
      watchedShows: plexWatchedShows,
      genresSet: plexGenresSet,
      countriesSet: plexCountriesSet,
    } = await fetchPlexShows();

    // Load additional shows from the local JSON file
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
      PLEX_TOKEN,
      genres: Array.from(plexGenresSet),
      countries: Array.from(plexCountriesSet),
      ADMIN_TOKEN,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send(`Error: ${error.message}`);
  }
});

app.post("/save-order", (req, res) => {
  const { order, token } = req.body;
  if (token !== ADMIN_TOKEN) {
    return res.status(403).send("Forbidden");
  }

  saveOrder(order);
  res.send("Order saved");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
