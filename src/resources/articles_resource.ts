import { Drash } from "../deps.ts";
import BaseResource from "./base_resource.ts";
import {
  ArticleModel,
  ArticleEntity,
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

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param number[] authorIds
   * @param any[] entities
   *
   * @return any[]
   *     Returns the entities with author entities added.
   */
  protected async addAuthorsToArticleEntities(
    authorIds: number[],
    entities: any[]
  ): Promise<any[]> {
    let authors: any = await UserModel.whereInId(authorIds);

    entities.map((entity: any) => {
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
   * @param number[] articleIds
   * @param any[] entities
   *
   * @return any[]
   *     Returns the entities with a favoritesCount field.
   */
  protected async addFavoritesToArticleEntities(
    articleIds: number[],
    entities: any
  ): Promise<any[]> {
    let favorites: any = await ArticlesFavoritesModel
      .whereInArticleId(articleIds);

    entities.map((entity: any) => {
      favorites.forEach((favorite: ArticlesFavoritesModel) => {
        if (favorite.article_id == entity.id) {
          entity.favoritesCount += 1;
        }
      });
      return entity;
    });

    return entities;
  }

  /**
   * @return Promise<Drash.Http.Response>
   */
  protected async createArticle(): Promise<Drash.Http.Response> {
    const inputArticle: ArticleEntity = this.request.getBodyParam("article");

    let article: ArticleModel = new ArticleModel(
      inputArticle.author_id,
      inputArticle.title,
      inputArticle.description,
      inputArticle.body,
    );
    article = await article.save();

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
      return this.errorResponse(500, "Can't determine the current user.");
    }
    const slug = this.request.getPathParam("slug");
    const article = await ArticleModel.whereSlug(slug);

    if (!article) {
      return this.errorResponse(404, "Article not found.");
    }

    let entity: any = article.toEntity();
    let user: any = await UserModel.whereId(article.author_id);
    if (!user) {
      entity.author = user = {
        bio: "",
        email: "",
        image: "",
        username: "Unknown",
      };
    } else {
      entity.author = user.toEntity();
    }

    let favorites: any = await ArticlesFavoritesModel.whereId(article.id);
    entity.favoritesCount = favorites.length;
    console.log(favorites);
    favorites.forEach((favorite: ArticlesFavoritesModel) => {
      if (entity.id === favorite.article_id) {
        console.log("favorited 1");
        console.log(currentUser.id);
        console.log(favorite.user_id);
        if (currentUser.id === favorite.user_id) {
          console.log("favorited 2");
          entity.favorited = true;
        }
      }
    });

    this.response.body = {
      article: entity,
    };

    return this.response;
  }

  /**
   * Get all articles--filtered or unfiltered.
   *
   * Filters include: {
   *   author: string;       (author username)
   *   favorited_by: string; (author username)
   *   offset: number;       (used for filtering articles by OFFSET clause)
   *   tag: string;          (used for filtering articles by tag)
   * }
   *
   * @return Promise<Drash.Http.Response>
   */
  protected async getArticles(): Promise<Drash.Http.Response> {
    const articles: ArticleModel[] = await ArticleModel
      .all(await this.getQueryFilters());

    let articleIds: number[] = [];
    let authorIds: number[] = [];

    let entities: any = articles.map((article: ArticleModel) => {
      if (authorIds.indexOf(article.author_id) === -1) {
        authorIds.push(article.author_id);
      }
      if (articleIds.indexOf(article.id) === -1) {
        articleIds.push(article.id);
      }
      return article.toEntity();
    });

    entities = await this.addAuthorsToArticleEntities(authorIds, entities);
    entities = await this.addFavoritesToArticleEntities(articleIds, entities);
    entities = await this.filterEntities(articleIds, entities);

    this.response.body = {
      articles: entities,
    };
    return this.response;
  }

  /**
   * Filter the entities further.
   *
   * @param any entities
   *
   * @return any
   *     Returns the filtered entities.
   */
  protected async filterEntities(
    articleIds: number[],
    entities: any
  ): Promise<any> {
    const favorites: any = await ArticlesFavoritesModel
      .whereInArticleId(articleIds);

    const username = this.request.getUrlQueryParam("favorited_by");
    if (!username) {
      return entities;
    }

    const user = await UserModel.whereUsername(username);

    if (!user) {
      return entities;
    }

    let filteredIds: number[] = [];

    entities.forEach((entity: any) => {
      favorites.forEach((favorite: ArticlesFavoritesModel) => {
        if (entity.id === favorite.article_id) {
          if (user.id === favorite.user_id) {
            filteredIds.push(entity.id);
          }
        }
      });
    });

    return entities.filter((entity: any) => {
      return filteredIds.indexOf(entity.id) !== -1;
    });
  }

  /**
   * Get the filters for filtering article records.
   *
   * @return ArticleFilters
   */
  protected async getQueryFilters(): Promise<ArticleFilters> {
    const author = this.request.getUrlQueryParam("author");
    const offset = this.request.getUrlQueryParam("offset");
    const tag = this.request.getUrlQueryParam("tag");

    let filters: ArticleFilters = {};

    if (author) {
      const authorUser = await UserModel.whereUsername(author);
      if (authorUser) {
        filters.author = authorUser;
      }
    }

    return filters;
  }

  /**
   * @return Promise<Drash.Http.Response>
   *     Returns the updated article.
   */
  protected async toggleFavorite(): Promise<Drash.Http.Response> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      return this.errorResponse(500, "Can't determine the current user.");
    }
    const slug = this.request.getPathParam("slug");
    const article = await ArticleModel.whereSlug(slug);
    if (!article) {
      return this.errorResponse(404, `Article with slug "${slug}" not found.`);
    }
    const action = this.request.getBodyParam("action");
    let favorite: any;
    switch (action) {
      case "set":
        favorite = new ArticlesFavoritesModel(
          article.id,
          currentUser.id,
          true,
        );
        await favorite.save();
        break;
      case "unset":
        favorite = await ArticlesFavoritesModel.whereId(article.id);
        if (!favorite) {
          return this.errorResponse(404, "Article doesn't have any favorites.");
        }
        favorite.value = false;
        await favorite.save();
        break;
    }
    return this.getArticle();
  }
}

export default ArticlesResource;
