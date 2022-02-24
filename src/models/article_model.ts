import BaseModel from "./base_model.ts";
import { UserModel } from "./user_model.ts";
import { ArticlesFavoritesModel } from "./articles_favorites_model.ts";
import { ArticleCommentsModel } from "./article_comments_model.ts";
import type { Where } from "./base_model.ts";

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

export class ArticleModel extends BaseModel {
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
  public id = 0;

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

  public async delete() {
    // const user = await UserModel.first({
    //   where: [
    //     ["id", this.author_id],
    //   ],
    // });
    // await user?.delete();
    await super.delete();
  }

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
    return await UserModel.first({
      where: [
        ["id", this.author_id],
      ],
    });
  }

  public async articleFavorites(where: Where = []) {
    where.push(["article_id", this.id]);
    return await ArticlesFavoritesModel.all({
      where,
    });
  }

  public async comments(where: Where = []) {
    where.push(["article_id", this.id]);
    return await ArticleCommentsModel.all({
      where,
    });
  }
}
