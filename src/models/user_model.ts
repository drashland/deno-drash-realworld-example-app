import BaseModel from "./base_model.ts";

type UserEntity = {
  bio?: string;
  email: string;
  id?: null|number;
  image?: string;
  password: string;
  username: string;
  token?: null|string;
};

export class UserModel extends BaseModel {

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public static UPDATE_ONE = "UPDATE users SET username = ?, password = ?, email = ?, bio = ?, image = ?  WHERE id = ?";

  public bio: string;
  public email: string;
  public id: null|number;
  public image: string;
  public password: string;
  public username: string;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRCUTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(
    username: string,
    password: string,
    email: string,
    bio: string = "",
    image: string = "https://static.productionready.io/images/smiley-cyrus.jpg",
    id: null|number = null
  ) {
    super();
    this.id = id;
    this.username = username;
    this.password = password;
    this.email = email;
    this.bio = bio;
    this.image = image;
  }

  static async getUserByEmail(email: string) {
    const query = `SELECT * FROM users WHERE email = '${email}';`;
    const client = await BaseModel.connect();
    const dbResult = await client.query(query);
    console.log(dbResult);
    const user = BaseModel.formatResults(dbResult.rows, dbResult.rowDescription.columns)
    client.release();
    if (user && user.length > 0) {
      return createUserModel(user[0]);
    }
    return null;
  }

  static async getUserById(id: null|number) {
    const query = `SELECT * FROM users WHERE id = '${id}';`;
    const client = await BaseModel.connect();
    const dbResult = await client.query(query);
    client.release();
    const user = BaseModel.formatResults(dbResult.rows, dbResult.rowDescription.columns)
    client.release();
    if (user && user.length > 0) {
      return createUserModel(user[0]);
    }
    return null;
  }

  static async getUserByUsername(username: string) {
    const query = `SELECT * FROM users WHERE username = '${username}';`;
    const client = await BaseModel.connect();
    const dbResult = await client.query(query);
    client.release();
    const user = BaseModel.formatResults(dbResult.rows, dbResult.rowDescription.columns)
    client.release();
    if (user && user.length > 0) {
      return createUserModel(user[0]);
    }
    return null;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public async save(): Promise<void> {
    if (this.id) {
      throw new Error("Record already exists.");
    }

    let query = "INSERT INTO users "
      + " (username, email, password, bio, image)"
      + " VALUES ('?', '?', '?', '?', '?');"
    query = this.prepareQuery(
      query,
      [
        this.username,
        this.email,
        this.password,
        this.bio,
        this.image
      ]
    );
    console.log(query);
    const client = await BaseModel.connect();
    // await client.query(query);
    client.release();
    return;
  }

  public async update(data: any): Promise<void> {
    let query = "UPDATE users SET "
      + "username = '?', password = '?', email = '?', bio = '?', image = '?' "
      + `WHERE id = '${this.id}';`;
    query = this.prepareQuery(
      query,
      [
        data.username,
        data.password,
        data.email,
        data.bio,
        data.image
      ]
    );
    console.log(query);
    const client = await BaseModel.connect();
    // const result = await client.query(query);
    client.release();
    return;
  }

  public toEntity(): UserEntity {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      bio: this.bio,
      image: this.image,
      token: null,
      password: this.password,
    };
  }
}

function createUserModel(user: any): UserModel {
  return new UserModel(
    user.username,
    user.password,
    user.email,
    user.bio,
    user.image,
    user.id
  );
}

export default UserModel;
