# Realworld Drash App Example

* Deno version: v0.41.0
* Drash version: v0.41.1

# How to Run

`docker-compose build && docker-compose up -d`

# Features

## To Add

* Redis
* API container?
* Database
* Auth middleware
* Pages:
    * Register (register resource)
    * Login (login resource)
    * Home (Authed) - displays all users, can delete any user
* User resource
* Web Socket container?

## Already Implemented

* Dockerised
* Middleware: Logging
* Postgres DB (with seeder)
* DB models

## Notes

### Login to postgres container

`psql -U user -P realworld` // pass = userpassword

### Make Data Dump

`docker exec -t realworld_postgres pg_dumpall -c -U user > dump_`date +%d-%m-%Y"_"%H_%M_%S`.sql`