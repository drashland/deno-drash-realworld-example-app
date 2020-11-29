FROM debian:stable-slim

RUN apt update -y \
  && apt clean \
  && apt install bash curl unzip -y \
  && apt install -y --no-install-recommends nodejs \
  && apt install -y --no-install-recommends npm \
  && npm install -g npm@latest

RUN curl -fsSL https://deno.land/x/install/install.sh | DENO_INSTALL=/usr/local sh -s v1.5.4
RUN export DENO_INSTALL="/usr/bin"
RUN export PATH="$DENO_INSTALL/bin:$PATH"

RUN echo "#!/bin/bash" > "/root/startup.sh"
RUN echo "deno run --allow-net --allow-read --watch --unstable app.ts &" >> "/root/startup.sh"
RUN echo "npm i && npm run webpack-watch" >> "/root/startup.sh"
RUN chmod +x "/root/startup.sh"
RUN ls -lah /root
ENTRYPOINT [ "/root/startup.sh" ]