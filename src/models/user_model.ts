import BaseModel from "./base_model.ts";

export default class UserModel extends BaseModel {

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - PROPERTIES - STATIC /////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    public static SELECT_ALL = "SELECT * FROM users";
    public static DELETE_ALL = "DELETE FROM users WHERE username = 'one'";
    public static UPDATE_ONE = "UPDATE users SET username = 'TEST' WHERE username = 'one'";
    public static CREATE_ONE = "INSERT INTO users (username, password, email) VALUES (?, ?, ?);"
    public static SELECT_ALL_BY_EMAIL = "SELECT * FROM users WHERE email = ";

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - PROPERTIES - ABSTRACT ///////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    public primary_key: string = 'id'

    public hidden: string[] = [
        'password'
    ]

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

    public async validate (data: { username: string, email: string, password: string}) {
        //
        // Username
        //

        // Required
        if (!data.username) {
            return {
                success: false,
                message: 'Username must be set.'
            }
        }

        //
        // Email
        //

        // Required
        if (!data.email) {
            return {
                success: false,
                message: 'Email must be set.'
            }
        }
        // Matches an email address
        if (/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(data.email) === false) {
            return {
                success: false,
                message: 'Email must be a valid email address.'
            }
        }

        //
        // Password
        //

        // Required
        if (!data.password) {
            return {
                success: false,
                message: 'Password must be set.'
            }
        }
        // Min 8 characters, max any, 1 uppercase, 1 lowercase, 1 number
        if (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(data.password) === false) {
            return {
                success: false,
                message: 'Password must contain the following: 8 characters, 1 number and 1 uppercase and lowercase letter'
            }
        }

        //
        // General checks
        //

        // TODO :: Doesn't already exist
        const result = await this.SELECT(UserModel.SELECT_ALL_BY_EMAIL, [data.email])
        console.log(result)

        return {
            success: true,
            message: 'Passed validation'
        }

    }
}