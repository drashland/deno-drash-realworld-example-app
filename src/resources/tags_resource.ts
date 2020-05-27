import { Drash } from "../deps.ts"

class TagsResource extends Drash.Http.Resource {

  static paths = [
    "/tags",
    "/tags/:id",
  ];

  public GET() {
    this.response.body = [];
    return this.response;
  }
}

export default TagsResource;

