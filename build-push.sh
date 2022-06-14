TAG=20220614-1416

REPO=dlll-nginx-scale-to-zero

docker build -t pudding/$REPO:$TAG .
docker push pudding/$REPO:$TAG 
docker rmi pudding/$REPO:$TAG