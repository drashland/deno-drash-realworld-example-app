import { Drash, bcrypt } from "../deps.ts"
import UserModel from "../models/user_model.ts";
import SessionModel from "../models/session_model.ts";
// const test = new SessionModel()
// await test.CREATE(SessionModel.CREATE_ONE, [1, 'sesh 2', 'sesh 3'])

class LoginResource extends Drash.Http.Resource {

    static paths = [
        "/login",
    ];

    // static middleware: {
    //     before_request: [
    //         'LogMiddleware'
    //     ]
    // }

    public async GET() {
        // TODO :: Turn this block into an auth middleware
        const sessionModel = new SessionModel()
        const sessionOne = this.request.getCookie('sessionOne')
        const sessionTwo = this.request.getCookie('sessionTwo')
        if (sessionOne && sessionTwo) {
            const session = await sessionModel.SELECT(SessionModel.SELECT_ONE_BY_SESSION_ONE_AND_TWO, [sessionOne, sessionTwo])
            if (session.length) {
                this.response.body = this.response.render('/index.html', { title: 'Home'})
                return this.response
            }
        }

        this.response.body = this.response.render('/login.html');
        return this.response;
    }

    /**
     * Requires and expects the following in the request body:
     * {
     *     email: string
     *     password: string
     * }
     */
    public async POST() {
        // Gather data
        const email: string = decodeURIComponent(this.request.getBodyParam('email'))
        const password: string = decodeURIComponent(this.request.getBodyParam('password'))
        // Basic validation
        if (!email.trim()) {
            this.response.body = JSON.stringify({ success: false, message: 'Please fill our your email.'})
            return this.response
        }
        if (!password.trim()) {
            this.response.body = JSON.stringify({ success: false, message: 'Please fill our your password.'})
            return this.response
        }
        // Check they exist
        const userModel = new UserModel()
        const user = await userModel.SELECT(UserModel.SELECT_ALL_BY_EMAIL, [email])
        if (!user.length) {
            // TODO :: Add response content type or something for JSON?
            this.response.body = JSON.stringify({ success: false, message: 'No account exists with that email.'})
            return this.response
        }
        //Check the passwords match
        const passwordsMatch = await bcrypt.compare(password, user[0].password);
        if (!passwordsMatch) {
            this.response.body = JSON.stringify({ success: false, message: 'The email or password you entered is incorrect.'})
            return this.response
        }
        // Create session for user
        const sessionModel = new SessionModel()
        const sessionOneValue = await bcrypt.hash('sessionOne2020Drash')
        const sessionTwoValue = await bcrypt.hash('sessionTwo2020Drash')
        await sessionModel.CREATE(SessionModel.CREATE_ONE, [user[0].id, sessionOneValue, sessionTwoValue])

        // Success response
        const expiresDate = new Date();
        expiresDate.setDate(expiresDate.getDate() + 30); // 30 days
        this.response.setCookie({
            name: "sessionOne",
            value: sessionOneValue,
            expires: expiresDate,
            path: "/"
        });
        this.response.setCookie({
            name: "sessionTne",
            value: sessionTwoValue,
            expires: expiresDate,
            path: "/"
        });
        this.response.body = JSON.stringify({success: true, message: 'Successfully created.'})
        return this.response
    }
}

export default LoginResource;
