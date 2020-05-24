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

### Fontend login

There are a total of 100 users, with each user having the same password. Say we want to login as user 32:

```
Username: user32
Password: Userpass1
Email: user32@hotmail.com
```

### Login to postgres container

```shell script
$ docker exec -it realworld_postgres bash
$ psql -U user
# \c realworld
# select * from users;
````

### Make Data Dump

`docker exec -t realworld_postgres pg_dumpall -c -U user > postgres_dump.sql`