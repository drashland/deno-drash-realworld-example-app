import { execute } from "./base_migration.ts";

await execute(`DROP TABLE IF EXISTS public.articles;`);

await execute(`CREATE TABLE public.articles (
  id serial PRIMARY KEY,
  author_id integer NOT NULL,
  title character varying(255) NOT NULL,
  description character varying(255) NOT NULL,
  body character varying(255) NOT NULL,
  slug character varying(255) NOT NULL,
  created_at timestamp without time zone NOT NULL,
  updated_at timestamp without time zone NOT NULL
);`);

await execute(`DROP TABLE IF EXISTS public.articles_favorites;`);

await execute(`CREATE TABLE public.articles_favorites (
  id serial PRIMARY KEY,
  article_id integer NOT NULL,
  user_id integer NOT NULL,
  value boolean NOT NULL
);`);
