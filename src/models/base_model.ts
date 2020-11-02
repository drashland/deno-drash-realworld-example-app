import { Column, Pool, PoolClient } from "../deps.ts";
import type { QueryResult } from "../deps.ts";

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
  static formatResults(
    rows: Array<string[]>,
    columns: Column[],
  ): [] | Array<{ [key: string]: string | number | boolean }> {
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

    const client = await BaseModel.connect();
    const dbResult: QueryResult = await client.query(query);
    client.release();
    if (dbResult.rowCount! < 1) {
      return [];
    }

    return BaseModel.formatResults(
      dbResult.rows,
      dbResult.rowDescription.columns,
    );
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
  static async WhereIn(
    table: string,
    data: { values: Array<number | string> | number[]; column: string },
  ): Promise<[] | Array<{ [key: string]: string | number | boolean }>> {
    if (data.values.length <= 0) {
      return [];
    }

    const query = `SELECT * FROM ${table} ` +
      ` WHERE ${data.column} ` +
      ` IN (${data.values.join(",")})`;

    const client = await BaseModel.connect();
    const dbResult: QueryResult = await client.query(query);
    client.release();
    if (dbResult.rowCount! < 1) {
      return [];
    }

    return BaseModel.formatResults(
      dbResult.rows,
      dbResult.rowDescription.columns,
    );
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @description
   *     Prepares a query to insert dynamic data into, similar to what PHP would
   *     do.  The query doesn't have to have "?", if it doesn't, method will
   *     return the original query string
   *
   * @param string query
   *     The db query string. Required.
   * @param string[] [data]
   *     Array of strings to update each placeholder
   *
   * @example
   * const query = "SELECT * FROM users WHERE name = ? AND username = ?"
   * const data = ["Edward", "Ed2020"]; // note first index is for 1st placeholder, 2nd index is for 2nd placeholder and so on
   *
   * @return string
   *     The query with the placeholders replaced with the data
   */
  protected prepareQuery(query: string, data?: Array<string | number>): string {
    if (!data || !data.length) {
      return query;
    }
    // First create an array item for each placeholder
    const occurrences = query.split("?");
    if (occurrences[occurrences.length - 1] === "") { // for when last item is ""
      occurrences.splice(occurrences.length - 1);
    }
    // Replace each item with itself but passed in data instead of the placeholder
    data.forEach((val, i) => {
      occurrences[i] = occurrences[i] + "'" + data[i] + "'";
    });
    // re construct the string
    let prepared = "";
    occurrences.forEach((val, i) => {
      prepared += occurrences[i];
    });
    return prepared;
  }
}
