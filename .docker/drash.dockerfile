FROM debian:stable-slim

RUN apt update -y \
  && apt clean \
  && apt install bash curl unzip -y \
  && apt install -y --no-install-recommends nodejs \
  && apt install -y --no-install-recommends npm \
  && npm install -g npm@latest

RUN curl -fsSL https://deno.land/x/install/install.sh | DENO_INSTALL=/usr/local sh -s v1.16.3
RUN export DENO_INSTALL="/root/.local"
RUN export PATH="$DENO_INSTALL/bin:$PATH"

COPY ./.docker/drash-entrypoint.sh /drash-entrypoint.sh
RUN chmod +x /drash-entrypoint.sh

WORKDIR /var/www/src
COPY src/package.json src/package-lock.json src/webpack.config.js ./
RUN npm ci --prefer-offline --no-audit --progress=false
COPY src/. .

ENTRYPOINT ["sh","/drash-entrypoint.sh"]
