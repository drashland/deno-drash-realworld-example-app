import { reactive } from "./components/deps.ts";
import type { TReactiveProperties } from "./components/deps.ts";

interface Errors {
  [key: string]: string[];
}

export type Comment = {
  id: number;
  author_image: string;
  author_username: string;
  updated_at: string;
  author_id: number;
  body: string;
  created_at: string;
  article_id: number;
  tablename: string;
};
export type User = {
  created_on: string;
  email: string;
  id: number;
  last_login: string;
  password: string;
  username: string;
  token: string;
  following: boolean;
  image: string;
  bio: string;
  tablename: string;
};
export const userDefault: User = {
  created_on: "",
  email: "",
  id: 0,
  last_login: "",
  password: "",
  username: "",
  token: "",
  following: false,
  image: "",
  bio: "",
  tablename: "",
};

export type Article = {
  title: string;
  description: string;
  body: string;
  tags: [];
  author_id: number;
  tablename: string;
  created_at: string;
  id: number;
  updated_at: string;
  author: User;
  favoritesCount: number;
  favorited: boolean;
  following: boolean;
};
export const defaultArticle: Article = {
  title: "",
  description: "",
  body: "",
  tags: [],
  author_id: 0,
  tablename: "",
  created_at: "",
  id: 0,
  updated_at: "",
  following: false,
  favorited: false,
  favoritesCount: 0,
  author: userDefault,
};
export const authUser = reactive<User>(userDefault);
export const isAuthenticated = reactive(false);

const setCookie = (cname: string, cvalue: string | null) => {
  const d = new Date();
  d.setTime(d.getTime() + (1 * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

export const setUser = (newUser: User) => {
  updateReactiveObject(authUser, newUser);
  isAuthenticated.value = true;
  setCookie("drash_sess", authUser.token.value);
};

export const fetchTags = async () => {
  const res = await fetch("/tags");
  if (res.status !== 200) {
    return [];
  }
  return await res.json() as string[];
};

export const fetchArticles = async (params: {
  author?: string;
  favorited_by?: string;
  offset?: string;
  tag?: string;
  user_id?: string;
}) => {
  const query = new URLSearchParams();
  if (params.author) {
    query.set("author", params.author);
  }
  if (params.favorited_by) {
    query.set("favorited_by", params.favorited_by);
  }
  if (params.offset) {
    query.set("offset", params.offset);
  }
  if (params.tag) {
    query.set("tag", params.tag);
  }
  if (params.user_id) {
    query.set("user_id", params.user_id);
  }
  const res = await fetch("/articles?" + query);
  if (res.status !== 200) {
    return {
      articles: [],
    };
  }
  const json = await res.json();
  console.log("Dispatching setArticles", json.articles);
  return json as {
    articles: Article[];
  };
};

export const toggleArticleFavorite = async (params: {
  action: string;
  id: number;
}) => {
  console.log(`Handling action: toggleArticleFavorite (${params.action})`);
  const res = await fetch(`/articles/${params.id}/favorite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: params.action,
      user_id: authUser.id.value,
    }),
  });
  if (res.status !== 200) {
    console.log("toggleArticleFavorite unsuccessful.");
    return res;
  }
  console.log("toggleArticleFavorite successful.");
};

export const deleteArticle = async (data: {
  article_id: number;
}) => {
  console.log("Handling action: deleteArticle");
  const id = data.article_id;
  const res = await fetch("/api/articles/" + id, {
    method: "DELETE",
  });
  if (res.status !== 200) {
    return res;
  }
  const response = {
    data: await res.json(),
  };
  if (response.data.success === true) {
    return true;
  } else {
    return response;
  }
};

export const fetchProfile = async (params: {
  username: string;
}) => {
  console.log("Handling action: fetchProfile");
  const res = await fetch(`/api/profiles/${params.username}`);
  if (res.status !== 200) {
    console.log("Unsetting profile.");
    return;
  }
  console.log("Profile fetched successfully. Setting profile.");
  const json = await res.json();
  return json.profile as User;
};

const unsetUser = () => {
  updateReactiveObject(authUser, userDefault);
  isAuthenticated.value = false;
  setCookie("drash_sess", null);
};

export const logIn = async (credentials: {
  email: string;
  password: string;
}) => {
  console.log("Handling action: logIn");
  const res = await fetch("/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user: credentials,
    }),
  });
  const json = await res.json();
  if (res.status !== 200) {
    console.log("Log in unsuccessful.");
    return json.errors as Errors;
  }
  console.log("Log in successful.");
  return true;
};

export const register = async (credentials: {
  email: string;
  username: string;
  password: string;
}) => {
  const response = await fetch("/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  const json = await response.json();
  if (response.status !== 200) {
    return json as {
      errors: Errors;
    };
  }
  console.log("Registration successful.");
  console.log(response);
  setUser({
    ...json.user,
    token: json.token,
  });
  return true;
};

export const logOut = () => {
  unsetUser();
};

export const updateUser = async (user: TReactiveProperties<User>) => {
  console.log("Handling action: updateUser");
  const params = {
    id: user.id.value,
    username: user.username.value,
    email: user.email.value,
    bio: user.bio.value,
    image: user.image.value,
    token: user.token.value,
    password: "",
  };
  if (user.password) {
    params.password = user.password.value;
  }
  const res = await fetch("/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (res.status !== 200) {
    console.log("User not updated.");
    return json as {
      user: false;
      errors: Errors;
    };
  }
  console.log("User updated successfuly.");
  updateReactiveObject(user, json.user);
  return json as {
    errors: false;
    user: User;
  };
};

function getCookie(cname: string) {
  const row = document.cookie.split("; ")
    .find((row) => row.startsWith(cname));
  if (!row) {
    return "";
  }
  return row.split("=")[1];
}

export function updateReactiveObject(
  // deno-lint-ignore no-explicit-any
  initial: TReactiveProperties<Record<string, any>>,
  // deno-lint-ignore no-explicit-any
  newData: Record<string, any>,
) {
  Object.entries(newData).forEach(([key, value]) => {
    if (typeof value === "object" && !Array.isArray(value) && value) {
      Object.entries(value).forEach(([key2, value2]) => {
        initial[key][key2].value = value2;
      });
    } else {
      //@ts-ignore:
      initial[key].value = value;
    }
  });
}

export const checkIfUserIsAuthenticated = async () => {
  console.log("Checking if the user is authenticated.");
  if (getCookie("drash_sess") && getCookie("drash_sess") != "null") {
    const response = await fetch("/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "check_if_user_is_authenticated",
        token: getCookie("drash_sess"),
      }),
    });
    if (response.status !== 200) {
      console.log("User has a session, but it's invalid.");
      console.log(response);
      unsetUser();
      return false;
    }
    console.log("User is authenticated.");
    const json = await response.json();
    setUser(json.user);
    return true;
  } else {
    console.log("User is not authenticated.");
    unsetUser();
    return false;
  }
};

export const deleteComment = async (
  { commentId }: { id: number | string; commentId: number },
) => {
  console.log("Handling action: deleteComment");
  const response = await fetch(`/articles/comment/${commentId}`, {
    method: "DELETE",
  });
  if (response.status !== 200) {
    return;
  }
  return true;
};

export const createArticleComment = async (params: {
  id: number;
  comment: string;
}) => {
  console.log(`Handling action: createArticleComment (${params.id})`);
  const res = await fetch(`/articles/${params.id}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      comment: params.comment,
    }),
  });
  const json = await res.json();
  if (res.status !== 200) {
    return {
      errors: json.errors,
    };
  }
  return {
    comment: json.data,
  };
};

