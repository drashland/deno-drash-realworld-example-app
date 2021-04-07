import { Drash } from "../deps.ts";
import { ArticleModel } from "../models/article_model.ts";
import { ArticleCommentsModel } from "../models/article_comments_model.ts";
import UserService from "../services/user_service.ts";
import BaseResource from "./base_resource.ts";
// import ArticleService from "../services/article_service.ts";

export default class ArticleCommentsResource extends BaseResource {
  static paths = [
    "/articles/:slug/comments",
    "/articles/comment/:id", // Only for deleting
  ];

  public async GET() {
    const slug = this.request.getPathParam("slug") || "";
    const articles = await ArticleModel.where({ slug });
    if (!articles.length) {
      console.error("No article was found with the slug of: " + slug);
      this.response.status_code = 404;
      this.response.body = {
        errors: {
          comment: "No article was found for the given article",
        },
      };
      return this.response;
    }
    const article = articles[0];
    const comments = await ArticleCommentsModel.whereIn(
      "article_id",
      [article.id],
    );
    if (!comments.length) {
      console.log(
        "No comments were found for the article with id: " + article.id,
      );
      this.response.body = [];
      return this.response;
    }
    console.log(
      "Returning comments (length of " + comments.length +
        ") for article with id: " + article.id,
    );
    this.response.body = {
      success: true,
      data: comments,
    };
    return this.response;
  }

  public async POST() {
    console.log("Handling ArticleCommentsResource POST.");
    const comment = (this.request.getBodyParam("comment") as string);
    const slug = this.request.getPathParam("slug") || "";
    console.log("The slug for the article: " + slug);
    // First find an article by that slug. The article should exist.
    const articles = await ArticleModel.where({ slug });
    if (!articles.length) {
      return this.errorResponse(404, "No article was found.");
    }
    const article = articles[0];
    // Get user and validation check
    if (!comment) {
      return this.errorResponse(422, "A comment is required to post.");
    }
    const cookie = this.request.getCookie("drash_sess");
    const user = await UserService.getLoggedInUser(cookie || "");
    if (typeof user === "boolean") {
      return this.errorResponse(
        403,
        "You are unauthorised to complete this action.",
      );
    }
    // save the comment
    const articleComment = new ArticleCommentsModel(
      article.id,
      comment,
      user.image,
      user.id,
      user.username,
    );
    const savedArticleComment: ArticleCommentsModel = await articleComment
      .save();
    if (!savedArticleComment) {
      return this.errorResponse(500, "Failed to save the comment.");
    }
    const articleEntity = savedArticleComment.toEntity();
    this.response.status_code = 200;
    this.response.body = {
      success: true,
      data: articleEntity,
    };
    return this.response;
  }

  public async DELETE() {
    console.log("Handling ArticleCommentsResource DELETE.");

    // make sure they are authorised to do so
    const cookie = this.request.getCookie("drash_sess");
    const user = await UserService.getLoggedInUser(cookie || "");
    if (typeof user === "boolean") {
      return this.errorResponse(403, "You are unauthorised to do this action.");
    }

    // Make sure they are the author of the comment
    const commentId = Number(this.request.getPathParam("id")) || 0;
    console.log("going to get comments");
    const comments = await ArticleCommentsModel.where({ author_id: user.id });
    const isTheirComment = comments.filter((comment) => {
      return comment.id == Number(commentId);
    }).length >= 0;
    if (!isTheirComment) {
      return this.errorResponse(403, "You are unauthorised to do this action.");
    }
    // Delete the comment
    const articleCommentsModel = new ArticleCommentsModel(
      0,
      ", ",
      "",
      0,
      ", ",
      0,
      0,
      commentId,
    );
    articleCommentsModel.id = Number(commentId);
    const deleted = await articleCommentsModel.delete();

    this.response.body = {
      message: "Deleted the comment",
      success: true,
    };
    return this.response;
  }
}
