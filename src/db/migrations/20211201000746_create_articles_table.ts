import { AbstractMigration, ClientPostgreSQL } from "../../deps.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(): Promise<void> {
    await this.client.queryObject(`
      CREATE TABLE articles (
          id SERIAL PRIMARY KEY,
          author_id integer NOT NULL,
          title character varying(255) NOT NULL,
          description character varying(255) NOT NULL,
          body character varying(255) NOT NULL,
          slug character varying(255) NOT NULL,
          created_at timestamp without time zone NOT NULL,
          updated_at timestamp without time zone NOT NULL,
          tags character varying(255)
      );
    `);
  }

  /** Runs on rollback */
  async down(): Promise<void> {
    await this.client.queryObject(`
            DROP TABLE articles
        `);
  }
}
