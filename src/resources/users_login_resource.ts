import { Drash, bcrypt } from "../deps.ts"
import UserModel from "../models/user_model.ts";
import SessionModel from "../models/session_model.ts";
import ValidationService from "../services/validation_service.ts";

class LoginResource extends Drash.Http.Resource {

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
    const sessionValues = this.request.getBodyParam("token");
    console.log("Using the following session values:");
    console.log(sessionValues);
    if (sessionValues) {
      const sessionValuesSplit = sessionValues.split("|::|");
      const sessionOne = sessionValuesSplit[0];
      const sessionTwo = sessionValuesSplit[1];
      if (sessionOne && sessionTwo) {
        const session = await SessionModel.getUserSession(sessionOne, sessionTwo);
        if (session) {
          let user = await UserModel.getUserById(session.user_id);
          console.log(user);
          if (user) {
            let entity = user.toEntity();
            entity.token = `${session.session_one}|::|${session.session_two}`;
            this.response.body = {
              user: entity
            };
            return this.response;
          }
        }
      }
    }

    console.log("User's session is invalid or has expired.");
    this.response.status_code = 401;
    this.response.body = {
      errors: {
        body: ["Invalid session."]
      }
    };
    return this.response;
  }

  /**
   * Log the user in question into the system.
   *
   * @return Promise<Drash.Http.Response>
   */
  protected async logInUser(): Promise<Drash.Http.Response> {
    const inputUser = this.request.getBodyParam("user");

    if (!inputUser.email) {
      return this.errorResponse("Email field required.");
    }
    if (!ValidationService.isEmail(inputUser.email)) {
      return this.errorResponse("Email must be a valid email.");
    }

    // Convert the user to a real user model object
    const user = await UserModel.getUserByEmail(
      inputUser.email
    );

    if (!user) {
      console.log("User not found.");
      return this.errorResponse("Invalid user credentials.");
    }

    const password = this.request.getBodyParam("user").password;
    if (!password) {
      return this.errorResponse("Password field required.");
    }
    if (! (await ValidationService.isPasswordCorrect(password, user.password))) {
      console.log("Passwords do not match.");
      return this.errorResponse("Invalid user credentials.");
    }

    // Create session for user. We return the session values on the user
    // object and the front-end is in charge of setting the values as a
    // cookie.
    const sessionOne = await bcrypt.hash("sessionOne2020Drash");
    const sessionTwo = await bcrypt.hash("sessionTwo2020Drash");
    let session = new SessionModel(sessionOne, sessionTwo, user.id);
    session = await session.save();

    let entity = user.toEntity();
    entity.token = `${session.session_one}|::|${session.session_two}`;

    this.response.body = {
      user: entity
    }

    return this.response;
  }

  /**
   * Create a uniform error response for this resource.
   *
   * @param string message
   *     The error message to send in the body of the response.
   *
   * @return Drash.Http.Response
   */
  protected errorResponse(message: string): Drash.Http.Response {
    this.response.status_code = 401;
    this.response.body = {
      errors: {
        body: [message]
      }
    };
    return this.response;
  }
}

export default LoginResource
