import { AbstractMigration, ClientPostgreSQL } from "../../deps.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(): Promise<void> {
    await this.client.queryObject(`
      CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username character varying(50) NOT NULL,
          password character varying(100) NOT NULL,
          email character varying(355) NOT NULL,
          created_on timestamp without time zone default now(),
          last_login timestamp without time zone,
          image character varying DEFAULT 'https://static.productionready.io/images/smiley-cyrus.jpg'::character varying NOT NULL,
          bio character varying(280)
      );
    `);
  }

  /** Runs on rollback */
  async down(): Promise<void> {
    await this.client.queryObject(`
            DROP table users
        `);
  }
}
