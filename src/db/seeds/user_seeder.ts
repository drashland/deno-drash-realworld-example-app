import {
  AbstractSeed,
  ClientPostgreSQL,
} from "https://deno.land/x/nessie@2.0.4/mod.ts";

export default class extends AbstractSeed<ClientPostgreSQL> {
  /** Runs on seed */
  async run(): Promise<void> {
    let count = 1;
    while (count !== 100) {
      await this.client.queryObject(`
                INSERT INTO users (
                    username,
                    password,
                    email,
                    created_on,
                    last_login,
                    image,
                    bio
                ) VALUES (
                    user${count},
                    $2a$10$Ha7shP2TNTmTR9tC8xdXg.Vta3w6IaHYnMNOxxfl5EG.cdwVFnTlW,
                    user${count}@hotmail.com,
                    2020-05-14 20:03:56.025651,
                    NULL,
                    https://static.productionready.io/images/smiley-cyrus.jpg,
                    NULL
                )
            `);
      count++;
    }
  }
}
