// @ts-check

import axios from 'axios';
import { join, basename } from 'path';
import {
  plexServerIp,
  plexServerPort,
  plexToken,
  dataDir,
} from '../server-config.js';
import { loadFile, saveFile } from '../utils/fileUtils.js';

/**
 * @typedef {import('axios').AxiosResponse} AxiosResponse
 */

/**
 * @typedef {Object} Genre
 * @property {string} tag
 */

/**
 * @typedef {Object} Country
 * @property {string} tag
 */

/**
 * @typedef {Object} Show
 * @property {string} title
 * @property {string} key
 * @property {string} thumb
 * @property {Genre[] | Genre} [genres]
 * @property {Country[] | Country} [countries]
 * @property {number} [numberOrder]
 * @property {number} [letterOrder]
 */

/** @typedef {Object} Order
 * @property {string} title 
 * @property {string[]} numberOrder
 * @property {string[]} letterOrder
 *

/**
 * @typedef {Object} OrderList
 * @property {Order[]} order 
 */

const orderFilePath = join(dataDir, 'order.json');
const showsFilePath = join(dataDir, 'shows.json');

/**
 * Fetches Plex shows and processes them.
 * @returns {Promise<{ watchedShows: Show[], genresSet: Set<string>, countriesSet: Set<string> }>}
 */
