import BaseModel from "./base_model.ts";
import { UserEntity, UserModel } from "./user_model.ts";
import { IQueryResult } from "../deps.ts"

export type ArticleEntity = {
  author?: UserEntity | null;
  author_id: number;
  body: string;
  created_at: number;
  description: string;
  favorited: boolean;
  favoritesCount: number;
  id?: number;
  slug?: string;
  title: string;
  updated_at: number;
};

export type Filters = {
  author?: UserModel | null;
  offset?: number;
};

/**
 * @description
 * Returns an instance of the ArticleModel with the data passed in attached
 *
 * @param {ArticleEntity} article
 *
 * @return {ArticleModel}
 */
export function createArticleModelObject(article: ArticleEntity): ArticleModel {
  return new ArticleModel(
    article.author_id,
    article.title,
    article.description,
    article.body,
    article.slug,
    article.created_at,
    article.updated_at,
    article.id,
  );
}

//@ts-ignore
// (ebebbington) Error comes from this model adding the where method, that uses different
// params compared to BaseModel's where method
export class ArticleModel extends BaseModel {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @var {number}
   *
   * Id of the associated author in the author table
   */
  public author_id: number;

  /**
   * @var {string}
   *
   * Body (content) for the article
   */
  public body: string;

  /**
   * @var {created_at}
   *
   * Timestamp of when the row was created inside the database
   */
  public created_at: number;

  /**
   * @var {description}
   *
   * Desription for the article
   */
  public description: string;

  /**
   * @var {boolean} [=false]
   *
   * If the article is favorited
   */
  public favorited: boolean = false;

  /**
   * @var {numbers} [=0]
   *
   * Number of favourites the article has accumulated
   */
  public favoritesCount: number = 0;

  /**
   * @var {number}
   *
   * Id of the related row in the database
   */
  public id: number;

  /**
   * @var {string}
   *
   * Slug for the article content
   */
  public slug: string;

  /**
   * @var {string}
   *
   * Title of the article
   */
  public title: string;

  /**
   * @var {number}
   *
   * Timestamp of the last time the database row was updated
   */
  public updated_at: number;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRCUTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param {number} authorId
   * @param {string} title
   * @param {string} description
   * @param {string} body
   * @param {string} slug=""
   * @param {number} createdAt=Date
   * @param {number} updatedAt=Date
   * @param {number} id=-1
   */
  constructor(
    authorId: number,
    title: string,
    description: string,
    body: string,
    slug: string = "",
    createdAt: number = Date.now(),
    updatedAt: number = Date.now(),
    id: number = -1,
  ) {
    super();
    this.id = id;
    this.author_id = authorId;
    this.title = title;
    this.description = description;
    this.body = body;
    this.slug = this.id == -1 ? this.createSlug(title) : slug;
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
    let query = `DELETE FROM articles WHERE id = ?`;
    query = this.prepareQuery(
      query,
      [
        String(this.id),
      ],
    );

    try {
      const client = await BaseModel.connect();
      const dbResult: IQueryResult =  await client.query(query);
      client.release();
      if (dbResult.rowCount < 1) {
        return false
      }
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  }

  /**
   * Save this model.
   *
   * @return Promise<ArticleModel|[]> The saved article, else [] if failure to save
   */
  public async save(): Promise<ArticleModel|[]> {
    // If this model already has an ID, then that means we're updating the model
    if (this.id != -1) {
      return this.update();
    }

    let query = "INSERT INTO articles " +
      " (author_id, title, description, body, slug, created_at, updated_at)" +
      " VALUES (?, ?, ?, ?, ?, to_timestamp(?), to_timestamp(?));";
    query = this.prepareQuery(
      query,
      [
        String(this.author_id),
        this.title,
        this.description,
        this.body,
        this.createSlug(this.title),
        String(Date.now() / 1000.00),
        String(Date.now() / 1000.00),
      ],
    );

    const client = await BaseModel.connect();
    const dbResult: IQueryResult = await client.query(query);
    client.release();
    if (dbResult!.rowCount! < 1) {
      return []
    }

    // @ts-ignore
    // (crookse) We ignore this because this will never return null.
    return ArticleModel.where({ slug: this.slug });
  }

  /**
   * Update this model.
   *
   * @return Promise<ArticleModel|[]> The updated article, else [] if it failed to update
   */
  public async update(): Promise<ArticleModel|[]> {
    let query = "UPDATE articles SET " +
      "title = ?, description = ?, body = ?, updatedAt = to_timestamp(?) " +
      `WHERE id = '${this.id}';`;
    query = this.prepareQuery(
      query,
      [
        this.title,
        this.description,
        this.body,
        String(Date.now()),
      ],
    );
    const client = await BaseModel.connect();
    const dbResult: IQueryResult = await client.query(query);
    if (dbResult.rowCount < 1) {
      return []
    }
    client.release();

    // @ts-ignore
    // (crookse) We ignore this because this will never return null.
    return ArticleModel.where({ id: this.id });
  }

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
  static async all(filters: Filters): Promise<ArticleModel[] | []> {
    let query = "SELECT * FROM articles ";
    if (filters.author) {
      query += ` WHERE author_id = '${filters.author.id}' `;
    }
    if (filters.offset) {
      query += ` OFFSET ${filters.offset} `;
    }
    const client = await BaseModel.connect();
    const dbResult: IQueryResult = await client.query(query);
    client.release();
    if (dbResult.rowCount < 1) {
      return []
    }

    let results = BaseModel.formatResults(
      dbResult.rows,
      dbResult.rowDescription.columns,
    );
    if (results && results.length > 0) {
      // @ts-ignore
      // Nothing we can do about this.. the createUserModelObject expect
      // a user object type, but there's no way to type it like that the return type of whereIn can't be user
      return results.map(article => {
        return createArticleModelObject(article);
      });
    }
    return [];
  }

  /**
   * @description
   *     See BaseModel.where()
   *
   * @param {[key: string]: string} fields
   *
   * @return Promise<ArticleModel[]|[]>
   */
  static async where(
    fields: {[key: string]: string},
  ): Promise<ArticleModel[] | []> {
    let results = await BaseModel.where("articles", fields);

    if (results.length <= 0) {
      return [];
    }

    //@ts-ignore
    // (ebebbington) Nothing we can do about this.. the createUserModelObject expect
    // a user object type, but there's no way to type it like that the return type of whereIn can't be user
    return results.map(result => {
      return createArticleModelObject(result);
    });
  }

  /**
   * @description
   *     See BaseModel.whereIn()
   *
   * @param string column
   * @param string[]|number[] values
   *
   * @return Promise<ArticleModel[]|[]>
   */
  static async whereIn(
    column: string,
    values: string[]|number[],
  ): Promise<ArticleModel[] | []> {
    let results = await BaseModel.whereIn("articles", {
      column,
      values,
    });

    if (results.length <= 0) {
      return [];
    }

    //@ts-ignore
    // (ebebbington) Nothing we can do about this.. the createUserModelObject expect
    // a user object type, but there's no way to type it like that the return type of whereIn can't be user
    return results.map(result => {
      return createArticleModelObject(result);
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @return ArticleEntity
   */
  public toEntity(): ArticleEntity {
    return {
      id: this.id,
      author_id: this.author_id,
      title: this.title,
      description: this.description,
      favorited: this.favorited,
      favoritesCount: this.favoritesCount,
      body: this.body,
      slug: this.slug,
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
}
