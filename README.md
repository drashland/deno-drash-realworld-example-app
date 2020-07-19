# ![Drash Example App](logo.png)

___This respository is still very much under development. Things will change. Things will break. Please take caution when looking/using the code in this repository.__

### Drash codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) spec and API.

This real world example application uses Deno, Drash, Vue, webpack, PostgreSQL, and docker-compose.

Requires:
* Deno v1.1.1
* Drash v1.0.6

# How to Run

```
$ docker-compose build && docker-compose up -d
$ cd src
$ npm install
$ npm run webpack
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
- [ ] Database model representations
- [x] Vue (built with webpack using Vue Single File Components)

# Frontend login

There are a total of 100 users, with each user having the same password. Say we want to login as user 32:

```
Username: user32
Password: Userpass1
Email: user32@hotmail.com
```
