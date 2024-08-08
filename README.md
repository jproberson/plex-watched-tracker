# Plex Watched Tracker - Warning don't use
This project intended to try out using ejs files with node.
So it will change drastically in time.

This project tracks watched TV shows from your Plex server and a manual list.

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
PORT=your_preferred_port
```
### Manual List
If you want to include a manual list of shows, create a directory called manual-watched-list in your project root. Inside this directory, create a file: show-overrides.json. 
If you have ran the app already there should be a directory thumbnails, if not then create it.

- show-overrides.json: A JSON file containing your manual list of shows in the following format:
```json
[
  {
    "title": "Show Title",
    "genres": ["Genre1", "Genre2"],
    "countries": "Country",
    "thumb": "show_thumbnail.jpg"
  },
]
```

- thumbnails: A directory containing the thumbnail images for the manual list of shows.

## Local Development
To run the project locally, follow these steps:

### Install dependencies:

1. Install dependencies: `npm install`
2. Start the server: `npm run dev`

## Docker Setup
To run the project in a Docker container, follow these steps:

1. Build the Docker image:
```
docker build -t plex-watched-tracker .
```

2. Run the Docker container with the manual list:
```
docker run -d --name plex-watched-tracker -p 5000:3000 \
    -e PLEX_SERVER_IP=your_plex_server_ip \
    -e PLEX_SERVER_PORT=32400 \
    -e PLEX_TOKEN=your_plex_token \
    -e ADMIN_TOKEN=your_admin_token \
    -v /path/to/data:/usr/src/app/data \
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
      - $/path/to/data_dir:/usr/src/app/data
    ports:
      - "${PORT}:3000"
```
To start the service, run: `docker-compose up -d`
