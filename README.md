# Plex-Watched-Tracker

```
docker-compose up --build -d
```

OR

```
docker build -t plex-watched-tracker .

docker run -d -p 42069:3000 \
    -e PLEX_SERVER_IP=192.168.0.180 \
    -e PLEX_SERVER_PORT=32400 \
    -e PLEX_TOKEN="L_JC9WjTCoEcm4ZvbVCf&" \
    plex-watched-tracker

```
