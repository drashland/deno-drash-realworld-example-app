// deno-lint-ignore-file ban-ts-comment
//import { db } from "../db.ts"

// TODO :: USE TRANSACTIONS

import { PostgresClient } from "../deps.ts";

type First<IsFirst> = IsFirst extends true ? true
  : false;

type QueryResponse<IsFirst, Model extends BaseModel> = First<IsFirst> extends
  true ? Model | null : Model[] | [];

export type Where = Array<
  [string, string | number] | [string, string, string | number]
>; // [ ['id', 2], ['created_at', '>', new Date()] ]
type WhereIn = [string, Array<string | number>];

interface QueryOpts {
  select?: string[]; // ["username", "id"]
  where?: Where;
  whereIn?: WhereIn;
  limit?: number;
  offset?: number;
}

/**
 * A base class to provide helper methods to querying the database.
 *
 * You can define a class like so:
 * ```js
 * interface UserEntity {
 *   id: number;
 *   name: string;
 *   nicknames: string[];
 *   is_admin: boolean;
 *   config: { google_uri?: string };
 *   customClassProperty: string;
 *   company: Company | null;
 * }
 * class User extends Model {
 *   public tablename = "users";
 *
 *   public id = 0;
 *
 *   public name = "";
 *
 *   public nicknames: string[] = []; // As postgres supports arrays: `nicknames text[] NOT NULL`
 *
 *   public is_admin = false; // As postgres supports booleans: `is_admin boolean NOT NULL`
 *
 *   public config: {
 *     google_uri?: string
 *   } = {}; // As postgres supports objects: `config json NOT NULL`
 *
 *   public company_id = 0;
 *
 *   public created_at = "";
 *
 *   public updated_at = "";
 *
 *   public customClassProperty = "hello world"; // Excluded when saving/updating
 *
 *   public async company(): Promise<Company> {
 *     return await Company.first({
 *       where: [
 *         ['id', this.company_id]
 *       ]
 *     });
 *   }
 *
 *   public async toEntity(): Promise<UserEntity> {
 *     const company = await this.company();
 *     return await super.toEntity({
 *       company ? await company.toEntity() : null,
 *       customClassProperty
 *     }); // { id: 1, ..., company: ..., ... }
 *   }
 *
 *   public async factoryDefaults(params: Partial<UserEntity> = {}) {
 *     return {
 *       company_id: params.company_id ?? (await Company.factory()).id,
 *       name: params.name ?? "Some name",
 *       // ...,
 *     }
 *   }
 * }
 * let user = await User.factory() // User { ... }
 * console.log(user.id); // 1
 * console.log(await user.company()); // Company { ... }
 * user = await User.first({
 *   where: [
 *     ['id', user.id]
 *   ]
 * });
 * console.log(user.id); // 1
 * console.log(user.name) // "Some name"
 * const user2 = await User.factory({
 *   company_id: (await user.company()).id,
 *   name: "Hello",
 * });
 * console.log(user2.id); // 2
 * console.log(user2.name); // "Hello"
 * console.log((await user2.company()).id); // 1
 * user2.name = "World";
 * await user2.save();
 * console.log(user2.name); // "World";
 * ```
 */
export default abstract class BaseModel {
  [k: string]: unknown

  protected abstract tablename: string;

  protected abstract factoryDefaults(
    params: Record<string, unknown>,
  ): Promise<Record<string, unknown>> | Record<string, unknown>;

  public abstract id: (number | string);

  // TODO :: USE POOLS
  private static async queryRaw(
    query: string,
    args: Array<unknown> = [],
  ) {
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
    const dbResult = args && args.length
      ? await db.queryObject(query, ...args)
      : await db.queryObject(query);
    await db.end();
    return dbResult.rows as Record<string, unknown>[];
  }

  private async getChildFieldNames(
    omit: {
      id?: boolean;
      timestamps?: boolean;
    } = {},
  ): Promise<Array<string>> {
    const rows = await BaseModel.queryRaw(
      `SELECT column_name FROM information_schema.columns WHERE table_name = '${this.tablename}'`,
    ) as Array<{
      column_name: string;
    }>;
    let fields = rows.map((row) => row.column_name);
    if (omit.id) {
      fields = fields.filter((field) => field !== "id");
    }
    if (omit.timestamps) {
      fields = fields.filter((field) =>
        ["created_at", "updated_at"].includes(field) === false
      );
    }
    return fields;
  }

