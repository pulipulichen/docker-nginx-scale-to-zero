TAG=20220612-0008

REPO=dlll-nginx-scale-to-zero

docker build -t pudding/$REPO:$TAG .
docker push pudding/$REPO:$TAG 
docker rmi pudding/$REPO:$TAG