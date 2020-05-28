import { Drash, bcrypt } from "../deps.ts"
import UserModel from "../models/user_model.ts";
import SessionModel from "../models/session_model.ts";
import UserService from "../services/user_service.ts";

const sessionModel = new SessionModel();

class RegisterResource extends Drash.Http.Resource {

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
        const username = decodeURIComponent(this.request.getBodyParam('username'));
        const email = decodeURIComponent(this.request.getBodyParam('email'));
        const rawPassword = decodeURIComponent(this.request.getBodyParam('password'));

        console.log("Creating the following user:");
        console.log(username, email, rawPassword);

        // Validate
        const userModel = new UserModel();
        const result = await userModel.validate({
          username,
          email,
          password: rawPassword
        });
        if (result.data !== true) {
          this.response.status_code = 422;
          this.response.body = {
            errors: result.data
          };
          return this.response;
        }

        // Hash password
        const password = await bcrypt.hash(rawPassword);

        // Create user
        await userModel.CREATE(
          UserModel.CREATE_ONE,
          [
            username,
            email,
            password
          ]
        );

        let user = await UserService.getUserByUsername(username);

        // Create session for user. We return the session values on the user
        // object and the front-end is in charge of setting the values as a
        // cookie.
        const sessionOneValue = await bcrypt.hash("sessionOne2020Drash");
        const sessionTwoValue = await bcrypt.hash("sessionTwo2020Drash");
        await sessionModel.CREATE(
          SessionModel.CREATE_ONE,
          [
            user.id,
            sessionOneValue,
            sessionTwoValue
          ]
        );
        user.token = `${sessionOneValue}|::|${sessionTwoValue}`;

        // Return the newly created user
        this.response.body = {
          user
        };

        return this.response;
    }
}

export default RegisterResource;
