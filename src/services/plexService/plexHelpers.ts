import { loadFile, loadOrCreateFile } from '../../utils/fileUtils.js';
import {
  PlexSections,
  PlexDirectory,
  ShowMetaData,
  PlexSectionData,
  ShowTrackerData,
} from './plexTypes.js';
import { fetchSeasonData, fetchSectionData } from '../plexApiService.js';
import { join } from 'path';
import { dataDir } from '../../server-config.js';

const userShowOverrides = join(dataDir, 'show-overrides.json');
export const savedShowsFilePath = join(dataDir, 'saved-shows.json');
export const thumbnailsFilePath = join(dataDir, '/thumbnails');

export function getShowSections(sections: PlexSections): PlexDirectory[] {
  return sections.MediaContainer.Directory.filter((dir) => dir.type === 'show');
}

export async function fetchSectionDataSafe(sectionKey: string): Promise<PlexSectionData | null> {
  if (!sectionKey) {
    console.warn('Section key is missing for section');
    return null;
  }
  return await fetchSectionData(sectionKey);
}

export function validateShowData(show: ShowMetaData): ShowMetaData | null {
  const { title, key, thumb } = show;
  if (!title || !key || !thumb) {
    console.warn('Show data is incomplete:', show);
    return null;
  }
  return show;
}

export async function areAllEpisodesWatched(plexSectionData: PlexSectionData): Promise<boolean> {
  const seasons = Array.isArray(plexSectionData?.MediaContainer?.Metadata)
    ? plexSectionData.MediaContainer.Metadata
    : [plexSectionData.MediaContainer.Metadata];

  for (const season of seasons) {
    const seasonKey = season?.key;
    if (!seasonKey) {
      console.warn('Season key is missing for season:', season);
      return false;
    }
    const seasonData = await fetchSeasonData(seasonKey);
    const episodes = Array.isArray(seasonData?.MediaContainer?.Metadata)
      ? seasonData.MediaContainer.Metadata
      : [seasonData.MediaContainer.Metadata];

    for (const episode of episodes) {
      if (!episode?.viewCount || parseInt(episode.viewCount) === 0) {
        return false;
      }
    }
  }
  return true;
}

export function loadUserShowOverrides(): ShowTrackerData[] {
  return loadFile(userShowOverrides);
}

export function loadSavedShows(): ShowTrackerData[] {
  return loadOrCreateFile(savedShowsFilePath);
}

export function mergeShows(
  preloadedShows: ShowTrackerData[],
  fetchedShows: ShowTrackerData[],
  userOverrides: ShowTrackerData[],
): ShowTrackerData[] {
  const showsMap = new Map<string, ShowTrackerData>();

  preloadedShows.forEach(show => {
    showsMap.set(show.title, show);
  });

  fetchedShows.forEach(show => {
    const existingShow = showsMap.get(show.title);

    if (existingShow) {
      if (existingShow.thumb !== show.thumb) {
        existingShow.thumb = show.thumb;
      }
      showsMap.set(existingShow.title, existingShow);
    } else {
      showsMap.set(show.title, show);
    }

  });
  userOverrides.forEach(show => {

    const existingShow = showsMap.get(show.title);
    if (existingShow) {
      if (existingShow.thumb !== show.thumb) {
        existingShow.thumb = show.thumb;
      }
      showsMap.set(existingShow.title, existingShow);
    } else {
      showsMap.set(show.title, show);

    }

  });

  return Array.from(showsMap.values());
}
