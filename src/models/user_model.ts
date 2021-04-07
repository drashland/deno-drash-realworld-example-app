import BaseModel from "./base_model.ts";

export type UserEntity = {
  bio?: string;
  email: string;
  id?: number;
  image?: string;
  password?: string;
  username: string;
  token?: null | string;
};

/**
 * @description
 * Creates a instance of the user model with the properties populated
 *
 * @param object user
 * @param string user.username
 * @param string user.password
 * @param string user.email
 * @param string user.bio
 * @param string user.image
 * @param number user.id
 *
 * @return UserModel
 */
export function createUserModelObject(user: {
  username: string;
  password: string;
  email: string;
  bio: string;
  image: string;
  id: number;
}): UserModel {
  return new UserModel(
    user.username,
    user.password,
    user.email,
    user.bio,
    user.image,
    user.id,
  );
}

//@ts-ignore UserModel defines a where method that has different params than base models
// where method. Might need to investigate the naming usage
export class UserModel extends BaseModel {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @var string
   *
   * Bio associated with the given user
   */
  public bio: string;

  /**
   * @var string
   *
   * Email address for the given user
   */
  public email: string;

  /**
   * @var number
   *
   * Associated row id for the database entry
   */
  public id: number;

  /**
   * @var string
   *
   * Path to where the profile picture resides for the user
   */
  public image: string;

  /**
   * @var string
   *
   * Password for the given user. Hashed if pulled from the database
   */
  public password: string;

  /**
   * @var string
   *
   * Username for the user
   */
  public username: string;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRCUTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param string username
   * @param string password
   * @param string email
   * @param string bio=""
   * @param string image="https://static.productionready.io/images/smiley-cyrus.jpg"
   * @param number id=-1
   */
  constructor(
    username: string,
    password: string,
    email: string,
    bio: string = "",
    image: string = "https://static.productionready.io/images/smiley-cyrus.jpg",
    id: number = -1,
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
  // FILE MARKER - METHODS - CRUD //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Delete this model.
   *
   * @return Promise<boolean> False if the query failed to delete
   */
  public async delete(): Promise<boolean> {
    const query = `DELETE FROM users WHERE id = $1`;
    const dbResult = await BaseModel.query(query, this.id);
    if (dbResult.rowCount! < 1) {
      return false;
    }
    return true;
  }

  /**
   * Save this model.
   *
   * @return Promise<UserModel|null> Empty array if no data was found
   */
  public async save(): Promise<UserModel | null> {
    // If this model already has an ID, then that means we're updating the model
    if (this.id != -1) {
      return this.update();
    }

    const query =
      "INSERT INTO users (username, email, password, bio, image) VALUES ($1, $2, $3, $4, $5);";
    const dbResult = await BaseModel.query(
      query,
      this.username,
      this.email,
      this.password,
      this.bio,
      this.image,
    );
    if (dbResult.rowCount < 1) {
      return null;
    }

    // (crookse) We ignore this because this will never return null.
    const savedResult = await UserModel.where({ email: this.email });
    if (savedResult.length === 0) {
      return null;
    }
    return savedResult[0];
  }

  /**
   * Update this model.
   *
   * @return Promise<UserModel|null> False if no results were found
   */
  public async update(): Promise<UserModel | null> {
    const query = "UPDATE users SET " +
      "username = $1, password = $2, email = $3, bio = $4, image = $5 " +
      `WHERE id = $6;`;
    const dbResult = await BaseModel.query(
      query,
      this.username,
      this.password,
      this.email,
      this.bio,
      this.image,
      this.id,
    );
    if (dbResult.rowCount! < 1) {
      return null;
    }

    const updatedResult = await UserModel.where({ email: this.email });
    if (updatedResult.length === 0) {
      return null;
    }
    return updatedResult[0];
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - STATIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @description
   *     See BaseModel.Where()
   *
   * @param {[key: string]: string} fields
   *
   * @return Promise<UserModel[]|[]>
   */
  static async where(
    fields: { [key: string]: string | number },
  ): Promise<UserModel[] | []> {
    const results = await BaseModel.Where("users", fields);

    if (results.length <= 0) {
      return [];
    }

    //@ts-ignore Nothing we can do about this.. the createUserModelObject expect
    // a user object type, but there's no way to type it like that the return type of whereIn can't be user
    return results.map((result) => {
      return createUserModelObject(result);
    });
  }

  /**
   * @description
   *     See BaseModel.WhereIn()
   *
   * @param string column
   * @param any values
   *
   * @return Promise<UserModel[]> | []
   */
  static async whereIn(
    column: string,
    values: string[] | number[],
  ): Promise<UserModel[] | []> {
    const results = await BaseModel.WhereIn("users", {
      column,
      values,
    });

    if (results.length <= 0) {
      return [];
    }

    //@ts-ignore Nothing we can do about this.. the createUserModelObject expect
    // a user object type, but there's no way to type it like that the return type of whereIn can't be user
    return results.map((result) => {
      return createUserModelObject(result);
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
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
