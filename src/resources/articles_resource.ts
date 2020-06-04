import { Drash } from "../deps.ts"
import BaseResource from "./base_resource.ts"
import { ArticleModel, ArticleEntity, Filters as ArticleFilters } from "../models/article_model.ts";
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

    const slug = this.request.getPathParam("slug");
    if (slug) {
      return await this.getArticle(slug);
    }

    return await this.getArticles();
  }

  public async POST(): Promise<Drash.Http.Response> {
    if (this.request.url_path.contains("/favorite")) {
      return await this.toggleFavorite(
        this.request.getBodyParam("slug"),
        this.request.getBodyParam("action")
      );
    }

    return await this.createArticle();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @return Promise<Drash.Http.Response>
   */
  protected createArticle(): Promise<Drash.Http.Response> {
    const inputArticle: ArticleEntity = this.request.getBodyParam("article");

    let article: ArticleModel = new ArticleModel(
      inputArticle.author_id,
      inputArticle.title,
      inputArticle.description,
      inputArticle.body
    );
    article = await article.save();

    if (!article) {
      this.response.status_code = 500;
      this.response.body = {
        errors: {
          body: ["Article could not be saved."]
        }
      };
      return this.response;
    }

    this.response.body = {
      article: article.toEntity()
    };

    return this.response;
  }

  /**
   * Get an article by slug.
   *
   * @return Promise<Drash.Http.Response>
   */
  protected async getArticle(slug: string): Promise<Drash.Http.Response> {
    const article = await ArticleModel.getArticleBySlugWithAuthor(slug);

    if (!article) {
      this.response.status_code = 404;
      this.response.body = {
        errors: {
          body: ["Article not found."]
        }
      };
      return this.response;
    }

    let entity: any = article.toEntity();

    this.response.body = {
      article: entity
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
      const authorUser= await UserModel.getUserByUsername(author);
      if (!authorUser) {
        return this.errorResponse(404, `Articles by ${author} could not be found.`);
      }
      filters.author = authorUser;
    }

    if (favoritedBy) {
      const favoritedByUser = await UserModel.getUserByUsername(favoritedBy);
      if (!favoritedByUser) {
        return this.errorResponse(404, `Articles by ${favoritedBy} could not be found.`);
      }
      filters.favorited_by = favoritedByUser;
    }

    filters.offset = offset ?? 0;
    filters.tag = tag ?? null;

    const articles: ArticleModel[] = await ArticleModel
      .getAllArticlesWithAuthors(filters);
    const entities: ArticleEntity[] = articles.map((article: ArticleModel) => {
      return article.toEntity();
    });

    this.response.body = {
      articles: entities
    };
    return this.response;
  }

  /**
   * @return Promise<Drash.Http.Response>
   */
  protected async toggleFavorite(
    slug: string,
    action: string
  ): Promise<Drash.Http.Response> {
    switch (action) {
      case: "set":
        ArticleModel.setArticleFavorite(slug);
        break;
      case: "unset":
        ArticleModel.unsetArticleFavorite(slug);
        break;
    }
  }
}

export default ArticlesResource;

