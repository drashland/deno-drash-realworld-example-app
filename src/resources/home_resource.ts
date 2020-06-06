import { Drash } from "../deps.ts";
import BaseResource from "./base_resource.ts";

class HomeResource extends BaseResource {
  static paths = [
    "/",
  ];

  public async GET() {
    this.response.headers.set("Content-Type", "text/html");
    this.response.body = this.response.render(
      "/index.html",
      { title: "Conduit" },
    );
    return this.response;
  }
}

export default HomeResource;
