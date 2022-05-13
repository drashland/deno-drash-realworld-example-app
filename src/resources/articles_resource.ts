import type { Drash } from "../deps.ts";
import BaseResource from "./base_resource.ts";
import { ArticleEntity, ArticleModel } from "../models/article_model.ts";
import { ArticlesFavoritesModel } from "../models/articles_favorites_model.ts";
import UserModel from "../models/user_model.ts";

class ArticlesResource extends BaseResource {
  paths = [
    "/articles",
    "/articles/:id",
    "/articles/:id/favorite",
  ];

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - HTTP //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public async GET(request: Drash.Request, response: Drash.Response) {
    console.log("Handling ArticlesResource GET.");

    if (request.pathParam("id")) {
      return await this.getArticle(request, response);
    }

    return await this.getArticles(request, response);
  }

  public async POST(request: Drash.Request, response: Drash.Response) {
    console.log("Handling ArticlesResource POST.");

    if (request.url.includes("/favorite")) {
      return await this.toggleFavorite(request, response);
    }

    return await this.createArticle(request, response);
  }

  public async PUT(request: Drash.Request, response: Drash.Response) {
    console.log("Handling ArticlesResource PUT");

    return await this.updateArticle(request, response);
  }

  public async DELETE(request: Drash.Request, response: Drash.Response) {
    console.log("Handling ArticlesResource DELETE");

    return await this.deleteArticle(request, response);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @description
   * Gets data from the request to update an article. Data would come in like so:
   * {
   *   article: {
   *     author_id: number,
   *     title: string,
   *     description: string,
   *     body: string,
   *     ...
   *   }
   * }
   */
  protected async updateArticle(
    request: Drash.Request,
    response: Drash.Response,
  ) {
    const inputArticle: ArticleEntity | null = request.bodyParam("article")
      ? (request.bodyParam("article") as ArticleEntity)
      : null;

    if (inputArticle === null) {
      return this.errorResponse(
        400,
        "Article parameter must be passed in",
        response,
      );
    }

    const article = await ArticleModel.where(
      "id",
      inputArticle.id,
    ).first();

    if (!article) {
      return this.errorResponse(500, "Article could not be saved.", response);
    }
    article.author_id = inputArticle.author_id;
    article.title = inputArticle.title;
    article.description = inputArticle.description;
    article.body = inputArticle.body;
    article.tags = inputArticle.tags;
    await article.save();

    return response.json({
      article,
    });
  }

  /**
   * @description
   * Deletes an article by the id
   */
  protected async deleteArticle(
    request: Drash.Request,
    response: Drash.Response,
  ) {
    const articleId = request.pathParam("id");

    if (!articleId) {
      return this.errorResponse(400, "No article id was passed in", response);
    }

    const article = await ArticleModel.where(
      "id",
      articleId,
    ).first();
    if (!article) {
      return this.errorResponse(
        500,
        "Failed to fetch the article by id: " + articleId,
        response,
      );
    }

    await article.delete();

    return response.json({
      success: true,
    });
  }

  /**
   * @description
   * Gets data from the request to save a new article. Data would come in like so:
   * {
   *   article: {
   *     author_id: number,
   *     title: string,
   *     description: string,
   *     body: string
   *   }
   * }
   */
  protected async createArticle(
    request: Drash.Request,
    response: Drash.Response,
  ) {
    const inputArticle: ArticleEntity =
      (request.bodyParam("article") as ArticleEntity);

    if (!inputArticle.title) {
      return this.errorResponse(
        400,
        "You must set the article title.",
        response,
      );
    }

    const article = new ArticleModel();
    article.author_id = inputArticle.author_id;
    article.title = inputArticle.title;
    article.description = inputArticle.description ?? "";
    article.body = inputArticle.body ?? "";
    article.tags = inputArticle.tags ?? [];
    await article.save();

    return response.json({
      article,
    });
  }

  protected async getArticle(request: Drash.Request, response: Drash.Response) {
    const id = request.pathParam("id") || "";
    const article = await ArticleModel.where(
      "id",
      id,
    ).first();

    if (!article) {
      return this.errorResponse(
        404,
        "Article not found.",
        response,
      );
    }

    const user = await UserModel.where(
      "id",
      article.author_id,
    ).first();
    if (!user) {
      return this.errorResponse(
        400,
        "Unable to determine the article's author.",
        response,
      );
    }

    const favorites = await article.articleFavorites().all();
    return response.json({
      article: {
        ...article,
        author: user,
        favoritesCount: favorites.length,
        favorited: favorites.length > 0,
      },
    });
  }

  /**
   * @description
   *     Get all articles--filtered or unfiltered.
   *
   *     Filters include:
   *         {
   *           author: string;       (author username)
   *           favorited_by: string; (author username)
   *           offset: number;       (used for filtering articles by OFFSET)
   *           tag: string;          (used for filtering articles by tag)
   *         }
   */
  protected async getArticles(
    request: Drash.Request,
    response: Drash.Response,
  ) {
    const authorParam = request.queryParam("author");
    const authorId = request.queryParam("user_id");
    console.log("autor param", authorParam);
    // { author: user where username is queryparam author } | {}
    let articles: ArticleModel[] = [];
    if (authorParam) {
      const author = await UserModel.where(
        "username",
        authorParam,
      ).first();
      if (author) {
        articles = await author.articles().all();
      }
    } else if (authorId) {
      articles = await ArticleModel.where("author_id", authorId)
        .all();
    } else {
      articles = await ArticleModel.all();
    }
    const username = request.queryParam("favorited_by");
    const result = [];
    for (const article of articles) {
      const favorites = await article.articleFavorites().all();
      const author = await article.author();
      result.push({
        ...article,
        author: author ?? null,
        favoritesCount: favorites.length,
        favorited: favorites.length > 0,
      });
    }
    if (!username) {
      console.log("returning the articles");
      return response.json({
        articles: result,
      });
    }

    const userToFilterBy = await UserModel.where(
      "username",
      username,
    ).first();
    if (!userToFilterBy) {
      return response.json({
        articles: result,
      });
    }

    // foreach article, if its favorited and the above user owns the article, push it

    const filtered: ArticleEntity[] = [];

    for (const article of result) {
      if (article.favorited && userToFilterBy.id === article.author_id) {
        filtered.push(article);
      }
    }

    return response.json({
      articles: filtered,
    });
  }

  protected async toggleFavorite(
    request: Drash.Request,
    response: Drash.Response,
  ) {
    console.log("Handling action: toggleFavorite.");
    const id = request.pathParam("id") || 0;

    const result = await ArticleModel.where(
      "id",
      id,
    ).first();
    if (!result) {
      return this.errorResponse(
        404,
        `Article with id "${id}" not found.`,
        response,
      );
    }

    const article = result;
    const currentUser = await article.author();
    if (!currentUser) {
      return this.errorResponse(
        404,
        `Unable to find user for article #${article.id}`,
        response,
      );
    }

    let favorite;

    const action = request.bodyParam("action");
    switch (action) {
      case "set":
        // Check if the user already has a record in the db before creating a
        // new one. If the user has a record, then we just update the record.
        favorite = await ArticlesFavoritesModel.where(
          "article_id",
          article.id,
        )
          .where("user_id", currentUser.id)
          .first();
        if (!favorite) {
          favorite = new ArticlesFavoritesModel();
          favorite.article_id = article.id;
          favorite.user_id = currentUser.id;
          await favorite.save();
        }
        break;
      case "unset":
        favorite = await ArticlesFavoritesModel.where("article_id", article.id)
          .where("user_id", currentUser.id)
          .first();
        if (!favorite) {
          return this.errorResponse(
            404,
            "Can't unset favorite on article that doesn't have any favorites.",
            response,
          );
        }
        await favorite.delete();
        break;
    }

    return this.getArticle(request, response);
  }
}

export default ArticlesResource;
