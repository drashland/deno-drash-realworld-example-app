#!/bin/bash

deno run --allow-net --allow-read --watch --unstable app.ts &
npm run webpack-watch