import {
  areAllEpisodesWatched,
  getShowSections,
  loadSavedShows,
  loadUserShowOverrides,
  mergeShows,
  savedShowsFilePath,
  thumbnailsFilePath,
  validateShowData,
} from './plexHelpers.js';
import { PlexSectionsResponse, ShowTrackerData } from './plexTypes.js';
import { fetchSectionData, fetchSections, fetchShowData } from '../plexApiService.js';
import {
  ensureDirectoryExists,
  loadFileNamesFromDir,
  saveShows,
  validateAndSaveThumbnail,
} from '../../utils/fileUtils.js';
import { plexToken } from '../../server-config.js';

export async function processShows() {
  const watchedShows = await updateShows();
  watchedShows.sort((a, b) => {
    const letterOrderA = a.letterOrder ?? '';
    const letterOrderB = b.letterOrder ?? '';
    const numberOrderA = a.numberOrder ?? Number.MAX_SAFE_INTEGER;
    const numberOrderB = b.numberOrder ?? Number.MAX_SAFE_INTEGER;

    if (letterOrderA < letterOrderB) {
      return -1;
    } else if (letterOrderA > letterOrderB) {
      return 1;
    } else {
      return numberOrderA - numberOrderB;
    }
  });
  return { watchedShows };
}

async function fetchPlexShows(): Promise<ShowTrackerData[]> {
  const currentThumbnails = loadFileNamesFromDir(thumbnailsFilePath);
  const sections = await fetchSections();
  const showSections = getShowSections(sections);
  const watchedShows: ShowTrackerData[] = [];

  ensureDirectoryExists(thumbnailsFilePath);

  for (const section of showSections) {
    const sectionData: PlexSectionsResponse = await fetchSectionData(section.key);
    if (!sectionData) continue;

    for (const show of sectionData.MediaContainer.Metadata || []) {
      const showData = validateShowData(show);
      if (!showData) continue;
      const showMetaData = await fetchShowData(showData.key);

      if (await areAllEpisodesWatched(showMetaData)) {
        const showData = showMetaData.MediaContainer;
        const showThumb = showData.thumb;

        const thumbnailUrl = `http://localhost:42069/images${showThumb}?X-Plex-Token=${plexToken}`;
        const thumbnailName = `${showThumb.split('/')[3]}-${showThumb.split('/').pop()}`;

        watchedShows.push({
          title: showData.parentTitle,
          thumb: `${thumbnailName}.jpg`,
        });
        await validateAndSaveThumbnail(currentThumbnails, thumbnailName, thumbnailUrl, thumbnailsFilePath);
      }
    }
  }

  return watchedShows;
}

export async function updateShows() {
  const preloadedShows = loadSavedShows();
  const watchedShows = await fetchPlexShows();
  const manualShows = loadUserShowOverrides();
  const mergedShows = mergeShows(preloadedShows, watchedShows, manualShows);

  saveShows(savedShowsFilePath, mergedShows);
  return mergedShows;
}
