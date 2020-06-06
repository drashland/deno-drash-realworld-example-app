import { Drash } from "../deps.ts";
import BaseResource from "./base_resource.ts";

class TagsResource extends BaseResource {
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
