import { assertEquals } from "../deps.ts";
import { test } from "./utils.ts";

import { server } from "../../server.ts";

Deno.test("GET /", async (t) => {
  await test(t, "Responds with 200 status", async () => {
    const res = await fetch(server.address);
    await res.text();
    assertEquals(res.status, 200);
  });
});
