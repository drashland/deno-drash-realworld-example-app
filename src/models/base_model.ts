//import { db } from "../db.ts"

import { KeyedRow } from "../deps.ts"
import {connectPg, PgConn} from "../deps.ts";

export default abstract class BaseModel {

  private static async getDb (): Promise<PgConn> {
    const db: PgConn = await connectPg({
      username: "user",
      password: "userpassword",
      database: "realworld",
      hostname: "realworld_postgres",
      port: 5432,
      sslMode: "disable"
    });
    return db
  }

  private static closeDb (db: PgConn) {
    db.close()
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
  ): Promise<[] | Array<{ [key: string]: string | number | boolean }>> {
    let query = `SELECT * FROM ${table} WHERE `;
    const clauses: string[] = [];
    for (const field in fields) {
      const value = fields[field];
      clauses.push(`${field} = '${value}'`);
    }
    query += clauses.join(" AND ");
    const dbResult = await BaseModel.query(query);
    if (dbResult.rowCount! < 1) {
      return [];
    }
    return dbResult.rows
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
  ): Promise<[] | Array<{ [key: string]: string | number | boolean }>> {
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
    return dbResult.rows
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
  public static async query(query: string, ...args: Array<string | number>): Promise<{ rows: KeyedRow[], rowCount: number, error?: boolean}> {
    try {
      query = query.replace(/\$[0-9]/g, "?param?")
      if (args && args.length) {
        for (let i = 0, j = 1; i < args.length; i++, j++) {
          if (typeof args[i] === "number") {
            query = query.replace(`?param?`, args[i] as string)
          } else if (typeof args[i] === "string") {
            query = query.replace(`?param?`, `'${args[i]}'`)
          }
        }
      }
      const db = await BaseModel.getDb()
      const dbResult = await db.query(query)
      BaseModel.closeDb(db)
      return {
        rows: dbResult.rows,
        rowCount: dbResult.completionInfo.numAffectedRows || 0
      }
    } catch (err) {
      console.error(err)
      return {
        rows: [],
        rowCount: 0,
        error: true
      }
    }
  }
}
