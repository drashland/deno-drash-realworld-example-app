import { Drash } from "../deps.ts";
import UserModel from "../models/user_model.ts";

class BaseResource extends Drash.Resource {
  public current_user: UserModel | null = null;

  /**
   * @description
   * Send an error response. No other logic is needed other than:
   *   this.errorResponse(...)
   *
   * @param number statusCode
   * @param string message
   *
   * @return Drash.Http.Response
   */
  protected errorResponse(
    statusCode: number,
    message: string,
    response: Drash.Response,
  ): void {
    response.status = statusCode;
    response.json({
      errors: {
        body: [message],
      },
    });
  }

  /**
   * All requests require the user_id field to be passed in so that we know who
   * the current user is when processing requests. If the user_id is not passed
   * in the request body or URL query param, then this error should be thrown.
   *
   * @return Drash.Http.Response
   */
  protected errorResponseCurrentUser(response: Drash.Response) {
    return this.errorResponse(
      400,
      "`user_id` field is required.",
      response,
    );
  }

  /**
   * @description
   * Returns a user by the user id within the url query or body
   *
   * @return
   */
  protected async getCurrentUser(
    request: Drash.Request,
  ): Promise<UserModel | null> {
    console.log("Getting the current user.");
    if (this.current_user) {
      console.log(`Using cached User #${this.current_user.id}.`);
      return this.current_user;
    }

    const userId = (request.queryParam("user_id") as string) ||
      (request.bodyParam("user_id") as string);

    if (!userId) {
      return null;
    }

    this.current_user = await UserModel.query({
      where: [
        ['id', userId]
      ],
      first: true
    });

    if (!this.current_user) {
      return null
    }

    console.log(`Setting User #${this.current_user.id} as current user.`);
    return this.current_user;
  }
}

export default BaseResource;
