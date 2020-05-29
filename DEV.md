# Login to postgres container

```shell script
$ docker exec -it realworld_postgres bash
$ psql -U user
# \c realworld
# select * from users;
````

# Make DB Data Dump
The postgres container uses a dump file to seed the database - this file is at `/.docker/data/`
```
cd /path/to/deno-drash-realworld-example
docker exec -t realworld_postgres pg_dumpall -c -U user > postgres_dump.sql
mv ./postgres_dump.sql ./.docker/data/postgres_dump.sql
```