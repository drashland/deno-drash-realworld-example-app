import { Drash } from "../deps.ts"
import UserService from "../services/user_service.ts";

class ProfilesResource extends Drash.Http.Resource {

  static paths = [
    "/profiles/:username",
  ];

  public GET() {
    console.log("Handling ProfilesResource GET.");
    const username = this.request.getPathParam("username");

    if (!username) {
      throw new Drash.Exceptions.HttpException(400, "Username path param is required.");
    }

    this.response.body = {
      profile: UserService.getUserByUsername(username)
    };

    return this.response;
  }
}

export default ProfilesResource;
