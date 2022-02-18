import BaseModel from "./base_model.ts";
import { UserModel } from "./user_model.ts";
import { ArticlesFavoritesModel } from "./articles_favorites_model.ts";
import { ArticleCommentsModel } from "./article_comments_model.ts";
import type { Where } from "./base_model.ts"

export type ArticleEntity = {
  author_id: number;
  body: string;
  created_at: number;
  description: string;
  id: number;
  slug: string;
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
   * Slug for the article content
   */
  public slug = "";

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
  // FILE MARKER - METHODS - PRIVATE /..////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Create a slug based on the given title.
   *
   * @param string title
   *
   * @return string
   */
  public createSlug(title: string): string {
    return title.toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/\s/g, "-");
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC .../////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public async factoryDefaults(params: Partial<ArticleEntity> = {}) {
    return {
      title: params.title ?? "title",
      slug: params.slug ?? this.createSlug(params.title ?? "title"),
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
