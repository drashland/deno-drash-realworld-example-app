import { Pool } from "../deps.ts";

const dbPool: Pool = new Pool({
    user: "user",
    password: "userpassword",
    database: "realworld",
    hostname: "realworld_postgres",
    port: 5432
}, 100);

export default abstract class BaseModel {

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - PROPERTIES - ABSTRACT ///////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    /**
     * Primary key of the table
     *
     * @type {string} primary_key
     */
    public abstract primary_key: string

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - METHODS - ABSTRACT //////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    public async abstract validate (data: any): Promise<{data: any}>

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    /**
     * @description
     * Uses the data received from the database table and the column names to format
     * the result into key value pairs
     *
     * @param {Array<string[]>} rows An array of the rows from the table, each containing column values
     * @param {any[]} columns Array of objects, each object holding column data. Used the get the column name
     *
     * @example
     * BaseModel.formatResults([[1, 'ed'], [2, 'john']], [{name: 'id', ...}, {name: 'name', ...}]);
     *
     * @return {any[]} Empty array of no db rows, else array of rows as key value pairs
     */
    // TODO :: Figure out return type (its format of: [{key: string}]
    private static formatResults (rows: Array<string[]>, columns: any[]): any[] {
        if (!rows.length)
            return []
        const columnNames: string[] = columns.map(column => {
            return column.name
        })
        let newResult: any = []
        rows.forEach((row, rowIndex) => {
            let rowData: any = {}
            row.forEach((rVal, rIndex) => {
                const columnName: string = columnNames[rIndex]
                rowData[columnName] = row[rIndex]
            })
            newResult.push(rowData)
        })
        return newResult
    }

    /**
     * @description
     * Prepares a query to insert dynamic data into, similar to what PHP would do.
     * The query doesn't have to have "?", if it doesn't, method will return the original query string
     *
     * @param {string}      query The db query string. Required.
     * @param {string[]}    data Array of strings to update each placeholder
     *
     * @example
     * const query = "SELECT * FROM users WHERE name = ? AND username = ?"
     * const data = ["Edward", "Ed2020"]; // note first index is for 1st placeholder, 2nd index is for 2nd placeholder and so on
     *
     * @return {string} The query with the placeholders replaced with the data
     */
    private prepare (query: string, data?: string[]): string {
        if (!data || !data.length)
            return query
        // First create an array item for each placeholder
        let occurrences = query.split('?')
        if (occurrences[occurrences.length - 1] === '') // for when last item is ""
            occurrences.splice(occurrences.length -1)
        // Replace each item with itself but passed in data instead of the placeholder
        data.forEach((val, i) => {
            occurrences[i] = occurrences[i] + "'" + data[i] + "'"
        })
        // re construct the string
        let prepared = ''
        occurrences.forEach((val, i) => {
            prepared += occurrences[i]
        })
        return prepared
    }

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    /**
     * @description
     * SELECT query. Gets results, formats it into an array of key value pairs and
     * strips properties based on the child class' hidden prop
     *
     * @param {string} query
     * @param {string[]} data
     *
     * @example
     * const userModel = new UserModel;
     * const result = userModel.SELECT(UserModel.SELECT_ALL, [1, 'ed'])
     *
     * @return {Promise<any[]|[]>} Array of db row(s) or empty array if no result
     */
    public async SELECT(query: string, data: any[]): Promise<any[]> {
        query = this.prepare(query, data)
        const client = await pool.connect();
        const dbResult = await client.query(query);
        client.release();
        const formattedResult = BaseModel.formatResults(dbResult.rows, dbResult.rowDescription.columns)
        return formattedResult;
    }

    /**
     * @description
     * UPDATE query.
     *
     * @param {string} query
     *
     * @example
     * const userModel = new UserModel;
     * const result = userModel.UPDATE(UserModel.UPDATE_ONE, ["someting"])
     *
     * @return {Promise<boolean|string>}
     */
    public async UPDATE(query: string, data?: any[]): Promise<boolean|string> {
      try {
        query = this.prepare(query, data)
        const client = await pool.connect();
        const dbResult = await client.query(query);
        client.release();
        return true;
      } catch (error) {
        return error.message;
      }
    }

    /**
     * @description
     * DELETE query
     *
     * @param {string} query
     *
     * @example
     * const userModel = new UserModel;
     * const result = userModel.DELETE(UserModel.DELETE_ALL)
     *
     * @return {Promise<boolean|string>}
     */
    public async DELETE(query: string): Promise<boolean|string> {
      try {
        query = this.prepare(query, data)
        const client = await pool.connect();
        const dbResult = await client.query(query);
        client.release();
      } catch (error) {
        return error.message;
      }
    }

    /**
     * @description
     * CREATE query
     *
     * @param {string} query
     * @param {string[]} data
     *
     * @example
     * const userModel = new UserModel;
     * const result = userModel.CREATE(UserModel.CREATE_ONE, ['Ed', 'Password', 'Email'])
     *
     * @return {Promise<boolean|string>}
     */
    public async CREATE(query: string, data: any[]): Promise<boolean|string> {
      try {
        query = this.prepare(query, data)
        const client = await pool.connect();
        const dbResult = await client.query(query);
        client.release();
      } catch (error) {
        return error.message;
      }
    }
}
