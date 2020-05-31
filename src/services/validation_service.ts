export default class ValidationService {
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
  public isEmail(email: string): boolean {
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
  public async isEmailUnique(email: string): Promise<boolean> {
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
  public isPasswordStrong(password: string): boolean {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(password);
  }
}