export const updateArticle = async (
  newArticle: TReactiveProperties<Article>,
) => {
  console.log("Handling action: updateArticle");
  newArticle.author_id.value = authUser.id.value;
  const response = await fetch("/articles", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      article: newArticle,
    }),
  });
  const json = await response.json();
  return json as {
    article: Article | never;
    errors: Errors | never;
  };
};

export const createArticle = async (
  newArticle: TReactiveProperties<Article>,
) => {
  console.log("Handling action: createArticle", newArticle);
  newArticle.author_id.value = authUser.id.value;
  const response = await fetch("/articles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      article: newArticle,
    }),
  });
  const json = await response.json();
  return json as {
    article: Article | never;
    errors: Errors | never;
  };
};

export const fetchArticleComments = async (id: number) => {
  console.log("Handling action: fetchArticleComments");
  const response = await fetch(`/articles/${id}/comments`);
  const json = await response.json();
  return json.data;
};

export const fetchArticle = async (id: number) => {
  console.log("Handling action: fetchArticle");
  const response = await fetch(`/api/articles/${id}`);
  const json = await response.json();
  return json.article as Article;
};

class EB {
  #callbacks = new Map();

  // deno-lint-ignore no-explicit-any
  on(name: string, callback: (data: any) => void) {
    const callbacks = this.#callbacks.get(name) ?? [];
    callbacks.push(callback);
    this.#callbacks.set(name, callbacks);
  }

  // deno-lint-ignore no-explicit-any
  emit(name: string, payload: any) {
    const callbacks = this.#callbacks.get(name);
    if (!callbacks) {
      return;
    }
    for (const callback of callbacks) {
      callback(payload);
    }
  }
}
export const Eventbus = new EB();
