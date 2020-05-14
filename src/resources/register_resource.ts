import { Drash } from "../deps.ts"

class RegisterResource extends Drash.Http.Resource {

    static paths = [
        "/register",
    ];

    static middleware: {
        before_request: [
            'LogMiddleware'
        ]
    }

    public GET() {
        this.response.body = this.response.render('/register.html', { title: 'Register'})
        return this.response;
    }

    public POST() {

    }
}

export default RegisterResource