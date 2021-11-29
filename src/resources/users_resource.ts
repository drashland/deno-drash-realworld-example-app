import { bcrypt } from "../deps.ts";
import BaseResource from "./base_resource.ts";
import UserModel from "../models/user_model.ts";
import SessionModel from "../models/session_model.ts";
import ValidationService from "../services/validation_service.ts";
import { Drash } from "../deps.ts";

class RegisterResource extends BaseResource {
  paths = [
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
  public async POST(request: Drash.Request, response: Drash.Response) {
    // Gather data
    const username = ValidationService.decodeInput(
      (request.bodyParam("username") as string) || "",
    );
    const email = ValidationService.decodeInput(
      (request.bodyParam("email") as string) || "",
    );
    const rawPassword = ValidationService.decodeInput(
      (request.bodyParam("password") as string) || "",
    );

    console.log("Creating the following user:");
    console.log(username, email, rawPassword);

    // Validate
    if (!username) {
      return this.errorResponse(422, "Username field required.", response);
    }
    if (!email) {
      return this.errorResponse(422, "Email field required.", response);
    }
    if (!rawPassword) {
      return this.errorResponse(422, "Password field required.", response);
    }
    if (!ValidationService.isEmail(email)) {
      return this.errorResponse(422, "Email must be a valid email.", response);
    }
    if (!(await ValidationService.isEmailUnique(email))) {
      return this.errorResponse(422, "Email already taken.", response);
    }
    if (!ValidationService.isPasswordStrong(rawPassword)) {
      return this.errorResponse(
        422,
        "Password must be 8 characters long and include 1 number, 1 " +
          "uppercase letter, and 1 lowercase letter.",
        response,
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
        response,
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
    return response.json({
      user: entity,
    });
  }
}

export default RegisterResource;
