import { Drash } from "../deps.ts";
import UserModel from "../models/user_model.ts";
import SessionModel from "../models/session_model.ts";
import ValidationService from "../services/validation_service.ts";

class BaseResource extends Drash.Http.Resource {
  public current_user: UserModel | null = null;

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

  /**
   * All requests require the user_id field to be passed in so that we know who
   * the current user is when processing requests. If the user_id is not passed
   * in the request body or URL query param, then this error should be thrown.
   *
   * @return Drash.Http.Response
   */
  protected errorResponseCurrentUser(): Drash.Http.Response {
    return this.errorResponse(
      400,
      "`user_id` field is required.",
    );
  }

  protected async getCurrentUser() {
    console.log("Getting the current user.");
    if (this.current_user) {
      console.log(`Using cached User #${this.current_user.id}.`);
      return this.current_user;
    }

    let userId = this.request.getUrlQueryParam("user_id");

    if (!userId) {
      userId = this.request.getBodyParam("user_id");
    }

    if (!userId) {
      return null;
    }

    let user = await UserModel.whereId(userId);
    if (user) {
      this.current_user = user;
      console.log(`Setting User #${this.current_user.id} as current user.`);
      return this.current_user;
    }

    return null;
  }
}

export default BaseResource;
