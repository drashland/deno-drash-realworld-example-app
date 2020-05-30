import { Drash } from "../deps.ts"
import UserService from "../services/user_service.ts";

class ProfilesResource extends Drash.Http.Resource {

  static paths = [
    "/profiles/:username",
  ];

  public async GET() {
    console.log("Handling ProfilesResource GET.");
    const username = this.request.getPathParam("username");
    console.log(`Handling the following user's profile: ${username}.`);

    if (!username) {
      this.response.status_code = 422;
      this.response.body = {
        errors: {
          username: ["Username path param is required."]
        }
      };
    }

    let user = await UserService.getUserByUsername(username);
    delete user.password;

    this.response.body = {
      profile: user
    };

    return this.response;
  }
}

export default ProfilesResource;
