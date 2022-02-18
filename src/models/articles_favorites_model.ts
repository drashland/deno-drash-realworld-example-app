import BaseModel from "./base_model.ts";
import { UserModel } from "./user_model.ts";
import { ArticleModel } from "./article_model.ts";

export type ArticlesFavoritesEntity = {
  article_id: number;
  user_id: number;
  id: number;
  value: boolean;
};

export class ArticlesFavoritesModel extends BaseModel {
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

  /**
   * @var boolean
   *
   * TODO(ebebbington) What is this property used for?
   */
  public value = false;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  // belongs to
  public async user(): Promise<UserModel | null> {
    return await UserModel.first({
      where: [
        ["id", this.user_id],
      ],
    });
  }

  public async factoryDefaults(params: Partial<ArticlesFavoritesEntity> = {}) {
    return {
      article_id: params.article_id ?? (await ArticleModel.factory()).id,
      user_id: params.user_id ?? (await UserModel.factory()).id,
      value: params.value ?? true,
    };
  }
}
