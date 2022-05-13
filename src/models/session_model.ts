import { UserModel } from "./user_model.ts";
import { Model } from "../deps.ts";

interface SessionModelEntity {
  session_one: string;
  session_two: string;
  id: number;
  user_id: number;
}

export class SessionModel extends Model {
  /**
   * @var number
   *
   * Id associated with the database row
   */
  public id = 0;

  /**
   * @var number
   *
   * Associated id of the user from users table that holds this session
   */
  public user_id = 0;

  /**
   * @var string
   *
   * Value for session one, used with session two for stronger security (both must match instead of just one)
   */
  public session_one = "";

  /**
   * @var string
   *
   * Value for session two, used with session one for stronger security (both must match instead of just one)
   */
  public session_two = "";

  public tablename = "sessions";

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public async delete() {
    const user = await UserModel.where(
      "id",
      this.user_id,
    ).first();
    await user?.delete();
    await super.delete();
  }

  public async user(): Promise<UserModel | null> {
    return await UserModel.where(
      "id",
      this.user_id,
    ).first();
  }

  public async factoryDefaults(params: Partial<SessionModelEntity> = {}) {
    return {
      user_id: params.user_id ?? (await UserModel.factory()).id,
      session_one: params.session_one ?? "sesh_1",
      session_two: params.session_two ?? "sesh_2",
    };
  }
}

export default SessionModel;
