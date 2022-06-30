#!/usr/bin/env sh
#set -eu
#envsubst '${BACKEND}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

node /dlll_paas/scaler/index.js &
node /dlll_paas/redirect-to-vpn/index.js &

# whereis node
# node /scaler/index.js
#cat /etc/nginx/conf.d/default.conf
#exec "$@"
#nginx -g daemon off

if [ "${BACKENDS}" != "" ]; then
  node /dlll_paas/admin-index/index.js &
  node /dlll_paas/scaler/template.js
  #nginx -g daemon off
  nginx -g "daemon off;"
else
  node /dlll_paas/admin-index/index.js
fi
