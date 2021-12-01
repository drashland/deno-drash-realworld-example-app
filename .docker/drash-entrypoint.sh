#!/bin/bash

deno install --unstable --allow-net=realworld_postgres:5432,deno.land --allow-read=. --allow-write=nessie.config.ts,db -f  https://deno.land/x/nessie/cli.ts
export PATH="/root/.deno/bin:$PATH"
deno run --allow-net --allow-read --watch --unstable app.ts &
npm i
npm run webpack-watch
