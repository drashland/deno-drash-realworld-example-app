import BaseModel from "./base_model.ts";

export type ArticlesFavoritesEntity = {
  article_id: number;
  user_id: number;
  id?: number;
  value: boolean;
};

export function createArticlesFavoritesModelObject(
  inputObj: ArticlesFavoritesEntity,
): ArticlesFavoritesModel {
  return new ArticlesFavoritesModel(
    inputObj.article_id,
    inputObj.user_id,
    inputObj.value,
    inputObj.id,
  );
}

export class ArticlesFavoritesModel extends BaseModel {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public article_id: number;
  public user_id: number;
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
    id: number = -1,
  ) {
    super();
    this.article_id = articleId;
    this.user_id = authorId;
    this.value = value;
    this.id = id;
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
   * @return Promise<ArticlesFavoritesModel>
   */
  public async save(): Promise<ArticlesFavoritesModel> {
    // If this model already has an ID, then that means we're updating the model
    if (this.id != -1) {
      return this.update();
    }

    let query = "INSERT INTO articles_favorites " +
      " (article_id, user_id, value)" +
      " VALUES (?, ?, ?);";
    query = this.prepareQuery(
      query,
      [
        String(this.article_id),
        String(this.user_id),
        String(this.value),
      ],
    );

    const client = await BaseModel.connect();
    await client.query(query);
    client.release();

    // @ts-ignore
    // (crookse) We ignore this because this will never return null.
    return ArticlesFavoritesModel.where({article_id: this.article_id});
  }

  /**
   * Update this model.
   *
   * @return Promise<ArticlesFavoritesModel>
   */
  public async update(): Promise<ArticlesFavoritesModel> {
    let query = "UPDATE articles_favorites SET " +
      "value = ? " +
      `WHERE id = '${this.id}';`;
    query = this.prepareQuery(
      query,
      [
        String(this.value),
      ],
    );
    const client = await BaseModel.connect();
    await client.query(query);
    client.release();

    // @ts-ignore
    // (crookse) We ignore this because this will never return null.
    return ArticlesFavoritesModel.where({article_id: this.article_id});
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - STATIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  static async where(
    fields: any
  ): Promise<ArticlesFavoritesModel[] | []> {
    let query = "SELECT * FROM articles_favorites WHERE ";
    let clauses: string[] = [];
    for (let field in fields) {
      let value = fields[field];
      clauses.push(`${field} = '${value}'`);
    }
    query += clauses.join(" AND ");

    const client = await BaseModel.connect();
    const dbResult = await client.query(query);
    client.release();

    let results: any = BaseModel.formatResults(
      dbResult.rows,
      dbResult.rowDescription.columns,
    );

    if (results.length <= 0) {
      return [];
    }

    return results.map((result: any) => {
      return createArticlesFavoritesModelObject(result);
    });
  }

  /**
   * Get records by the given id column values.
   *
   * @param string column
   * @param number[] val
   */
  static async whereIn(column: string, values: number[]) {
    if (values.length <= 0) {
      return [];
    }

    let valuesCommaSeparated = values.join(",");
    let query =
      `SELECT * FROM articles_favorites WHERE ${column} IN (${values.join(",")})`;

    const client = await BaseModel.connect();
    const dbResult = await client.query(query);
    client.release();

    let results: any = BaseModel.formatResults(
      dbResult.rows,
      dbResult.rowDescription.columns,
    );
    if (results && results.length > 0) {
      return results.map((result: any) => {
        return createArticlesFavoritesModelObject(result);
      });
    }

    return [];
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @return ArticlesFavoritesEntity
   */
  public toEntity(): ArticlesFavoritesEntity {
    return {
      id: this.id,
      article_id: this.article_id,
      user_id: this.user_id,
      value: this.value,
    };
  }
}
