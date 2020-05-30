import Vue from "vue";
import axios from "axios";
import { router } from "../../public/js/_app.js";
import JwtService from "@/common/jwt_service.js";

const userDefault = {
   created_on: null,
   email: null,
   id: null,
   last_login: null,
   password: null,
   username: null,
};

export default {
  checkIfUserIsAuthenticated(context) {
    if (getCookie("drash_sess") && getCookie("drash_sess") != "null") {
      console.log("Handling action: checkIfUserIsAuthenticated");
      axios
        .post("/users/login", {
          action: "check_auth",
          token: getCookie("drash_sess"),
        })
        .then((response) => {
          console.log("User is authenticated.");
          context.dispatch("setUser", response.data.user);
        })
        .catch((error) => {
          console.log("User is not authenticated.");
          console.log(error.response);
          context.dispatch("unsetUser");
        });
      return;
    }

    console.log("User is not authenticated.");
    context.dispatch("unsetUser");
  },

  createArticle({ commit }, article) {
    return new Promise((resolve) => {
      axios
        .post("/articles", {
          article
        })
        .then((response) => {
          resolve(response)
        })
        .catch((error) => {
          resolve(error.response);
        });
    });
  },

  fetchArticle(context, slug) {
    console.log("Handling action: fetchArticle");
    return new Promise((resolve) => {
      axios
        .get(`/articles/${slug}`)
        .then((response) => {
          context.dispatch("setArticle", response.data.article);
          resolve(response);
        })
        .catch((error) => {
          resolve(error.response);
        });
    });
  },

  fetchArticleComments({ commit }, slug) {
    return new Promise((resolve) => {
      axios
        .get(`/articles/${slug}/comments`)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          resolve(error.response);
        });
    });
  },

  fetchArticles({ commit }, params) {
    return new Promise((resolve) => {
      axios
        .get("/articles", {
          params: {
            favorited: params.favorited,
            offset: params.filters,
            tag: params.tag,
          }
        })
        .then(({ data }) => {
          resolve(data)
        })
        .catch(error => {
          resolve(undefined);
        });
    });
  },

  fetchProfile(context, params) {
    console.log("Handling action: fetchProfile");
    return new Promise((resolve) => {
      axios
        .get(`/profiles/${params.username}`)
        .then((response) => {
          console.log("Profile fetched successfully. Setting profile.");
          context.dispatch("setProfile", response.data.profile);
        })
        .catch((response) => {
          console.log("Unsetting profile.");
          context.dispatch("unsetProfile");
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
    return new Promise((resolve) => {
      axios
        .post("/users/login", {
          user: credentials
        })
        .then((response) => {
          console.log("Log in successful.");
          context.dispatch("setUser", response.data.user);
          resolve(true);
        })
        .catch((error) => {
          console.log("Log in unsuccessful.");
          context.dispatch("unsetUser");
          resolve(error.response.data);
        });
    });
  },

  logOut(context) {
    context.dispatch("unsetUser");
  },

  register(context, credentials) {
    return new Promise((resolve) => {
      axios
        .post("/users", {
          email: credentials.email,
          password: credentials.password,
          username: credentials.username,
        })
        .then((response) => {
          console.log("Registration successful.");
          console.log(response);
          context.dispatch("setUser", response.data.user);
          resolve(true);
        })
        .catch((error) => {
          console.log("Registration unsuccessful.");
          resolve(error.response.data);
        });
    });
  },

  setArticle(context, article) {
    context.commit("setArticle", article);
  },

  setProfile(context, profile) {
    context.commit("setProfile", profile);
  },

  setUser(context, user) {
    context.commit("setIsAuthenticated", true);
    context.commit("setUser", user);
    setCookie("drash_sess", user.token, 1);
  },

  unsetArticle(context) {
    context.commit("setArticle", {});
  },

  unsetUser(context) {
    context.commit("setIsAuthenticated", false);
    context.commit("setUser", userDefault);
    setCookie("drash_sess", null)
  },

  unsetProfile(context) {
    context.commit("setProfile", userDefault);
  },

  updateUser(context, user) {
    console.log("Handling action: updateUser");
    return new Promise((resolve) => {
      axios
        .post("/user", {
          user
        })
        .then((response) => {
          console.log("User updated successfuly.");
          context.dispatch("setUser", response.data.user);
          resolve(true);
        })
        .catch((error) => {
          console.log("User not updated.");
          resolve(error.response.data);
        });
    });
  },
};

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
