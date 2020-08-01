import { Drash } from "../../deps.ts";
import ArticleCommentsResource from "../../resources/article_comments_resource.ts";
import ArticlesResource from "../../resources/articles_resource.ts";
import HomeResource from "../../resources/home_resource.ts";
import ProfilesResource from "../../resources/profiles_resource.ts";
import TagsResource from "../../resources/tags_resource.ts";
import UserResource from "../../resources/user_resource.ts";
import UsersLoginResource from "../../resources/users_login_resource";
import UsersResource from "../../resources/users_resource";
import {ArticleEntity} from "../../models/article_model";
import BaseModel from "../../models/base_model";
import { QueryResult } from "../../deps.ts";
import {ArticleCommentEntity} from "../../models/article_comments_model";

export function createServerObject (): Drash.Http.Server {
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
        UsersResource
    ]
  });
  return server
}

export async function createTestArticle (overrides?: ArticleEntity) {
  let query = `INSERT INTO articles (author_id, title, description, body, slug, created_at, updated_at, tags) VALUES(`
  query += overrides!.author_id ? overrides.author_id : 1
  query += ", "
  query += overrides!.title ? overrides.title : "Test Article Title"
  query += ", "
  query += overrides!.description ? overrides.description : "Test Article Description"
  query += ", "
  query += overrides!.body ? overrides.body : "Test Article Body"
  query += ", "
  query += overrides!.slug ? overrides.slug : "test-article-title"
  query += ", "
  query += "to_timestamp(" + String(Date.now() / 1000.00) + ")"
  query += ", "
  query += "to_timestamp(" + String(Date.now() / 1000.00) + ")"
  query += ", "
  query += overrides!.tags ? overrides.tags : "\"\""
  query += ")"
  const client = await BaseModel.connect();
  await client.query(query);
  const title = overrides!.title ? overrides.title : "Test Article Title"
  const result: QueryResult = await client.query("SELECT * FROM articles WHERE title = " + title + " LIMIT 1");
  client.release();
}

export async function createTestComment (overrides?: ArticleCommentEntity) {
  let query = `INSERT INTO article_comments (article_id, author_image, author_id, author_username, body, created_at, updated_at) VALUES(`
  query += overrides!.article_id ? overrides.article_id : 1;
  query += ", ";
  query += overrides!.author_image ? overrides.author_image : "https://static.productionready.io/images/smiley-cyrus.jpg
  query += ", "
  query += overrides!.author_id ? overrides.author_id : 1
  query += ", "
  query += overrides!.author_username ? overrides.author_username : "Test Username"
  query += ", "
  query += overrides!.body ? overrides.body : "Test Body"
  query += ", "
  query += "to_timestamp(" + String(Date.now() / 1000.00) + ")"
  query += ", "
  query += "to_timestamp(" + String(Date.now() / 1000.00) + ")"
  query += ")"
  const client = await BaseModel.connect();
  await client.query(query);
  const body = overrides!.body ? overrides.body : "Test Body"
  const result: QueryResult = await client.query("SELECT * FROM article_comments WHERE body = " + title + " LIMIT 1;");
  client.release();
}