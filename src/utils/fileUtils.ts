import fs from 'fs';
import { ShowTrackerData } from '../services/plexTypes.js';

export function loadFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

export function saveFile(filePath: string, data: ShowTrackerData[]) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

