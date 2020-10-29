import Vue from "vue";
import axios from "axios";
import { router } from "../../public/js/_app.js";
import JwtService from "@/common/jwt_service.js";
import { store } from "../../public/js/_app";

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
    console.log("Checking if the user is authenticated.");
    return new Promise((resolve, reject) => {
      if (getCookie("drash_sess") && getCookie("drash_sess") != "null") {
        axios
          .post("/users/login", {
            action: "check_if_user_is_authenticated",
            token: getCookie("drash_sess"),
          })
          .then(async (response) => {
            console.log("User is authenticated.");
            await context.dispatch("setUser", response.data.user);
            resolve(true);
          })
          .catch((error) => {
            console.log("User has a session, but it's invalid.");
            console.log(error.response);
            context.dispatch("unsetUser");
            resolve(false);
          });
      } else {
        console.log("User is not authenticated.");
        context.dispatch("unsetUser");
        resolve(false);
      }
    });
  },

  createArticle(context, article) {
    console.log("Handling action: createArticle");
    console.log("the article:");
    console.log(article);
    article.author_id = context.getters.user.id;
    return new Promise((resolve) => {
      axios
        .post("/articles", {
          article,
        })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          resolve(error.response);
        });
    });
  },

  createArticleComment(context, params) {
    console.log(`Handling action: createArticleComment (${params.slug})`);
    return new Promise((resolve, reject) => {
      axios
        .post(`/articles/${params.slug}/comments`, {
          comment: params.comment,
        })
        .then(async (response) => {
          const comment = response.data.data;
          context.dispatch("setComment", comment);
          resolve(response);
        })
        .catch((error) => {
          console.error("Create article comment unsuccessful");
          console.error(error);
          reject({ data: { success: false, message: error.message } });
        });
    });
  },

  createArticleTag(context, tag) {
    console.log("Handling action: createArticleTag");
    const tags = context.getters.tags || [];
    tags.push(tag);
    context.commit("setTags", tags);
  },

  deleteArticle(context, data) {
    console.log("Handling action: deleteArticle");
    const slug = data.article_slug;
    return new Promise((resolve) => {
      axios
        .delete("/articles/" + slug)
        .then((response) => {
          if (response.data.success === true) {
            let articles = context.getters.articles;
            articles.forEach((article, i) => {
              if (article.slug === slug) {
                articles.splice(i, 1);
              }
            });
            context.dispatch("setArticles", articles);
            context.dispatch("unsetArticle", {});
            resolve(true);
          } else {
            resolve(response);
          }
        })
        .catch((err) => {
          resolve(err.response);
        });
    });
  },

  deleteArticleTag(context, tag) {
    console.log("Handling action: deleteArticleTag");
    let article = context.getters.article;
    const tags = article.tags;
    const index = tags.indexOf(tag);
    tags.splice(index, 1);
    article.tags = tags;
    context.commit("setArticle", article);
  },

  deleteComment(context, { slug, commentId }) {
    console.log("Handling action: deleteComment");
    console.log(slug, commentId);
    return new Promise((resolve) => {
      axios
        .delete(`/articles/comment/${commentId}`)
        .then(
          ((response) => {
            let comments = [];
            context.getters.comments.forEach((a, i) => {
              if (a.id == commentId) {
                return;
              }
              comments.push(a);
            });
            context.dispatch("setComments", comments);
            resolve(response);
          }),
        )
        .catch((err) => {
          resolve(err.response);
        });
    });
  },

  fetchArticle(context, slug) {
    console.log("Handling action: fetchArticle");
    return new Promise((resolve) => {
      axios
        .get(`/articles/${slug}`, {
          params: {
            user_id: context.getters.user.id,
          },
        })
        .then((response) => {
          const article = response.data.article;
          context.dispatch("setArticle", article);
          resolve(response);
        })
        .catch((error) => {
          resolve(error.response);
        });
    });
  },

  fetchArticleComments({ commit }, slug) {
    console.log("Handling action: fetchArticleComments");
    return new Promise((resolve) => {
      axios
        .get(`/articles/${slug}/comments`)
        .then((response) => {
          commit("setComments", response.data.data);
          resolve(response);
        })
        .catch((error) => {
          resolve(error.response);
        });
    });
  },

  fetchArticles(context, params) {
    return new Promise((resolve) => {
      axios
        .get("/articles", {
          params: {
            author: params.author,
            favorited_by: params.favorited,
            offset: params.filters,
            tag: params.tag,
            user_id: context.getters.user.id,
          },
        })
        .then((response) => {
          context.dispatch("setArticles", response.data.articles);
          resolve(response);
        })
        .catch((error) => {
          resolve(error.response);
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
          console.log(error.response);
          context.dispatch("unsetProfile");
        });
    });
  },

  fetchTags({ commit }) {
    return new Promise((resolve) => {
      axios
        .get("/tags")
        .then(({ data }) => {
          resolve(data);
        })
        .catch((error) => {
          resolve(undefined);
        });
    });
  },

  logIn(context, credentials) {
    console.log("Handling action: logIn");
    return new Promise((resolve) => {
      axios
        .post("/users/login", {
          user: credentials,
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
    console.log("Handling action: setArticle");
    if (article.tags.length > 0) {
      article.tags = article.tags.split(",");
    } else {
      article.tags = [];
    }
    context.commit("setArticle", article);
    let articles = [];
    context.getters.articles.forEach((a, i) => {
      if (a.id === article.id) {
        articles.push(article);
        return;
      }
      articles.push(a);
    });
    context.commit("setArticles", articles);
  },

  setArticles(context, articles) {
    articles.forEach((article) => {
      if (article.tags.length > 0) {
        article.tags = article.tags.split(",");
      } else {
        article.tags = [];
      }
    });
    context.commit("setArticles", articles);
  },

  setComment(context, comment) {
    console.log("Handling action: setComment");
    context.commit("setComment", comment);
    let comments = [];
    comments.push(comment);
    if (!context.getters.comments) {
      context.dispatch("setComments", comments);
    } else {
      context.getters.comments.forEach((a, i) => {
        comments.push(a);
      });
      context.dispatch("setComments", comments);
    }
  },

  setComments(context, comments) {
    context.commit("setComments", comments);
  },

  setProfile(context, profile) {
    context.commit("setProfile", profile);
  },

  setUser(context, user) {
    context.commit("setIsAuthenticated", true);
    context.commit("setUser", user);
    setCookie("drash_sess", user.token, 1);
  },

  toggleArticleFavorite(context, params) {
    console.log(`Handling action: toggleArticleFavorite (${params.action})`);
    return new Promise((resolve) => {
      axios
        .post(`/articles/${params.slug}/favorite`, {
          action: params.action,
          user_id: context.getters.user.id,
        })
        .then(async (response) => {
          console.log("toggleArticleFavorite successful.");
          context.dispatch("setArticle", response.data.article);
        })
        .catch((error) => {
          console.log(error);
          console.log("toggleArticleFavorite unsuccessful.");
          resolve(error.response);
        });
    });
  },

  unsetArticle(context) {
    context.commit("setArticle", {});
  },

  unsetUser(context) {
    context.commit("setIsAuthenticated", false);
    context.commit("setUser", userDefault);
    setCookie("drash_sess", null);
  },

  unsetProfile(context) {
    context.commit("setProfile", userDefault);
  },

  updateArticle(context, article) {
    console.log("Handling action: updateArticle");
    article.author_id = context.getters.user.id;
    console.log("the article to update:");
    console.log(article);
    return new Promise((resolve) => {
      axios
        .put("/articles", {
          article,
        })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          resolve(error.response);
        });
    });
  },

  updateUser(context, user) {
    console.log("Handling action: updateUser");
    return new Promise((resolve) => {
      let params = {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        image: user.image,
        token: user.token,
      };
      if (user.password) {
        params.password = user.password;
      }
      axios
        .post("/user", params)
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
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
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
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
