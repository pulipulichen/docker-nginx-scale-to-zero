TAG=20220714-2331

REPO=dlll-nginx-scale-to-zero

docker build -t pudding/$REPO:$TAG -t latest . && docker push pudding/$REPO:$TAG && docker rmi pudding/$REPO:$TAG
