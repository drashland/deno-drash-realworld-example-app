import { assertEquals } from "../deps.ts";
import { test } from "./utils.ts";

import { server } from "../../server.ts";

Deno.test("POST /users", async (t) => {
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
  await test(t, "Responds with 200 on a successful registration", async () => {
    const res = await fetch(server.address + "/users", {
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
    await res.json();

    // TODO(any) assert user was correctly saved in db, along with the session
    //const user = await UserModel.first({});

    assertEquals(res.status, 200);
    // TODO(any) Assert res `body`
  });
});
