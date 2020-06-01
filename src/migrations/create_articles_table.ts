import { execute } from "./base_migration.ts";

const query = `
CREATE TABLE public.articles (
    id serial PRIMARY KEY,
    author_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description character varying(255) NOT NULL,
    body character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);
`

await execute(query);
