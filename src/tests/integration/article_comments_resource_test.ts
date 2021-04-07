import {
  clearTestArticles,
  clearTestComments,
  clearTestSessions,
  createServerObject,
  createTestArticle,
  createTestComment,
  createTestSession,
} from "./utils.ts";
import { Rhum } from "../deps.ts";

const server = createServerObject();

Rhum.testPlan("integration/article_comments_resource_test.ts", () => {
  Rhum.testSuite("GET /articles/:slug/comments", () => {
    Rhum.testCase(
      "Responds with a 200 status when comments for an article exist",
      async () => {
        await server.run({ hostname: "localhost", port: 1447 });

        // create an article and comment inside the db
        const article = await createTestArticle();
        const id = typeof article.id === "boolean" ? 0 : Number(article.id);
        if (!id) {
          throw new Error(
            "article.id should be defined, maybe you query to add an article screwed up somewhere",
          );
        }
        await createTestComment({ article_id: id });

        // make request
        const res = await fetch(
          "http://localhost:1447/articles/test-article-title/comments",
        );
        const body = await res.json();

        // clear down db
        await clearTestArticles();
        await clearTestComments();

        // assertions
        Rhum.asserts.assertEquals(res.status, 200);
        Rhum.asserts.assertEquals(body.success, true);
        Rhum.asserts.assertEquals(body.data[0].body, "Test Body");
        Rhum.asserts.assertEquals(
          body.data[0].author_username,
          "Test Username",
        );

        server.close();
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
    // Rhum.testCase("Responds with a 404 when article does not exist with the slug", async () => {
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
  Rhum.testSuite("POST /articles/:slug/comments", () => {
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
    //   const res = await fetch(`http://localhost:1447/articles/${article.slug}/comments`, {
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
    //   const res = await fetch(`http://localhost:1447/articles/${article.slug}/comments`, {
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
        await server.run({ hostname: "localhost", port: 1447 });

        // insert db data
        const article = await createTestArticle();
        const session = await createTestSession();

        // make request
        const cookie = session.session_one + "|::|" + session.session_two;
        const res = await fetch(
          `http://localhost:1447/articles/${article.slug}/comments`,
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

        // clear down db
        await clearTestArticles();
        await clearTestComments();
        await clearTestSessions();

        // assertions
        Rhum.asserts.assertEquals(res.status, 200);
        Rhum.asserts.assertEquals(body.success, true);
        Rhum.asserts.assertEquals(body.data.body, "Hello world!");

        await server.close();
      },
    );
  });
  Rhum.testSuite("DELETE /articles/comments/:id", () => {
    Rhum.testCase(
      "Responds with a 200 status when deleting a existing comment",
      async () => {
        await server.run({ hostname: "localhost", port: 1447 });

        // create an article and comment inside the db
        const article = await createTestArticle();
        const id = typeof article.id === "boolean" ? 0 : Number(article.id);
        if (!id) {
          throw new Error(
            "article.id should be defined, maybe you query to add an article screwed up somewhere",
          );
        }
        const comment = await createTestComment({ article_id: id });
        const session = await createTestSession();

        // make request
        const res = await fetch(
          "http://localhost:1447/articles/comment/" + comment.id,
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

        // TODO(any) Assert comment in the db was deleted

        // clear down db
        await clearTestArticles();
        await clearTestComments();

        // assertions
        Rhum.asserts.assertEquals(res.status, 200);
        Rhum.asserts.assertEquals(body, {
          success: true,
          message: "Deleted the comment",
        });

        await server.close();
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
