import { Drash } from "../../deps.ts"

class ArticlesCreateResource extends Drash.Http.Resource {

  static paths = [
    "/articles/create",
  ];

  public async GET() {
    this.response.body = this.response.render('/create_article.html');
    return this.response;
  }

  public POST() {
    this.response.body = this.response.render('/article.html');
    return this.response;
  }
}

export default ArticlesCreateResource;

