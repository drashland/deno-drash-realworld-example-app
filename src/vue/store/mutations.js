export default {
  setError(state, errors = {}) {
    state.errors = {};
  },

  setIsAuthenticated(state, value = false) {
    state.is_authenticated = value;
  },

  setProfile(state, profile) {
    state.profile = profile;
  },

  setUser(state, user) {
    state.user = user;
  },
};
