import { Drash } from "../deps.ts";
import BaseResource from "./base_resource.ts";
import UserModel from "../models/user_model.ts";

class ProfilesResource extends BaseResource {
  static paths = [
    "/profiles/:username",
  ];

  public async GET() {
    console.log("Handling ProfilesResource GET.");
    const username = this.request.getPathParam("username") || "";
    console.log(`Handling the following user's profile: ${username}.`);

    if (!username) {
      this.response.status_code = 422;
      this.response.body = {
        errors: {
          username: ["Username path param is required."],
        },
      };
      // TODO(ebebbington) Return response
    }

    this.response.body = {
      profile: null,
    };

    const result = await UserModel.where({ username: username });
    if (result.length <= 0) {
      return this.errorResponse(404, "Profile not found.");
    }

    const entity = result[0].toEntity();
    this.response.body = {
      profile: entity,
    };

    return this.response;
  }
}

export default ProfilesResource;
