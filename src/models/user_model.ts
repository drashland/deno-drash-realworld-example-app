import BaseModel from "./base_model.ts";

export type UserEntity = {
  bio?: string;
  email: string;
  id?: number;
  image?: string;
  password?: string;
  username: string;
  token?: null|string;
};

function createUserModelObject(user: any): UserModel {
  return new UserModel(
    user.username,
    user.password,
    user.email,
    user.bio,
    user.image,
    user.id
  );
}

export class UserModel extends BaseModel {

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public static UPDATE_ONE = "UPDATE users SET username = ?, password = ?, email = ?, bio = ?, image = ?  WHERE id = ?";

  public bio: string;
  public email: string;
  public id: number;
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
    id: number = -1
  ) {
    super();
    this.id = id;
    this.username = username;
    this.password = password;
    this.email = email;
    this.bio = bio;
    this.image = image;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - STATIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  static async getUserByEmail(email: string) {
    const query = `SELECT * FROM users WHERE email = '${email}';`;
    const client = await BaseModel.connect();
    const dbResult = await client.query(query);
    const user = BaseModel.formatResults(dbResult.rows, dbResult.rowDescription.columns)
    if (user && user.length > 0) {
      return createUserModelObject(user[0]);
    }
    return null;
  }

  static async getUserById(id: number) {
    const query = `SELECT * FROM users WHERE id = '${id}';`;
    const client = await BaseModel.connect();
    const dbResult = await client.query(query);
    client.release();
    const user = BaseModel.formatResults(dbResult.rows, dbResult.rowDescription.columns)
    if (user && user.length > 0) {
      return createUserModelObject(user[0]);
    }
    return null;
  }

  static async getUserByUsername(username: string) {
    const query = `SELECT * FROM users WHERE username = '${username}';`;
    const client = await BaseModel.connect();
    const dbResult = await client.query(query);
    client.release();
    const user = BaseModel.formatResults(dbResult.rows, dbResult.rowDescription.columns)
    if (user && user.length > 0) {
      return createUserModelObject(user[0]);
    }
    return null;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Save this model.
   *
   * @return Promise<UserModel>
   */
  public async save(): Promise<UserModel> {
    // If this model already has an ID, then that means we're updating the model
    if (this.id != -1) {
      return this.update();
    }

    let query = "INSERT INTO users "
      + " (username, email, password, bio, image)"
      + " VALUES (?, ?, ?, ?, ?);"
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

    const client = await BaseModel.connect();
    await client.query(query);
    client.release();

    // @ts-ignore
    //
    // (crookse) We ignore this because getUserByEmail() can return null if the
    // user is not found. However, in this case, it will never be null.
    return UserModel.getUserByEmail(this.email);
  }

  /**
   * Update this model.
   *
   * @return Promise<UserModel>
   */
  public async update(): Promise<UserModel> {
    let query = "UPDATE users SET "
      + "username = ?, password = ?, email = ?, bio = ?, image = ? "
      + `WHERE id = '${this.id}';`;
    query = this.prepareQuery(
      query,
      [
        this.username,
        this.password,
        this.email,
        this.bio,
        this.image
      ]
    );
    const client = await BaseModel.connect();
    await client.query(query);
    client.release();

    // @ts-ignore
    // (crookse) We ignore this because getUserByEmail() can return null if the
    // user is not found. However, in this case, it will never be null.
    return UserModel.getUserByEmail(this.email);
  }

  /**
   * Convert this object to an entity.
   *
   * @return UserEntity
   */
  public toEntity(): UserEntity {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      bio: this.bio,
      image: this.image,
      token: null,
    };
  }
}

export default UserModel;
