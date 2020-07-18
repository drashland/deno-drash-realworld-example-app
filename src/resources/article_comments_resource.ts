import { Drash } from "../deps.ts";
import {ArticleModel} from "../models/article_model.ts";
import {ArticleCommentsModel} from "../models/article_comments_model.ts";
import UserService from "../services/user_service.ts";
// import ArticleService from "../services/article_service.ts";

export default class ArticleCommentsResource extends Drash.Http.Resource {
  static paths = [
    "/articles/:slug/comments",
  ];

  public async GET() {
    const slug = this.request.getPathParam("slug");
    const articles = await ArticleModel.where({ slug })
    if (!articles.length) {
      console.error("No article was found with the slug of: " + slug)
      this.response.status_code = 404
      this.response.body = {
        errors: {
          comment: "No article was found for the given article"
        }
      }
      return this.response
    }
    const article = articles[0]
    const comments = await ArticleCommentsModel.whereIn("article_id", [article.id]);
    if (!comments.length) {
      console.log("No comments were found for the article with id: " + article.id)
      this.response.body = []
      return this.response
    }
    console.log("Returning comments (length of " + comments.length + ") for article with id: " + article.id)
    this.response.body = {
      success: true,
      data: comments
    };
    return this.response;
  }

  public async POST() {
    console.log('Handling ArticleCommentsResource POST.')
    const comment = this.request.getBodyParam("comment")
    const slug = this.request.getPathParam("slug")
    console.log("The slug for the article: " + slug)
    // First find an article by that slug. The article should exist.
    const articles = await ArticleModel.where({ slug })
    if (!articles.length) {
      console.error("Article does not exist for the posted comment.");
      this.response.status_code = 422;
      this.response.body = {
        errors: {
          comment: "No article was found"
        }
      }
      return this.response
    }
    const article = articles[0]
    // Get user and validation check
    if (!comment) {
      console.error("No comment was passed in. A comment is required.")
      this.response.status_code = 422
      this.response.body = {
        errors: {
          comment: "A comment is required to post"
        }
      }
      return this.response
    }
    const cookie = this.request.getCookie("drash_sess")
    const user = await UserService.getLoggedInUser(cookie || "");
    if (typeof user === "boolean") {
      console.error("Seems like the 'user' isn\'t authenticated.")
      this.response.status_code = 403
      this.response.body  =  {
        errors: {
          comment: "You are unauthorised to do this action."
        }
      }
      return this.response
    }
    // save the comment
    const articleComment = new ArticleCommentsModel(article.id, comment, user.image, user.id, user.username)
    const savedArticleComment: ArticleCommentsModel = await articleComment.save()
    if (!savedArticleComment) {
      console.error("Failed to save the comment")
      this.response.status_code = 500
      this.response.body =  {
        errors: {
          comment: "Failed to save the comment"
        }
      }
      return this.response
    }
    const articleEntity = savedArticleComment.toEntity()
    this.response.status_code = 200
    this.response.body = {
      success: true,
      data: articleEntity
    };
    return this.response
  }
}
