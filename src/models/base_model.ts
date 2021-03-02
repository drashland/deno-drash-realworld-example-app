//import { db } from "../db.ts"

import { PostgresClient } from "../deps.ts";

export default abstract class BaseModel {
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

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - STATIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @description
   *     Get records using the WHERE clause.
   *
   * @param string table
   * @param {[key: string]: string} fields eg {name: "ed", location: "uk"}
   *
   * @return Promise<[]|[{[key: string]: string}]> Empty array if no results were found, else array of objects
   */
  protected static async Where(
    table: string,
    fields: { [key: string]: string | number },
  ): Promise<[] | Record<string, unknown>[]> {
    let query = `SELECT * FROM ${table} WHERE `;
    const clauses: string[] = [];
    for (const field in fields) {
      const value = fields[field];
      if (typeof value === "number") {
        clauses.push(`${field} = ${value}`);
      } else {
        clauses.push(`${field} = '${value}'`);
      }
    }
    query += clauses.join(" AND ");
    const dbResult = await BaseModel.query(query);
    if (dbResult.rowCount! < 1) {
      return [];
    }
    return dbResult.rows;
  }

  /**
   * @description
   *     Get records using the WHERE IN clause.
   *
   * @param string table Tbale name to make the query
   * @param {column: string,  values: number[]|string[]} data
   *     {
   *       column: string            (the column to target)
   *       values: number[]|string[] (the values to put in the IN array)
   *     }
   *
   * @return Promise<any> Empty array if no data was found
   */
  public static async WhereIn(
    table: string,
    data: { values: Array<number | string> | number[]; column: string },
  ): Promise<[] | Record<string, unknown>[]> {
    if (data.values.length <= 0) {
      return [];
    }

    const query = `SELECT * FROM ${table} ` +
      ` WHERE ${data.column} ` +
      ` IN (${data.values.join(",")})`;
    const dbResult = await BaseModel.query(query);
    if (dbResult.rowCount < 1) {
      return [];
    }
    return dbResult.rows;
  }

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
  public static async query(
    query: string,
    ...args: Array<string | number>
  ): Promise<
    { rows: Record<string, unknown>[]; rowCount: number; error?: boolean }
  > {
    try {
      const db = await BaseModel.getDb();
      const dbResult = args && args.length
        ? await db.queryObject(query, ...args)
        : await db.queryObject(query);
      await BaseModel.closeDb(db);
      return {
        rows: dbResult.rows,
        rowCount: dbResult.rowCount ?? 0,
      };
    } catch (err) {
      console.error(err);
      return {
        rows: [],
        rowCount: 0,
        error: true,
      };
    }
  }
}
