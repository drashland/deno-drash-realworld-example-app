import type { Drash } from "../deps.ts";
import BaseResource from "./base_resource.ts";
import {
  ArticleEntity,
  ArticleModel,
  Filters as ArticleFilters,
} from "../models/article_model.ts";
import { ArticlesFavoritesModel } from "../models/articles_favorites_model.ts";
import UserModel from "../models/user_model.ts";

class ArticlesResource extends BaseResource {
  static paths = [
    "/articles",
    "/articles/:slug",
    "/articles/:slug/favorite",
  ];

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - HTTP //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public async GET(): Promise<Drash.Http.Response> {
    console.log("Handling ArticlesResource GET.");

    if (this.request.getPathParam("slug")) {
      return await this.getArticle();
    }

    return await this.getArticles();
  }

  public async POST(): Promise<Drash.Http.Response> {
    console.log("Handling ArticlesResource POST.");

    if (this.request.url_path.includes("/favorite")) {
      return await this.toggleFavorite();
    }

    return await this.createArticle();
  }

  public async PUT(): Promise<Drash.Http.Response> {
    console.log("Handling ArticlesResource PUT");

    return await this.updateArticle();
  }

  public async DELETE(): Promise<Drash.Http.Response> {
    console.log("Handling ArticlesResource DELETE");

    return await this.deleteArticle();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @description
   *     Add the author object to the entities.
   *
   * @param number[] authorIds
   * @param ArticleEntity[] entities
   *
   * @return Promise<ArticleEntity[]>
   */
  protected async addAuthorsToEntities(
    authorIds: number[],
    entities: ArticleEntity[],
  ): Promise<ArticleEntity[]> {
    const authors: UserModel[] = await UserModel.whereIn("id", authorIds);

    entities.map((entity: ArticleEntity) => {
      authors.forEach((user: UserModel) => {
        if (user.id === entity.author_id) {
          entity.author = user.toEntity();
        }
      });
      return entity;
    });

    return entities;
  }

  /**
   * @description
   *     Add the favorited field to the entities.
   *
   * @param number[] articleIds
   * @param ArticleEntity[] entities
   *
   * @return Promise<ArticleEntity[]>
   */
  protected async addFavoritedToEntities(
    articleIds: number[],
    entities: ArticleEntity[],
  ): Promise<ArticleEntity[]> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      return entities;
    }

    const favs: ArticlesFavoritesModel[] = await ArticlesFavoritesModel
      .whereIn("article_id", articleIds);

    entities = entities.map((entity: ArticleEntity) => {
      favs.forEach((favorite: ArticlesFavoritesModel) => {
        if (entity.id === favorite.article_id) {
          if (currentUser.id === favorite.user_id) {
            entity.favorited = favorite.value;
          }
        }
      });
      return entity;
    });

    return entities;
  }

  /**
   * @description
   *     Add the favoritesCount field to the entities.
   *
   * @param number[] articleIds
   * @param ArticleEntity[] entities
   *
   * @return Promise<ArticleEntity[]>
   */
  protected async addFavoritesCountToEntities(
    articleIds: number[],
    entities: ArticleEntity[],
  ): Promise<ArticleEntity[]> {
    const favs: ArticlesFavoritesModel[] = await ArticlesFavoritesModel
      .whereIn("article_id", articleIds);

    entities.map((entity: ArticleEntity) => {
      favs.forEach((favorite: ArticlesFavoritesModel) => {
        if (favorite.article_id == entity.id) {
          if (favorite.value === true) {
            entity.favoritesCount += 1;
          }
        }
      });
      return entity;
    });

    return entities;
  }

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
   *
   * @return Promise<Drash.Http.Response>
   */
  protected async updateArticle(): Promise<Drash.Http.Response> {
    const inputArticle: ArticleEntity | null =
      this.request.getBodyParam("article")
        ? (this.request.getBodyParam("article") as ArticleEntity)
        : null;

    if (inputArticle === null) {
      return this.errorResponse(400, "Article parameter must be passed in");
    }

    const article: ArticleModel = new ArticleModel(
      inputArticle.author_id,
      inputArticle.title,
      inputArticle.description,
      inputArticle.body,
      inputArticle.tags,
      inputArticle.slug,
      inputArticle.created_at,
      inputArticle.updated_at,
      inputArticle.id,
    );
    await article.save();

    if (!article) {
      return this.errorResponse(500, "Article could not be saved.");
    }

    this.response.body = {
      article: article.toEntity(),
    };

    return this.response;
  }

  /**
   * @description
   * Deletes an article by the slug
   *
   * @return Promise<Drash.Http.Response>
   */
  protected async deleteArticle(): Promise<Drash.Http.Response> {
    const articleSlug = this.request.getPathParam("slug");

    if (!articleSlug) {
      return this.errorResponse(400, "No article slug was passed in");
    }

    const articleResult: ArticleModel[] | [] = await ArticleModel.where(
      { slug: articleSlug },
    );
    if (!articleResult.length) {
      return this.errorResponse(
        500,
        "Failed to fetch the article by slug: " + articleSlug,
      );
    }

    const article: ArticleModel = articleResult[0];
    const deleted = await article.delete();
    if (deleted === false) {
      return this.errorResponse(
        500,
        "Failed to delete the article of slug: " + articleSlug,
      );
    }

    this.response.body = {
      success: true,
    };

    return this.response;
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
   *
   * @return Promise<Drash.Http.Response>
   */
  protected async createArticle(): Promise<Drash.Http.Response> {
    const inputArticle: ArticleEntity =
      (this.request.getBodyParam("article") as ArticleEntity);

    if (!inputArticle.title) {
      return this.errorResponse(400, "You must set the article title.");
    }

    const article: ArticleModel = new ArticleModel(
      inputArticle.author_id,
      inputArticle.title,
      inputArticle.description || "",
      inputArticle.body || "",
      inputArticle.tags || "",
    );
    console.log("article to save:");
    console.log(article);
    await article.save();

    if (!article) {
      return this.errorResponse(500, "Article could not be saved.");
    }

    this.response.body = {
      article: article.toEntity(),
    };

    return this.response;
  }

  /**
   * @return Promise<Drash.Http.Response>
   */
  protected async getArticle(): Promise<Drash.Http.Response> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      return this.errorResponse(
        400,
        "`user_id` field is required.",
      );
    }

    const slug = this.request.getPathParam("slug") || "";
    const articleResult = await ArticleModel.where({ slug: slug });

    if (articleResult.length <= 0) {
      return this.errorResponse(
        404,
        "Article not found.",
      );
    }

    const article = articleResult[0];

    const userResult = await UserModel.where({ id: article.author_id });
    if (userResult.length <= 0) {
      return this.errorResponse(
        400,
        "Unable to determine the article's author.",
      );
    }

    const user = userResult[0];

    const entity: ArticleEntity = article.toEntity();
    entity.author = user.toEntity();

    const favs = await ArticlesFavoritesModel
      .where({ article_id: article.id });
    if (favs) {
      favs.forEach((favorite: ArticlesFavoritesModel) => {
        if (favorite.value === true) {
          entity.favoritesCount += 1;
        }
      });
      favs.forEach((favorite: ArticlesFavoritesModel) => {
        if (entity.id === favorite.article_id) {
          if (currentUser.id === favorite.user_id) {
            entity.favorited = favorite.value;
          }
        }
      });
    }

    this.response.body = {
      article: entity,
    };

    return this.response;
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
   *
   * @return Promise<Drash.Http.Response>
   */
  protected async getArticles(): Promise<Drash.Http.Response> {
    const articles: ArticleModel[] = await ArticleModel
      .all(await this.getQueryFilters());

    const articleIds: number[] = [];
    const authorIds: number[] = [];

    let entities: ArticleEntity[] = articles.map((article: ArticleModel) => {
      if (authorIds.indexOf(article.author_id) === -1) {
        authorIds.push(article.author_id);
      }
      if (articleIds.indexOf(article.id) === -1) {
        articleIds.push(article.id);
      }
      return article.toEntity();
    });

    entities = await this.addAuthorsToEntities(authorIds, entities);
    entities = await this.addFavoritesCountToEntities(articleIds, entities);
    entities = await this.addFavoritedToEntities(articleIds, entities);
    entities = await this.filterEntitiesByFavoritedBy(articleIds, entities);

    this.response.body = {
      articles: entities,
    };
    return this.response;
  }

  /**
   * @description
   *     Filter the entities by the favorited_by param.
   *
   * @param number[] articleIds
   * @param ArticleEntity[] entities
   *
   * @return Promise<ArticleEntity[]>
   */
  protected async filterEntitiesByFavoritedBy(
    articleIds: number[],
    entities: ArticleEntity[],
  ): Promise<ArticleEntity[]> {
    const favs: ArticlesFavoritesModel[] = await ArticlesFavoritesModel
      .whereIn("article_id", articleIds);

    const username = this.request.getUrlQueryParam("favorited_by");
    if (!username) {
      return entities;
    }

    const results = await UserModel.where({ username: username });

    if (results.length <= 0) {
      return entities;
    }

    const user = results[0];

    const filtered: ArticleEntity[] = [];

    entities.forEach((entity: ArticleEntity) => {
      favs.forEach((favorite: ArticlesFavoritesModel) => {
        if (entity.id === favorite.article_id) {
          if (user.id === favorite.user_id) {
            if (favorite.value === true) {
              entity.favorited = true;
              filtered.push(entity);
            }
          }
        }
      });
    });

    return filtered;
  }

  /**
   * @description
   *     Get the filters for filtering article records.
   *
   * @return Promise<ArticleFilters>
   */
  protected async getQueryFilters(): Promise<ArticleFilters> {
    const author = this.request.getUrlQueryParam("author");
    const offset = this.request.getUrlQueryParam("offset");

    const filters: ArticleFilters = {};

    if (author) {
      const authorUser = await UserModel.where({ username: author });
      if (authorUser.length > 0) {
        filters.author = authorUser[0];
      }
    }

    return filters;
  }

  /**
   * @return Promise<Drash.Http.Response>
   *     Returns the updated article in the response.
   */
  protected async toggleFavorite(): Promise<Drash.Http.Response> {
    console.log("Handling action: toggleFavorite.");
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      return this.errorResponse(
        400,
        "`user_id` field is required.",
      );
    }

    const slug = this.request.getPathParam("slug") || "";

    const result = await ArticleModel.where({ slug: slug });
    if (result.length <= 0) {
      return this.errorResponse(404, `Article with slug "${slug}" not found.`);
    }

    const article = result[0];

    let favorite;

    const action = this.request.getBodyParam("action");
    switch (action) {
      case "set":
        // Check if the user already has a record in the db before creating a
        // new one. If the user has a record, then we just update the record.
        favorite = await ArticlesFavoritesModel.where({
          article_id: article.id,
          user_id: currentUser.id,
        });
        if (favorite.length > 0) {
          favorite[0].value = true;
          await favorite[0].save();
        } else {
          favorite = new ArticlesFavoritesModel(
            article.id,
            currentUser.id,
            true,
          );
          await favorite.save();
        }
        break;
      case "unset":
        favorite = await ArticlesFavoritesModel.where({
          article_id: article.id,
          user_id: currentUser.id,
        });
        if (!favorite) {
          return this.errorResponse(
            404,
            "Can't unset favorite on article that doesn't have any favorites.",
          );
        }
        favorite[0].value = false;
        await favorite[0].save();
        break;
    }

    return this.getArticle();
  }
}

export default ArticlesResource;
