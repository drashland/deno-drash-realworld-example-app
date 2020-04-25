import { Drash } from "../deps.ts"
import {PostgresClient} from "../deps.ts";
import UserModel from "../models/user_model.ts";
//import UserModel from "../models/user_model.ts";

class HomeResource extends Drash.Http.Resource {

    static paths = [
        "/",
        "/home"
    ];

    static middleware: {
        before_request: [
            'LogMiddleware'
        ]
    }

    public async GET() {
        this.response.body = this.response.render('/index.html')
        return this.response;
    }
}

export default HomeResource