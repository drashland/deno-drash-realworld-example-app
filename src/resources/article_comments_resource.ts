import { ArticleModel } from "../models/article_model.ts";
import { ArticleCommentsModel } from "../models/article_comments_model.ts";
import { Drash } from "../deps.ts";
import UserService from "../services/user_service.ts";
import BaseResource from "./base_resource.ts";
// import ArticleService from "../services/article_service.ts";

export default class ArticleCommentsResource extends BaseResource {
  paths = [
    "/articles/:slug/comments",
    "/articles/comment/:id", // Only for deleting
  ];

  public async GET(request: Drash.Request, response: Drash.Response) {
    const slug = request.pathParam("slug") || "";
    const article = await ArticleModel.query({
      where: [
        ['slug', slug]
       ],
       first: true
    });
    if (!article) {
      console.error("No article was found with the slug of: " + slug);
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
    const slug = request.pathParam("slug") || "";
    console.log("The slug for the article: " + slug);
    // First find an article by that slug. The article should exist.
    const articles = await ArticleModel.query({
      where: [
        ['slug', slug]
       ]
      });
    if (!articles.length) {
      return this.errorResponse(404, "No article was found.", response);
    }
    const article = articles[0];
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
    // TODO :: No need for author img and username, we can do this via relations
    articleComment.author_image = user.image;
    articleComment.author_id = user.id;
    await articleComment
      .save();
    const articleEntity = await  articleComment.toEntity();
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
    console.log("going to get comments");
    const comments = await ArticleCommentsModel.query({
      where: [
        ['author_id', user.id]
       ]
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
    const articleCommentsModel = await ArticleCommentsModel.query({
      'where': [
        ['id', commentId]
      ],
      first: true,
    }) as ArticleCommentsModel;
    await articleCommentsModel.delete();
    return response.json({
      message: "Deleted the comment",
      success: true,
    });
  }
}
