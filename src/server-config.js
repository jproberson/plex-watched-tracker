import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const port = process.env.PORT || 3000;
export const plexServerIp = process.env.PLEX_SERVER_IP || '192.168.0.180';
export const plexServerPort = process.env.PLEX_SERVER_PORT || 32400;
export const plexToken = process.env.PLEX_TOKEN || 'L_JC9WjTCoEcm4ZvbVCf&';
export const adminToken = process.env.ADMIN_TOKEN || 'admin_secret_token';
export const dataDir = process.env.DATA_DIR || join(__dirname, '..', 'data');
