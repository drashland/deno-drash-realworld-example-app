import UserModel from "../models/user_model.ts";
const model = new UserModel();

class UserService {
  static async getUserByEmail(email: string) {
    console.log(`Getting user from database by email "${email}".`);
    const user = await model.SELECT(UserModel.SELECT_ALL_BY_EMAIL, [email]);
    if (user && user.length) {
      return user[0];
    }
    return null;
  }

  static async getUserById(id: number) {
    console.log(`Getting user from database by ID "${id}".`);
    const user = await model.SELECT(UserModel.SELECT_ALL_BY_ID, [id]);
    if (user && user.length) {
      return user[0];
    }
    return null;
  }

  static async getUserByUsername(username: string) {
    console.log(`Getting user from database by username "${username}".`);
    const user = await model.SELECT(UserModel.SELECT_ALL_BY_USERNAME, [username]);
    if (user && user.length) {
      return user[0];
    }
    return null;
  }
}

export default UserService;
