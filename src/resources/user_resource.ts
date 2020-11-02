import { bcrypt, Drash } from "../deps.ts";
import BaseResource from "./base_resource.ts";
import UserModel from "../models/user_model.ts";
import ValidationService from "../services/validation_service.ts";

export default class UserResource extends BaseResource {
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
    this.response.body = await UserModel.where({
      username: this.request.getPathParam("username") || "",
    });
    if (!this.response.body) {
      return this.errorResponse(
        400,
        "Username must exist in the uri",
      );
    }
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

    // Gather data
    const id = (this.request.getBodyParam("id") as string | number) || "";
    const username = ValidationService.decodeInput(
      (this.request.getBodyParam("username") as string) || "",
    );
    const email = ValidationService.decodeInput(
      (this.request.getBodyParam("email") as string) || "",
    );
    const rawPassword = ValidationService.decodeInput(
      (this.request.getBodyParam("password") as string) || "",
    );
    const bio = ValidationService.decodeInput(
      (this.request.getBodyParam("bio") as string) || "",
    );
    const image = ValidationService.decodeInput(
      (this.request.getBodyParam("image") as string) || "",
    );
    const token = (this.request.getBodyParam("token") as string) || "";

    const result = await UserModel.where({ id: id });

    if (result.length <= 0) {
      console.log("User not found.");
      return this.errorResponse(404, "Error updating your profile.");
    }

    const user = result[0];

    // Validate
    console.log("Validating inputs.");
    if (!username) {
      return this.errorResponse(422, "Username field required.");
    }
    if (!image) {
      return this.errorResponse(422, "Image field required.");
    }
    if (!email) {
      return this.errorResponse(422, "Email field required.");
    }
    if (!ValidationService.isEmail(email)) {
      return this.errorResponse(422, "Email must be a valid email.");
    }
    if (email != user.email) {
      if (!(await ValidationService.isEmailUnique(email))) {
        return this.errorResponse(422, "Email already taken.");
      }
    }
    if (rawPassword) {
      if (!ValidationService.isPasswordStrong(rawPassword)) {
        return this.errorResponse(
          422,
          "Password must be 8 characters long and include 1 number, 1 " +
            "uppercase letter, and 1 lowercase letter.",
        );
      }
    }

    user.username = username;
    user.bio = bio ?? "";
    user.image = image;
    if (rawPassword) {
      user.password = await bcrypt.hash(rawPassword); // HASH THE PASSWORD
    }
    const savedUser = await user.save();
    if (savedUser === null) {
      return this.errorResponse(
        422,
        "An error occurred whilst saving your user",
      );
    }

    const entity = savedUser.toEntity();
    // Make sure to pass the user's session token back to them
    entity.token = token;

    this.response.body = {
      user: entity,
    };

    return this.response;
  }
}
