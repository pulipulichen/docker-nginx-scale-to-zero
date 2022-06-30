TAG=20220616-2158

REPO=dlll-nginx-scale-to-zero

docker build -t pudding/$REPO:$TAG -t latest . && docker push pudding/$REPO:$TAG && docker rmi pudding/$REPO:$TAG
