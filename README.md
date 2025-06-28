# coltracker

## push repo to ghcr

echo GITHUB_TOKEN | docker login ghcr.io -u the-boj --password-stdin
docker build --platform linux/amd64 -t coltracker:latest .
docker tag coltracker:latest ghcr.io/the-boj/coltracker:latest
docker push ghcr.io/the-boj/coltracker:latest

## docker compose

services:
  app:
    image: ghcr.io/the-boj/coltracker:latest
    restart: unless-stopped
    ports:
      - "3008:3008"
    volumes:
      - /home/iotee/coltracker:/app/data
