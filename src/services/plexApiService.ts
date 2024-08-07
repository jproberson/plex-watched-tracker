import axios from 'axios';
import { plexServerIp, plexServerPort, plexToken } from '../server-config.js';

export const fetchSections = async () => {
  const sectionsUrl = `http://${plexServerIp}:${plexServerPort}/library/sections?X-Plex-Token=${plexToken}`;
  return await fetchData(sectionsUrl);
};

export const fetchSectionData = async (sectionKey: string) => {
  const sectionUrl = `http://${plexServerIp}:${plexServerPort}/library/sections/${sectionKey}/all?X-Plex-Token=${plexToken}`;
  return fetchData(sectionUrl);
};

export const fetchShowData = async (showKey: string) => {
  const showUrl = `http://${plexServerIp}:${plexServerPort}${showKey}?X-Plex-Token=${plexToken}`;
  return fetchData(showUrl);
};

export const fetchSeasonData = async (seasonKey: string) => {
  const seasonUrl = `http://${plexServerIp}:${plexServerPort}${seasonKey}?X-Plex-Token=${plexToken}`;
  return fetchData(seasonUrl);
};

const fetchData = async (url: string) => {
  const response = await axios.get(url);
  if (response.status !== 200) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }
  return response.data;
};
