import { Drash } from "./deps.ts";
import ArticleCommentsResource from "./resources/article_comments_resource.ts";
import ArticlesResource from "./resources/articles_resource.ts";
import HomeResource from "./resources/home_resource.ts";
import ProfilesResource from "./resources/profiles_resource.ts";
import TagsResource from "./resources/tags_resource.ts";
import UserResource from "./resources/user_resource.ts";
import UsersLoginResource from "./resources/users_login_resource.ts";
import UsersResource from "./resources/users_resource.ts";

export const server = new Drash.Http.Server({
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
});
