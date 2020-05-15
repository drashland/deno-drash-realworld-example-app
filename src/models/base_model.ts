import { PostgresClient } from "../deps.ts";

const dbClient: PostgresClient = new PostgresClient({
    user: "user",
    password: "userpassword",
    database: "realworld",
    host: "realworld_postgres",
    port: "5432"
});

export default abstract class BaseModel {

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - PROPERTIES - ABSTRACT ///////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    /**
     * Properties you wish to keep hidden when pulling db data
     *
     * @type {string[]} hidden
     */
    public abstract hidden: string[];

    /**
     * Primary key of the table
     *
     * @type {string} primary_key
     */
    public abstract primary_key: string

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - METHODS - ABSTRACT //////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    public async abstract validate(data: any): Promise<{ success: boolean, message: string }>

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
     */
    // TODO :: Figure out return type (its format of: [{key: string}]
    private static formatResults (rows: Array<string[]>, columns: any[]) {
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
     * Removes properties from array of objects if the property is hidden on the child class
     *
     * @param {Array<{}>} formattedResults Return value of said method
     *
     */
    // TODO :: Figure out return type (its format of: [{key: string}]
    private checkHidden (formattedResults: any) {
        formattedResults.forEach((result: string, i: number) => {
            if (this.hidden.indexOf(result))
                delete formattedResults.result
        })
        return formattedResults
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
     * const result = userModel.SELECT(UserModel.SELECT_ALL)
     */
    // TODO :: Figure out return type (its format of: [{key: string}]
    public async SELECT(query: string, data: string[]) {
        query = this.prepare(query, data)
        await dbClient.connect()
        let result = await dbClient.query(query);
        result = BaseModel.formatResults(result.rows, result.rowDescription.columns)
        result = this.checkHidden(result)
        await dbClient.end()
        return result;
    }

    /**
     * @description
     * UPDATE query.
     *
     * @param {string} query
     *
     * @example
     * const userModel = new UserModel;
     * const result = userModel.UPDATE(UserModel.UPDATE_ALL)
     */
    // TODO :: analyse what we could return using the query response
    public async UPDATE(query: string) {
        await dbClient.connect()
        let result = await dbClient.query(query);
        await dbClient.end()
        return result;
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
     */
    // TODO :: analyse what we could return using the query response
    public async DELETE(query: string) {
        await dbClient.connect()
        let result = await dbClient.query(query);
        await dbClient.end()
        return result;
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
     * const result = userModel.CREATE(UserModel.CREATE_ONE)
     */
    // TODO :: Add JSDoc, and analyse what we could return using the query response
    public async CREATE(query: string, data: string[]) {
        query = this.prepare(query, data)
        await dbClient.connect()
        let result = await dbClient.query(query);
        await dbClient.end()
        return result;
    }
}