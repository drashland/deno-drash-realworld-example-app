import BaseModel from "./base_model.ts";
import type { ArticleModel } from "./article_model.ts";

export type ArticleCommentEntity = {
  // deno-lint-ignore camelcase
  created_at: number;
  id: number;
  // deno-lint-ignore camelcase
  article_id: number;
  body: string;
  // deno-lint-ignore camelcase
  updated_at: number;
  // deno-lint-ignore camelcase
  author_id: number;
  // deno-lint-ignore camelcase
  author_image: string;
  // deno-lint-ignore camelcase
  author_username: string;
};

export type Filters = {
  article?: ArticleModel | null;
  offset?: number;
};

/**
 * @description
 * Returns an instance of the ArticleModel with the data passed in attached
 *
 * @param ArticleEntity article
 *
 * @return ArticleModel
 */
export function createArticleCommentsModelObject(
  article: ArticleCommentEntity,
): ArticleCommentsModel {
  return new ArticleCommentsModel(
    article.article_id,
    article.body,
    article.author_image,
    article.author_id,
    article.author_username,
    article.created_at,
    article.updated_at,
    article.id,
  );
}

export class ArticleCommentsModel extends BaseModel {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @var number
   *
   * Id of the associated article in the articles table
   */
  public article_id: number;

  /**
   * @var created_at
   *
   * Timestamp of when the row was created inside the database
   */
  public created_at: number;

  /**
   * @var comment
   *
   * Comment for the article
   */
  public body: string;

  /**
   * @var number
   *
   * Id of the related row in the database
   */
  public id: number;

  /**
   * @var number
   *
   * Id of the user who created the comment
   */
  public author_id: number;

  /**
   * @var string
   *
   * Username of the author who created the comment
   */
  public author_username: string;

  public author_image: string;

  /**
   * @var number
   *
   * Timestamp of the last time the database row was updated
   */
  public updated_at: number;

  public slug: string;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRCUTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param number id=-1
   * @param number articleId
   * @param string comment
   * @param number authorId
   * @param string authorUsername
   * @param number createdAt=Date
   * @param number updatedAt=Date
   */
  constructor(
    articleId: number,
    body: string,
    authorImage: string,
    authorId: number,
    authorUsername: string,
    createdAt: number = Date.now(),
    updatedAt: number = Date.now(),
    id: number = -1,
    slug: string = "",
  ) {
    super();
    this.id = id;
    this.article_id = articleId;
    this.body = body;
    this.author_id = authorId;
    this.author_image = authorImage;
    this.author_username = authorUsername;
    this.created_at = createdAt;
    this.updated_at = updatedAt;
    this.slug = this.id == -1
      ? this.createSlug(this.author_id + this.body + this.author_username)
      : slug;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - CRUD //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Delete this model.
   *
   * @return Promise<boolean>
   */
  public async delete(): Promise<boolean> {
    const query = `DELETE FROM article_comments WHERE id = $1`;
    const dbResult = await BaseModel.query(query, this.id);
    if (dbResult.error || dbResult.rowCount === 0) {
      return false;
    }
    return true;
  }

  /**
   * Save this model.
   *
   * @return Promise<ArticleCommentsModel> The saved article
   */
  public async save(): Promise<ArticleCommentsModel> {
    // If this model already has an ID, then that means we're updating the model
    // if (this.id != -1) {
    //   return this.update();
    // }

    const query =
      "INSERT INTO article_comments (article_id, author_image, author_id, author_username, body, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, to_timestamp($6), to_timestamp($7));";
    await BaseModel.query(
      query,
      this.article_id,
      this.author_image,
      this.author_id,
      this.author_username,
      this.body,
      Date.now() / 1000.00,
      Date.now() / 1000.00,
    );

    // @ts-ignore (crookse) We ignore this because this will never return null.
    const tmp = await ArticleCommentsModel.where(
      { author_id: this.author_id, body: this.body },
    );
    return tmp[0];
  }

  /**
   * Update this model.
   *
   * @return Promise<ArticleCommentsModel> The updated article comment
   */
  // Might not need this
  // public async update(): Promise<ArticleCommentsModel> {
  //   let query = "UPDATE articles SET " +
  //       "title = ?, description = ?, body = ?, updatedAt = to_timestamp(?) " +
  //       `WHERE id = '${this.id}';`;
  //   query = this.prepareQuery(
  //       query,
  //       [
  //         this.title,
  //         this.description,
  //         this.body,
  //         String(Date.now()),
  //       ],
  //   );
  //   const client = await BaseModel.connect();
  //   await client.query(query);
  //   client.release();
  //
  //   // @ts-ignore
  //   // (crookse) We ignore this because this will never return null.
  //   return ArticleModel.where({ id: this.id });
  // }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - STATIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Get all records--filtered or unfiltered.
   *
   * @param Filters filters
   *
   * @return Promise<ArticleMode[]|[]>
   */
  static async all(filters: Filters): Promise<ArticleCommentsModel[] | []> {
    let query = "SELECT * FROM article_comments ";
    if (filters.article) {
      query += ` WHERE article_id = '${filters.article.id}' `;
    }
    if (filters.offset) {
      query += ` OFFSET ${filters.offset} `;
    }
    const dbResult = await BaseModel.query(query);
    return ArticleCommentsModel.constructArticleComments(dbResult.rows);
  }

  /**
   * @description
   *     See BaseModel.where()
   *
   * @param fields
   *
   * @return Promise<ArticleModel[]|[]>
   */
  static async where(
    fields: { [key: string]: string | number },
  ): Promise<ArticleCommentsModel[] | []> {
    const results = await BaseModel.Where("article_comments", fields);

    if (results.length <= 0) {
      return [];
    }

    return ArticleCommentsModel.constructArticleComments(results);
  }

  /**
   * @description
   *     See BaseModel.whereIn()
   *
   * @param string column
   * @param string[] values
   *
   * @return Promise<ArticleModel[]|[]>
   */
  static async whereIn(
    column: string,
    values: Array<string | number>,
  ): Promise<ArticleCommentsModel[] | []> {
    const results = await BaseModel.WhereIn("article_comments", {
      column,
      values,
    });

    if (results.length <= 0) {
      return [];
    }

    return ArticleCommentsModel.constructArticleComments(results);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @return ArticleEntity
   */
  public toEntity(): ArticleCommentEntity {
    return {
      id: this.id,
      author_id: this.author_id,
      author_image: this.author_image,
      author_username: this.author_username,
      article_id: this.article_id,
      body: this.body,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
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

  protected static constructArticleComments(
    results: Record<string, unknown>[],
  ): Array<ArticleCommentsModel> | [] {
    const articleComments: Array<ArticleCommentsModel> = [];
    results.forEach((result) => {
      const entity: ArticleCommentEntity = {
        id: typeof result.id === "number" ? result.id : 0,
        body: typeof result.body === "string" ? result.body : "",
        "author_id": typeof result.author_id === "number"
          ? result.author_id
          : 0,
        "created_at": typeof result.created_at === "number"
          ? result.created_at
          : 0,
        "updated_at": typeof result.updated_at === "number"
          ? result.updated_at
          : 0,
        "article_id": typeof result.article_id === "number"
          ? result.article_id
          : 0,
        "author_username": typeof result.author_username === "string"
          ? result.author_username
          : "",
        "author_image": typeof result.author_image === "string"
          ? result.author_image
          : "",
      };
      articleComments.push(createArticleCommentsModelObject(entity));
    });
    return articleComments;
  }
}
