# coltracker

echo GITHUB_TOKEN | docker login ghcr.io -u the-boj --password-stdin
docker build --platform linux/amd64 -t coltracker:latest .
docker tag coltracker:latest ghcr.io/the-boj/coltracker:latest
docker push ghcr.io/the-boj/coltracker:latest
