# ![Drash Example App](logo.png)

This real world example application uses Deno, Drash, Vue, Webpack, PostgreSQL,
and docker-compose.

Drash codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) spec and API

## How to Run

1. x86 chips

    ```bash
    $ sudo docker-compose build && sudo docker-compose up
    ```

1. Apple silicon chips (M1, M2)

    ```bash
    $ docker-compose -f docker-compose.m1.yml build && docker-compose -f docker-compose.m1.yml up
    ```

Navigate to [http://localhost:1667](http://localhost:1667)

## Run with `make` commands

Also, you can run the project with `Makefile` ([Unbuntu](https://www.unixmen.com/install-ubuntu-make-on-ubuntu-15-04/)), ([Windows](https://stackoverflow.com/questions/32127524/how-to-install-and-use-make-in-windows)) commands:

```bash
  $ make up
  $ make up-m1
```

## Frontend login

There are a total of 100 users, with each user having the same password. Say we
want to login as user 32:

```
Username: user32
Password: Userpass1
Email: user32@hotmail.com
```

## Built With

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
