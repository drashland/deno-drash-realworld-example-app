import { bcrypt, Drash } from "../deps.ts";
import BaseResource from "./base_resource.ts";
import UserModel, { UserEntity } from "../models/user_model.ts";
import SessionModel from "../models/session_model.ts";
import ValidationService from "../services/validation_service.ts";

class LoginResource extends BaseResource {
  static paths = [
    "/users/login",
  ];

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - HTTP //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Handle POST requests by checking if the supplied email belongs to a user
   * in the database.
   *
   * @return Drash.Http.Response
   *    Returns a response with one of the following bodies:
   *    - If the user is in the database:
   *      {
   *        user: {
   *          created_on: "2020-05-14T20:03:56.025Z"
   *          email: "user1@hotmail.com"
   *          id: 1
   *          last_login: null
   *          password: "$2a$10$Ha7shP2TNTmTR9tC8xdXg.Vta3w6IaHYnMNOxxfl5EG.cdwVFnTlW"
   *          username: "user1"
   *        }
   *      }
   *    - If the user is not in the database:
   *      {
   *        user: null
   *      }
   */
  public async POST() {
    console.log("Handling LoginResource POST.");
    const action = this.request.getBodyParam("action");
    if (action == "check_if_user_is_authenticated") {
      return await this.checkIfUserIsAuthenticated();
    }

    return await this.logInUser();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Check if the user making the request is authenticated with a session.
   *
   * @return Promise<Drash.Http.Response>
   */
  protected async checkIfUserIsAuthenticated(): Promise<Drash.Http.Response> {
    console.log("Checking if user has a session.");
    const sessionValues = (this.request.getBodyParam("token") as string);
    if (sessionValues) {
      const sessionValuesSplit = sessionValues.split("|::|");
      const sessionOne = sessionValuesSplit[0];
      const sessionTwo = sessionValuesSplit[1];
      if (sessionOne && sessionTwo) {
        const session = await SessionModel.getUserSession(
          sessionOne,
          sessionTwo,
        );
        if (session) {
          const user = await UserModel.where({ "id": session.user_id });
          if (user.length > 0) {
            const entity = user[0].toEntity();
            entity.token = `${session.session_one}|::|${session.session_two}`;
            this.response.body = {
              user: entity,
            };
            console.log("User has an active session.");
            return this.response;
          }
        }
      }
    }

    console.log("User's session is invalid or has expired.");
    this.response.status_code = 401;
    this.response.body = {
      errors: {
        body: ["Invalid session."],
      },
    };
    return this.response;
  }

  /**
   * Log the user in question into the system.
   *
   * @return Promise<Drash.Http.Response>
   */
  protected async logInUser(): Promise<Drash.Http.Response> {
    const inputUser: UserEntity =
      (this.request.getBodyParam("user") as UserEntity);

    if (!inputUser.email) {
      return this.errorResponse(422, "Email field required.");
    }
    if (!ValidationService.isEmail(inputUser.email)) {
      return this.errorResponse(422, "Email must be a valid email.");
    }

    // Convert the user to a real user model object
    const result = await UserModel.where({ email: inputUser.email });

    if (result.length <= 0) {
      console.log("User not found.");
      return this.errorResponse(422, "Invalid user credentials.");
    }

    const user = result[0];

    const rawPassword = inputUser.password ? inputUser.password : "";
    if (!rawPassword) {
      return this.errorResponse(422, "Password field required.");
    }
    if (
      !(await ValidationService.isPasswordCorrect(rawPassword, user.password))
    ) {
      console.log("Passwords do not match.");
      return this.errorResponse(422, "Invalid user credentials.");
    }

    // Create session for user. We return the session values on the user
    // object and the front-end is in charge of setting the values as a
    // cookie.
    const sessionOne = await bcrypt.hash("sessionOne2020Drash");
    const sessionTwo = await bcrypt.hash("sessionTwo2020Drash");
    const Session = new SessionModel(sessionOne, sessionTwo, user.id);
    const session = await Session.save();
    if (!session) {
      return this.errorResponse(
        422,
        "An error occurred whilst saving your session",
      );
    }

    const entity = user.toEntity();
    entity.token = `${session.session_one}|::|${session.session_two}`;

    this.response.body = {
      user: entity,
    };

    return this.response;
  }
}

export default LoginResource;
