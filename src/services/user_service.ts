import UserModel from "../models/user_model.ts";
import SessionModel from "../models/session_model.ts";

export default class UserService {
  /**
   * Get user model for logged in user
   *
   * @param string cookieValue
   *     this.request.getCookie("...")
   *
   * @return UserModel|boolean
   *     - Returns the user model.
   *     - Returns false if:
   *       - No "drash_sess" cookie
   *       - No session exists with the "drash_sess" cookie
   *       - No user was found with that session
   */
  static async getLoggedInUser(
    cookieValue: string,
  ): Promise<UserModel | boolean> {
    const sessionCookie = cookieValue;
    if (!sessionCookie) {
      return false;
    }
    const sessionOne = sessionCookie.split("|::|")[0];
    const sessionTwo = sessionCookie.split("|::|")[1];
    const session = await SessionModel.getUserSession(sessionOne, sessionTwo);
    if (!session) {
      return false;
    }
    const userId = session.user_id;
    const user = await UserModel.where({ id: userId });
    if (!user.length) {
      return false;
    }
    return user[0];
  }
}
