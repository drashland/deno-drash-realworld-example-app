import { Drash } from "../deps.ts";
import UserModel from "../models/user_model.ts";
import SessionModel from "../models/session_model.ts";
import ValidationService from "../services/validation_service.ts";

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

  protected async getCurrentUser() {
    let userId = this.request.getUrlQueryParam("user_id");

    if (!userId) {
      userId = this.request.getBodyParam("user_id");
    }

    if (!userId) {
      return null;
    }

    let user = await UserModel.whereId(userId);
    if (user) {
      return user;
    }

    return null;
  }
}

export default BaseResource;
