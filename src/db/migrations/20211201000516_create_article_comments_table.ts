import { AbstractMigration, ClientPostgreSQL } from "../../deps.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(): Promise<void> {
    await this.client.queryObject(`
      CREATE TABLE article_comments (
          id SERIAL PRIMARY KEY,
          article_id integer NOT NULL REFERENCES articles ON DELETE CASCADE,
          author_id integer NOT NULL REFERENCES users ON DELETE CASCADE,
          body character varying(255) NOT NULL,
          created_at timestamp without time zone NOT NULL default now(),
          updated_at timestamp without time zone
      );
  `);
  }

  /** Runs on rollback */
  async down(): Promise<void> {
    await this.client.queryObject(`
            DROP TABLE article_comments
        `);
  }
}
