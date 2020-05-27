import Vue from "vue";
import axios from "axios";
import { router } from "../../public/js/_app.js";
import JwtService from "@/common/jwt_service.js";

export default {
  checkIfUserIsAuthenticated(context) {
    if (context.getters.user && context.getters.user.email) {
      axios
        .post("/users/login", {
          user: {
            email: context.getters.user.email
          }
        })
        .then((response) => {
          context.dispatch("setUser", response.data.user);
        })
        .catch((response) => {
          console.log(response.data);
          context.dispatch("logOut");
        });
      return;
    }

    context.dispatch("logOut");
  },

  fetchArticles({ commit }, offset) {
    return new Promise((resolve) => {
      axios
        .get("/articles", {
          offset: offset
        })
        .then(({ data }) => {
          resolve(data)
        })
        .catch(error => {
          resolve(undefined);
        });
    });
  },

  fetchProfile({ commit }, params) {
    console.log(params);
    return new Promise((resolve) => {
      axios
        .get(`/profiles/${params.username}`)
        .then(({ data }) => {
          resolve(data)
        })
        .catch(error => {
          resolve(undefined);
        });
    });
  },

  fetchTags({ commit }) {
    return new Promise((resolve) => {
      axios
        .get("/tags")
        .then(({ data }) => {
          resolve(data)
        })
        .catch(error => {
          resolve(undefined);
        });
    });
  },

  logIn(context, credentials) {
    console.log("Handling action: logIn");
    axios
      .post("/users/login", {
        user: credentials
      })
      .then((response) => {
        console.log(response);
        context.dispatch("setUser", response.data.user);
      })
      .catch((response) => {
        console.log(response);
        context.dispatch("unsetUser");
      });
  },

  logOut(context) {
    context.commit("setIsAuthenticated", false);
    context.commit("setUser", null);
  },

  register(context, credentials) {
    return new Promise((resolve) => {
      axios
        .post("/users", {
          user: credentials
        })
        .then(({ data }) => {
          resolve(data);
        })
        .catch(() => {
          resolve(undefined);
        });
    });
  },

  setUser(context, user) {
    context.commit("setIsAuthenticated", true);
    context.commit("setUser", user);
  },

  unsetUser(context) {
    context.commit("setIsAuthenticated", false);
    context.commit("setUser", null);
  }
};
