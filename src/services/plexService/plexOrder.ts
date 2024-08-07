import { loadFile, saveShows } from '../../utils/fileUtils.js';
import { ShowTrackerData } from './plexTypes.js';
import { savedShowsFilePath } from './plexHelpers.js';

export function saveOrder(updatedOrder: ShowTrackerData[]) {
  if (!Array.isArray(updatedOrder)) {
    throw new Error('updatedOrder data is not an array');
  }

  saveShows(savedShowsFilePath, updatedOrder);
}

export function loadOrder() {
  return loadFile(savedShowsFilePath);
}
