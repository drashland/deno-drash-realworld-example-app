FROM debian:stable-slim

RUN apt update -y \
  && apt clean \
  && apt install bash curl unzip -y \
  && apt install -y --no-install-recommends nodejs \
  && apt install -y --no-install-recommends npm \
  && npm install -g npm@latest

RUN curl -fsSL https://deno.land/x/install/install.sh | DENO_INSTALL=/usr/local sh -s v1.8.3
RUN export DENO_INSTALL="/usr/bin"
RUN export PATH="$DENO_INSTALL/bin:$PATH"

COPY ./.docker/drash-entrypoint.sh /drash-entrypoint.sh
RUN chmod +x /drash-entrypoint.sh
ENTRYPOINT ["/drash-entrypoint.sh"]