#!/bin/bash
~/.deno/bin/deno run --allow-net --allow-read --watch --unstable app.ts &
npm i
npm rebuild
npm run webpack-watch
