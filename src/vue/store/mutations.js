export default {
  setArticle(state, article) {
    state.article = article;
  },

  setArticles(state, articles) {
    state.articles = articles;
  },

  setComment(state, comment) {
    state.comment = comment
  },

  setComments(state, comments) {
    state.comments = comments
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
