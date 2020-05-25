import { Drash } from "../../deps.ts"

class ArticlesEditResource extends Drash.Http.Resource {

  static paths = [
    "/articles/:id/edit",
  ];

  public async GET() {
    this.response.body = this.response.render('/edit_article.html');
    return this.response;
  }

  public POST() {
    this.response.body = this.response.render('/article.html');
    return this.response;
  }
}

export default ArticlesEditResource;


