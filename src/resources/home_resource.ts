import { Drash } from "../deps.ts"

class HomeResource extends Drash.Http.Resource {

    static paths = [
        "/",
        "/home"
    ];

    public GET() {
        // TODO :: Render app vue
        this.response.body = this.response.render('/index.html')
        return this.response;
    }
}

export default HomeResource