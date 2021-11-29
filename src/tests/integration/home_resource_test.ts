import { Rhum } from "../deps.ts";

import { server } from "../../server.ts";

Rhum.testPlan("integration/home_resource_test.ts", () => {
  Rhum.testSuite("GET /", () => {
    Rhum.testCase("Responds with 200 status", async () => {
      const res = await fetch(server.address);
      await res.text();
      Rhum.asserts.assertEquals(res.status, 200);
    });
  });
});

Rhum.run();