export async function fetchPlexShows() {
  const sectionsUrl = `http://${plexServerIp}:${plexServerPort}/library/sections?X-Plex-Token=${plexToken}`;
  /** @type {AxiosResponse} */
  const sectionsResponse = await axios.get(sectionsUrl);

  if (sectionsResponse.status !== 200) {
    throw new Error(`Failed to fetch sections: ${sectionsResponse.status}`);
  }

  const sections = sectionsResponse.data;
  const showSections = sections.MediaContainer.Directory.filter(
    (dir) => dir.type === 'show',
  );

  /** @type {Show[]} */
  let watchedShows = [];
  /** @type {Set<string>} */
  let genresSet = new Set();
  /** @type {Set<string>} */
  let countriesSet = new Set();

  for (const section of showSections) {
    const sectionKey = section.key;
    if (!sectionKey) {
      console.warn('Section key is missing for section:', section);
      continue;
    }
    const sectionUrl = `http://${plexServerIp}:${plexServerPort}/library/sections/${sectionKey}/all?X-Plex-Token=${plexToken}`;
    /** @type {AxiosResponse} */
    const sectionResponse = await axios.get(sectionUrl);

    if (sectionResponse.status !== 200) {
      throw new Error(
        `Failed to fetch section data: ${sectionResponse.status}`,
      );
    }

    const sectionData = sectionResponse.data;

    for (const show of sectionData.MediaContainer.Metadata || []) {
      /** @type {Show} */
      const showData = show;
      const showTitle = showData.title;
      const showKey = showData.key;
      const showThumb = showData.thumb;

      if (!showTitle || !showKey || !showThumb) {
        console.warn('Show data is incomplete for show:', showData);
        continue;
      }

      const showUrl = `http://${plexServerIp}:${plexServerPort}${showKey}?X-Plex-Token=${plexToken}`;
      /** @type {AxiosResponse} */
      const showResponse = await axios.get(showUrl);

      if (showResponse.status !== 200) {
        throw new Error(`Failed to fetch show data: ${showResponse.status}`);
      }

      const showResponseData = showResponse.data;
      let allEpisodesWatched = true;

      const seasons = Array.isArray(showResponseData.MediaContainer.Metadata)
        ? showResponseData.MediaContainer.Metadata
        : [showResponseData.MediaContainer.Metadata];

      for (const season of seasons) {
        if (!season) {
          console.warn('Season data is missing for show:', showTitle);
          continue;
        }
        const seasonKey = season.key;
        if (!seasonKey) {
          console.warn('Season key is missing for season:', season);
          continue;
        }

        const seasonUrl = `http://${plexServerIp}:${plexServerPort}${seasonKey}?X-Plex-Token=${plexToken}`;
        /** @type {AxiosResponse} */
        const seasonResponse = await axios.get(seasonUrl);

        if (seasonResponse.status !== 200) {
          throw new Error(
            `Failed to fetch season data: ${seasonResponse.status}`,
          );
        }

        const seasonData = seasonResponse.data;

        const episodes = Array.isArray(seasonData.MediaContainer.Metadata)
          ? seasonData.MediaContainer.Metadata
          : [seasonData.MediaContainer.Metadata];

        for (const episode of episodes) {
          if (!episode) {
            console.warn('Episode data is missing for season:', seasonKey);
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
        const genres = [];
        const countries = [];
        if (showData.genres) {
          const showGenres = Array.isArray(showData.genres)
            ? showData.genres
            : [showData.genres];
          showGenres.forEach((g) => {
            genres.push(g.tag);
            genresSet.add(g.tag);
          });
        }
        if (showData.countries) {
          const showCountries = Array.isArray(showData.countries)
            ? showData.countries
            : [showData.countries];
          showCountries.forEach((c) => {
            countries.push(c.tag);
            countriesSet.add(c.tag);
          });
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

/**
 * Loads the order from the order file.
 * @returns {any}
 */
function loadOrder() {
  return loadFile(orderFilePath);
}

/**
 * Saves the order to the order file.
 * @param {any} updatedOrder
 */
export function saveOrder(updatedOrder) {
  if (!Array.isArray(updatedOrder)) {
    throw new Error('updatedOrder data is not an array');
  }

  // Load the existing order
  const currentOrder = loadOrder();

  // Create a map for quick lookup of current shows
  const currentOrderMap = new Map();
  currentOrder.forEach((show) => {
    currentOrderMap.set(show.title, show);
  });

  // Merge the updated shows with the current order
  const mergedOrder = updatedOrder.map((updatedShow) => {
    const existingShow = currentOrderMap.get(updatedShow.title);
    if (existingShow) {
      return {
        ...existingShow,
        numberOrder: updatedShow.numberOrder,
        ...(updatedShow.letterOrder !== undefined && {
          letterOrder: updatedShow.letterOrder,
        }),
      };
    } else {
      return updatedShow;
    }
  });

  // Add any existing shows that were not in the updatedShows array
  currentOrder.forEach((show) => {
    if (!updatedOrder.find((updatedShow) => updatedShow.title === show.title)) {
      mergedOrder.push(show);
    }
  });

  saveFile(orderFilePath, mergedOrder);
}

/**
 * Loads the shows from the shows file.
 * @returns {any}
 */
function loadShows() {
  return loadFile(showsFilePath);
}

/**
 * Processes the shows by fetching from Plex and combining with additional shows.
 * @returns {Promise<{ watchedShows: Show[], genresSet: Set<string>, countriesSet: Set<string> }>}
 */
export async function processShows() {
  const { watchedShows, genresSet, countriesSet } = await fetchPlexShows();
  const additionalShows = loadShows();

  additionalShows.forEach((show) => {
    show.genres.forEach((genre) => genresSet.add(genre));
    countriesSet.add(show.countries);
    watchedShows.push({
      title: show.title,
      thumb: `/thumbnails/${basename(show.thumbnail)}`,
      genres: show.genres,
      countries: [show.countries],
      key: show.title,
    });
  });

  /** @type {OrderList} */
  const orderList = loadOrder();

  if (!Array.isArray(orderList)) {
    throw new Error('Order data is not an array');
  }

  // Create a map for quick lookup of order indexes
  const numberOrderMap = new Map();
  orderList.forEach(({ title, numberOrder, letterOrder }) => {
    const matchedShowIndex = watchedShows.findIndex(
      (show) => show.title === title,
    );
    if (matchedShowIndex !== -1) {
      watchedShows[matchedShowIndex].numberOrder = numberOrder;
      watchedShows[matchedShowIndex].letterOrder = letterOrder;
      numberOrderMap.set(title, numberOrder);
    } else {
    }
  });

  watchedShows.sort((a, b) => {
    const aOrder = numberOrderMap.has(a.title)
      ? numberOrderMap.get(a.title)
      : Number.MAX_SAFE_INTEGER;
    const bOrder = numberOrderMap.has(b.title)
      ? numberOrderMap.get(b.title)
      : Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder;
  });

  return { watchedShows, genresSet, countriesSet };
}
