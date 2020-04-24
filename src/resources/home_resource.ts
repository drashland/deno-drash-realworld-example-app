import { Drash } from "../deps.ts"

class HomeResource extends Drash.Http.Resource {

    static paths = [
        "/",
        "/home"
    ];

    public GET() {
        this.response.body = 'Hello World!';
        return this.response;
    }
}

export default HomeResource