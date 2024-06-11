# Plex Watched Tracker
This project tracks watched TV shows from your Plex server and a manual list. It displays the shows in a web interface, allowing you to filter and sort them.

## Features
- Tracks watched TV shows from Plex.
- Supports a manual list of watched shows.
- Allows filtering by genre and country.
- Drag-and-drop sorting of shows with persistent order.
- Secure sorting with an admin token.

## Prerequisites
- Docker
- Plex server
- Node.js (for local development)

## Setup
### Environment Variables
Create a .env file in the root of your project with the following variables:

```makefile
PLEX_SERVER_IP=your_plex_server_ip
PLEX_SERVER_PORT=32400
PLEX_TOKEN=your_plex_token
ADMIN_TOKEN=your_admin_token
PORT=3000
```
### Manual List
If you want to include a manual list of shows, create a directory called manual-watched-list in your project root. Inside this directory, create two subdirectories: thumbnails and shows.json.

- shows.json: A JSON file containing your manual list of shows in the following format:
```json
[
  {
    "title": "Show Title",
    "genre": ["Genre1", "Genre2"],
    "country": "Country",
    "thumbnail": "show_thumbnail.jpg"
  },
]
```

- thumbnails: A directory containing the thumbnail images for the manual list of shows.

## Local Development
To run the project locally, follow these steps:

### Install dependencies:

1. Install dependencies: `npm install`
2. Start the server: `npm run start`

## Docker Setup
To run the project in a Docker container, follow these steps:

1. Build the Docker image:
```
docker build -t plex-watched-tracker .
```

2. Run the Docker container with the manual list:
```
docker run -d --name plex-watched-tracker -p 42069:3000 \
    -e PLEX_SERVER_IP=your_plex_server_ip \
    -e PLEX_SERVER_PORT=32400 \
    -e PLEX_TOKEN=your_plex_token \
    -e ADMIN_TOKEN=your_admin_token \
    -v /path/to/config:/usr/src/app/config \
    plex-watched-tracker
```
## Docker Compose
If you prefer to use Docker Compose, create a docker-compose.yml file in your project root with the following content:

```yaml
services:
  plex-watched-tracker:
    build: .
    container_name: plex-watched-tracker
    environment:
      - PLEX_SERVER_IP=${PLEX_SERVER_IP}
      - PLEX_SERVER_PORT=${PLEX_SERVER_PORT}
      - PLEX_TOKEN=${PLEX_TOKEN}
      - ADMIN_TOKEN=${ADMIN_TOKEN}
      - PORT=${PORT}
    volumes:
      - $/path/to/config_dir:/usr/src/app/config
    ports:
      - "42069:3000"
```
To start the service, run: `docker-compose up -d`

## Usage
### Accessing the Application
Once the server is running, you can access the application in your web browser at `http://localhost:42069`.

## Filtering and Sorting
- Use the search bar to filter shows by title.
- Use the dropdown menus to filter shows by genre and country.
- Click the "Enable Edit Mode" button to enable drag-and-drop sorting. You will be prompted to enter the admin token.
- The sorted order will be saved and persist across sessions.
