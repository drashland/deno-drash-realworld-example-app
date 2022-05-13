import { AbstractMigration, ClientPostgreSQL } from "../../deps.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(): Promise<void> {
    await this.client.queryObject(`
      CREATE TABLE sessions (
          id SERIAL PRIMARY KEY,
          user_id integer NOT NULL REFERENCES users ON DELETE CASCADE,
          session_one character varying(255) NOT NULL,
          session_two character varying(255) NOT NULL,
          CONSTRAINT fk_user
              FOREIGN KEY(user_id)
                  REFERENCES users(id)
      );
    `);
  }

  /** Runs on rollback */
  async down(): Promise<void> {
    await this.client.queryArray(`DROP TABLE sessions`);
  }
}
