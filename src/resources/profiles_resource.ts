import BaseResource from "./base_resource.ts";
import UserModel from "../models/user_model.ts";
import { Drash } from "../deps.ts";

class ProfilesResource extends BaseResource {
  paths = [
    "/profiles/:username",
  ];

  public async GET(request: Drash.Request, response: Drash.Response) {
    console.log("Handling ProfilesResource GET.");
    const username = request.pathParam("username") || "";
    console.log(`Handling the following user's profile: ${username}.`);

    if (!username) {
      response.status = 422;
      return response.json({
        errors: {
          username: ["Username path param is required."],
        },
      });
      // TODO(ebebbington) Return response
    }

    response.json({
      profile: null,
    });

    const result = await UserModel.where(
      "username",
      username,
    ).first();
    if (!result) {
      return this.errorResponse(404, "Profile not found.", response);
    }

    response.json({
      profile: result,
    });
  }
}

export default ProfilesResource;
