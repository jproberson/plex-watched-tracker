import {
  plexServerIp,
  plexServerPort,
  plexToken,
} from '../server-config.ts';

import axios from 'axios';

export const fetchSections = async () => {
  const sectionsUrl = `http://${plexServerIp}:${plexServerPort}/library/sections?X-Plex-Token=${plexToken}`;
  return await fetchData(sectionsUrl);
};

export const fetchSectionData = async (sectionKey) => {
  const sectionUrl = `http://${plexServerIp}:${plexServerPort}/library/sections/${sectionKey}/all?X-Plex-Token=${plexToken}`;
  return fetchData(sectionUrl);
};

export const fetchShowData = async (showKey) => {
  const showUrl = `http://${plexServerIp}:${plexServerPort}${showKey}?X-Plex-Token=${plexToken}`;
  return fetchData(showUrl);
};

export const fetchSeasonData = async (seasonKey) => {
  const seasonUrl = `http://${plexServerIp}:${plexServerPort}${seasonKey}?X-Plex-Token=${plexToken}`;
  return fetchData(seasonUrl);
};

const fetchData = async (url) => {
  const response = await axios.get(url);
  if (response.status !== 200) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }
  return response.data;
};
