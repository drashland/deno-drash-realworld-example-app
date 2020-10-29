import { bcrypt, Drash } from "../deps.ts";
import BaseResource from "./base_resource.ts";
import UserModel from "../models/user_model.ts";
import SessionModel from "../models/session_model.ts";
import ValidationService from "../services/validation_service.ts";

class RegisterResource extends BaseResource {
  static paths = [
    "/users",
  ];

  /**
     * Handle POST requests with the following request body:
     *
     *     {
     *         username: string,
     *         email: string,
     *         password: string,
     *     }
     */
  public async POST() {
    // Gather data
    const username = ValidationService.decodeInput(
      (this.request.getBodyParam("username") as string) || "",
    );
    const email = ValidationService.decodeInput(
      (this.request.getBodyParam("email") as string) || "",
    );
    const rawPassword = ValidationService.decodeInput(
      (this.request.getBodyParam("password") as string) || "",
    );

    console.log("Creating the following user:");
    console.log(username, email, rawPassword);

    // Validate
    if (!username) {
      return this.errorResponse(422, "Username field required.");
    }
    if (!email) {
      return this.errorResponse(422, "Email field required.");
    }
    if (!rawPassword) {
      return this.errorResponse(422, "Password field required.");
    }
    if (!ValidationService.isEmail(email)) {
      return this.errorResponse(422, "Email must be a valid email.");
    }
    if (!(await ValidationService.isEmailUnique(email))) {
      return this.errorResponse(422, "Email already taken.");
    }
    if (!ValidationService.isPasswordStrong(rawPassword)) {
      return this.errorResponse(
        422,
        "Password must be 8 characters long and include 1 number, 1 " +
          "uppercase letter, and 1 lowercase letter.",
      );
    }

    // Create user
    const User = new UserModel(
      username,
      await bcrypt.hash(rawPassword), // HASH THE PASSWORD
      email,
    );
    const user = await User.save();

    if (!user) {
      return this.errorResponse(
        422,
        "An error occurred while trying to create your account.",
      );
    }

    const entity = user.toEntity();

    // Create session for user. We return the session values on the user
    // object and the front-end is in charge of setting the values as a
    // cookie.
    const sessionOneValue = await bcrypt.hash("sessionOne2020Drash");
    const sessionTwoValue = await bcrypt.hash("sessionTwo2020Drash");
    const session = new SessionModel(
      sessionOneValue,
      sessionTwoValue,
      user.id,
    );
    session.save();
    entity.token = `${sessionOneValue}|::|${sessionTwoValue}`;

    // Return the newly created user
    this.response.body = {
      user: entity,
    };
    return this.response;
  }
}

export default RegisterResource;
