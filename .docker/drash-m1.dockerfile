FROM debian:stable-slim

RUN apt update -y \
  && apt clean \
  && apt install bash curl unzip python2 gyp make g++ -y \
  && apt install -y --no-install-recommends nodejs \
  && apt install -y --no-install-recommends npm \
  && npm install -g npm@latest

RUN curl -LJO https://github.com/LukeChannings/deno-arm64/releases/download/v1.12.1/deno-linux-arm64.zip
RUN mkdir -p ~/.deno/bin
RUN unzip deno-linux-arm64.zip -d ~/.deno/bin
RUN echo $'export DENO_INSTALL="/root/.deno"\nexport PATH="$DENO_INSTALL/bin:$PATH"' >> ~/.bashrc
RUN . ~/.bashrc
RUN rm deno-linux-arm64.zip

COPY ./.docker/drash-entrypoint-m1.sh /drash-entrypoint-m1.sh
RUN chmod +x /drash-entrypoint-m1.sh
ENTRYPOINT ["/drash-entrypoint-m1.sh"]