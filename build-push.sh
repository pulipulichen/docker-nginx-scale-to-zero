TAG=20220630-2053

REPO=dlll-nginx-scale-to-zero

docker build -t pudding/$REPO:$TAG -t latest . && docker push pudding/$REPO:$TAG && docker rmi pudding/$REPO:$TAG
