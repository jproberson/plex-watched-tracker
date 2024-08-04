import { basename, join } from 'path';
import { dataDir } from '../server-config.js';
import { loadFile, saveFile } from '../utils/fileUtils.js';
import { fetchSeasonData, fetchSectionData, fetchSections, fetchShowData } from './plexApiService.js';
import { CountryMetaData, GenreMetaData, PlexDirectory, ShowMetaData, ShowTrackerData } from './plexTypes.js';

const orderFilePath = join(dataDir, 'order.json');
const showsFilePath = join(dataDir, 'shows.json');

export async function fetchPlexShows() {
  const sections = await fetchSections();

  const showSections = sections.MediaContainer.Directory.filter(
    (dir: PlexDirectory) => dir.type === 'show',
  );

  const watchedShows: ShowTrackerData[] = [];
  const genresSet: Set<string> = new Set();
  const countriesSet: Set<string> = new Set();

  for (const section of showSections) {
    const sectionKey = section.key;
    if (!sectionKey) {
      console.warn('Section key is missing for section:', section);
      continue;
    }

    const sectionData = await fetchSectionData(sectionKey);

    for (const show of sectionData?.MediaContainer?.Metadata || []) {
      const showData: ShowMetaData = show;
      const showTitle = showData.title;
      const showKey = showData.key;
      const showThumb = showData.thumb;

      if (!showTitle || !showKey || !showThumb) {
        console.warn('Show data is incomplete for show:', showData);
        continue;
      }

      const showMetaData = await fetchShowData(showKey);

      let allEpisodesWatched = true;

      const seasons = Array.isArray(showMetaData?.MediaContainer?.Metadata)
        ? showMetaData.MediaContainer.Metadata
        : [showMetaData.MediaContainer.Metadata];

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

        const seasonData = await fetchSeasonData(seasonKey);

        const episodes = Array.isArray(seasonData?.MediaContainer?.Metadata)
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
        const genres: string[] = [];
        const countries: string[] = [];
        if (showData.Genre) {
          showData.Genre.forEach((g: GenreMetaData) => {
            genres.push(g.tag);
            genresSet.add(g.tag);
          });
        }
        if (showData.Country) {
          showData.Country.forEach((c: CountryMetaData) => {
            countries.push(c.tag);
            countriesSet.add(c.tag);
          });
        }
        watchedShows.push({
          title: showTitle,
          thumbnail: `images${showThumb}`,
          genres,
          country: countries.join(', '),
        });
      }
    }
  }

  return { watchedShows, genresSet, countriesSet };
}

function loadOrder() {
  return loadFile(orderFilePath);
}

export function saveOrder(updatedOrder: ShowTrackerData[]) {
  if (!Array.isArray(updatedOrder)) {
    throw new Error('updatedOrder data is not an array');
  }

  const currentOrder = loadOrder();

  const currentOrderMap = new Map();
  currentOrder.forEach((show: ShowTrackerData) => {
    currentOrderMap.set(show.title, show);
  });

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

  currentOrder.forEach((show: ShowTrackerData) => {
    if (!updatedOrder.find((updatedShow) => updatedShow.title === show.title)) {
      mergedOrder.push(show);
    }
  });

  saveFile(orderFilePath, mergedOrder);
}

function loadShows(): ShowTrackerData[] {
  const shows = loadFile(showsFilePath);
  return shows;
}

export async function processShows() {
  const { watchedShows, genresSet, countriesSet } = await fetchPlexShows();
  const additionalShows = loadShows() || [];

  additionalShows.forEach((show) => {
    show.genres.forEach((genre) => genresSet.add(genre));
    countriesSet.add(show.country);
    watchedShows.push({
      title: show.title,
      thumbnail: `/thumbnails/${basename(show.thumbnail)}`,
      genres: show.genres,
      country: show.country,
    });
  });

  const orderList = loadOrder();

  if (!Array.isArray(orderList)) {
    throw new Error('Order data is not an array');
  }

  const numberOrderMap:Map<string, number> = new Map();
  orderList.forEach(({ title, numberOrder, letterOrder }) => {
    const matchedShowIndex = watchedShows.findIndex(
      (show) => show.title === title,
    );
    if (matchedShowIndex !== -1) {
      watchedShows[matchedShowIndex].numberOrder = numberOrder;
      watchedShows[matchedShowIndex].letterOrder = letterOrder;
      numberOrderMap.set(title, numberOrder);
    }
  });

  watchedShows.sort((a, b) => {
    const aOrder = numberOrderMap.get(a.title) ?? Number.MAX_SAFE_INTEGER;
    const bOrder = numberOrderMap.get(b.title) ?? Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder;
  });

  return { watchedShows, genresSet, countriesSet };
}
