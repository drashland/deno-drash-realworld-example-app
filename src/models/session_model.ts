import BaseModel from "./base_model.ts";

export class SessionModel extends BaseModel {

  public id: null|number;
  public user_id: null|number;
  public session_one: string;
  public session_two: string;

  public static SELECT_ONE_BY_USER_ID = "SELECT * FROM sessions WHERE user_id = ? LIMIT 1"
  public static CREATE_ONE = "INSERT INTO sessions (user_id, session_one, session_two) VALUES (?, ?, ?);"

  constructor(
    sessionOne: string,
    sessionTwo: string,
    userId: null|number,
    id: null|number = null
  ) {
    super();
    this.session_one = sessionOne;
    this.session_two = sessionTwo;
    this.user_id = userId;
    this.id = id;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - STATIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  static async getUserSession(
    sessionOne: string,
    sessionTwo: string
  ): Promise<SessionModel|null> {
    const query = "SELECT * FROM sessions "
      + `WHERE session_one = '${sessionOne}' AND session_two = '${sessionTwo}' `
      + "LIMIT 1;";
    const client = await BaseModel.connect();
    const dbResult = await client.query(query);
    client.release();
    const session = BaseModel.formatResults(dbResult.rows, dbResult.rowDescription.columns)
    if (session && session.length > 0) {
      return createSessionModel(session[0]);
    }
    return null;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public async save(): Promise<SessionModel> {
    if (this.id) {
      throw new Error("Record already exists.");
    }

    let query = "INSERT INTO sessions "
      + " (user_id, session_one, session_two)"
      + " VALUES (?, ?, ?);"
    query = this.prepareQuery(
      query,
      [
        String(this.user_id),
        this.session_one,
        this.session_two,
      ]
    );
    const client = await BaseModel.connect();
    await client.query(query);
    client.release();

    // @ts-ignore
    return SessionModel.getUserSession(this.session_one, this.session_two);
  }
  
}

function createSessionModel(session: any): SessionModel {
  return new SessionModel(
    session.session_one,
    session.session_two,
    session.user_id,
    session.id
  );
}

export default SessionModel;
