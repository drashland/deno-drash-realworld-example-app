import { ArticleModel } from "../models/article_model.ts";
import { ArticleCommentModel } from "../models/article_comment_model.ts";
import { Drash } from "../deps.ts";
import BaseResource from "./base_resource.ts";
import { AuthenticateService } from "../services/authenticate_service.ts";
const authenticateService = new AuthenticateService();
// import ArticleService from "../services/article_service.ts";

export default class ArticleCommentResource extends BaseResource {
  paths = [
    "/articles/:id/comments",
    "/articles/comment/:id", // Only for deleting
  ];

  public services = {
    "POST": [authenticateService],
    "DELETE": [authenticateService],
  };

  public async GET(request: Drash.Request, response: Drash.Response) {
    const id = request.pathParam("id") || "";
    const article = await ArticleModel.where(
      "id",
      id,
    ).first();
    if (!article) {
      console.error("No article was found with the id of: " + id);
      response.status = 404;
      return response.json({
        errors: {
          comment: "No article was found for the given article",
        },
      });
    }
    const comments = await article.comments().all();
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
    console.log("Handling ArticleCommentResource POST.");
    const comment = (request.bodyParam("comment") as string);
    const id = request.pathParam("id") || "";
    console.log("The id for the article: " + id);
    // First find an article by that id. The article should exist.
    const article = await ArticleModel.where(
      "id",
      id,
    ).first();
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
    const user = await this.getUser({
      session: true,
    }, request);
    if (typeof user === "boolean") {
      return this.errorResponse(
        403,
        "You are unauthorised to complete this action.",
        response,
      );
    }
    // save the comment
    const articleComment = new ArticleCommentModel();
    articleComment.article_id = article.id,
      articleComment.body = comment,
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
    console.log("Handling ArticleCommentResource DELETE.");

    // make sure they are authorised to do so
    const user = await this.getUser({
      session: true,
    }, request);
    if (user === false) {
      return this.errorResponse(
        403,
        "You are unauthorised to do this action.",
        response,
      );
    }

    // Make sure they are the author of the comment
    const commentId = Number(request.pathParam("id")) || 0;
    const comments = await ArticleCommentModel.where(
      "author_id",
      user.id,
    ).all();
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
    const articleCommentModel = await ArticleCommentModel.where(
      "id",
      commentId,
    ).first() as ArticleCommentModel;
    await articleCommentModel.delete();
    return response.json({
      message: "Deleted the comment",
      success: true,
    });
  }
}
