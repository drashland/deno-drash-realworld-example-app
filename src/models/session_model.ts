import BaseModel from "./base_model.ts";

export default class SessionModel extends BaseModel {

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - PROPERTIES - STATIC /////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    // public static SELECT_ALL = "SELECT * FROM users";
    // public static DELETE_ALL = "DELETE FROM users WHERE username = 'one'";
    // public static UPDATE_ONE = "UPDATE users SET username = 'TEST' WHERE username = 'one'";
    // public static CREATE_ONE = "INSERT INTO users (username, password, email) VALUES (?, ?, ?);"
    public static SELECT_ONE_BY_SESSION_ONE_AND_TWO = "SELECT * FROM sessions WHERE session_one = ? AND session_two = ? LIMIT 1";
    public static SELECT_ONE_BY_USER_ID = "SELECT * FROM sessions WHERE user_id = ? LIMIT 1"
    public static CREATE_ONE = "INSERT INTO sessions (user_id, session_one, session_two) VALUES (?, ?, ?);"

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - PROPERTIES - ABSTRACT ///////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    public primary_key: string = 'id'

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - PROPERTIES - PUBLIC /////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    public id: number = 0

    public user_id: number = 0

    public session_one: string = ''

    public session_two: string = ''

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    public async validate (data: { userId: number, sessionOne: string, sessionTwo: string}): Promise<boolean|{ errors: any }> {
      //
      // User id
      //

      // Required
      if (!data.userId) {
          return {
            errors: {
              userId: ['User id must be set.'],
            }
          }
      }

      //
      // session one
      //

      // Required
      if (!data.sessionOne) {
          return {
            errors: {
              sessionOne: ['Session one must be set.'],
            }
          }
      }

      //
      // session two
      //

      // Required
      if (!data.sessionTwo) {
          return {
            errors: {
              sessionTwo: ['Session two must be set.'],
            }
          }
      }

      return true;
    }
}
