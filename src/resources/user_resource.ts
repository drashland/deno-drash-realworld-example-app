import { Drash, bcrypt } from "../deps.ts";
import UserService from "../services/user_service.ts";
import UserModel from "../models/user_model.ts";

const userModel = new UserModel();

class UserResource extends Drash.Http.Resource {
  static paths = [
    "/user",
  ];

  public GET() {
    this.response.body = UserService.getUserByUsername(
      this.request.getPathParam("username"),
    );
    return this.response;
  }

  public async POST() {
    console.log("Handling UserResource POST.");
    console.log("Updating the user with the following information:");
    let user = this.request.getBodyParam("user");
    console.log(user);
    const userFromDb = await UserService.getUserById(user.id);
    let token = user.token;

    let query = `UPDATE users SET`;

    if (user.username) {
      query += ` username = '${user.username}'`;
    } else {
      this.response.status_code = 422;
      this.response.body = {
        errors: {
          username: ["Username field is required."],
        },
      };
      return this.response;
    }

    if (user.password) {
      const isStrong = userModel.validatePasswordFormat(user.password);
      if (isStrong === false) {
        this.response.status_code = 422;
        this.response.body = {
          errors: {
            password: [
              "Password must contain the following: 8 characters, 1 number and 1 uppercase and lowercase letter.",
            ],
          },
        };
        return this.response;
      }

      const password = await bcrypt.hash(user.password);
      query += `, password = '${password}'`;
    }

    if (user.bio) {
      query += `, bio = '${user.bio}'`;
    } else {
      query += `, bio = ''`;
    }

    if (user.image) {
      query += `, image = '${user.image}'`;
    } else {
      this.response.status_code = 422;
      this.response.body = {
        errors: {
          image: ["Image field is required."],
        },
      };
      return this.response;
    }

    if (user.email) {
      const hasValidFormat = userModel.validateEmailFormat(user.email);
      if (hasValidFormat === false) {
        this.response.status_code = 422;
        this.response.body = {
          errors: {
            email: ["Email must be a valid email address."],
          },
        };
        return this.response;
      }
      if (user.email !== userFromDb.email) {
        const isUnique = await userModel.validateEmailUnique(user.email);
        if (!isUnique) {
          this.response.status_code = 422;
          this.response.body = {
            errors: {
              email: ["Email aready taken."],
            },
          };
          return this.response;
        }
      }
      query += `, email = '${user.email}'`;
    } else {
      this.response.status_code = 422;
      this.response.body = {
        errors: {
          email: ["Email field is required."],
        },
      };
      return this.response;
    }

    query += ` WHERE id = '${user.id}';`;

    console.log("Executing the following query:");
    console.log(query);
    try {
      let result = await userModel.UPDATE(query);
      console.log("Update result:");
      console.log(result);
    } catch (error) {
      this.response.status_code = 500;
      this.response.body = {
        errors: [error.message]
      };
    }

    user = await UserService.getUserByUsername(user.username);
    delete user.password;

    user.token = token;

    this.response.body = {
      user,
    };

    return this.response;
  }
}

export default UserResource;
