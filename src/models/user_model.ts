import BaseModel from "./base_model.ts";
import { ArticleModel } from "./article_model.ts";
import { SessionModel } from "./session_model.ts";
import { ArticlesFavoritesModel } from "./articles_favorites_model.ts";
import type { Where } from "./base_model.ts";

export type UserEntity = {
  bio: string;
  email: string;
  id: number;
  image: string;
  password: string;
  username: string;
};

export class UserModel extends BaseModel {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @var string
   *
   * Bio associated with the given user
   */
  public bio = "";

  /**
   * @var string
   *
   * Email address for the given user
   */
  public email = "";

  /**
   * @var number
   *
   * Associated row id for the database entry
   */
  public id = 0;

  /**
   * @var string
   *
   * Path to where the profile picture resides for the user
   */
  public image = "";

  /**
   * @var string
   *
   * Password for the given user. Hashed if pulled from the database
   */
  public password = "";

  /**
   * @var string
   *
   * Username for the user
   */
  public username = "";

  public tablename = "users";

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public factoryDefaults(params: Partial<UserEntity> = {}) {
    return {
      email: params.email ?? "test@hotmail.com",
      username: params.username ?? "drash",
      password: params.password ?? "admin",
      image: params.image ?? "https:?/drash.land/favicon.ico",
      bio: params.bio ?? "the bio",
    };
  }

  public async articles(
    where: Where = [],
  ): Promise<ArticleModel[] | []> {
    return await ArticleModel.all({
      where: [
        ["author_id", this.id],
        ...where,
      ],
    });
  }

  public async session(): Promise<SessionModel | null> {
    return await SessionModel.first({
      where: [
        ["user_id", this.id],
      ],
    });
  }

  // Example overriding save method
  public async save() {
    // do some stuff, like set a uuid or something
    await super.save();
  }

  /**
   * can also do:
   *
   * public tags = [] // if tags is array, postgres will return it as array
   * public admin = false // if admin is BOOLEAN, postgres will return it as such
   * public config = {} // if config is json, postgres will return it
   */

  public async articleFavorites(where: Where = []) {
    where.push(["user_id", this.id]);
    return await ArticlesFavoritesModel.all({
      where,
    });
  }
}

export default UserModel;
