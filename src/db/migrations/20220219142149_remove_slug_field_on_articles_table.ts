import { AbstractMigration, ClientPostgreSQL } from "../../deps.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(): Promise<void> {
    await this.client.queryArray(`ALTER TABLE articles DROP COLUMN slug`);
  }

  /** Runs on rollback */
  async down(): Promise<void> {
    await this.client.queryArray(
      `ALTER TABLE articles ADD COLUMN slug character varying(255) NOT NULL`,
    );
  }
}
