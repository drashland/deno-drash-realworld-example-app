import { Drash, bcrypt } from "../deps.ts";
import UserModel from "../models/user_model.ts";

export default class UserResource extends Drash.Http.Resource {
  static paths = [
    "/user",
    "/user/:username",
  ];

  /**
   * @description
   * Handle a GET request given the specified username path param.
   *
   * @return Drash.Http.Response
   *     Returns a User object matched to the username path param.
   */
  public async GET() {
    this.response.body = await UserModel.getUserByUsername(
      this.request.getPathParam("username"),
    );
    return this.response;
  }

  /**
   * @description
   * Handle a POST request with the following accepted request body params:
   *     {
   *       username: string,
   *       email: string,
   *       bio?: string,
   *       password? string
   *     }
   *
   * @return Drash.Http.Response
   *     - If any input fails validation, then we return a 422 response.
   *     - If the database fails to update the user in question, then we return
   *       a 500 response.
   *     - If all is successful, then we return a 200 response with the User
   *       object with its fields updated.
   */
  public async POST() {
    console.log("Handling UserResource POST.");
    console.log("Updating the user with the following information:");
    let userDetails = this.request.getBodyParam("user");
    console.log(userDetails);

    // Keep track of the user's token because we'll need to send it back in the
    // response. Otherwise, the user will be logged out.
    let token = userDetails.token;

    this.response.body = {
      user: null,
    };

    const user = await UserModel.getUserById(userDetails.id);
    if (user) {
      user.update(userDetails);
      let entity = user.toEntity();
      entity.token = token;

      this.response.body = {
        user,
      };
    }

    return this.response;
  }
}
