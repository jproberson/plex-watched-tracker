
const axios = require("axios");
const path = require("path");
const { plexServerIp, plexServerPort, plexToken, configDir } = require("../server-config");
const { loadFile, saveFile } = require("../utils/fileUtils");

const orderFilePath = path.join(configDir, "order.json");
const showsFilePath = path.join(configDir, "shows.json");

async function fetchPlexShows() {
  const sectionsUrl = `http://${plexServerIp}:${plexServerPort}/library/sections?X-Plex-Token=${plexToken}`;
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
    const sectionUrl = `http://${plexServerIp}:${plexServerPort}/library/sections/${sectionKey}/all?X-Plex-Token=${plexToken}`;
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

      const showUrl = `http://${plexServerIp}:${plexServerPort}${showKey}?X-Plex-Token=${plexToken}`;
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

        const seasonUrl = `http://${plexServerIp}:${plexServerPort}${seasonKey}?X-Plex-Token=${plexToken}`;
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

function loadOrder() {
  return loadFile(orderFilePath);
}

function saveOrder(order) {
  saveFile(orderFilePath, order);
}

function loadShows() {
  return loadFile(showsFilePath);
}

module.exports = {
  fetchPlexShows,
  loadOrder,
  saveOrder,
  loadShows,
};
