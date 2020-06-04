import BaseModel from "./base_model.ts";

export type ArticlesFavoritesEntity = {
  article_id: number;
  author_id: number;
  id?: number;
  value: boolean;
}

function createArticlesFavoritesModel(
  inputObj: ArticlesFavoritesEntity
): ArticlesFavoritesModel {
  return new ArticlesFavoritesModel(
    inputObj.article_id,
    inputObj.author_id,
    inputObj.value,
    inputObj.id,
  );
}

export class ArticlesFavoritesModel extends BaseModel {

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public article_id: number;
  public author_id: number;
  public id: number;
  public value: boolean;
  public query: string = "";

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRCUTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(
    articleId: number,
    authorId: number,
    value: boolean,
    id: number = -1
  ) {
    super();
    this.article_id = articleId;
    this.author_id = authorId;
    this.value = value;
    this.id = id;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - STATIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  static async getByArticleId(articleId: number): Promise<ArticlesFavoritesModel|null> {
    let query = "SELECT * FROM articles_favorites ";
    query += ` WHERE article_id = '${articleId}'`;
    const client = await BaseModel.connect();
    let result: any = await client.query(query);
    result = BaseModel.formatResults(result.rows, result.rowDescription.columns)
    if (result && result.length > 0) {
      return createArticlesFavoritesModel(result[0]);
    }
    return null;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
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
      ]
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
   * @return Promise<ArticlesFavoritesModel>
   */
  public async save(): Promise<ArticlesFavoritesModel> {
    // If this model already has an ID, then that means we're updating the model
    if (this.id != -1) {
      return this.update();
    }

    let query = "INSERT INTO articles_favorites "
      + " (article_id, author_id, value)"
      + " VALUES (?, ?, ?);"
    query = this.prepareQuery(
      query,
      [
        String(this.article_id),
        String(this.author_id),
        String(this.value),
      ]
    );

    const client = await BaseModel.connect();
    await client.query(query);
    client.release();

    // @ts-ignore
    return ArticlesFavoritesModel.getByArticleId(this.article_id);
  }

  /**
   * @return ArticlesFavoritesEntity
   */
  public toEntity(): ArticlesFavoritesEntity {
    return {
      id: this.id,
      article_id: this.article_id,
      author_id: this.author_id,
      value: this.value == "t" ? true : false,
    };
  }

  /**
   * Update this model.
   *
   * @return Promise<ArticlesFavoritesModel>
   */
  public async update(): Promise<ArticlesFavoritesModel> {
    let query = "UPDATE articles_favorites SET "
      + "value = ? "
      + `WHERE id = '${this.id}';`;
    query = this.prepareQuery(
      query,
      [
        String(this.value),
      ]
    );
    const client = await BaseModel.connect();
    await client.query(query);
    client.release();

    // @ts-ignore
    // (crookse) We ignore this because getUserByEmail() can return null if the
    // user is not found. However, in this case, it will never be null.
    return ArticlesFavoritesModel.getByArticleId(this.id);
  }
}
