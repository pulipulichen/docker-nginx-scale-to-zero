TAG=20220606-0957

REPO=dlll-nginx-scale-to-zero

docker build -t pudding/$REPO:$TAG .
docker push pudding/$REPO:$TAG 