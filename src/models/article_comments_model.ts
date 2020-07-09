import BaseModel from "./base_model.ts";
import {ArticleModel} from "./article_model.ts";

export type ArticleCommentEntity = {
  created_at: number;
  id: number;
  article_id: number
  body: string
  updated_at: number;
  author_id: number;
  author_image: string
  author_username: string
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
export function createArticleCommentsModelObject(article: ArticleCommentEntity): ArticleCommentsModel {
  return new ArticleCommentsModel(
      article.article_id,
      article.body,
      article.author_image,
      article.author_id,
      article.author_username,
      article.created_at,
      article.updated_at,
      article.id
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

  public author_image: string

  /**
   * @var number
   *
   * Timestamp of the last time the database row was updated
   */
  public updated_at: number;

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
  ) {
    super();
    this.id = id;
    this.article_id = articleId;
    this.body = body;
    this.author_id = authorId
    this.author_image = authorImage
    this.author_username = authorUsername
    this.created_at = createdAt;
    this.updated_at = updatedAt;
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
    let query = `DELETE FROM article_comments WHERE id = ?`;
    query = this.prepareQuery(
        query,
        [
          String(this.id),
        ],
    );

    try {
      const client = await BaseModel.connect();
      await client.query(query);
      client.release();
    } catch (error) {
      console.log(error);
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

    let query = "INSERT INTO article_comments " +
        " (article_id, author_image, author_id, author_username, body, created_at, updated_at)" +
        " VALUES (?, ?, ?, ?, ?, to_timestamp(?), to_timestamp(?));";
    query = this.prepareQuery(
        query,
        [
          String(this.article_id),
          this.author_image,
          this.author_id,
          this.author_username,
          this.body,
          String(Date.now() / 1000.00),
          String(Date.now() / 1000.00),
        ],
    );

    const client = await BaseModel.connect();
    await client.query(query);
    client.release();

    // @ts-ignore
    // (crookse) We ignore this because this will never return null.
    return ArticleCommentsModel.where({ id: this.id });
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
    const client = await BaseModel.connect();
    const dbResult = await client.query(query);
    client.release();

    let results = BaseModel.formatResults(
        dbResult.rows,
        dbResult.rowDescription.columns,
    );
    if (results && results.length > 0) {
      return results.map((article: any) => {
        return createArticleCommentsModelObject(article);
      });
    }
    return [];
  }

  /**
   * @description
   *     See BaseModel.where()
   *
   * @param any fields
   *
   * @return Promise<ArticleModel[]|[]>
   */
  static async where(
      fields: any,
  ): Promise<ArticleModel[] | []> {
    let results = await BaseModel.where("article_comments", fields);

    if (results.length <= 0) {
      return [];
    }

    return results.map((result: any) => {
      return createArticleCommentsModelObject(result);
    });
  }

  /**
   * @description
   *     See BaseModel.whereIn()
   *
   * @param string column
   * @param any values
   *
   * @return Promise<ArticleModel[]|[]>
   */
  static async whereIn(
      column: string,
      values: any,
  ): Promise<ArticleModel[] | []> {
    let results = await BaseModel.whereIn("article_comments", {
      column,
      values,
    });

    if (results.length <= 0) {
      return [];
    }

    return results.map((result: any) => {
      return createArticleCommentsModelObject(result);
    });
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
  // protected createSlug(title: string): string {
  //   return title.toLowerCase()
  //       .replace(/[^a-zA-Z0-9 ]/g, "")
  //       .replace(/\s/g, "-");
  // }
}
