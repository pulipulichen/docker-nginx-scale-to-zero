TAG=20220610-0129

REPO=dlll-nginx-scale-to-zero

docker build -t pudding/$REPO:$TAG .
docker push pudding/$REPO:$TAG 