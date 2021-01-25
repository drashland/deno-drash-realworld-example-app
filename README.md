# ![Drash Example App](logo.png)

### Drash codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) spec and API.

This real world example application uses Deno, Drash, Vue, Webpack, PostgreSQL,
and docker-compose.

# How to Run

```
$ docker-compose build && docker-compose up -d
```

Navigate to `localhost:1667`

# Features

- [x] Docker compose environment
- [x] Logging
- [x] Authentication (/users/login)
- [x] User accounts
  - [x] Postgres DB to hold user accounts with a seeder
  - [x] Registration
  - [x] Login
  - [x] Password hashing
- [ ] Redis?
- [ ] API container?
- [ ] Web socket?
- [x] Database model representations
- [x] Vue (built with webpack using Vue Single File Components)
- [ ] Cypress

# Frontend login

There are a total of 100 users, with each user having the same password. Say we
want to login as user 32:

```
Username: user32
Password: Userpass1
Email: user32@hotmail.com
```

# Built With

- [Docker](https://www.docker.com/) - Containerisation
- [Apache](https://httpd.apache.org/) - Acts as how Apache can be used as a
  proxy server for Drash
- [Deno](https://deno.land) - Javascript and Typescript runtime
- [Drash](https://drash.land/drash) - Web server
- [Vue](https://vuejs.org/) - Frontend framework
- [Webpack](https://webpack.js.org/) - Bundling Vue
- [Postgres](https://github.com/deno-postgres/deno-postgres) - Postgres driver
  for the applications database
- [Bcrypt](https://github.com/jamesbroadberry/deno-bcrypt/tree/master) - Hashing
  and comparing passwords
- [Rhum](https://github.com/drashland/rhum) - Testing framework
- [Dmm](https://github.com/drashland/dmm) - Module Manager for Deno to update
  our dependencies
- [Vue-input](https://www.npmjs.com/package/@johmun/vue-tags-input) - Library
  used to help the display of article tags as 'pills', allowing them to be
  removed and added like a shopping cart
- [Cypress](https://cypress.io/) - Browser testing framework
