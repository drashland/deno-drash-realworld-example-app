import { bcrypt } from "../deps.ts";
import BaseResource from "./base_resource.ts";
import UserModel from "../models/user_model.ts";
import ValidationService from "../services/validation_service.ts";
import { Drash } from "../deps.ts";

export default class UserResource extends BaseResource {
  paths = [
    "/user",
    "/user/:username",
  ];

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
  public async POST(request: Drash.Request, response: Drash.Response) {
    console.log("Handling UserResource POST.");

    // Gather data
    const id = (request.bodyParam("id") as string | number) || "";
    const username = ValidationService.decodeInput(
      (request.bodyParam("username") as string) || "",
    );
    const email = ValidationService.decodeInput(
      (request.bodyParam("email") as string) || "",
    );
    const rawPassword = ValidationService.decodeInput(
      (request.bodyParam("password") as string) || "",
    );
    const bio = ValidationService.decodeInput(
      (request.bodyParam("bio") as string) || "",
    );
    const image = ValidationService.decodeInput(
      (request.bodyParam("image") as string) || "",
    );
    const token = (request.bodyParam("token") as string) || "";

    const user = await UserModel.where(
      "id",
      id,
    ).first();

    if (!user) {
      console.log("User not found.");
      return this.errorResponse(404, "Error updating your profile.", response);
    }

    // Validate
    console.log("Validating inputs.");
    if (!username) {
      return this.errorResponse(422, "Username field required.", response);
    }
    if (!image) {
      return this.errorResponse(422, "Image field required.", response);
    }
    if (!email) {
      return this.errorResponse(422, "Email field required.", response);
    }
    if (!ValidationService.isEmail(email)) {
      return this.errorResponse(422, "Email must be a valid email.", response);
    }
    if (email != user.email) {
      if (!(await ValidationService.isEmailUnique(email))) {
        return this.errorResponse(422, "Email already taken.", response);
      }
    }
    if (rawPassword) {
      if (!ValidationService.isPasswordStrong(rawPassword)) {
        return this.errorResponse(
          422,
          "Password must be 8 characters long and include 1 number, 1 " +
            "uppercase letter, and 1 lowercase letter.",
          response,
        );
      }
    }

    console.log("existing user pass", user.password);
    console.log("new password to hash", rawPassword);

    user.username = username;
    user.bio = bio ?? "";
    user.image = image;
    if (rawPassword) {
      user.password = await bcrypt.hash(rawPassword); // HASH THE PASSWORD
    }
    user.email = email;
    await user.save();

    return response.json({
      user: {
        ...user,
        token,
      },
    });
  }
}
