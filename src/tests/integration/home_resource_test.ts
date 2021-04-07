import { Rhum } from "../deps.ts";
import { createServerObject } from "./utils.ts";

const server = createServerObject();

Rhum.testPlan("integration/home_resource_test.ts", () => {
  Rhum.testSuite("GET /", () => {
    Rhum.testCase("Responds with 200 status", async () => {
      await server.run({ hostname: "localhost", port: 1447 });
      const res = await fetch("http://localhost:1447");
      const text = await res.text();
      Rhum.asserts.assertEquals(res.status, 200);
      server.close();
    });
  });
});

Rhum.run();
