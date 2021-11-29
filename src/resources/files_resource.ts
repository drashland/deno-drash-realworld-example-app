import BaseResource from "./base_resource.ts";
import { Drash } from "../deps.ts";

class FilesResource extends BaseResource {
  paths = [
    "/favicon.ico",  
    "/public/.*\.(js|css|)",
  ];

  public GET(request: Drash.Request, response: Drash.Response) {
    const url = new URL(request.url)
    console.log(url.pathname)
    return response.file(`.${url.pathname}`)
  }
}

export default FilesResource;
