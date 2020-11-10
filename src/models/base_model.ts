import { Column, Pool, PoolClient } from "../deps.ts";
import type { QueryResult } from "../deps.ts";

type FormattedResults = [] | Array<{ [key: string]: string | number | boolean }>

export const dbPool = new Pool({
  user: "user",
  password: "userpassword",
  database: "realworld",
  hostname: "realworld_postgres",
  port: 5432,
}, 50);

export default abstract class BaseModel {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @description
   * Connects to a pool of the db and returns the connection object
   *
   * @return Promise<PoolClient>
   */
  static async connect(): Promise<PoolClient> {
    return await dbPool.connect();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - STATIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @description
   *     Uses the data received from the database table and the column names to
   *     format the result into key value pairs.
   *
   * @param Array<string[]> rows
   *     An array of the rows from the table, each containing column values.
   * @param Column[] columns
   *     Array of objects, each object holding column data. Used the get the
   *     column name.
   *
   * @return []|[{[key: string]: string}]
   *     Empty array of no db rows, else array of rows as key value pairs.
   *     For example:
   *         [{ name: "ed"}, {name: "eric}]
   *
   * @example
   * BaseModel.formatResults([[1, 'ed'], [2, 'john']], [{name: 'id', ...}, {name: 'name', ...}]);
   */
  private static formatResults(
    rows: Array<string[]>,
    columns: Column[],
  ): FormattedResults {
    if (!rows.length) {
      return [];
    }
    const columnNames: string[] = columns.map((column) => {
      return column.name;
    });
    const newResult: Array<{ [key: string]: string }> = [];
    rows.forEach((row, rowIndex) => {
      const rowData: { [key: string]: string } = {};
      row.forEach((rVal, rIndex) => {
        const columnName: string = columnNames[rIndex];
        rowData[columnName] = row[rIndex];
      });
      newResult.push(rowData);
    });
    return newResult;
  }

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

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
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
  public static async query(query: string, ...args: unknown[]): Promise<{ rows: FormattedResults, rowCount: number, error?: boolean}> {
    try {
      const client = await BaseModel.connect();
      const dbResult = args && args.length ? await client.query(query, ...args) : await client.query(query)
      await client.release();
      const rowCount = dbResult.rowCount as number
      if (dbResult.rows.length) {
        const formattedResults = BaseModel.formatResults(
            dbResult.rows,
            dbResult.rowDescription.columns
        );
        return {
          rows: formattedResults,
          rowCount
        }
      }
      return {
        rows: [],
        rowCount: 0
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
