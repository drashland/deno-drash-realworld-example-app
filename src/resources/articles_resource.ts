import { Drash } from "../deps.ts"
import { ArticleModel, ArticleEntity } from "../models/article_model.ts";

class ArticlesResource extends Drash.Http.Resource {

  static paths = [
    "/articles",
    "/articles/:slug",
  ];

  public async GET() {
    const article = await ArticleModel.getArticleBySlug(
      this.request.getPathParam("slug")
    );

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

  public async POST() {
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
}

export default ArticlesResource;

