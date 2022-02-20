import { Drash } from "../deps.ts";
import { SessionModel } from "../models/session_model.ts";

export class AuthenticateService extends Drash.Service {
  /**
   * Run this service before the resource's HTTP method.
   */
  public async runBeforeResource(
    request: Drash.Request,
    response: Drash.Response,
  ) {
    const sessionValues = request.bodyParam<string>("token");
    if (!sessionValues) {
      console.log("User's session is invalid or has expired.");
      throw new Drash.Errors.HttpError(
        401,
        "User's session is invalid or has expired.",
      );
    }
    const sessionValuesSplit = sessionValues.split("|::|");
    const sessionOne = sessionValuesSplit[0];
    const sessionTwo = sessionValuesSplit[1];
    const session = await SessionModel.first({
      where: [
        ["session_one", sessionOne],
        ["session_two", sessionTwo],
      ],
    });
    if (!session) {
      throw new Drash.Errors.HttpError(403, "Invalid session");
    }
  }
}
