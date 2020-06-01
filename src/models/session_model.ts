import BaseModel from "./base_model.ts";

function createSessionModel(session: any): SessionModel {
  return new SessionModel(
    session.session_one,
    session.session_two,
    session.user_id,
    session.id
  );
}

export class SessionModel extends BaseModel {

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public id: number;
  public user_id: number;
  public session_one: string;
  public session_two: string;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRCUTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param string sessionOne
   * @param string sessionTwo
   * @param number userId
   * @param number id
   */
  constructor(
    sessionOne: string,
    sessionTwo: string,
    userId: number,
    id: number = -1
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

  /**
   * Save this model.
   *
   * @return Promise<SessionModel>
   */
  public async save(): Promise<SessionModel> {
    if (this.id != -1) {
      throw new Error("Session record already exists.");
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
    // (crookse) We ignore this because getUserSession() can return null if the
    // session is not found. However, in this case, it will never be null.
    return SessionModel.getUserSession(this.session_one, this.session_two);
  }

}

export default SessionModel;
