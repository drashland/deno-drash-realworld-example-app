# Login to Postgres Container

```shell script
$ sudo docker exec -it realworld_postgres bash
$ psql -U user
# \c realworld
# select * from users;
```

Or:

1. Ubuntu setup:

   ```shell script
   $ curl -o ~/.psqlrc https://raw.githubusercontent.com/mate-academy/fed/master/mate-scripts/config-files/.psqlrc
   $ sudo apt update
   $ sudo apt install postgresql postgresql-contrib
   
   $ make db
   password: userpassword
   # select * from users;
   ```

1. macOS setup:

   ```shell script
   $ curl -o ~/.psqlrc https://raw.githubusercontent.com/mate-academy/fed/master/mate-scripts/config-files/.psqlrc
   $ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   $ brew install postgresql
   
   $ make db
   password: userpassword
   # select * from users;
   ```

## Problems in Vue

### `article.tags` returns as `["""]`

When sent down from the server, the `article.tags` property is `""`. But when
vue gets it from the `axios` response, the property is `[""]`. This seems to be
a problem with vue, and to combat it, we have added the following checks into
the tag components: `v-if="tags.length !== 1 && !!tags[0]"`.
