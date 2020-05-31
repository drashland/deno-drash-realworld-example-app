import BaseModel from "./base_model.ts";

export class SessionModel extends BaseModel {

  public id: null|number;
  public user_id: null|number;
  public session_one: string;
  public session_two: string;

  public static SELECT_ONE_BY_USER_ID = "SELECT * FROM sessions WHERE user_id = ? LIMIT 1"
  public static CREATE_ONE = "INSERT INTO sessions (user_id, session_one, session_two) VALUES (?, ?, ?);"

  constructor(
    userId: null|number,
    sessionOne: string,
    sessionTwo: string,
    id: null|number = null
  ) {
    super();
    this.id = id;
    this.user_id = userId;
    this.session_one = sessionOne;
    this.session_two = sessionTwo;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  static async getUserSession(sessionOne: string, sessionTwo: string): Promise<SessionModel|null> {
    const query = `SELECT * FROM sessions WHERE session_one = ${sessionOne} AND session_two = ${sessionTwo} LIMIT 1`;
    const client = await BaseModel.connect();
    const dbResult = await client.query(query);
    client.release();
    const session = BaseModel.formatResults(dbResult.rows, dbResult.rowDescription.columns)
    if (session && session.length > 0) {
      return createSessionModel(session[0]);
    }
    return null;
  }

  public async save(): Promise<void> {
    if (this.id) {
      throw new Error("Record already exists.");
    }

    let query = "INSERT INTO sessions "
      + " (session_one, session_two, user_id)"
      + " VALUES (?, ?, ?);"
    query = this.prepareQuery(
      query,
      [
        this.session_one,
        this.session_two,
        String(this.user_id)
      ]
    );
    console.log(query);
    const client = await BaseModel.connect();
    // await client.query(query);
    client.release();
    return;
  }
  
}

function createSessionModel(session: any): SessionModel {
  return new SessionModel(
    session.sessionOne,
    session.sessionTwo,
    session.user_id,
  );
}

export default SessionModel;
