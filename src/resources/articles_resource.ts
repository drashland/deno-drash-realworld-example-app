import type { Drash } from "../deps.ts";
import BaseResource from "./base_resource.ts";
import {
  ArticleEntity,
  ArticleModel,
} from "../models/article_model.ts";
import { ArticlesFavoritesModel } from "../models/articles_favorites_model.ts";
import UserModel from "../models/user_model.ts";

class ArticlesResource extends BaseResource {
  paths = [
    "/articles",
    "/articles/:slug",
    "/articles/:slug/favorite",
  ];

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - HTTP //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public async GET(request: Drash.Request, response: Drash.Response) {
    console.log("Handling ArticlesResource GET.");

    if (request.pathParam("slug")) {
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

    const article = await ArticleModel.query({
      where: [
        ['id', inputArticle.id]
      ],
      first: true
    })
    
    if (!article) {
      return this.errorResponse(500, "Article could not be saved.", response);
    }
    article.author_id = inputArticle.author_id
    article.title = inputArticle.title;
    article.description = inputArticle.description
    article.body = inputArticle.body
    article.tags = inputArticle.tags;
    article.slug = inputArticle.slug ?? article.createSlug(article.title)
    await article.save();

    return response.json({
      article: await article.toEntity(),
    });
  }

  /**
   * @description
   * Deletes an article by the slug
   */
  protected async deleteArticle(
    request: Drash.Request,
    response: Drash.Response,
  ) {
    const articleSlug = request.pathParam("slug");

    if (!articleSlug) {
      return this.errorResponse(400, "No article slug was passed in", response);
    }

    const article = await ArticleModel.query({
      where: [
        ['slug', articleSlug ],
      ],
      first: true
    });
    if (!article) {
      return this.errorResponse(
        500,
        "Failed to fetch the article by slug: " + articleSlug,
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

    const article = new ArticleModel;
    article.author_id = inputArticle.author_id
    article.title = inputArticle.title
    article.description = inputArticle.description ?? ''
    article.body = inputArticle.body ?? ''
    article.tags = inputArticle.tags ?? []
    console.log("article to save:");
    console.log(article);
    await article.save();

    return response.json({
      article: await article.toEntity(),
    });
  }

  protected async getArticle(request: Drash.Request, response: Drash.Response) {
    const currentUser = await this.getCurrentUser(request);
    if (!currentUser) {
      return this.errorResponse(
        400,
        "`user_id` field is required.",
        response,
      );
    }

    const slug = request.pathParam("slug") || "";
    const article = await ArticleModel.query({
      where: [
        ['slug', slug ]
      ],
      first: true
    });

    if (!article) {
      return this.errorResponse(
        404,
        "Article not found.",
        response,
      );
    }

    const user = await UserModel.query({
      where: [
        ['id', article.author_id]
      ],
      first: true
    });
    if (!user) {
      return this.errorResponse(
        400,
        "Unable to determine the article's author.",
        response,
      );
    }


    const entity = await article.toEntity<ArticleEntity>();

    const favorites = (await article.articleFavorites([
      ['user_id', user.id]
    ]))
    return response.json({
      article: {
        ...entity,
        author: await user.toEntity(),
        favoritesCount: favorites.length,
        favorited: favorites.length > 0
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
    const authorParam = request.queryParam('author')
        // { author: user where username is queryparam author } | {}
    const where = []
    if (authorParam) {
      const author = await UserModel.query({
        where: [
          ['username', authorParam]
        ],
        first: true
      })
      if (author) {
      where.push([
        'author_id', author.id
      ])
    }
    }
    const articles: ArticleModel[] = await ArticleModel
      .query({
        where
      })
    const username = request.queryParam("favorited_by");
    const result = articles.map(async article => {
      const favorites = await article.articleFavorites()
      return {
        ...await article.toEntity<ArticleEntity>(),
        author: (await article.author())?.toEntity(),
        favoritesCount: favorites.length,
        favorited: favorites.length > 0
      }
    }) as any
    if (!username) {
      return response.json({
        articles: result
      })
    }

    const userToFilterBy = await UserModel.query({
      where: [
        ['username', username]
       ], first: true
    });
    if (!userToFilterBy) {
      return response.json({
        articles: result
      });
    }

    // foreach article, if its favorited and the above user owns the article, push it

    const filtered: ArticleEntity[] = [];

    for (const article of result) {
      if (article.favorited && userToFilterBy.id === article.author_id) {
        filtered.push(article)
      }
    }

    return response.json({
      articles: filtered
    })
  }

  protected async toggleFavorite(
    request: Drash.Request,
    response: Drash.Response,
  ) {
    console.log("Handling action: toggleFavorite.");
    const currentUser = await this.getCurrentUser(request);
    if (!currentUser) {
      return this.errorResponse(
        400,
        "`user_id` field is required.",
        response,
      );
    }

    const slug = request.pathParam("slug") || "";

    const result = await ArticleModel.query({
      where: [
        ['slug', slug]
       ], first: true });
    if (!result) {
      return this.errorResponse(
        404,
        `Article with slug "${slug}" not found.`,
        response,
      );
    }

    const article = result;

    let favorite;

    const action = request.bodyParam("action");
    switch (action) {
      case "set":
        // Check if the user already has a record in the db before creating a
        // new one. If the user has a record, then we just update the record.
        favorite = await ArticlesFavoritesModel.query({
          where: [
          ['article_id', article.id],
          ['user_id', currentUser.id],
          ],
          first: true
        });
        if (favorite) {
          favorite.value = true;
          await favorite.save();
        } else {
          favorite = new ArticlesFavoritesModel;
          favorite.article_id = article.id;
          favorite.user_id = currentUser.id;
          favorite.value = true
          await favorite.save();
        }
        break;
      case "unset":
        favorite = await ArticlesFavoritesModel.query({
          where: [
            ['article_id', article.id],
          ['user_id', currentUser.id],
          ], first: true
        });
        if (!favorite) {
          return this.errorResponse(
            404,
            "Can't unset favorite on article that doesn't have any favorites.",
            response,
          );
        }
        favorite.value = false;
        await favorite.save();
        break;
    }

    return this.getArticle(request, response);
  }
}

export default ArticlesResource;
