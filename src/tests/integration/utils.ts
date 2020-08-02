import { Drash } from "../../deps.ts";
import ArticleCommentsResource from "../../resources/article_comments_resource.ts";
import ArticlesResource from "../../resources/articles_resource.ts";
import HomeResource from "../../resources/home_resource.ts";
import ProfilesResource from "../../resources/profiles_resource.ts";
import TagsResource from "../../resources/tags_resource.ts";
import UserResource from "../../resources/user_resource.ts";
import UsersLoginResource from "../../resources/users_login_resource.ts";
import UsersResource from "../../resources/users_resource.ts";
import {ArticleEntity} from "../../models/article_model.ts";
import BaseModel from "../../models/base_model.ts";
import { QueryResult } from "../../deps.ts";
import {ArticleCommentEntity} from "../../models/article_comments_model.ts";

// TODO(edward) Add docblocks

const client = await BaseModel.connect();

class TestModel extends BaseModel {
  public getPreparedQuery (query: string, data: Array<string|number>)  {
    return this.prepareQuery(query, data)
  }
}
const testModel = new TestModel();

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
    ],
    views_path: "./public/views"
  });
  return server
}

export async function createTestArticle (overrides?: ArticleEntity) {
  let query = `INSERT INTO articles (author_id, title, description, body, slug, created_at, updated_at, tags) VALUES(?, ?, ?, ?, ?, to_timestamp(?), to_timestamp(?), ?);`
  const data = [
    overrides && overrides.author_id ? overrides!.author_id : 1,
    overrides && overrides!.title ? overrides!.title : "Test Article Title",
    overrides && overrides!.description ? overrides!.description : "Test Article Description",
    overrides && overrides!.body ? overrides!.body : "Test Article Body",
    overrides && overrides!.slug ? overrides!.slug : "test-article-title",
    String(Date.now() / 100.00),
    String(Date.now() / 100.00),
    overrides && overrides!.tags ? overrides!.tags : ""
  ]
  query = testModel.getPreparedQuery(query, data)
  await client.query(query);
  const title = overrides && overrides!.title ? overrides!.title : "Test Article Title";
  const result: QueryResult = await client.query(`SELECT * FROM articles WHERE title = '${title}' LIMIT 1;`);
  const formattedResults = TestModel.formatResults(result.rows, result.rowDescription.columns);
  client.release();
  return formattedResults[0]
}

export async function clearTestArticles () {
  const query = "DELETE FROM articles"
  const client = await BaseModel.connect()
  await client.query(query)
  client.release()
}

export async function createTestComment (overrides: any = {}) {
  let query = `INSERT INTO article_comments (article_id, author_image, author_id, author_username, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, to_timestamp(?), to_timestamp(?));`
  const data = [
    overrides!.article_id ? `${overrides!.article_id}` : 1,
    overrides!.author_image ? overrides!.author_image : "https://static.productionready.io/images/smiley-cyrus.jpg",
    overrides!.author_id ? overrides!.author_id : 1,
    overrides!.author_username ? overrides!.author_username : "Test Username",
    overrides!.body ? overrides!.body : "Test Body",
    String(Date.now()),
    String(Date.now())
  ];
  query = testModel.getPreparedQuery(query, data);
  await client.query(query);
  const body = overrides && overrides!.body ? overrides!.body : "Test Body"
  const result: QueryResult = await client.query(`SELECT * FROM article_comments WHERE body = '${body}' LIMIT 1;`);
  const formattedResults = TestModel.formatResults(result.rows, result.rowDescription.columns);
  client.release();
  return formattedResults[0]
}

export async function clearTestComments () {
  const query = "DELETE FROM article_comments"
  await client.query(query)
  client.release()
}

export async function createTestSession (overrides: any = {}) {
  let query = `INSERT INTO sessions (user_id, session_one, session_two) VALUES(?, ?, ?);`;
  const data = [
    overrides && overrides.user_id ? overrides.user_id : 1,
    overrides && overrides.session_one ? overrides.session_one : "Test Session 1",
    overrides && overrides.session_two ? overrides.session_two : "Test Session 2"
  ];
  query = testModel.getPreparedQuery(query, data);
  await client.query(query);
  const userId = overrides && overrides.user_id ? overrides.user_id : 1;
  const result: QueryResult = await client.query(`SELECT * FROM sessions WHERE user_id = '${userId}' LIMIT 1;`);
  const formattedResults = TestModel.formatResults(result.rows, result.rowDescription.columns);
  client.release();
  return formattedResults[0]
}

export async function clearTestSessions () {
  const query = "DELETE FROM sessions"
  await client.query(query)
  client.release()
}