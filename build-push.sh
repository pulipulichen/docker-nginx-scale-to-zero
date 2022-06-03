TAG=20220601-1926

REPO=dlll-nginx-scale-to-zero

docker build -t pudding/$REPO:$TAG .
docker push pudding/$REPO:$TAG 