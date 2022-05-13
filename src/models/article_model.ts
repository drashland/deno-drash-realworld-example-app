import { UserModel } from "./user_model.ts";
import { ArticlesFavoritesModel } from "./articles_favorites_model.ts";
import { ArticleCommentModel } from "./article_comment_model.ts";
import { Model, QueryBuilder } from "../deps.ts";

export type ArticleEntity = {
  author_id: number;
  body: string;
  created_at: number;
  description: string;
  id: number;
  title: string;
  updated_at: number;
  tags: string[];
};

export class ArticleModel extends Model {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public tablename = "articles";

  /**
   * @var number
   *
   * Id of the associated author in the author table
   */
  public author_id = 0;

  /**
   * @var string
   *
   * Body (content) for the article
   */
  public body = "";

  /**
   * @var string[]
   *
   * Tags associated with the article, comma separated.
   *
   *     const tags = ["javascript", "webdev"];
   *     new ArticleModel(..., tags.join(","))
   */
  public tags: string[] = [];

  /**
   * @var created_at
   *
   * Timestamp of when the row was created inside the database
   */
  public created_at = 0;

  /**
   * @var description
   *
   * Desription for the article
   */
  public description = "";

  /**
   * @var number
   *
   * Id of the related row in the database
   */
  public override id = 0;

  /**
   * @var string
   *
   * Title of the article
   */
  public title = "";

  /**
   * @var number
   *
   * Timestamp of the last time the database row was updated
   */
  public updated_at = 0;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC .../////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public async factoryDefaults(params: Partial<ArticleEntity> = {}) {
    return {
      title: params.title ?? "title",
      description: params.description ?? "a desc",
      tags: params.tags ?? ["a tag"],
      body: params.body ?? " the body",
      author_id: params.author_id ?? (await UserModel.factory()).id,
    };
  }

  public async author() {
    return await UserModel.where(
      "id",
      this.author_id,
    ).first();
  }

  public articleFavorites(): QueryBuilder<ArticlesFavoritesModel> {
    return ArticlesFavoritesModel.where("article_id", this.id);
  }

  public comments(): QueryBuilder<ArticleCommentModel> {
    return ArticleCommentModel.where("article_id", this.id);
  }
}