  /**
   * Constracts the WHERE section of a query, and returns it and the params to use
   *
   * @example
   * ```js
   * constractWhereQuery([
   *   ['id', 2]
   * ]) // { query: " WHERE id = $1", params: [2] }
   * ```
   *
   * @param where The where fields
   *
   * @returns The query and params
   */
  private static constructWhereQuery(where: Where): {
    whereQuery: string;
    whereArgs: Array<string | number>;
  } {
    // Where
    const whereArgs: Array<string | number> = [];
    let whereQuery = where.map((w, i) => { // where = [ ["id", 1], ["last_updated", '<', now()] ]
      whereArgs.push(w.at(-1) as string);
      w[w.length - 1] = `$${i + 1}`;
      if (w.length === 2) {
        return w.join(" = "); // "id = ?"
      }
      return w.join(" "); // "last_updated < ?"
    }).join(" and "); // "id = ? and last_updated = ?"
    whereQuery = ` WHERE ` + whereQuery + " ";
    return {
      whereQuery,
      whereArgs,
    };
  }

  /**
   * Constracts the WHERE IN section of a query, and returns it and the params to use
   *
   * @example
   * ```js
   * constractWhereInQuery(['id', [1, 2, 3]]) // { query: " WHERE id IN ($1, $2, $3)", params: [1, 2, 3] }
   * ```
   *
   * @param whereIn The where fields
   *
   * @returns The query and params
   */
  private static constructWhereInQuery(whereIn: WhereIn): {
    whereInQuery: string;
    whereInArgs: Array<string | number>;
  } {
    const whereInArgs: Array<string | number> = [];
    // Wherein
    let whereInQuery = ` WHERE ? IN (`;
    const whereInParams = whereIn.flat();
    const whereInPreparedParams = whereInParams.map((w, i) => {
      whereInArgs.push(w);
      return `$${i + 1}`;
    });
    whereInQuery += whereInPreparedParams.join(", ") + " ";
    return {
      whereInQuery,
      whereInArgs,
    };
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  // deno-lint-ignore no-explicit-any
  toEntity(): Promise<any>;
  toEntity<Entity>(args: Record<string, unknown>): Promise<Entity>;
  toEntity<Entity>(): Promise<Entity>;
  /**
   * Returns your class as an entity (object), where it's a representation of
   * the row in the database
   *
   * @example
   * ```js
   * // Representation of the schema
   * interface UserEntity {
   *   id: number;
   *   username: string;
   * }
   * class User extends Model {
   *   public id = 0
   *   public username = ""
   *   public tablename = "users"
   *   public someCustomProp = "USERS"
   * }
   * const user = await User.first(...) // UserModel { ... }
   * const entity = await user.toEntity<UserEntity>(); // { id: 0, username: "" }
   *
   * // You can also override the method:
   * interface UserEntity {
   *   id: number;
   *   company_name: string;
   * }
   * }
   * class User extends Model {
   *   id = 0
   *
   *   public async toEntity(): Promise<UserEntity> {
   *     return await this.toEntity({
   *       company_name: (await this.company()).name
   *     })
   *   }
   * }
   *
   * await (new User).toEntity() // { id: 0, company_name: "User ltd." }
   * ```
   *
   * @param extraProps Any other fields you want to set inside the entity alongside the model
   *
   * @returns The entity
   */
  public async toEntity<Entity>(
    extraProps: Record<string, unknown> = {},
  ): Promise<Entity> {
    const fields: Record<string, unknown> = {};
    for (const field of await this.getChildFieldNames()) {
      fields[field] = this[field];
    }
    Object.keys(extraProps).forEach((propname) => {
      fields[propname] = extraProps[propname];
    });
    return fields as Entity;
  }

  /**
   * Save or update the model to the database.
   *
   * If the model exists (eg the `id` property is set), this will
   * update the model, using the values of the field names on the class,
   * and exclude updating the `id`, `created_at` and `updated_at` fields
   *
   * If the model doesn't exist (eg no id), this will insert a new row
   *
   * Once all done, this will then update the class properties with the values inserted, and auto fields
   * such as assigning the new `created_at` value (if your table uses auto timestamps for example)
   *
   * You can also override this class if you needed to perform actions before or after saving:
   * ```js
   * public async save() {
   *   // do somthing before saving...
   *   // ...
   *   await super.save();
   *   // do something after
   *   // ...
   * }
   * ```
   */
  public async save(): Promise<void> {
    const fields = await this.getChildFieldNames({
      id: true,
      timestamps: true,
    }); // wont include timestamps and id
    if (this.id) {
      // update
      let query = `UPDATE ${this.tablename} SET `;
      query += fields.map((name, i) => `${name} = $${i + 1}`).join(", ");
      query += ` WHERE id = $${fields.length + 1}`;
      const rows = await BaseModel.queryRaw(
        query,
        [...fields.map((name) => this[name]), this.id],
      );
      Object.assign(this, rows[0]);
      return;
    }
    let query = `INSERT INTO ${this.tablename} (`;
    query += fields.join(", ");
    query += ` ) VALUES (`;
    query += fields.map((_name, i) => `$${i + 1}`)
      .join(", ");
    query += `) RETURNING *`;
    const result = await BaseModel.queryRaw(
      query,
      fields.map((name) => this[name]),
    );
    Object.assign(this, result[0]);
  }

  /**
   * Delete the model from the database using the `id`.
   * Will not modify the models properties
   *
   * You can extend this if you need to something before or after deleting:
   * ```js
   * public async delete() {
   *   doSomethingBeforeDeleting();
   *   await super.delete();
   *   doSomethingElseNowRowHasBeenDeleted();
   *   console.log(await this.exists()); // false
   * }
   * ```
   *
   * If the table has foreign constraints and you wish to delete those
   * along with this row, for example you have `users`, and `comments`,
   * and `comments` as a foreign key `user_id`, then be sure to add
   * `user_id ... REFERENCES users ON DELETE CASCASE`
   */
  public async delete(): Promise<void> {
    await BaseModel.queryRaw(
      `DELETE FROM ${this.tablename} WHERE id = $1`,
      [this.id],
    );
  }

  /**
   * Check if this model exists in the database via the `id`
   *
   * @returns If the model/row exists
   */
  public async exists(): Promise<boolean> {
    // Fastest way to query if row exists
    const rows = await BaseModel.queryRaw(
      `SELECT EXISTS(SELECT 1 FROM ${this.tablename} WHERE id = $1)`,
      [this.id],
    ) as [
      {
        exists: boolean;
      },
    ];
    return rows[0].exists;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - STATIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Find a single entry in the database
   *
   * @example
   * ```js
   * await UserModel.find({
   *   where: [
   *     ['id', 2],
   *     ['created_at', '>', new Date()]
   *   ]
   * }) // UserModel { ... }
   * ```
   *
   * @param opts - Options to find the specific record
   *
   * @returns The record converted to the model if found, else null
   */
  public static async first<Model extends BaseModel>(
    this: new () => Model,
    opts: QueryOpts,
  ): Promise<Model | null> {
    if (!opts.select) opts.select = ["*"];
    if (!opts.where) opts.where = [];
    const args: Array<string | number> = [];

    const model = new this();

    // Select
    let query = `SELECT ` + opts.select.join(", ") +
      ` FROM ${model.tablename}`;

    if (opts.where.length) {
      const { whereQuery, whereArgs } = BaseModel.constructWhereQuery(
        opts.where,
      );
      query += whereQuery;
      whereArgs.map((arg) => args.push(arg));
    }

    if (opts.whereIn) {
      const { whereInArgs, whereInQuery } = BaseModel.constructWhereInQuery(
        opts.whereIn,
      );
      query += whereInQuery;
      whereInArgs.map((arg) => args.push(arg));
    }

    if (opts.offset) {
      query += ` OFFSET ${opts.offset}`;
    }

    if (opts.limit) {
      query += ` LIMIT ${opts.limit}`;
    }

    // Execute
    const rows = await BaseModel.queryRaw(query, args);
    const row = rows[0];
    if (!row) {
      return null;
    }
    return Object.assign(model, row);
  }

  /**
   * Find a single entry in the database
   *
   * @example
   * ```js
   * await UserModel.find({
   *   where: [
   *     ['id', 2],
   *     ['created_at', '>', new Date()]
   *   ]
   * }) // UserModel { ... }
   * ```
   *
   * @param opts - Options to find the specific record
   *
   * @returns The record converted to the model if found, else null
   */
  public static async all<Model extends BaseModel>(
    this: new () => Model,
    opts: QueryOpts,
  ): Promise<Model[] | []> {
    if (!opts.select) opts.select = ["*"];
    if (!opts.where) opts.where = [];
    const args: Array<string | number> = [];

    const model = new this();

    // Select
    let query = `SELECT ` + opts.select.join(", ") +
      ` FROM ${model.tablename}`;

    if (opts.where.length) {
      const { whereQuery, whereArgs } = BaseModel.constructWhereQuery(
        opts.where,
      );
      query += whereQuery;
      whereArgs.map((arg) => args.push(arg));
    }

    if (opts.whereIn) {
      const { whereInArgs, whereInQuery } = BaseModel.constructWhereInQuery(
        opts.whereIn,
      );
      query += whereInQuery;
      whereInArgs.map((arg) => args.push(arg));
    }

    if (opts.offset) {
      query += ` OFFSET ${opts.offset}`;
    }

    if (opts.limit) {
      query += ` LIMIT ${opts.limit}`;
    }

    // Execute
    const rows = await BaseModel.queryRaw(query, args);
    const models: Model[] = [];
    for (const row of rows) {
      models.push(Object.assign(new this(), row));
    }
    return models;
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
    query += Object.keys(defaults).map((_k, i) => `$${i + 1}`).join(", ");
    query += `) RETURNING id`;
    const result = await BaseModel.queryRaw(
      query,
      Object.values(defaults) as string[],
    );
    //@ts-ignore
    return await this.first({
      where: [
        ["id", result[0].id],
      ],
    });
  }
}
