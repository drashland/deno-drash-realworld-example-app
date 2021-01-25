import { Drash } from "../deps.ts";
import BaseResource from "./base_resource.ts";
import { tengine } from "../middlewares/tengine.ts";

class HomeResource extends BaseResource {
  static paths = [
    "/",
  ];

  @Drash.Http.Middleware({
    before_request: [tengine],
    after_request: [],
  })
  public GET() {
    this.response.headers.set("Content-Type", "text/html");
    this.response.body = this.response.render(
      "/index.html",
      { title: "Conduit" },
    );
    return this.response;
  }
}

export default HomeResource;
