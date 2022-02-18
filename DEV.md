# Contents

- [Login to Postgres Container](#login-to-postgres-container)
- [Make a DB Data Dump](#make-a-db-data-dump-update-the-db)
- [Creating a Database](#creating-a-database)
- [Updating Deno](#updating-deno)

# Login to Postgres Container

```shell script
$ docker exec -it realworld_postgres bash
$ psql -U user
# \c realworld
# select * from users;
```

# Problems in Vue

## `article.tags` returns as `["""]`

When sent down from the server, the `article.tags` property is `""`. But when
vue gets it from the `axios` response, the property is `[""]`. This seems to be
a problem with vue, and to combat it, we have added the following checks into
the tag components: `v-if="tags.length !== 1 && !!tags[0]"`.
