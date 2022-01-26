FROM debian:stable-slim

RUN apt update -y \
  && apt clean \
  && apt install bash curl unzip -y \
  && apt install -y --no-install-recommends npm \
  && npm install -g npm@latest

RUN curl -fsSL https://deno.land/x/install/install.sh | DENO_INSTALL=/usr/local sh -s v1.16.3
RUN export DENO_INSTALL="/root/.local"
RUN export PATH="$DENO_INSTALL/bin:$PATH"
RUN deno install --unstable --allow-net=realworld_postgres:5432,deno.land --no-check --allow-read=. --allow-write=nessie.config.ts,db --name nessie  https://deno.land/x/nessie/cli.ts

WORKDIR /var/www/src

# npm i and build client
COPY src/package.json src/package-lock.json src/webpack.config.js ./
COPY src/public public
COPY src/vue vue
RUN npm ci --prefer-offline --no-audit --progress=false && npm run webpack

# Copy over other src code
COPY src/. .

# Cache app.ts and deps file
RUN deno cache --unstable deps.ts
RUN deno cache --unstable app.ts
