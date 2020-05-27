import { Drash } from "../deps.ts"

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

