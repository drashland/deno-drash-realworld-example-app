import { Drash } from "../deps.ts"

class AuthResource extends Drash.Http.Resource {

  static paths = [
    "/auth",
  ];

  public GET() {
    this.response.body = {
      user: {
        username: "someuser",
        email: "someemail@example.com"
      }
    };
    return this.response;
  }
}

export default AuthResource;

