import { createTestUser } from "../../integration/utils.ts";
import { Rhum } from "../../deps.ts";
import BaseModel from "../../../models/base_model.ts";

Rhum.testPlan("tests/unit/base_model_test.ts", () => {
  Rhum.testSuite("query()", () => {
    Rhum.testCase("Sanitises data", async () => {
      const user = await createTestUser();
      const query = "UPDATE users SET " +
        "username = $1, password = $2, email = $3, bio = $4, image = $5 " +
        `WHERE id = $6;`;
      const args: Array<string | number> = [
        "test username",
        "test password",
        "test email",
        "' WHERE id = '1'; UPDATE users SET username = 'test",
        "test image",
        user.id as number,
      ];
      const dbResult = await BaseModel.query(query, ...args);
      Rhum.asserts.assertEquals(dbResult.rowCount, 1);
      const updatedUser = await BaseModel.query(
        `SELECT * FROM users WHERE id = ${user.id};`,
      );
      Rhum.asserts.assertEquals(updatedUser.rows[0].username, "test username");
      Rhum.asserts.assertEquals(
        updatedUser.rows[0].bio,
        "' WHERE id = '1'; UPDATE users SET username = 'test",
      );
    });
  });
});

Rhum.run();
