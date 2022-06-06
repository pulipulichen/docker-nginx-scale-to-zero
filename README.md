# docker-nginx-scale-to-zero
A reverse proxy to scale deployment to zero.

# Environment Variables

- BACKENDS=["80,blog.pulipuli.info"]
- CONNECT_TIMEOUT=7s
- VPN_HTTP_PORT=31443
- DEBUG_LOCAL_PORT
- ENV_SERVICE_SERVER
- PORT_ADMIN_INDEX
- PORT_REDIRECT_TO_VPN

# Ports

- main:80 (看BACKENDS的設定)
- admin-index:9001
- redirect-to-vpn:9002