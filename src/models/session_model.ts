import BaseModel from "./base_model.ts";
import type { QueryResult } from "../deps.ts";

interface SessionModelEntity {
  session_one: string;
  session_two: string;
  id: number;
  user_id: number;
}

/**
 * @description
 * Creates an instance of the  SessionModel
 *
 * @param SessionModelEntity session
 *
 * @return SessionModelEntity  SessionModel a new instance of the SessionModel with the  properties set
 */
function createSessionModel(session: SessionModelEntity): SessionModel {
  return new SessionModel(
    session.session_one,
    session.session_two,
    session.user_id,
    session.id,
  );
}

export class SessionModel extends BaseModel {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROPERTIES //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @var number
   *
   * Id associated with the database row
   */
  public id: number;

  /**
   * @var number
   *
   * Associated id of the user from users table that holds this session
   */
  public user_id: number;

  /**
   * @var string
   *
   * Value for session one, used with session two for stronger security (both must match instead of just one)
   */
  public session_one: string;

  /**
   * @var string
   *
   * Value for session two, used with session one for stronger security (both must match instead of just one)
   */
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
   * @param number id=-1
   */
  constructor(
    sessionOne: string,
    sessionTwo: string,
    userId: number,
    id: number = -1,
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

  /**
   * @description
   * Get the session row by the passed in session values
   *
   * @param string sessionOne
   * @param string sessionTwo
   *
   * @return Promise<SessionModel> | null
   *     Null if no session was found
   */
  static async getUserSession(
    sessionOne: string,
    sessionTwo: string,
  ): Promise<SessionModel | null> {
    const query = "SELECT * FROM sessions " +
      `WHERE session_one = '${sessionOne}' AND session_two = '${sessionTwo}' ` +
      "LIMIT 1;";
    const client = await BaseModel.connect();
    const dbResult: QueryResult = await client.query(query);
    if (dbResult.rowCount! < 1) {
      return null;
    }
    client.release();
    const sessionResult = BaseModel.formatResults(
      dbResult.rows,
      dbResult.rowDescription.columns,
    );
    const session = sessionResult[0];
    if (sessionResult && sessionResult.length > 0) {
      // (ebebbington) Because we currently dont have a way to assign the entity type to `session` (and it work,
      // as it would error because that type isn't the return value of `formatResults`)
      const sessionEntity: SessionModelEntity = {
        session_one: typeof session.session_one === "string"
          ? session.session_one
          : "",
        session_two: typeof session.session_two === "string"
          ? session.session_two
          : "",
        id: typeof session.id === "number" ? session.id : 0,
        user_id: typeof session.user_id === "number" ? session.user_id : 0,
      };
      return createSessionModel(sessionEntity);
    }
    return null;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Save this model.
   *
   * @return Promise<SessionModel|null> Empty array if the query failed to save
   */
  public async save(): Promise<SessionModel | null> {
    if (this.id != -1) {
      throw new Error("Session record already exists.");
    }

    let query = "INSERT INTO sessions " +
      " (user_id, session_one, session_two)" +
      " VALUES (?, ?, ?);";
    query = this.prepareQuery(
      query,
      [
        String(this.user_id),
        this.session_one,
        this.session_two,
      ],
    );
    const client = await BaseModel.connect();
    const dbResult: QueryResult = await client.query(query);
    client.release();
    if (dbResult.rowCount! < 1) {
      return null;
    }

    // (crookse) We ignore this because getUserSession() can return null if the
    // session is not found. However, in this case, it will never be null.
    return SessionModel.getUserSession(this.session_one, this.session_two);
  }
}

export default SessionModel;
