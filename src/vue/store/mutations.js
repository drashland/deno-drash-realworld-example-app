export default {
  setErrors(state, errors = {}) {
    state.errors = {};
  },

  setIsAuthenticated(state, value = false) {
    state.is_authenticated = value;
  },

  setUser(state, user = null) {
    state.user = user;
  },
};
