import { Drash } from "../deps.ts"

class UsersProfilesResource extends Drash.Http.Resource {

  static paths = [
    "/profiles/:username",
  ];

  public GET() {
    this.response.body = UserService.getUserProfileByUsername(username);
    return this.response;
  }
}

export default UsersProfilesResource;
