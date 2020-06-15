import { Drash } from "./deps.ts";

// Resources
import ArticleCommentsResource from "./resources/article_comments_resource.ts";
import ArticlesResource from "./resources/articles_resource.ts";
import HomeResource from "./resources/home_resource.ts";
import ProfilesResource from "./resources/profiles_resource.ts";
import TagsResource from "./resources/tags_resource.ts";
import UserResource from "./resources/user_resource.ts";
import UsersLoginResource from "./resources/users_login_resource.ts";
import UsersResource from "./resources/users_resource.ts";

// Middleware
import AuthMiddleware from "./middlewares/auth_middleware.ts";
import LogMiddleware from "./middlewares/log_middleware.ts";

const server = new Drash.Http.Server({
  directory: ".",
  response_output: "application/json",
  resources: [
    ArticleCommentsResource,
    ArticlesResource,
    HomeResource,
    ProfilesResource,
    TagsResource,
    UserResource,
    UsersLoginResource,
    UsersResource,
  ],
  static_paths: ["/public"],
  views_path: "./public/views",
  template_engine: true,
});

server.run({
  hostname: "realworld_drash",
  port: 1667,
});

console.log("Drash server running on realworld_drash:1667");
console.log(
  "Navigate to localhost:8080 for a proxy pass, or localhost:1667 to be direct",
);
