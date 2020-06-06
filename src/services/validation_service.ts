import { bcrypt } from "../deps.ts";
import UserModel from "../models/user_model.ts";

export default class ValidationService {
  /**
   * Decode any encoded strings.
   *
   * @param string input
   *     The string to decode.
   *
   * @return string|undefined
   *     - Returns the decoded string.
   *     - Returns the input back if it is not a string. This method only
   *       decodes strings.
   */
  static decodeInput(input: string): any {
    if ((typeof input) !== "string") {
      return input;
    }
    return decodeURIComponent(input);
  }

  /**
   * @description
   * Validate that the given email passes validation by testing it against a
   * regular expression. The regular expression tests to see if the given email
   * is actually an email.
   *
   * @return boolean
   *     - Returns true if the email passes validation.
   *     - Returns false if the email fails validation.
   */
  static isEmail(email: string): boolean {
    const emailRegex = new RegExp(
      /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    );
    return emailRegex.test(email);
  }

  /**
   * @description
   *  Validate that the given email is unique in the database.
   *
   * @return boolean
   *     - Returns true if the email is unique.
   *     - Returns false if the email is already taken.
   */
  static async isEmailUnique(email: string): Promise<boolean> {
    const user = await UserModel.whereEmail(email);
    if (user) {
      return false;
    }
    return true;
  }

  /**
   * @description
   * Validate that the two given passwords match.
   *
   * @return boolean
   *     - Returns true if the two passwords match.
   *     - Returns false if the two passwords do not match.
   */
  static async isPasswordCorrect(
    passwordOne: string,
    passwordTwo: string
  ): Promise<boolean> {
    return await bcrypt.compare(passwordOne, passwordTwo);
  }

  /**
   * @description
   * Validate that the given password passes validation by testing it against a
   * regular expression. The regular expression tests to see if the given
   * password meets the following requirements:
   *
   *     - Is 8 characters long
   *     - Includes 1 number
   *     - Includes 1 uppercase letter
   *     - Includes 1 lowercase letter
   *
   * @return boolean
   *     - Returns true if the email is unique.
   *     - Returns false if the email is already taken.
   */
  static isPasswordStrong(password: string): boolean {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(password);
  }
}
