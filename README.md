# Praktika: Ülle Püttsepp 2018

## Simple production setup

```
docker build -t gi-visualizer -f docker/Dockerfile .

docker stack deploy -c docker/docker-compose.yml v

docker service ls 

```

If all services starting with v are 1/1 then app should be available at http://localhost:3001
