import { PostgresClient } from "../deps.ts";
import BaseModel from "./base_model.ts";

export default class UserModel extends BaseModel {

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - PROPERTIES - STATIC /////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    public static SELECT_ALL = "SELECT * FROM users";
    public static DELETE_ALL = "DELETE FROM users WHERE username = 'one'";
    public static UPDATE_ONE = "UPDATE users SET username = 'TEST' WHERE username = 'one'";
    public static CREATE_ONE = "INSERT INTO users (username, password, email) VALUES ('three', 'three', 'three@hotmail.com');"

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - PROPERTIES - ABSTRACT ///////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    public primary_key: string = 'id'

    public hidden: string[] = [
        'password'
    ]

    public fillable: string[] = [
        'username',
        'password',
        'email'
    ]

    // TODO :: Add validation rules
    public rules: string[] = [

    ]

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - PROPERTIES - PUBLIC ///////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    public id: number = 0

    public username: string = ''

    public password: string = ''

    public email: string = ''

    public created_on: any = ''

    public last_login: any = null

}