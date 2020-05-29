import BaseModel from "./base_model.ts";

export default class UserModel extends BaseModel {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES - STATIC /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public static CREATE_ONE =
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?);";
  public static DELETE_ALL = "DELETE FROM users WHERE username = 'one'";
  public static SELECT_ALL = "SELECT * FROM users";
  public static SELECT_ALL_BY_EMAIL = "SELECT * FROM users WHERE email = ?";
  public static SELECT_ALL_BY_ID = "SELECT * FROM users WHERE id = ?";
  public static SELECT_ALL_BY_USERNAME =
    "SELECT * FROM users WHERE username = ?";
  public static UPDATE_ONE =
    "UPDATE users SET username = ?, password = ?, email = ?, bio = ?, image = ?  WHERE id = ?";

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES - ABSTRACT ///////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public primary_key: string = "id";

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES - PUBLIC /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public id: number = 0;

  public username: string = "";

  public password: string = "";

  public email: string = "";

  public created_on: any = "";

  public last_login: any = null;

  public image: string = "";

  public bio: string = "";

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public async validate(
    data: { username: string; email: string; password: string },
  ): Promise<{ data: any }> {
    //
    // Username
    //

    // Required
    if (!data.username) {
      return {
        data: {
          username: ["Username field is required."],
        },
      };
    }

    //
    // Email
    //

    // Required
    if (!data.email) {
      return {
        data: {
          email: ["Email field is required."],
        },
      };
    }

    // Matches an email address
    const hasValidFormat = this.validateEmailFormat(data.email);
    if (hasValidFormat === false) {
      return {
        data: {
          email: ["Email must be a valid email address."],
        },
      };
    }

    // Doesn't already exist
    const isUnique = await this.validateEmailUnique(data.email);
    if (!isUnique) {
      return {
        data: {
          email: ["Email aready taken."],
        },
      };
    }

    //
    // Password
    //

    // Required
    if (!data.password) {
      return {
        data: {
          password: ["Password field is required."],
        },
      };
    }

    // Min 8 characters, max any, 1 uppercase, 1 lowercase, 1 number
    const isStrong = this.validatePasswordFormat(data.password);
    if (isStrong === false) {
      return {
        data: {
          password: [
            "Password must contain the following: 8 characters, 1 number and 1 uppercase and lowercase letter.",
          ],
        },
      };
    }

    return {
      data: true,
    };
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
  public validateEmailFormat(email: string): boolean {
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
  public async validateEmailUnique(email: string): Promise<boolean> {
    let result = await this.SELECT(UserModel.SELECT_ALL_BY_EMAIL, [email]);
    if (result.length) {
      return false;
    }
    return true;
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
  public validatePasswordFormat(password: string): boolean {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(password);
  }
}
