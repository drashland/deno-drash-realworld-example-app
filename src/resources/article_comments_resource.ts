import { ArticleModel } from "../models/article_model.ts";
import { ArticleCommentsModel } from "../models/article_comments_model.ts";
import { Drash } from "../deps.ts";
import UserService from "../services/user_service.ts";
import BaseResource from "./base_resource.ts";
// import ArticleService from "../services/article_service.ts";

export default class ArticleCommentsResource extends BaseResource {
  paths = [
    "/articles/:id/comments",
    "/articles/comment/:id", // Only for deleting
  ];

  public async GET(request: Drash.Request, response: Drash.Response) {
    const id = request.pathParam("id") || "";
    const article = await ArticleModel.first({
      where: [
        ["id", id],
      ],
    });
    if (!article) {
      console.error("No article was found with the id of: " + id);
      response.status = 404;
      return response.json({
        errors: {
          comment: "No article was found for the given article",
        },
      });
    }
    const comments = await article.comments();
    if (!comments.length) {
      console.log(
        "No comments were found for the article with id: " + article.id,
      );
      return response.json([]);
    }
    console.log(
      "Returning comments (length of " + comments.length +
        ") for article with id: " + article.id,
    );
    response.json({
      success: true,
      data: comments,
    });
  }

  public async POST(request: Drash.Request, response: Drash.Response) {
    console.log("Handling ArticleCommentsResource POST.");
    const comment = (request.bodyParam("comment") as string);
    const id = request.pathParam("id") || "";
    console.log("The id for the article: " + id);
    // First find an article by that id. The article should exist.
    const article = await ArticleModel.first({
      where: [
        ["id", id],
      ],
    });
    if (!article) {
      return this.errorResponse(404, "No article was found.", response);
    }
    // Get user and validation check
    if (!comment) {
      return this.errorResponse(
        422,
        "A comment is required to post.",
        response,
      );
    }
    const cookie = request.getCookie("drash_sess");
    const user = await UserService.getLoggedInUser(cookie || "");
    if (typeof user === "boolean") {
      return this.errorResponse(
        403,
        "You are unauthorised to complete this action.",
        response,
      );
    }
    // save the comment
    const articleComment = new ArticleCommentsModel();
    articleComment.article_id = article.id,
      articleComment.comment = comment,
      articleComment.author_id = user.id;
    await articleComment
      .save();
    const articleEntity = await articleComment.toEntity();
    response.status = 200;
    return response.json({
      success: true,
      data: articleEntity,
    });
  }

  public async DELETE(request: Drash.Request, response: Drash.Response) {
    console.log("Handling ArticleCommentsResource DELETE.");

    // make sure they are authorised to do so
    const cookie = request.getCookie("drash_sess");
    const user = await UserService.getLoggedInUser(cookie || "");
    if (typeof user === "boolean") {
      return this.errorResponse(
        403,
        "You are unauthorised to do this action.",
        response,
      );
    }

    // Make sure they are the author of the comment
    const commentId = Number(request.pathParam("id")) || 0;
    const comments = await ArticleCommentsModel.all({
      where: [
        ["author_id", user.id],
      ],
    });
    const isTheirComment = comments.filter((comment) => {
      return comment.id == Number(commentId);
    }).length >= 0;
    if (!isTheirComment) {
      return this.errorResponse(
        403,
        "You are unauthorised to do this action.",
        response,
      );
    }
    // Delete the comment
    const articleCommentsModel = await ArticleCommentsModel.first({
      "where": [
        ["id", commentId],
      ],
    }) as ArticleCommentsModel;
    await articleCommentsModel.delete();
    return response.json({
      message: "Deleted the comment",
      success: true,
    });
  }
}
