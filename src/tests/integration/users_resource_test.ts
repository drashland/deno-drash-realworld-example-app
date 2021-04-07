import { Rhum } from "../deps.ts";
import { clearTestUsers, createServerObject } from "./utils.ts";

const server = createServerObject();

Rhum.testPlan("integration/users_resource_test.ts", () => {
  Rhum.testSuite("POST /users", () => {
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 when no username was passed in to register", () => {
    //   // TODO(any Assert response status and body
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 when no email was passed in to register", () => {
    //   // TODO(any Assert response status and body
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 when no password was passed in to register", () => {
    //   // TODO(any Assert response status and body
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 when email is not valid when passed in to register", () => {
    //   // TODO(any Assert response status and body
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 when email is not unique when passed in to register", () => {
    //   // TODO(any Assert response status and body
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 when password is not strong when passed in to register", ()  => {
    //   // TODO(any Assert response status and body
    // })
    Rhum.testCase(
      "Responds with 200 on a successful registration",
      async () => {
        await server.run({ hostname: "localhost", port: 1447 });

        const res = await fetch("http://localhost:1447/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "testUsername",
            email: "abc@hotmail.com",
            password: "TestPassword1",
          }),
        });
        const body = await res.json();

        // TODO(any) assert user was correctly saved in db, along with the session

        await clearTestUsers("testUsername");

        Rhum.asserts.assertEquals(res.status, 200);
        // TODO(any) Assert `body`

        server.close();
      },
    );
  });
});

Rhum.run();
