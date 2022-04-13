import { Rhum } from "../deps.ts";
import { clearTestUsers, createTestUser } from "./utils.ts";

import { server } from "../../server.ts";

Rhum.testPlan("integration/profiles_resource_test.ts", () => {
  Rhum.testSuite("GET /profiles/:username", () => {
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 422 when no username param", () => {
    //
    // });
    // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
    // Rhum.testCase("Responds with 404 when no user was found", () => {
    //
    // })
    Rhum.testCase("Responds with 200 and the profile when found", async () => {
      const user = await createTestUser();

      const res = await fetch(
        `${server.address}/profiles/${user.username}`,
      );
      const body = await res.json();

      await clearTestUsers();

      Rhum.asserts.assertEquals(res.status, 200);
      Rhum.asserts.assertEquals(body.profile.username, "testUsername");
    });
  });
});

Rhum.run();
