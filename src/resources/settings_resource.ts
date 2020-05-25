import { Drash } from "../deps.ts"

class SettingsResource extends Drash.Http.Resource {

    static paths = [
        "/settings",
    ];

    public GET() {
        this.response.body = this.response.render('/settings.html');
        return this.response;
    }
}

export default SettingsResource;
