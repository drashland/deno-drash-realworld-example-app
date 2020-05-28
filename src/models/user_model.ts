import BaseModel from "./base_model.ts";

export default class UserModel extends BaseModel {

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - PROPERTIES - STATIC /////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    public static SELECT_ALL = "SELECT * FROM users";
    public static DELETE_ALL = "DELETE FROM users WHERE username = 'one'";
    public static UPDATE_ONE = "UPDATE users SET username = 'TEST' WHERE username = 'one'";
    public static CREATE_ONE = "INSERT INTO users (username, email, password) VALUES (?, ?, ?);"
    public static SELECT_ALL_BY_EMAIL = "SELECT * FROM users WHERE email = ?";
    public static SELECT_ALL_BY_ID = "SELECT * FROM users WHERE id = ?";
    public static SELECT_ALL_BY_USERNAME = "SELECT * FROM users WHERE username = ?";

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - PROPERTIES - ABSTRACT ///////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    public primary_key: string = 'id'

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - PROPERTIES - PUBLIC /////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    public id: number = 0

    public username: string = ''

    public password: string = ''

    public email: string = ''

    public created_on: any = ''

    public last_login: any = null

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    public async validate (data: { username: string, email: string, password: string}): Promise<{data: any}> {
        //
        // Username
        //

        // Required
        if (!data.username) {
            return {
              data: {
                username: ['Username field is required.'],
              }
            }
        }

        //
        // Email
        //

        // Required
        if (!data.email) {
            return {
              data: {
                email: ['Email field is required.'],
              }
            }
        }

        // Matches an email address
        const emailRegex = new RegExp(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)
        if (emailRegex.test(data.email) === false) {
            return {
              data: {
                email: ['Email must be a valid email address.']
              }
            }
        }

        // Doesn't already exist
        const result = await this.SELECT(UserModel.SELECT_ALL_BY_EMAIL, [data.email])
        console.log(result);
        if (result.length) {
            return {
              data: {
                email: ['Email aready taken.'],
              }
            }
        }

        //
        // Password
        //

        // Required
        if (!data.password) {
            return {
              data: {
                password: ['Password field is required.'],
              }
            }
        }
        // Min 8 characters, max any, 1 uppercase, 1 lowercase, 1 number
        if (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(data.password) === false) {
            return {
              data: {
                password: 'Password must contain the following: 8 characters, 1 number and 1 uppercase and lowercase letter',
              }
            }
        }

        return {
          data: true
        };
    }
}
