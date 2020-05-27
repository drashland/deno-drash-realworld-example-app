import Vue from "vue";
import axios from "axios";
import JwtService from "@/common/jwt_service.js";

export default {
  checkIfUserIsAuthenticated(context) {
    const token = JwtService.getToken();
    if (token) {
      Vue.axios.defaults.headers.common[
        "Authorization"
      ] = `Token ${token}`;
      axios.get("/auth")
        .then(({ data }) => {
          context.commit("setIsAuthenticated", true);
          context.commit("setUser", data.user);
        })
        .catch(() => {
          context.commit("setError", "An error occurred during the authentication process.");
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
        .get("/profiles")
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
    return new Promise((resolve) => {
      axios
        .post("/users/login", {
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
};
