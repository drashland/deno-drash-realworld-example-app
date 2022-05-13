import { UserModel } from "./user_model.ts";
import { ArticleModel } from "./article_model.ts";
import { Model } from "../deps.ts";

export type ArticlesFavoritesEntity = {
  article_id: number;
  user_id: number;
  id: number;
};

export class ArticlesFavoritesModel extends Model {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public tablename = "articles_favorites";

  /**
   * @var number
   *
   * id of the associated article in the database
   */
  public article_id = 0;

  /**
   * @var number
   *
   * Id of the associated user in the database
   */
  public user_id = 0;

  /**
   * @var number
   *
   * Id of the database row
   */
  public id = 0;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  // belongs to
  public async user(): Promise<UserModel | null> {
    return await UserModel.where(
      "id",
      this.user_id,
    ).first();
  }

  public async factoryDefaults(params: Partial<ArticlesFavoritesEntity> = {}) {
    return {
      article_id: params.article_id ?? (await ArticleModel.factory()).id,
      user_id: params.user_id ?? (await UserModel.factory()).id,
    };
  }
}
