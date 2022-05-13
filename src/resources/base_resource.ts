import { Drash } from "../deps.ts";
import UserModel from "../models/user_model.ts";
import { SessionModel } from "../models/session_model.ts";

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
   * Get a user by:
   *   - session (logged in user using token)
   *   - query param
   *   - user id
   *
   * @param type
   * @param request
   * @returns
   */
  protected async getUser(type: {
    session?: boolean;
    query?: boolean;
    body?: boolean;
  }, request: Drash.Request): Promise<UserModel | false> {
    let userId = "";
    if (type.session) {
      const sessionValues = request.getCookie("drash_sess");
      if (!sessionValues) {
        return false;
      }
      const sessionValuesSplit = sessionValues.split("|::|");
      const sessionOne = sessionValuesSplit[0];
      const sessionTwo = sessionValuesSplit[1];
      const session = await SessionModel.where(
        "session_one",
        sessionOne,
      )
        .where("session_two", sessionTwo)
        .first();
      if (!session) {
        return false;
      }
      const user = await session.user();
      if (!user) {
        return false;
      }
      return user;
    }
    if (type.query) {
      userId = request.queryParam("user_id") ?? "";
    }
    if (type.body) {
      userId = request.bodyParam<string>("user_id") ?? "";
    }
    const user = await UserModel.where(
      "id",
      userId,
    ).first();
    if (!user) {
      return false;
    }
    return user;
  }
}

export default BaseResource;
