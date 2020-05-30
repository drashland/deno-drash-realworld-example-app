import { Drash } from "../deps.ts"
import ArticleService from "../services/article_service.ts";

class ArticlesResource extends Drash.Http.Resource {

  static paths = [
    "/articles",
    "/articles/:id",
  ];

  public GET() {
    this.response.body = [];
    return this.response;
  }
}

export default ArticlesResource;

