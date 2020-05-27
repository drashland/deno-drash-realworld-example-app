import axios from "axios";

export default {
  logIn(context, credentials) {
    return new Promise((resolve) => {
      axios.post("/users/login", { user: credentials })
        .then(({ data }) => {
          context.commit("setIsAuthenticated", true);
          context.commit("setUser", data.user);
          resolve(true);
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
      axios.post("/users", { user: credentials })
        .then(({ data }) => {
          context.commit("setIsAuthenticated", true);
          context.commit("setUser", data.user);
          resolve(data);
        })
        .catch(() => {
          resolve(undefined);
        });
    });
  },
};
