export default {
  setArticle(state, article) {
    state.article = article;
  },

  setError(state, errors) {
    state.errors = errors;
  },

  setIsAuthenticated(state, value) {
    state.is_authenticated = value;
  },

  setProfile(state, profile) {
    state.profile = profile;
  },

  setUser(state, user) {
    state.user = user;
  },
};
