import { reactive, ReactiveArray } from "./components/deps.ts";
import type { TReactiveProperties } from "./components/deps.ts"

type Comment = {
  id: number,
  author_image: string,
  author_username: string,
  updated_at: string,
  author_id: number,
  body: string,
  created_at: string,
  article_id: number,
  tablename: string
}
const commentDefault = {
  id: 0,
  author_image: "",
  author_username: "",
  updated_at: "",
  author_id: 0,
  body: "",
  created_at: "",
  article_id: 0,
  tablename: ""
}
type User = {
  created_on: string,
  email: string,
  id: number,
  last_login: string,
  password: string,
  username: string,
  token: string,
  following: boolean,
  image: string,
  bio: string,
  tablename: string,
}
const userDefault: User = {
  created_on: '',
  email: '',
  id: 0,
  last_login: '',
  password: '',
  username: '',
  token: "",
  following: false,
  image: "",
  bio: "",
  tablename: "",
};

export type Article = {
  title: string,
  description: string,
  body: string,
  tags: [],
  author_id: number,
  tablename: string,
  created_at: string,
  id: number,
  updated_at: string,
  author: User,
  favoritesCount: number,
  favorited: boolean
  following: boolean
}
const defaultArticle: Article = {
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

export const profile = reactive<User>(userDefault);
export let comment = reactive<Comment>(commentDefault);
export const tags = reactive<string[]>([]);
export const user = reactive<User>(userDefault);
export const comments = reactive([]) as unknown as ReactiveArray<
  Record<string, unknown>
>;
export const isAuthenticated = reactive(false);
export const articles = reactive<Article[]>([]);
export let article = reactive<Article>(defaultArticle);

const setCookie = (cname: string, cvalue: string | null) => {
  const d = new Date();
  d.setTime(d.getTime() + (1 * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

export const setUser = (newUser: User) => {
  Object.entries(newUser)
    //@ts-ignore: 
    .forEach(([key, value]) => user[key].value = value);
  isAuthenticated.value = true;
  setCookie("drash_sess", user.token.value);
};

export const fetchTags = async () => {
  const res = await fetch("/tags");
  if (res.status !== 200) {
    return undefined;
  }
  return await res.json();
};

export const fetchArticles = async (params: {
  author?: string,
  favorited_by?: string,
  offset?: string,
  tag?: string,
  user_id?: string,
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
    return res;
  }
  const json = await res.json();
  console.log("Dispatching setArticles", json.articles);
  setArticles(json.articles);
  return json;
};

export const setArticles = (newArticles: Article[]) => {
  articles.value = newArticles;
};

export const toggleArticleFavorite = async (params: {
  action: string,
  id: number
}) => {
  console.log(`Handling action: toggleArticleFavorite (${params.action})`);
  const res = await fetch(`/articles/${params.id}/favorite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: params.action,
      user_id: user.id.value,
    }),
  });
  if (res.status !== 200) {
    console.log("toggleArticleFavorite unsuccessful.");
    return res;
  }
  console.log("toggleArticleFavorite successful.");
  const json = await res.json();
  setArticle(json.article);
};

export const setArticle = (newArticle: Article) => {
  console.log("Handling action: setArticle");
  article = reactive(newArticle);
  // todo Below doesn't work with children
  //Object.entries(newArticle).forEach(([key, value]) => article[key].value = value)
  setArticles([newArticle]);
};

export const deleteArticle = async (data: {
  article_id: number
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
    articles.value.forEach((article, i) => {
      if (article.id.value === id) {
        articles.splice(i, 1);
      }
    });
    unsetArticle();
    return true;
  } else {
    return response;
  }
};

export const unsetArticle = () => {
  setArticle(defaultArticle);
};

export const fetchProfile = async (params: {
  username: string
}) => {
  console.log("Handling action: fetchProfile");
  const res = await fetch(`/profiles/${params.username}`);
  if (res.status !== 200) {
    console.log("Unsetting profile.");
    unsetProfile();
    return;
  }
  console.log("Profile fetched successfully. Setting profile.");
  const json = await res.json();
  setProfile(json.profile);
  return json.profile;
};

export const setProfile = (newProfile: User) => {
  Object.entries(newProfile).forEach(([key, value]) =>
    // @ts-ignore: 
    profile[key].value = value
  );
};

export const unsetProfile = () => {
  setProfile(userDefault);
};

export const unsetUser = () => {
  Object.entries(userDefault).forEach(([key, value]) => {
    //@ts-ignore: 
    user[key].value = value;
  });
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
    unsetUser();
    return await json.errors;
  }
  console.log("Log in successful.");
  setUser(json.user);
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
    return json;
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
    password: '',
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
    return json;
  }
  console.log("User updated successfuly.");
  setUser(json.user);
  return true;
};

function getCookie(cname: string) {
  const row = document.cookie.split("; ")
    .find((row) => row.startsWith(cname));
  if (!row) {
    return "";
  }
  return row.split("=")[1];
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
    setUser((await response.json()).user);
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

  comments.map((comment, i) => {
    if (comment.id.value === commentId) {
      comments.splice(i.value, 1);
    }
  });
  return response;
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
  setComment(json.data);
  return {
    comment: json.data,
  };
};

export const setComments = (newComments: Comment[]) => {
  comments.value = newComments;
};

export const setComment = (newComment: Comment) => {
  console.log("Handling action: setComment");
  comment = reactive(newComment);
  comments.push(newComment);
  if (!comments.value.length) {
    setComments([newComment]);
  } else {
    comments.push(newComment);
  }
};

export const updateArticle = async (newArticle: TReactiveProperties<Article>) => {
  console.log("Handling action: updateArticle");
  newArticle.author_id.value = user.id.value;
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
  return json;
};

export const createArticle = async (newArticle: TReactiveProperties<Article>) => {
  console.log("Handling action: createArticle", newArticle);
  newArticle.author_id.value = user.id.value;
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
  return json;
};

export const setTags = (newTags: string[]) => {
  tags.value = newTags;
};

export const fetchArticleComments = async (id: number) => {
  console.log("Handling action: fetchArticleComments");
  const response = await fetch(`/articles/${id}/comments`);
  const json = await response.json();
  if (response.status === 200) {
    setComments(json.data);
  }
  return json.data;
};

export const fetchArticle = async (id: number) => {
  console.log("Handling action: fetchArticle");
  const response = await fetch(`/api/articles/${id}?user_id=${user.id.value}`);
  const json = await response.json();
  if (response.status === 200) {
    setArticle(json.article);
  }
  return json;
};
