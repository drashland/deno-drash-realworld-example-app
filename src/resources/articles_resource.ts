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
   *     Returns the entities with author entities attached.
   */
  protected async attachAuthorsToArticleEntities(
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
  protected async attachFavoritesToArticleEntities(
    articleIds: number[],
    entities: any
  ): Promise<any[]> {
    let favorites: any = await ArticlesFavoritesModel.whereInId(articleIds);

    entities.map((entity: any) => {
      favorites.forEach((favorite: ArticlesFavoritesModel) => {
        if (favorite.article_id === entity.id) {
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
      .all(await this.getFilters());

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

    entities = await this.attachAuthorsToArticleEntities(authorIds, entities);
    entities = await this.attachFavoritesToArticleEntities(authorIds, entities);

    this.response.body = {
      articles: entities,
    };
    return this.response;
  }

  /**
   * Get the filters for filtering article records.
   *
   * @return ArticleFilters
   */
  protected async getFilters(): Promise<ArticleFilters> {
    const author = this.request.getUrlQueryParam("author");
    const favoritedBy = this.request.getUrlQueryParam("favorited_by");
    const offset = this.request.getUrlQueryParam("offset");
    const tag = this.request.getUrlQueryParam("tag");

    let filters: ArticleFilters = {};

    if (author) {
      const authorUser = await UserModel.whereUsername(author);
      if (authorUser) {
        filters.author = authorUser;
      }
    }

    if (favoritedBy) {
      const favoritedByUser = await UserModel.whereUsername(favoritedBy);
      if (favoritedByUser) {
        filters.favorited_by = favoritedByUser;
      }
    }

    filters.offset = offset ?? 0;
    filters.tag = tag ?? null;

    return filters;
  }

  /**
   * @return Promise<Drash.Http.Response>
   */
  protected async toggleFavorite(): Promise<Drash.Http.Response> {
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
          article.author_id,
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
