# Plex-Watched-Tracker

```
docker-compose up --build -d
```

OR

```
docker build -t plex-watched-shows .

docker run -d -p 3000:3000 \
    -e PLEX_SERVER_IP=192.168.0.180 \
    -e PLEX_SERVER_PORT=32400 \
    -e PORT=3000 \
    -e PLEX_TOKEN="" \
    plex-watched-shows
```
