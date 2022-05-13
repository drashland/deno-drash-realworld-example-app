import {
  AbstractSeed,
  ClientPostgreSQL,
} from "https://deno.land/x/nessie@2.0.4/mod.ts";
import { UserModel } from "../../models/user_model.ts";

export default class extends AbstractSeed<ClientPostgreSQL> {
  /** Runs on seed */
  async run(): Promise<void> {
    let count = 1;
    while (count !== 100) {
      await UserModel.factory({
        username: `user${count}`,
        password:
          "$2a$10$Ha7shP2TNTmTR9tC8xdXg.Vta3w6IaHYnMNOxxfl5EG.cdwVFnTlW",
        email: `user${count}@hotmail.com`,
        image: "https://static.productionready.io/images/smiley-cyrus.jpg",
      });
      count++;
    }
  }
}
