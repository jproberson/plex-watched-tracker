require("dotenv").config();
const path = require("path");

module.exports = {
  port: process.env.PORT || 5000,
  plexServerIp: process.env.PLEX_SERVER_IP || "192.168.0.180",
  plexServerPort: process.env.PLEX_SERVER_PORT || 32400,
  plexToken: process.env.PLEX_TOKEN || "L_JC9WjTCoEcm4ZvbVCf&",
  adminToken: process.env.ADMIN_TOKEN || "admin_secret_token",
  configDir: path.join(__dirname, "..", "config"),
};
