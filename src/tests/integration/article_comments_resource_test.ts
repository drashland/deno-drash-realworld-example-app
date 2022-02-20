import { Rhum } from "../deps.ts";
import { ArticleModel } from "../../models/article_model.ts";
import { ArticleCommentsModel } from "../../models/article_comments_model.ts";
import { SessionModel } from "../../models/session_model.ts";

import { server } from "../../server.ts";

Rhum.testPlan("integration/article_comments_resource_test.ts", () => {
  Rhum.testSuite("GET /articles/:id/comments", () => {
    Rhum.testCase(
      "Responds with a 200 status when comments for an article exist",
      async () => {
        // create an article and comment inside the db
        const article = await ArticleModel.factory();
        const comment = await ArticleCommentsModel.factory({
          article_id: article.id,
        });
        // make request
        const res = await fetch(
          `${server.address}/articles/${article.id}/comments`,
        );
        const body = await res.json();

        // clear down db
        await article.delete();
        await comment.delete();

        // assertions
        Rhum.asserts.assertEquals(res.status, 200);
        Rhum.asserts.assertEquals(body.success, true);
        Rhum.asserts.assertEquals(body.data[0].body, "Test Body");
      },
    );
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with a 200 status when no comments for an article exist", async () => {
    //   await server.run({ hostname: "localhost", port: 1447 });
    //
    //   // create an article and comment inside the db
    //   const article = await createTestArticle();
    //
    //   // make request
    //   const res = await fetch("http://localhost:1447/articles/test-article-title/comments");
    //   const body = await res.json();
    //
    //   // clear down db
    //   await clearTestArticles();
    //
    //   // assertions
    //   Rhum.asserts.assertEquals(res.status, 200);
    //   // TODO(any) Assert `body`. It should be something like "No comments were found"
    //
    //   await server.close()
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with a 404 when article does not exist with the id", async () => {
    //   await server.run({ hostname: "localhost", port: 1447 });
    //
    //   // make request
    //   const res = await fetch("http://localhost:1447/articles/i-dont-exist/comments");
    //   const body = await res.json();
    //
    //   // assertions
    //   Rhum.asserts.assertEquals(res.status, 404);
    //   // TODO(any) Assert `body`
    //
    //   await server.close()
    // })
  });
  Rhum.testSuite("POST /articles/:id/comments", () => {
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 404 when no article was found", async () => {
    //   await server.run({ hostname: "localhost", port: 1447 });
    //
    //   // make request
    //   const res = await fetch("http://localhost:1447/articles/i-dont-exist/comments", {
    //     method: "POST"
    //   });
    //   const body = await res.json();
    //
    //   // assertions
    //   Rhum.asserts.assertEquals(res.status, 404);
    //   // TODO(any) Assert `body`
    //
    //   await server.close()
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 when no `comment` in body", async () => {
    //   await server.run({ hostname: "localhost", port: 1447 });
    //
    //   // insert db data
    //   const article = await createTestArticle();
    //
    //   // make request
    //   const res = await fetch(`http://localhost:1447/articles/${article.id}/comments`, {
    //     method: "POST"
    //   });
    //   const body = await res.json();
    //
    //   // clear down db
    //   await clearTestArticles();
    //
    //   // assertions
    //   Rhum.asserts.assertEquals(res.status, 404);
    //   // TODO(any) Assert `body`
    //
    //   await server.close()
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 403 when unauthorised (no user)", async () => {
    //   await server.run({ hostname: "localhost", port: 1447 });
    //
    //   // insert db data
    //   const article = await createTestArticle();
    //
    //   // make request
    //   const res = await fetch(`http://localhost:1447/articles/${article.id}/comments`, {
    //     method: "POST",
    //     body: JSON.stringify({ comment: "some data just to set the comment on body" })
    //   });
    //   const body = await res.json();
    //
    //   // clear down db
    //   await clearTestArticles();
    //
    //   // assertions
    //   Rhum.asserts.assertEquals(res.status, 403);
    //   // TODO(any) Assert `body`
    //
    //   await server.close()
    // });
    Rhum.testCase(
      "Responds with 200 on valid post and saves the comment for the article",
      async () => {
        // insert db data
        const article = await ArticleModel.factory();
        const session = await SessionModel.factory();

        // make request
        const cookie = session.session_one + "|::|" + session.session_two;
        const res = await fetch(
          `${server.address}/articles/${article.id}/comments`,
          {
            method: "POST",
            headers: {
              "Cookie": "drash_sess=" + cookie,
              "Content-Type": "application/json",
            },
            credentials: "same-origin",
            body: JSON.stringify({
              comment: "Hello world!",
            }),
          },
        );
        const body = await res.json();

        const comment = await ArticleCommentsModel.first({});

        // clear down db
        await article.delete();
        await session.delete();
        await comment?.delete();

        // assertions
        Rhum.asserts.assertEquals(res.status, 200);
        Rhum.asserts.assertEquals(body.success, true);
        Rhum.asserts.assertEquals(body.data.body, "Hello world!");
        // TODO :: Assert `comment`
      },
    );
  });
  Rhum.testSuite("DELETE /articles/comments/:id", () => {
    Rhum.testCase(
      "Responds with a 200 status when deleting a existing comment",
      async () => {
        // create an article and comment inside the db
        const article = await ArticleModel.factory();
        const comment = await ArticleCommentsModel.factory({
          article_id: article.id,
        });
        const session = await SessionModel.factory();

        // make request
        const res = await fetch(
          `${server.address}/articles/comment/` + comment.id,
          {
            method: "DELETE",
            credentials: "same-origin",
            headers: {
              "Cookie": "drash_sess=" + session.session_one + "|::|" +
                session.session_two,
            },
          },
        );
        const body = await res.json();

        // clear down db
        await article.delete();
        await session.delete();

        Rhum.asserts.assertEquals(await comment.exists(), true);
        Rhum.asserts.assertEquals(res.status, 200);
        Rhum.asserts.assertEquals(body, {
          success: true,
          message: "Deleted the comment",
        });
      },
    );
    // Rhum.testCase("Responds with 403 when user is not logged in", async () => {
    //   await server.run({ hostname: "localhost", port: 1447 });
    //
    //   // make request
    //   const res = await fetch("http://localhost:1447/articles/comment/" + 1, {
    //     method: "DELETE"
    //   });
    //   const body = await res.json();
    //
    //   // assertions
    //   Rhum.asserts.assertEquals(res.status, 403);
    //   // TODO(any) assert `body`
    //
    //   await server.close()
    // })
    // Rhum.testCase("Responds with 403 if user tries to delete someone else's comment", async () => {
    //   await server.run({ hostname: "localhost", port: 1447 });
    //
    //   // create an article and comment inside the db
    //   const article = await createTestArticle();
    //   const comment = await createTestComment({ article_id: article.id });
    //   // TODO(any) Create session in db
    //
    //   // make request
    //   const res = await fetch("http://localhost:1447/articles/comment/" + comment.id, {
    //     method: "DELETE",
    //     // TODO(any) Add cookie to pass auth, but make sure you are running as a user NOT with id 1 (created with the comment)
    //   });
    //   const body = await res.json();
    //
    //   // clear down db
    //   await clearTestArticles()
    //   await clearTestComments();
    //   // TODO(any) Clear session
    //
    //   // assertions
    //   Rhum.asserts.assertEquals(res.status, 403);
    //   // TODO(edward) assert `body`
    //
    //   await server.close()
    // })
  });
});

Rhum.run();
