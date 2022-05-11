import { assertEquals } from "../deps.ts";
import { UserModel } from "../../models/user_model.ts";
import { server } from "../../server.ts";
import { bcrypt } from "../../deps.ts";
import { test } from "./utils.ts";

Deno.test("POST /users/login", async (t) => {
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
  await test(t, "Responds with 200 on a successful POST", async () => {
    const user = await UserModel.factory({
      password: await bcrypt.hash("TestPassword1"),
    });

    const res = await fetch(server.address + "/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          email: user.email,
          password: "TestPassword1",
        },
      }),
    });

    await res.json();

    assertEquals(res.status, 200);
  });
  // TODO(any) Asserts `body` and assert all the data was correctly saved
});
