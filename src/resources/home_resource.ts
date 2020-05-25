import { Drash } from "../deps.ts"

class HomeResource extends Drash.Http.Resource {

    static paths = [
        "/",
    ];

    // static middleware: {
    //     before_request: [
    //         'LogMiddleware'
    //     ]
    // }

    public async GET() {
        this.response.body = this.response.render('/home.html');
        return this.response;
    }
}

export default HomeResource;
