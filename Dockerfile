FROM fabiocicerchia/nginx-lua:1.22-debian11.3-compat

RUN apt update

# RUN apt-get install dpkg-dev -y
# RUN apt install software-properties-common -y
# RUN add-apt-repository ppa:nginx/stable -y
# # RUN echo "deb http://ppa.launchpad.net/nginx/stable/ubuntu lucid main" > /etc/apt/sources.list.d/nginx-stable-lucid.list
# # RUN echo "deb-src http://ppa.launchpad.net/nginx/stable/ubuntu lucid main" > /etc/apt/sources.list.d/nginx-stable-lucid.list
# # RUN apt update
# RUN apt-get install nginx-plus-module-ndk nginx-plus-module-lua -y

# ==============================
# Install node.js
# https://stackoverflow.com/a/36401038/6645399

WORKDIR /tmp
RUN curl -sL https://deb.nodesource.com/setup_16.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt install nodejs -y
WORKDIR /

# ==============================
# Custom reverse proxy with environment vairables
# https://serverfault.com/a/919212/432158

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

# =============================
# Lua-nginx-module
# https://stackoverflow.com/a/53005072/6645399
# https://docs.nginx.com/nginx/admin-guide/dynamic-modules/lua/



# =============================
# 建議放在最後
COPY docker-entrypoint.sh /
RUN chmod 777 /docker-entrypoint.sh

COPY nginx-default.conf.template /etc/nginx/conf.d/default.conf.template
COPY scaler/* /scaler/