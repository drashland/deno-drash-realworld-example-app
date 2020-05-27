const state = {
  articles: [],
  articles_count: 0,
  errors: {},
  is_authenticated: false,
  is_loading: false,
  profile: {
    image: "https://static.productionready.io/images/smiley-cyrus.jpg"
  },
  tags: [],
  user: null,
};

const getters = {
  articles() {
    return state.articles;
  },

  articles_count() {
    return state.articles_count;
  },

  errors() {
    return state.errors;
  },

  is_authenticated() {
    return state.is_authenticated;
  },

  is_loading() {
    return state.is_loading;
  },

  profile() {
    return state.profile;
  },

  tags() {
    return state.tags;
  },

  user() {
    return state.user;
  },
}

export {
  state,
  getters,
}
