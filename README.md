# ![Drash Example App](logo.png)

### Drash codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) spec and API.

This real world example application uses Deno, Drash, Vue, webpack, and docker-compose.

# Realworld Drash App Example

* Deno version: v0.41.0
* Drash version: v0.41.1

# How to Run

`docker-compose build && docker-compose up -d`

Navigate to `localhost:1667`

# Features

- [ ] Docker compose environment
- [ ] Middleware
    - [ ] Logging
    - [ ] Authentication (/home route)
- [ ] User accounts
    - [ ] Postgres DB to hold user accounts with a seeder
    - [ ] Registration
    - [ ] Login
    - [ ] Password hashing
    - [ ] Home page listing all user accounts
- [ ] Redis?
- [ ] API container?
- [ ] Web socket?
- [ ] Database model representations
- [ ] Vue

## Notes

### Login to postgres container

```shell script
$ docker exec -it realworld_postgres bash
$ psql -U user
# \c realworld
# select * from users;
````

### Make Data Dump

`docker exec -t realworld_postgres pg_dumpall -c -U user > postgres_dump.sql`