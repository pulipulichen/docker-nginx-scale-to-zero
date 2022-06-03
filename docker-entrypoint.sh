#!/usr/bin/env sh
set -eu

envsubst '${BACKEND}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# whereis node
# node /scaler/index.js
#cat /etc/nginx/conf.d/default.conf
exec "$@"