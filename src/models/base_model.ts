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
     * Columns that must be filled before creating or updating a row
     *
     * @type {string[]} fillable
     */
    public abstract required: string[]

    /**
     * Primary key of the table
     *
     * @type {string} primary_key
     */
    public abstract primary_key: string

    /**
     * Validation rules
     *
     * @type {string[]} rules
     */
    public abstract rules: string[]

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - METHODS - ABSTRACT //////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    //

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

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    /**
     * @description
     * SELECT query. Gets results, formats it into an array of key value pairs and
     * strips properties based on the child class' hidden prop
     *
     * @param {string} query
     *
     * @example
     * const userModel = new UserModel;
     * const result = userModel.SELECT(UserModel.SELECT_ALL)
     */
    // TODO :: Figure out return type (its format of: [{key: string}]
    public async SELECT(query: string) {
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
     *
     * @example
     * const userModel = new UserModel;
     * const result = userModel.CREATE(UserModel.CREATE_ONE)
     */
    // TODO :: Add JSDoc, and analyse what we could return using the query response
    public async CREATE(query: string) {
        await dbClient.connect()
        let result = await dbClient.query(query);
        await dbClient.end()
        return result;
    }
}