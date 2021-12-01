import BaseResource from "./base_resource.ts";
import { Drash } from "../deps.ts";

class TagsResource extends BaseResource {
  paths = [
    "/tags",
    "/tags/:id",
  ];

  public GET(_request: Drash.Request, response: Drash.Response) {
    response.json([]);
  }
}

export default TagsResource;
