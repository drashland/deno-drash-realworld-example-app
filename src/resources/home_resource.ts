import { Drash } from "../deps.ts"
import UserModel from "../models/user_model.ts";

class HomeResource extends Drash.Http.Resource {

    static paths = [
        "/",
        "/home"
    ];

    // static middleware: {
    //     before_request: [
    //         'LogMiddleware'
    //     ]
    // }

    public async GET() {
        const userModel = new UserModel()
        const users = await userModel.SELECT(UserModel.SELECT_ALL, [])
        console.log(users)
        this.response.body = this.response.render('/index.html', { title: 'Home', users: users })
        return this.response;
    }
}

export default HomeResource