# docker-nginx-scale-to-zero
A reverse proxy to scale deployment to zero.

# Environment Variables

- BACKENDS=["80,https://blog.pulipuli.info"]
- VPN_HTTP_PORT=31443
- DEBUG_LOCAL_PORT
- ENV_SERVICE_SERVER

# Ports

- main:80
- admin-index:8081
- redirect-to-vpn:8082