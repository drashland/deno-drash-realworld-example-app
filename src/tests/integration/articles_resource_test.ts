import { Rhum } from "../deps.ts";

Rhum.testPlan("integration/articles_resource_test.ts", () => {
  Rhum.testSuite("GET /articles", () => {
    Rhum.testCase("Responds with 200 and all articles", () => {
      // TODO(any) Assert response
    });
  });
  Rhum.testSuite("GET /article/:id", () => {
    Rhum.testCase(
      "Responds with 200 on valid id and returns the article",
      () => {
        // TODO(any) Assert response
      },
    );
  });
  Rhum.testSuite("POST /articles/:id/favorite", () => {
    Rhum.testCase(
      "Responds with 200 and removes the favorite on the article",
      () => {
        // TODO(any) Assert the response data, and data was saved into the db
      },
    );
  });
  Rhum.testSuite("POST /articles", () => {
    Rhum.testCase(
      "Responds with 200 on valid post and creates the article",
      () => {
        // TODO(any) Assert the response data, and data was saved into the db
      },
    );
  });
  Rhum.testSuite("PUT /articles/:id", () => {
    Rhum.testSuite(
      "Responds with 200 on successfully updating an article",
      () => {
        // TODO(any) Assert the response data, and data was saved into the db
      },
    );
  });
});

Rhum.run();
