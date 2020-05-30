import { Drash } from "../deps.ts"
// import ArticleService from "../services/article_service.ts";

class ArticleCommentsResource extends Drash.Http.Resource {

  static paths = [
    "/articles/:slug/comments",
  ];

  public GET() {
    this.response.body = [
      {
        "comment": {
          "id": 1,
          "createdAt": "2016-02-18T03:22:56.637Z",
          "updatedAt": "2016-02-18T03:22:56.637Z",
          "body": "It takes a Jacobian",
          "author": {
            "username": "jake",
            "bio": "I work at statefarm",
            "image": "https://i.stack.imgur.com/xHWG8.jpg",
            "following": false
          }
        }
      }
    ];
    return this.response;
  }
}

export default ArticleCommentsResource;
