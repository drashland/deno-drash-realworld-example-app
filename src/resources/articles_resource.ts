import { Drash } from "../deps.ts"
import BaseResource from "./base_resource.ts"
import { ArticleModel, ArticleEntity } from "../models/article_model.ts";

class ArticlesResource extends BaseResource {

  static paths = [
    "/articles",
    "/articles/:slug",
  ];

  public async GET(): Promise<Drash.Http.Response> {
    console.log("Handling ArticlesResource GET");

    const slug = this.request.getPathParam("slug");
    if (slug) {
      return await this.getArticle(slug);
    }

    return await this.getArticles();
  }

  public async POST(): Promise<Drash.Http.Response> {
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

  protected async getArticle(slug: string): Promise<Drash.Http.Response> {
    const article = await ArticleModel.getArticleBySlug(slug);

    if (!article) {
      this.response.status_code = 404;
      this.response.body = {
        errors: {
          body: ["Article not found."]
        }
      };
      return this.response;
    }

    this.response.body = {
      article: article.toEntity()
    };

    return this.response;
  }

  protected async getArticles(): Promise<Drash.Http.Response> {
    const articles: ArticleModel[] = await ArticleModel.getAllArticles();
    const entities: ArticleEntity[] = articles.map((article: ArticleModel) => {
      return article.toEntity();
    });
    console.log(entities);

    this.response.body = {
      articles: entities
    };
    return this.response;
  }
}

export default ArticlesResource;

