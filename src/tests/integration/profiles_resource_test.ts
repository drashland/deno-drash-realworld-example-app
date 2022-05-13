import { UserModel } from "../../models/user_model.ts";
import { test } from "./utils.ts";
import { assertEquals } from "../deps.ts";
import { server } from "../../server.ts";

Deno.test("GET /profiles/:username", async (t) => {
  // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
  // Rhum.testCase("Responds with 422 when no username param", () => {
  //
  // });
  // TODO(any) Not completing for the v1 release as it isn't needed, but nice to have
  // Rhum.testCase("Responds with 404 when no user was found", () => {
  //
  // })
  await test(t, "Responds with 200 and the profile when found", async () => {
    const user = await UserModel.factory();

    const res = await fetch(
      `${server.address}/profiles/${user.username}`,
    );
    const body = await res.json();

    assertEquals(res.status, 200);
    assertEquals(body.profile.username, user.username);
  });
});
