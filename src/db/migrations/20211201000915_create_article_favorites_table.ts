import { AbstractMigration, Info, ClientPostgreSQL } from "https://deno.land/x/nessie@2.0.4/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
    /** Runs on migrate */
    async up(info: Info): Promise<void> {
        this.client.queryObject(`
            CREATE TABLE articles_favorites (
                id SERIAL PRIMARY KEY,
                article_id integer NOT NULL,
                user_id integer NOT NULL,
                value boolean NOT NULL
            );
        `)
    }

    /** Runs on rollback */
    async down(info: Info): Promise<void> {
        this.client.queryObject(`
            DROP TABLE article_favorites
        `)
    }
}
