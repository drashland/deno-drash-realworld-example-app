/// <reference types="cypress" />

const faker = require("faker");
const { clear } = require("../../server/db");
const { seed } = require("../../server/db");
const {
  addMatchImageSnapshotPlugin,
} = require('cypress-image-snapshot/plugin');

module.exports = (on, config) => {
  on("task", {
    newUser() {
        return {
          username: faker.name.firstName() + `${Math.round(Math.random(1000) * 1000)}`,
          email: 'test'+`${Math.round(Math.random(1000) * 1000)}`+'@mail.com',
          password: '12345Qwert!',
        };
    },
    newArticle() {
      article = {
        title: faker.lorem.word(),
        description: faker.lorem.words(),
        body: faker.lorem.words(),
        tag: faker.lorem.word()
      };
      return article;
    },
    'db:clear'() {
      clear();

      return null;
    },
    'db:seed'() {
      seed();

      return null;
    }
  });
  addMatchImageSnapshotPlugin(on, config);
};
