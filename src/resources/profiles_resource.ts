import { Drash } from "../deps.ts"
import UserModel from "../models/user_model.ts";

class ProfilesResource extends Drash.Http.Resource {

  static paths = [
    "/profiles/:username",
  ];

  public async GET() {
    console.log("Handling ProfilesResource GET.");
    const username = this.request.getPathParam("username");

    if (!username) {
      throw new Drash.Exceptions.HttpException(400, "Username path param is required.");
    }

    this.response.body = {
      profile: null
    };

    let user = await UserModel.getUserByUsername(username);
    if (user) {
      let entity = user.toEntity();
      this.response.body = {
        profile: entity
      };
    }

    return this.response;
  }
}

export default ProfilesResource;
