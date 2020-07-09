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
    const slug = this.request.getQueryParam("slug");
    const article = await ArticleModel.where({ slug })
    if (!article.length) {
      this.response.status_code = 404
      this.response.body = {
        errors: {
          comment: "No article was found for the given article"
        }
      }
      return this.response
    }
    const comments = await ArticleCommentsModel.whereIn("article_id", [article.id]);
    if (!comments.length) {
      this.response.status_code = 404
      this.response.body = {
        errors: {
          comment: "No comments were found for the given article"
        }
      }
      return this.response
    }
    this.response.body = comments;
    return this.response;
  }

  public async POST() {
    console.log('Handling ArticleCommentsResource POST.')
    const comment = this.request.getBodyParam("comment")
    const slug = this.request.getUrlQueryParam("slug")
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
      this.response.status_code = 422
      this.response.body = {
        errors: {
          comment: "A comment is required to post"
        }
      }
      return this.response
    }
    const user = await UserService.getLoggedInUser();
    if (!user) {
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
    const savedArticleComment = await articleComment.save()
    if (!savedArticleComment) {
      this.response.status_code = 500
      this.response.body =  {
        errors: {
          comment: "Failed to save the comment"
        }
      }
      return this.response
    }
    this.response.status_code = 200
    this.response.body = {
      data: {
        success: true
      }
    }
    return this.response
  }
}
