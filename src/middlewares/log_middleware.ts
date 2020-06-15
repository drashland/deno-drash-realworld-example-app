// import { Drash } from "../deps.ts"
//
// const logger = new Drash.CoreLoggers.ConsoleLogger({
//     enabled: true,
//     level: "all",
//     tag_string: "{datetime} | {level} |",
//     tag_string_fns: {
//         datetime() {
//             return new Date().toISOString().replace("T", " ");
//         }
//     }
// });
//
// export default class LogMiddleware extends Drash.Http.Middleware {
//     public run() {
//         if (!this.response) {
//             logger.info(`Request received: ${this.request.method} ${this.request.url}`);
//         }
//         if (this.response) {
//             logger.info(`Response: ${this.response.status_code} ${this.response.getStatusMessage()}`);
//         }
//     }
// }
