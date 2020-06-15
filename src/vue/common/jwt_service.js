const ID_TOKEN_KEY = "id_token";

export const destroyToken = () => {
  window.localStorage.removeItem(ID_TOKEN_KEY);
};

export const getToken = () => {
  return window.localStorage.getItem(ID_TOKEN_KEY);
};

export const saveToken = (token) => {
  window.localStorage.setItem(ID_TOKEN_KEY, token);
};

export default {
  destroyToken,
  getToken,
  saveToken,
};
