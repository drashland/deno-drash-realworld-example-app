import { Rhum } from "../deps.ts";
import { clearTestUsers, createServerObject, createTestUser } from "./utils.ts";

Rhum.testPlan("integration/users_login_resource_test.ts", () => {
  Rhum.testSuite("POST /users/login", () => {
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 200 if the user is already logged and `action` is to check", () => {
    //   // TODO(any Assert response status and body
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 401 if user is not logged but `action` is to check", () => {
    //   // TODO(any Assert response status and body
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 if no email was passed in", () => {
    //   // TODO(any Assert response status and body
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 if email is not a valid email", () => {
    //   // TODO(any Assert response status and body
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 if no user was found with passed in email", () => {
    //   // TODO(any Assert response status and body
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 if no password was passed in", () => {
    //   // TODO(any Assert response status and body
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 if request password does not match the users", () => {
    //   // TODO(any Assert response status and body
    // })
    Rhum.testCase("Responds with 200 on a successful POST", async () => {
      const server = createServerObject();
      await server.run({ hostname: "localhost", port: 1447 });

      await createTestUser();

      const res = await fetch("http://localhost:1447/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            email: "test@hotmail.com",
            password: "TestPassword1",
          },
        }),
      });

      const body = await res.json();

      await clearTestUsers();

      server.close();

      Rhum.asserts.assertEquals(res.status, 200);
      // TODO(any) Asserts `body` and assert all the data was correctly saved
    });
  });
});

Rhum.run();
