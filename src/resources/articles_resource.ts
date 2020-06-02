import { Drash } from "../deps.ts"
import { ArticleModel, ArticleEntity } from "../models/article_model.ts";

class ArticlesResource extends Drash.Http.Resource {

  static paths = [
    "/articles",
    "/articles/:slug",
  ];

  public GET() {
    this.response.body = {
      "article": {
        "slug": "how-to-train-your-dragon",
        "title": "How to train your dragon",
        "description": "Ever wonder how?",
        "body": "It takes a Jacobian",
        "tagList": ["dragons", "training"],
        "createdAt": "2016-02-18T03:22:56.637Z",
        "updatedAt": "2016-02-18T03:48:35.824Z",
        "favorited": false,
        "favoritesCount": 0,
        "author": {
          "username": "jake",
          "bio": "I work at statefarm",
          "image": "https://i.stack.imgur.com/xHWG8.jpg",
          "following": false
        }
      }
    };
    return this.response;
  }

  public async POST() {
    const inputArticle: ArticleEntity = this.request.getBodyParam("article");
    let article: ArticleModel = new ArticleModel(
      inputArticle.author_id,
      inputArticle.title,
      inputArticle.description,
      inputArticle.body
    );
    try {
      article = await article.save();
    } catch (error) {
      console.log(error);
    }
    this.response.body = {
      article
    };
    return this.response;
  }
}

export default ArticlesResource;

