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
    console.log("Handling ArticlesResource GET");

    if (this.request.getPathParam("slug")) {
      return await this.getArticle();
    }

    return await this.getArticles();
  }

  public async POST(): Promise<Drash.Http.Response> {
    console.log("Handling ArticlesResource POST");
    if (this.request.url_path.includes("/favorite")) {
      return await this.toggleFavorite();
    }

    return await this.createArticle();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

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
    const author = this.request.getUrlQueryParam("author");
    const favoritedBy = this.request.getUrlQueryParam("favorited_by");
    const offset = this.request.getUrlQueryParam("offset");
    const tag = this.request.getUrlQueryParam("tag");

    let filters: ArticleFilters = {};

    if (author) {
      const authorUser = await UserModel.whereUsername(author);
      if (!authorUser) {
        return this.errorResponse(
          404,
          `Articles by ${author} could not be found.`,
        );
      }
      filters.author = authorUser;
    }

    if (favoritedBy) {
      const favoritedByUser = await UserModel.whereUsername(favoritedBy);
      if (!favoritedByUser) {
        return this.errorResponse(
          404,
          `Articles by ${favoritedBy} could not be found.`,
        );
      }
      filters.favorited_by = favoritedByUser;
    }

    filters.offset = offset ?? 0;
    filters.tag = tag ?? null;

    const articles: ArticleModel[] = await ArticleModel.all(filters);

    let authorIds: number[] = [];

    let entities: any = articles.map((article: ArticleModel) => {
      if (authorIds.indexOf(article.author_id) === -1) {
        authorIds.push(article.author_id);
      }
      return article.toEntity();
    });

    let authors: any = await UserModel.whereInId(authorIds);

    entities.map((entity: any) => {
      authors.forEach((user: UserModel) => {
        if (user.id === entity.author_id) {
          entity.author = user.toEntity();
        }
      });
      return entity;
    });

    this.response.body = {
      articles: entities,
    };
    return this.response;
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
        favorite = await ArticlesFavoritesModel.getByArticleId(article.id);
        favorite.value = false;
        await favorite.save();
        break;
    }
    this.response.body = true;
    return this.response;
  }
}

export default ArticlesResource;
