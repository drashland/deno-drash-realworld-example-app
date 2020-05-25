import { Drash } from "../../deps.ts"

class ArticlesArticleResource extends Drash.Http.Resource {

  static paths = [
    "/articles/:id",
  ];

  public async GET() {
    this.response.body = this.response.render('/article.html');
    return this.response;
  }
}

export default ArticlesArticleResource;
