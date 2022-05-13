import { ArticleModel } from "./article_model.ts";
import { SessionModel } from "./session_model.ts";
import { ArticlesFavoritesModel } from "./articles_favorites_model.ts";
import { Model, QueryBuilder } from "../deps.ts";

export type UserEntity = {
  bio: string;
  email: string;
  id: number;
  image: string;
  password: string;
  username: string;
};

export class UserModel extends Model {
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

  public articles(): QueryBuilder<ArticleModel> {
    return ArticleModel.where("author_id", this.id);
  }

  public async session(): Promise<SessionModel | null> {
    return await SessionModel.where(
      "user_id",
      this.id,
    ).first();
  }

  public articleFavorites(): QueryBuilder<ArticlesFavoritesModel> {
    return ArticlesFavoritesModel.where("user_id", this.id);
  }
}

export default UserModel;
