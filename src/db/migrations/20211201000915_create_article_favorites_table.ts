import { AbstractMigration, ClientPostgreSQL } from "../../deps.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(): Promise<void> {
    await this.client.queryObject(`
      CREATE TABLE articles_favorites (
          id SERIAL PRIMARY KEY,
          article_id integer NOT NULL REFERENCES articles ON DELETE CASCADE,
          user_id integer NOT NULL REFERENCES users ON DELETE CASCADE
      );
    `);
  }

  /** Runs on rollback */
  async down(): Promise<void> {
    await this.client.queryObject(`
            DROP TABLE articles_favorites
        `);
  }
}
