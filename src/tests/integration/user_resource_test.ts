import { Rhum } from "../deps.ts";
import { clearTestUsers, createServerObject, createTestUser } from "./utils.ts";

const server = createServerObject();

Rhum.testPlan("integration/users_resource_test.ts", () => {
  Rhum.testSuite("GET /user/:username", () => {
    Rhum.testCase("Responds with 200 and returns the user", async () => {
      await server.run({ hostname: "localhost", port: 1447 });

      await createTestUser();

      const res = await fetch("http://localhost:1447/user/testUsername");
      const body = await res.json();

      await clearTestUsers();

      Rhum.asserts.assertEquals(res.status, 200);
      // TODO(any) Assert `body`

      server.close();
    });
  });
  Rhum.testSuite("POST /user", () => {
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 404 when no id was passed in with body", () => {
    //
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 when no username was passed in", () => {
    //
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 when no image was passed in", () => {
    //
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 when no email was passed in", () => {
    //
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 when email field is not a valid email", () => {
    //
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 when passed in email does not match users email", () => {
    //
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 when password is not strong", () => {
    //
    // })
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 200 when saving and updating a valid user object", async () => {
    //
    // })
  });
});

Rhum.run();
