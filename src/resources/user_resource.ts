import { bcrypt } from "../deps.ts";
import BaseResource from "./base_resource.ts";
import UserModel from "../models/user_model.ts";
import ValidationService from "../services/validation_service.ts";
import { Drash } from "../deps.ts";

export default class UserResource extends BaseResource {
  paths = [
    "/user",
    "/user/:username",
  ];

  /**
   * @description
   * Handle a GET request given the specified username path param.
   *
   * @return Drash.Http.Response
   *     Returns a User object matched to the username path param.
   */
  // Dont think this is used
  // public async GET(request: Drash.Request, response: Drash.Response) {
  //   response.json(
  //     await UserModel.query({
  //       where: [
  //         ['username', request.pathParam("username") || ""],
  //       ],
  //       first: true
  //     }),
  //   );
  //   if (!response.body) {
  //     return this.errorResponse(
  //       400,
  //       "Username must exist in the uri",
  //       response,
  //     );
  //   }
  // }

  /**
   * @description
   * Handle a POST request with the following accepted request body params:
   *     {
   *       username: string,
   *       email: string,
   *       bio?: string,
   *       password? string
   *     }
   *
   * @return Drash.Http.Response
   *     - If any input fails validation, then we return a 422 response.
   *     - If the database fails to update the user in question, then we return
   *       a 500 response.
   *     - If all is successful, then we return a 200 response with the User
   *       object with its fields updated.
   */
  public async POST(request: Drash.Request, response: Drash.Response) {
    console.log("Handling UserResource POST.");

    // Gather data
    const id = (request.bodyParam("id") as string | number) || "";
    const username = ValidationService.decodeInput(
      (request.bodyParam("username") as string) || "",
    );
    const email = ValidationService.decodeInput(
      (request.bodyParam("email") as string) || "",
    );
    const rawPassword = ValidationService.decodeInput(
      (request.bodyParam("password") as string) || "",
    );
    const bio = ValidationService.decodeInput(
      (request.bodyParam("bio") as string) || "",
    );
    const image = ValidationService.decodeInput(
      (request.bodyParam("image") as string) || "",
    );
    const token = (request.bodyParam("token") as string) || "";

    const user = await UserModel.query({
      where: [
        ['id', id]
      ],
      first: true
    });

    if (!user) {
      console.log("User not found.");
      return this.errorResponse(404, "Error updating your profile.", response);
    }

    // Validate
    console.log("Validating inputs.");
    if (!username) {
      return this.errorResponse(422, "Username field required.", response);
    }
    if (!image) {
      return this.errorResponse(422, "Image field required.", response);
    }
    if (!email) {
      return this.errorResponse(422, "Email field required.", response);
    }
    if (!ValidationService.isEmail(email)) {
      return this.errorResponse(422, "Email must be a valid email.", response);
    }
    if (email != user.email) {
      if (!(await ValidationService.isEmailUnique(email))) {
        return this.errorResponse(422, "Email already taken.", response);
      }
    }
    if (rawPassword) {
      if (!ValidationService.isPasswordStrong(rawPassword)) {
        return this.errorResponse(
          422,
          "Password must be 8 characters long and include 1 number, 1 " +
            "uppercase letter, and 1 lowercase letter.",
          response,
        );
      }
    }

    user.username = username;
    user.bio = bio ?? "";
    user.image = image;
    if (rawPassword) {
      user.password = await bcrypt.hash(rawPassword); // HASH THE PASSWORD
    }
    await user.save();

    // Make sure to pass the user's session token back to them
    user.token = token;

    return response.json({
      user: await user.toEntity(),
      token,
    });
  }
}
