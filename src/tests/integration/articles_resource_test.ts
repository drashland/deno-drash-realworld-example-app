import { test } from "./utils.ts";

Deno.test("GET /articles", async (t) => {
  await test(t, "Responds with 200 and all articles", () => {
    // TODO(any) Assert response
  });
});
Deno.test("GET /article/:id", async (t) => {
  await test(
    t,
    "Responds with 200 on valid id and returns the article",
    () => {
      // TODO(any) Assert response
    },
  );
});
Deno.test("POST /articles/:id/favorite", async (t) => {
  await test(
    t,
    "Responds with 200 and removes the favorite on the article",
    () => {
      // TODO(any) Assert the response data, and data was saved into the db
    },
  );
});
Deno.test("POST /articles", async (t) => {
  await test(
    t,
    "Responds with 200 on valid post and creates the article",
    () => {
      // TODO(any) Assert the response data, and data was saved into the db
    },
  );
});
Deno.test("PUT /articles/:id", async (t) => {
  await test(t, "Responds with 200 on successfully updating an article", () => {
    // TODO(any) Assert the response data, and data was saved into the db
  });
});
