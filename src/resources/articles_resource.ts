import { Drash } from "../deps.ts"
import BaseResource from "./base_resource.ts"

class ArticlesResource extends BaseResource {

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

