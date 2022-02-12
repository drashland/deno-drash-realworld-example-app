// deno-lint-ignore-file ban-ts-comment
//import { db } from "../db.ts"

// TODO :: USE TRANSACTIONS

import { PostgresClient } from "../deps.ts";

type First<IsFirst> = IsFirst extends true ? true
  : false;

type QueryResponse<IsFirst, Model extends BaseModel> = First<IsFirst> extends
  true ? Model | null : Model[] | [];

export default abstract class BaseModel {
  [k: string]: unknown

  protected abstract tablename: string;

  /**
   * Instead of having to query the db for the fields we need to fill on the model each time
   * we need to fill a model, we'll do it once and store the values here
   *
   * Key = tablename, value = field names
   */
  private static modelFieldsCache: Record<string, string[]> = {};

  protected abstract factoryDefaults(
    params: Record<string, unknown>,
  ): Promise<Record<string, unknown>> | Record<string, unknown>;

  public abstract id: (number | string);

  private static async getDb(): Promise<PostgresClient> {
    const db = new PostgresClient({
      user: "user",
      password: "userpassword",
      database: "realworld",
      hostname: "realworld_postgres",
      port: 5432,
      tls: {
        enforce: false,
      },
    });
    await db.connect();
    return db;
  }

  private static async closeDb(db: PostgresClient): Promise<void> {
    await db.end();
  }

  private async getChildFieldNames(): Promise<Array<string>> {
    if (BaseModel.modelFieldsCache[this.tablename]) {
      return BaseModel.modelFieldsCache[this.tablename];
    }
    // @ts-ignore
    const rows = await this.constructor.queryRaw(
      `SELECT column_name FROM information_schema.columns WHERE table_name = '${this.tablename}'`,
    );
    const fields = rows.map((row: { column_name: string }) => row.column_name);
    BaseModel.modelFieldsCache[this.tablename] = fields;
    return fields;
  }

  public async toEntity<Entity>(extraProps: Record<string, unknown> = {}): Promise<Entity> {
    const fields: Record<string, unknown> = {};
    for (const field of await this.getChildFieldNames()) {
      fields[field] = this[field];
    }
    const { ...data } = this;
    Object.keys(extraProps).forEach(propname => {
      data[propname] = extraProps[propname]
    })
    //@ts-ignore
    return data as Entity;
  }

  public async save() {
    if (this.id) {
      //@ts-ignore
      const row = (await this.constructor.select(["id"], [
        ["id", this.id],
      ]))[0];
      if (!row) {
        throw new Error(`no model exists with id ${this.id}: ${this}`);
      }
      // update
      let query = `UPDATE ${this.tablename} SET `;
      query += (await this.getChildFieldNames()).map((name, i) =>
        `${name} = $${i + 1}`
      ).join(", ");
      query += ` WHERE id = ${this.id}`;
      //@ts-ignore
      await this.constructor.query(
        query,
        Object.getOwnPropertyNames(this).map((name) => this[name]),
      );
      return;
    }
    //@ts-ignore
    let query = `INSERT INTO ${this.constructor.tablename} (`;
    query += Object.getOwnPropertyNames(this).join(", ");
    query += ` ) VALUES (`;
    query += Object.getOwnPropertyNames(this).map((_name, i) => `$${i + 1}`)
      .join(", ");
    query += `)`;
    //@ts-ignore
    const result = await this.constructor.query(
      query,
      Object.getOwnPropertyNames(this).map((name) => this[name]),
    );
    this.id = result.id;
  }

  public async delete() {
    //@ts-ignore
    await this.constructor.query(
      `DELETE FROM ${this.tablename} WHERE id = ${this.id}`,
    );
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - STATIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @description
   * Responsible for running all the queries
   *
   * @param string query
   *     The query, with dollar signs in place of values if needed
   * @param unknown[] args
   *     If parameterising the query (using dollar signs), each item in this array will be associated with a dollar sign
   *
   * @example
   * const query = "SELECT * FROM users WHERE name = $1 AND username = $2"
   * const data = ["My name", "My username"];
   * await query(query, data)
   * // or if query does not use parameters:
   * await query(query)
   *
   * @returns An object containing:
   *     - An array of the formatted results: `[{id: ..., ...}, { ... }]
   *     - The row count
   *     - If there was an error thrown
   */
  public static async query<Model extends BaseModel, T extends boolean = any>(
    this: new () => Model,
    opts: {
      select?: string[];
      where?: Array<Array<string | number>>;
      whereIn?: [string, string|number[]]
      first?: T;
    },
  ): Promise<QueryResponse<T, Model>> {
    if (!opts.select) opts.select = ["*"];
    if (!opts.where) opts.where = [[]];

    let query = `SELECT ` + opts.select.join(", ") +
      ` FROM ${(new this()).tablename}`;
    const args: string[] = [];

    if (opts.where.length) {
      const whereQuery = opts.where.map((w, i) => { // where = [ ["id", 1], ["last_updated", '<', now()] ]
        args.push(w.at(-1) as string);
        w[w.length - 1] = `$${i + 1}`;
        if (w.length === 2) {
          return w.join(" = "); // "id = ?"
        }
        return w.join(" "); // "last_updated < ?"
      }).join(" and "); // "id = ? and last_updated = ?"
      query += ` WHERE ` + whereQuery;
    }

    if (opts.whereIn) {
      let whereInQuery = ` WHERE ? IN (`
      const whereInParams = opts.whereIn.flat()
      const whereInPreparedParams = whereInParams.map((w, i) => {
        args.push(w.toString())
        return `$${i + 1}`
      })
      whereInQuery += whereInPreparedParams.join(', ')
      query += `${whereInQuery} `
    }

    const models: Model[] = [];
    //@ts-ignore
    const rows = await this.queryRaw(query, args);
    for (const row of rows) {
      models.push(Object.assign(new this(), row));
    }
    if (opts.first) {
      return models[0];
    }
    return models;
  }

  protected static async queryRaw(
    query: string,
    args: Array<string | number> = [],
  ) {
    const db = await BaseModel.getDb();
    const dbResult = args && args.length
      ? await db.queryObject(query, ...args)
      : await db.queryObject(query);
    await BaseModel.closeDb(db);
    console.log("did a query", dbResult);
    return dbResult.rows;
  }

  /**
   * Create a factory
   *
   * Inserts a new record into the database and returns it as a model
   *
   * @example
   * ```js
   * class User extends Model {
   *   static tablename = "users";
   *
   *   // Default data to insert into database
   *   static factoryDefaults = {
   *     username: "john"
   *   }
   * }
   * const user: User = await User.factory()
   * ```
   *
   * @param params - To set any fields when creating the row
   *
   * @returns An instance of the parent model
   */
  public static async factory<Model extends BaseModel>(
    this: new () => Model,
    params: Record<string, string | number> = {},
  ): Promise<Model> {
    const model = new this();
    const defaults = await model.factoryDefaults(params);
    Object.keys(params).forEach((key) => {
      defaults[key] = params[key];
    });
    let query = `INSERT INTO ${model.tablename} (`;
    query += Object.keys(defaults).join(", ");
    query += `) VALUES (`;
    query += Object.keys(defaults).map((k, i) => `$${i + 1}`).join(", ");
    query += `) RETURNING id`;
    //@ts-ignore
    const result = await this.queryRaw(
      query,
      Object.values(defaults) as string[],
    );
    //@ts-ignore
    const models = await this.query(
      `SELECT * FROM ${model.tablename} WHERE id = ${result[0].id}`,
    );
    return models[0] as Model;
  }
}
