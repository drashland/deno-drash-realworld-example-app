import { Drash } from "./deps.ts";
import HomeResource from "./resources/home_resource.ts";
import AuthMiddleware from "./middlewares/auth_middleware.ts";
import LogMiddleware from "./middlewares/log_middleware.ts";
import RegisterResource from "./resources/register_resource.ts";

const server = new Drash.Http.Server({
    directory: ".",
    response_output: "text/html",
    resources: [
        HomeResource,
        RegisterResource
    ],
    static_paths: ["/public"],
    views_path: "./public/views",
    middleware: {
        server_level: {
            before_request: [
                LogMiddleware
            ]
        },
        resource_level: [
            AuthMiddleware
        ]
    },
    template_engine: true,
});

server.run({
    hostname: "realworld_drash",
    port: 1667
});

console.log('Drash server running on realworld_drash:1667')
console.log('Navigate to localhost:8080 for a proxy pass, or localhost:1667 to be direct')