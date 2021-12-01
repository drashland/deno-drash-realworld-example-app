import { AbstractMigration, Info, ClientPostgreSQL } from "https://deno.land/x/nessie@2.0.4/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
    /** Runs on migrate */
    async up(info: Info): Promise<void> {
        this.client.queryObject(`
            CREATE TABLE sessions (
                id SERIAL PRIMARY KEY,
                user_id integer NOT NULL,
                session_one character varying(255) NOT NULL,
                session_two character varying(255) NOT NULL,
                CONSTRAINT fk_user
                    FOREIGN KEY(user_id)
                        REFERENCES users(id)
            );
        `)
    }

    /** Runs on rollback */
    async down(info: Info): Promise<void> {
    }
}
