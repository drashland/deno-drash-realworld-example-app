import { Drash } from "../deps.ts"

class HomeResource extends Drash.Http.Resource {

  static paths = [
    "/",
  ];

  public async GET() {
    this.response.headers.set("Content-Type", "text/html");
    this.response.body = this.response.render("/index.html", { title: "Conduit"});
    return this.response;
  }
}

export default HomeResource;
