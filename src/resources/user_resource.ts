import { Drash } from "../deps.ts"

class UserResource extends Drash.Http.Resource {

  static paths = [
    "/user",
  ];

  public GET() {
    this.response.body = UserService.getUserByUsername(
      this.request.getPathParam("username")
    );
    return this.response;
  }
}

export default UserResource;
