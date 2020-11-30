#!/bin/bash
deno run --allow-net --allow-read --watch --unstable app.ts &
npm i
npm run webpack-watch
