import BaseModel from "./base_model.ts";
import { ArticleModel } from "./article_model.ts";
import { UserModel } from "./user_model.ts";

export type ArticleCommentEntity = {
  created_at: number;
  id: number;
  article_id: number;
  body: string;
  updated_at: number;
  author_id: number;
  author_image: string;
  author_username: string;
};

export class ArticleCommentsModel extends BaseModel {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public tablename = "article_comments";

  /**
   * Id of the associated article in the articles table
   */
  public article_id = 0;

  /**
   * Timestamp of when the row was created inside the database
   */
  public created_at = 0;

  /**
   * Comment for the article
   */
  public body = 0;

  /**
   * Id of the related row in the database
   */
  public id = 0;

  /**
   * Id of the user who created the comment
   */
  public author_id = 0;

  /**
   * Timestamp of the last time the database row was updated
   */
  public updated_at = 0;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Override default toEntity so we can supply the
   * authors username to the frontend
   */
  public async toEntity(): Promise<ArticleCommentEntity> {
    const user = await UserModel.first({
      select: ["username"],
      where: [
        ["id", this.author_id],
      ],
    });
    return await super.toEntity<ArticleCommentEntity>({
      author_username: user?.username ?? "",
      author_image: user?.image ?? ""
    });
  }

  public async factoryDefaults(params: Partial<ArticleCommentEntity> = {}) {
    return {
      author_id: params.author_id ?? (await UserModel.factory()).id,
      body: params.body ?? "bodyyy",
      article_id: params.article_id ?? (await ArticleModel.factory()).id,
    };
  }
}
