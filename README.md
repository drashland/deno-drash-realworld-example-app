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
- [ ] Postgres Database to hold user accounts with a db seeder
- [ ] Registration of a new user account
- [ ] Login of a user account
- [ ] Home page for a list all of users
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

`docker exec -t realworld_postgres pg_dumpall -c -U user > dump_`date +%d-%m-%Y"_"%H_%M_%S`.sql`