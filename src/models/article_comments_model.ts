import BaseModel from "./base_model.ts";
import { ArticleModel } from "./article_model.ts";
import { UserModel } from "./user_model.ts";

type ArticleCommentEntity = {
  created_at: number;
  id: number;
  article_id: number;
  body: string;
  updated_at: number;
  author_id: number;
  author_image: string;
  author_username: string
};

export class ArticleCommentsModel extends BaseModel {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public tablename = "article_comments";

  /**
   * @var number
   *
   * Id of the associated article in the articles table
   */
  public article_id = 0;

  /**
   * @var created_at
   *
   * Timestamp of when the row was created inside the database
   */
  public created_at = 0;

  /**
   * @var comment
   *
   * Comment for the article
   */
  public body = 0;

  /**
   * @var number
   *
   * Id of the related row in the database
   */
  public id = 0;

  /**
   * @var number
   *
   * Id of the user who created the comment
   */
  public author_id = 0;

  // TODO :: Dont need below props, just add an article relationship
  public author_image = "";

  /**
   * @var number
   *
   * Timestamp of the last time the database row was updated
   */
  public updated_at = 0;

  public slug = "";

  public async toEntity<ArticleCommentEntity>(): Promise<ArticleCommentEntity> {
    const user = await UserModel.query({
      select: ['username'],
      where: [
        ['id', this.author_id]
      ], first: true
    })
    return await super.toEntity({
      author_username: user?.username ?? ""
    })
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Create a slug based on the given title.
   *
   * @param string title
   *
   * @return string
   */
  protected createSlug(title: string): string {
    return title.toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/\s/g, "-");
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public async factoryDefaults(params: Partial<ArticleCommentEntity> = {}) {
    return {
      author_image: params.author_image ?? "https://drash.land/favicon.ico",
      author_id: params.author_id ?? (await UserModel.factory()).id,
      body: params.body ?? "bodyyy",
      article_id: params.article_id ?? (await ArticleModel.factory()).id,
    };
  }
}
