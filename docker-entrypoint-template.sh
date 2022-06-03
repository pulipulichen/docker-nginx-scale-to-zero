#!/usr/bin/env sh
set -eu
envsubst '${BACKEND}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

node /scaler/index.js &

# whereis node
# node /scaler/index.js
#cat /etc/nginx/conf.d/default.conf
exec "$@"
#nginx -g daemon off