# Contents

* [Login to Postgres Container](#login-to-postgres-container)
* [Make a DB Data Dump](#make-a-db-data-dump-update-the-db)
* [Creating a Database](#creating-a-database)
* [Updating Deno](#updating-deno)

# Login to Postgres Container

```shell script
$ docker exec -it realworld_postgres bash
$ psql -U user
# \c realworld
# select * from users;
````

# Make a DB Data Dump (Update the DB)
The postgres container uses a dump file to seed the database - this file is at `/.docker/data/`

Make your changes to the database if needed by directly modifying it inside of the `psql` shell
```
$ cd /path/to/deno-drash-realworld-example
$ docker exec -t realworld_postgres pg_dumpall -c -U user > postgres_dump.sql
$ mv ./postgres_dump.sql ./.docker/data/postgres_dump.sql
```
Remember to commit this file

# Creating a Database

Example query from the CLI:

```
CREATE TABLE article_comments (
  id SERIAL PRIMARY KEY,
  article_id integer NOT NULL REFERENCES articles(id),
  comment VARCHAR (255),
  created_at timestamp without time zone NOT NULL,
  updated_at timestamp without time zone NOT NULL
);
```

# Updating Deno

* Update the version the Drash container uses in `/.docker/drash.dockerfile`

* Update the Deno-specific dependencies in `deps.ts`

* Update 3rd part dependencies in `deps.ts` - Be mindful that these might not have been updated (using deprecated or old incorrect syntax), meaning we cannot update Deno

* Down, re-build and start the containers to check for any errors.

* Run tests