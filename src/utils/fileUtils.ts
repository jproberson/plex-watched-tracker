import axios from 'axios';
import fs from 'fs';
import path from 'node:path';
import { ShowTrackerData } from '../services/plexService/plexTypes.js';

export function loadFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

export function loadFileNamesFromDir(filePath: string) {
  if (fs.existsSync(filePath)) {
    return fs.readdirSync(filePath);
  }
  return [];
}

export function loadOrCreateFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }

  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

export function saveShows(filePath: string, shows: ShowTrackerData[]): void {
  fs.writeFileSync(filePath, JSON.stringify(shows, null, 2));
}

export async function downloadThumbnail(thumbnailPath: string, thumbUrl: string, retries = 3): Promise<void> {
  while (retries > 0) {
    try {
      const response = await axios.get(thumbUrl, { responseType: 'stream' });
      const writer = fs.createWriteStream(thumbnailPath);
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      retries--;
      console.error(`Failed to save thumbnail at ${thumbnailPath}. Retries left: ${retries}`, error);
      if (retries === 0) {
        throw new Error(`Failed to save thumbnail at ${thumbnailPath} after multiple attempts`);
      }
    }
  }
}

export function ensureDirectoryExists(directoryPath: string): void {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

export async function validateAndSaveThumbnail(currentThumbnails: string[], thumbnailName: string, thumbUrl: string, thumbnailsDir: string): Promise<void> {
  ensureDirectoryExists(thumbnailsDir);
  const thumbnailPath = path.join(thumbnailsDir, `${thumbnailName}.jpg`);
  if (!currentThumbnails.includes(`${thumbnailName}.jpg`)) {
    console.log('did not find thumbnail:', thumbnailName);
    return await downloadThumbnail(thumbnailPath, thumbUrl);
  }
  return Promise.resolve();
}
