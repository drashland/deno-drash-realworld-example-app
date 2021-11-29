import { Drash } from "../deps.ts";
import BaseResource from "./base_resource.ts";
import { tengine } from "../middlewares/tengine.ts";

class HomeResource extends BaseResource {
  paths = [
    "/",
  ];

  services = {
    GET: [tengine],
  };

  public GET(_request: Drash.Request, response: Drash.Response) {
    response.html(response.render(
      "/index.html",
      { title: "Conduit" },
    ) as string);
  }
}

export default HomeResource;
