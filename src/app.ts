import { Drash } from "./deps.ts";
import HomeResource from "./resources/home_resource.ts";

// TODO :: Add server and resource middleware
const server = new Drash.Http.Server({
    response_output: "text/html",
    resources: [
        HomeResource
    ],
});

server.run({
    hostname: "realworld_drash",
    port: 1447
});