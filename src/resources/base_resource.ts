import { Drash } from "../deps.ts";

class BaseResource extends Drash.Http.Resource {
  /**
   * @param number statusCode
   * @param string message
   *
   * @return Drash.Http.Response
   */
  protected errorResponse(
    statusCode: number,
    message: string,
  ): Drash.Http.Response {
    this.response.status_code = statusCode;
    this.response.body = {
      errors: {
        body: [message],
      },
    };
    return this.response;
  }
}

export default BaseResource;
