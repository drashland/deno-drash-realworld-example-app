import BaseModel from "./base_model.ts";
import { UserModel, createUserModelObject } from "./user_model.ts";
import {
  ArticlesFavoritesModel,
  createArticlesFavoritesModelObject,
} from "./articles_favorites_model.ts";

export type ArticleEntity = {
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

export class ArticleModel extends BaseModel {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public author_id: number;
  public body: string;
  public created_at: number;
  public description: string;
  public favorited: boolean = false;
  public favoritesCount: number = 0;
  public id: number;
  public slug: string;
  public title: string;
  public updated_at: number;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRCUTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(
    authorId: number,
    title: string,
    description: string,
    body: string,
    slug: string = "",
    createdAt = Date.now(),
    updatedAt = Date.now(),
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
   * @return Promise<ArticleModel>
   */
  public async save(): Promise<ArticleModel> {
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
    await client.query(query);
    client.release();

    // @ts-ignore
    //
    // (crookse) We ignore this because whereSlug() can return null if the
    // article is not found. However, in this case, it will never be null.
    return ArticleModel.whereSlug(this.slug);
  }

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

  /**
   * Update this model.
   *
   * @return Promise<ArticleModel>
   */
  public async update(): Promise<ArticleModel> {
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
    await client.query(query);
    client.release();

    // @ts-ignore
    // (crookse) We ignore this because whereId() can return null if the
    // user is not found. However, in this case, it will never be null.
    return ArticleModel.whereId(this.id);
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
      query += ` WHERE author_id = '${filters.author.id}'`;
    }
    const client = await BaseModel.connect();
    const dbResult = await client.query(query);
    client.release();

    let articles = BaseModel.formatResults(
      dbResult.rows,
      dbResult.rowDescription.columns,
    );
    if (articles && articles.length > 0) {
      return articles.map((article: any) => {
        return createArticleModelObject(article);
      });
    }
    return [];
  }

  /**
   * Get a record by the slug column value.
   *
   * @param string slug
   */
  static async whereSlug(slug: string) {
    let query = `SELECT * FROM articles WHERE slug = '${slug}';`;

    const client = await BaseModel.connect();
    const dbResult = await client.query(query);
    client.release();

    const article = BaseModel.formatResults(
      dbResult.rows,
      dbResult.rowDescription.columns,
    );
    if (article && article.length > 0) {
      return createArticleModelObject(article[0]);
    }
    return null;
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
