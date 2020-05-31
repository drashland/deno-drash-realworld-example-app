import { Drash, bcrypt } from "../deps.ts"
import UserModel from "../models/user_model.ts";
import SessionModel from "../models/session_model.ts";

class LoginResource extends Drash.Http.Resource {

    static paths = [
        "/users/login",
    ];

    // static middleware: {
    //     before_request: [
    //         'LogMiddleware'
    //     ]
    // }

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

      let user = null;

      const action = this.request.getBodyParam("action");
      if (action == "check_auth") {
        return this.checkAuth();
      }

      this.response.body = {
        user: null,
      };
      try {
        user = this.request.getBodyParam("user");
        if (!user.email) {
          this.response.status_code = 422;
          this.response.body = {
            errors: {
              body: ["Email field required."]
            }
          };
          return this.response;
        }
        user = await UserModel.getUserByEmail(
          user.email
        );
      } catch (error) {
        console.log(error);
        throw new Drash.Exceptions.HttpException(400, error);
      }

      if (!user) {
        this.response.status_code = 401;
        this.response.body = {
          errors: {
            body: ["Invalid user credentials."]
          }
        };
        return this.response;
      }

      user = user.toEntity();

      console.log("Checking if passwords match.");
      const password = this.request.getBodyParam("user").password;
      if (!password) {
        this.response.status_code = 422;
        this.response.body = {
          errors: {
            body: ["Password field required."]
          }
        };
        return this.response;
      }
      const passwordsMatch = await bcrypt.compare(
        password,
        user.password
      );
      if (!passwordsMatch) {
        console.log("Passwords do not match.");
        this.response.status_code = 401;
        this.response.body = {
          errors: {
            body: ["Invalid user credentials."]
          }
        };
        return this.response;
      }

      console.log("Passwords match. Returning the user object.");

      // Create session for user. We return the session values on the user
      // object and the front-end is in charge of setting the values as a
      // cookie.
      const sessionOneValue = await bcrypt.hash("sessionOne2020Drash");
      const sessionTwoValue = await bcrypt.hash("sessionTwo2020Drash");
      // @ts-ignore
      let session = new SessionModel(sessionOneValue, sessionTwoValue, user.id);
      session = await session.save();

      user.token = `${session.session_one}|::|${session.session_two}`;

      this.response.body = {
        user
      }

      return this.response;
    }

    /**
     * Check if the user making the request is authenticated with a session.
     *
     * @return Promise<Drash.Http.Response>
     */
    protected async checkAuth(): Promise<Drash.Http.Response> {
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
}

export default LoginResource
