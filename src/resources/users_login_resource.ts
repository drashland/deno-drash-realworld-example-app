import { bcrypt, Drash } from "../deps.ts";
import BaseResource from "./base_resource.ts";
import UserModel, { UserEntity } from "../models/user_model.ts";
import SessionModel from "../models/session_model.ts";
import ValidationService from "../services/validation_service.ts";

class LoginResource extends BaseResource {
  paths = [
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
  public async POST(request: Drash.Request, response: Drash.Response) {
    console.log("Handling LoginResource POST.");
    const action = request.bodyParam("action");
    if (action == "check_if_user_is_authenticated") {
      return await this.checkIfUserIsAuthenticated(request, response);
    }

    return await this.logInUser(request, response);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Check if the user making the request is authenticated with a session.
   *
   * @return Promise<Drash.Http.Response>
   */
  protected async checkIfUserIsAuthenticated(
    request: Drash.Request,
    response: Drash.Response,
  ) {
    console.log("Checking if user has a session.");
    // TODO :: Turn this into a authenticate/redirect middleware
    const sessionValues = request.bodyParam<string>("token");
    if (!sessionValues) {
      console.log("User's session is invalid or has expired.");
      response.status = 401;
      return response.json({
        errors: {
          body: ["Invalid session."],
        },
      });
    }
    const sessionValuesSplit = sessionValues.split("|::|");
    const sessionOne = sessionValuesSplit[0];
    const sessionTwo = sessionValuesSplit[1];
    const session = await SessionModel.query({
      where: [
        ['session_one', sessionOne],
        ['session_two', sessionTwo],
      ],
      first: true
    });
    if (session) {
      const user = await UserModel.query({
        where: [
          [ "id", session.user_id]
        ]
      });
      if (user.length > 0) {
        const entity = await user[0].toEntity();
        console.log("User has an active session.");
        return response.json({
          user: entity,
          token: `${session.session_one}|::|${session.session_two}`
        });
      }
    }
  }

  /**
   * Log the user in question into the system.
   *
   * @return Promise<Drash.Http.Response>
   */
  protected async logInUser(request: Drash.Request, response: Drash.Response) {
    const inputUser: UserEntity = (request.bodyParam("user") as UserEntity);

    if (!inputUser.email) {
      return this.errorResponse(422, "Email field required.", response);
    }
    if (!ValidationService.isEmail(inputUser.email)) {
      return this.errorResponse(422, "Email must be a valid email.", response);
    }

    // Convert the user to a real user model object
    const result = await UserModel.query({
      where: [
        ['email', inputUser.email]
       ]
     });

    if (result.length <= 0) {
      console.log("User not found.");
      return this.errorResponse(422, "Invalid user credentials.", response);
    }

    const user = result[0];

    const rawPassword = inputUser.password ? inputUser.password : "";
    if (!rawPassword) {
      return this.errorResponse(422, "Password field required.", response);
    }
    if (
      !(await bcrypt.compare(rawPassword, user.password))
    ) {
      console.log("Passwords do not match.");
      return this.errorResponse(422, "Invalid user credentials.", response);
    }

    // Create session for user. We return the session values on the user
    // object and the front-end is in charge of setting the values as a
    // cookie.
    const sessionOne = await bcrypt.hash("sessionOne2020Drash");
    const sessionTwo = await bcrypt.hash("sessionTwo2020Drash");
    const session = new SessionModel();
    session.session_one = sessionOne
    session.session_two = sessionTwo
    session.user_id = user.id
    await session.save();
    if (!session) {
      return this.errorResponse(
        422,
        "An error occurred whilst saving your session",
        response,
      );
    }

    const entity = await user.toEntity<UserEntity>();
    return response.json({
      user: {
        ...entity,
        token: `${session.session_one}|::|${session.session_two}`
      },
    });
  }
}

export default LoginResource;
