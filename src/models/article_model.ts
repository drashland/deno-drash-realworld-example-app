import BaseModel from "./base_model.ts";
import type { UserEntity, UserModel } from "./user_model.ts";

export type ArticleEntity = {
  author?: UserEntity | null;
  // deno-lint-ignore camelcase
  author_id: number;
  body: string;
  // deno-lint-ignore camelcase
  created_at: number;
  description: string;
  favorited: boolean;
  favoritesCount: number;
  id?: number;
  slug?: string;
  title: string;
  // deno-lint-ignore camelcase
  updated_at: number;
  tags?: string;
};

export type Filters = {
  author?: UserModel | null;
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
export function createArticleModelObject(article: ArticleEntity): ArticleModel {
  return new ArticleModel(
    article.author_id,
    article.title,
    article.description,
    article.body,
    article.tags,
    article.slug,
    article.created_at,
    article.updated_at,
    article.id,
  );
}

// (ebebbington) Error comes from this model adding the where method, that uses different
// params compared to BaseModel's where method
export class ArticleModel extends BaseModel {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @var number
   *
   * Id of the associated author in the author table
   */
  public author_id: number;

  /**
   * @var string
   *
   * Body (content) for the article
   */
  public body: string;

  /**
   * @var string[]
   *
   * Tags associated with the article, comma separated.
   *
   *     const tags = ["javascript", "webdev"];
   *     new ArticleModel(..., tags.join(","))
   */
  public tags: string;

  /**
   * @var created_at
   *
   * Timestamp of when the row was created inside the database
   */
  public created_at: number;

  /**
   * @var description
   *
   * Desription for the article
   */
  public description: string;

  /**
   * @var boolean [=false]
   *
   * If the article is favorited
   */
  public favorited = false;

  /**
   * @var numbers [=0]
   *
   * Number of favourites the article has accumulated
   */
  public favoritesCount = 0;

  /**
   * @var number
   *
   * Id of the related row in the database
   */
  public id: number;

  /**
   * @var string
   *
   * Slug for the article content
   */
  public slug: string;

  /**
   * @var string
   *
   * Title of the article
   */
  public title: string;

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
   * @param number authorId
   * @param string title
   * @param string description
   * @param string body
   * @param string[] tags
   * @param string slug=""
   * @param number createdAt=Date
   * @param number updatedAt=Date
   * @param number id=-1
   */
  constructor(
    authorId: number,
    title: string,
    description: string,
    body: string,
    tags: string = "",
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
    this.tags = tags;
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
    const query = `DELETE FROM articles WHERE id = $1`;
    const dbResult = await BaseModel.query(query, this.id);
    if (dbResult.rowCount < 1) {
      return false;
    }
    return true;
  }

  /**
   * Save this model.
   *
   * @return Promise<ArticleModel|[]> The saved article, else [] if failure to save
   */
  public async save(): Promise<ArticleModel | []> {
    // If this model already has an ID, then that means we're updating the model
    if (this.id != -1) {
      return this.update();
    }

    // TODO(ebebbington) Dont allow duplicate articles, because the slug is just the article name
    const query = "INSERT INTO articles " +
      " (author_id, title, description, body, slug, created_at, updated_at, tags)" +
      " VALUES ($1, $2, $3, $4, $5, to_timestamp($6), to_timestamp($7), $8);";
    const dbResult = await BaseModel.query(
      query,
      this.author_id,
      this.title,
      this.description,
      this.body,
      this.createSlug(this.title),
      Date.now() / 1000.00,
      Date.now() / 1000.00,
      this.tags,
    );
    if (dbResult.rowCount < 1) {
      return [];
    }

    // (crookse) We ignore this because this will never return null.
    const savedResult = await ArticleModel.where({ slug: this.slug });
    if (savedResult.length === 0) {
      return [];
    }
    return savedResult[0];
  }

  /**
   * Update this model.
   *
   * @return Promise<ArticleModel|[]> The updated article, else [] if it failed to update
   */
  public async update(): Promise<ArticleModel | []> {
    const query = "UPDATE articles SET " +
      "title = $1, description = $2, body = $3, updated_at = to_timestamp($4), tags = $5 " +
      `WHERE id = '${this.id}';`;
    const dbResult = await BaseModel.query(
      query,
      this.title,
      this.description,
      this.body,
      Date.now(),
      this.tags,
    );
    if (dbResult.rowCount! < 1) {
      return [];
    }

    // (crookse) We ignore this because this will never return null.
    const updatedResult = await ArticleModel.where({ id: this.id });
    if (updatedResult.length === 0) {
      return [];
    }
    return updatedResult[0];
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
    const dbResult = await BaseModel.query(query);
    if (dbResult.rowCount! < 1) {
      return [];
    }
    if (dbResult.rows.length === 0) {
      return [];
    }
    const articles: Array<ArticleModel> = [];
    dbResult.rows.forEach((result) => {
      const entity: ArticleEntity = {
        id: typeof result.id === "number" ? result.id : 0,
        body: typeof result.body === "string" ? result.body : "",
        "author_id": typeof result.author_id === "number"
          ? result.author_id
          : 0,
        "created_at": typeof result.created_at === "number"
          ? result.created_at
          : 0,
        description: typeof result.description === "string"
          ? result.description
          : "",
        favorited: typeof result.favorited === "boolean"
          ? result.favorited
          : false,
        favoritesCount: typeof result.favoritesCount === "number"
          ? result.favoritesCount
          : 0,
        title: typeof result.title === "string" ? result.title : "",
        "updated_at": typeof result.updated_at === "number"
          ? result.updated_at
          : 0,
        tags: typeof result.tags === "string" ? result.tags : "",
        slug: typeof result.slug === "string" ? result.slug : "",
      };
      articles.push(createArticleModelObject(entity));
    });
    return articles;
  }

  /**
   * @description
   *     See BaseModel.Where()
   *
   * @param {[key: string]: string} fields
   *
   * @return Promise<ArticleModel[]|[]>
   */
  static async where(
    fields: { [key: string]: string | number },
  ): Promise<ArticleModel[] | []> {
    const results = await BaseModel.Where("articles", fields);

    if (results.length <= 0) {
      return [];
    }

    const articles: Array<ArticleModel> = [];
    results.forEach((result) => {
      const entity: ArticleEntity = {
        id: typeof result.id === "number" ? result.id : 0,
        body: typeof result.body === "string" ? result.body : "",
        "author_id": typeof result.author_id === "number"
          ? result.author_id
          : 0,
        "created_at": typeof result.created_at === "number"
          ? result.created_at
          : 0,
        description: typeof result.description === "string"
          ? result.description
          : "",
        favorited: typeof result.favorited === "boolean"
          ? result.favorited
          : false,
        favoritesCount: typeof result.favoritesCount === "number"
          ? result.favoritesCount
          : 0,
        title: typeof result.title === "string" ? result.title : "",
        "updated_at": typeof result.updated_at === "number"
          ? result.updated_at
          : 0,
        tags: typeof result.tags === "string" ? result.tags : "",
        slug: typeof result.slug === "string" ? result.slug : "",
      };
      articles.push(createArticleModelObject(entity));
    });
    return articles;
  }

  /**
   * @description
   *     See BaseModel.WhereIn()
   *
   * @param string column
   * @param string[]|number[] values
   *
   * @return Promise<ArticleModel[]|[]>
   */
  static async whereIn(
    column: string,
    values: string[] | number[],
  ): Promise<ArticleModel[] | []> {
    const results = await BaseModel.WhereIn("articles", {
      column,
      values,
    });

    if (results.length <= 0) {
      return [];
    }

    const articles: Array<ArticleModel> = [];
    results.forEach((result) => {
      const entity: ArticleEntity = {
        id: typeof result.id === "number" ? result.id : 0,
        body: typeof result.body === "string" ? result.body : "",
        "author_id": typeof result.author_id === "number"
          ? result.author_id
          : 0,
        "created_at": typeof result.created_at === "number"
          ? result.created_at
          : 0,
        description: typeof result.description === "string"
          ? result.description
          : "",
        favorited: typeof result.favorited === "boolean"
          ? result.favorited
          : false,
        favoritesCount: typeof result.favoritesCount === "number"
          ? result.favoritesCount
          : 0,
        title: typeof result.title === "string" ? result.title : "",
        "updated_at": typeof result.updated_at === "number"
          ? result.updated_at
          : 0,
        tags: typeof result.tags === "string" ? result.tags : "",
        slug: typeof result.slug === "string" ? result.slug : "",
      };
      articles.push(createArticleModelObject(entity));
    });
    return articles;
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
      tags: this.tags,
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
