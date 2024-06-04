const express = require("express");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

const PLEX_SERVER_IP = process.env.PLEX_SERVER_IP || "192.168.0.180";
const PLEX_SERVER_PORT = process.env.PLEX_SERVER_PORT || "32400";
const PLEX_TOKEN = process.env.PLEX_TOKEN;

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
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
      const sectionUrl = `http://${PLEX_SERVER_IP}:${PLEX_SERVER_PORT}/library/sections/${sectionKey}/all?X-Plex-Token=${PLEX_TOKEN}`;
      const sectionResponse = await axios.get(sectionUrl);

      if (sectionResponse.status !== 200) {
        throw new Error(
          `Failed to fetch section data: ${sectionResponse.status}`
        );
      }

      const sectionData = sectionResponse.data;

      for (const show of sectionData.MediaContainer.Metadata) {
        const showTitle = show.title;
        const showKey = show.key;
        const showThumb = show.thumb;
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
          const seasonKey = season.key;
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
            thumb: showThumb,
            genres,
            countries,
          });
        }
      }
    }

    res.render("index", {
      watchedShows,
      PLEX_SERVER_IP,
      PLEX_SERVER_PORT,
      PLEX_TOKEN,
      genres: Array.from(genresSet),
      countries: Array.from(countriesSet),
    });
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
