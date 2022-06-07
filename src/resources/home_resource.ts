import { Drash } from "../deps.ts";
import BaseResource from "./base_resource.ts";
import { tengine } from "../middlewares/tengine.ts";

class PageResource extends BaseResource {
  paths = [
    "/",
    "/my-feed",
    "/tag/:tag",
    "/login",
    "/register",
    "/settings",
    "/profile/:username",
    "/profile/:username/favorites",
    "/articles/:id",
    "/editor/:id?"
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

export default PageResource;
