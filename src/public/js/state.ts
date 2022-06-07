import { reactive, ReactiveArray } from "./components/deps.ts";

const userDefault = {
  created_on: null,
  email: null,
  id: null,
  last_login: null,
  password: null,
  username: null,
  token: "",
  following: false,
  image: "",
  bio: "",
  tablename: "",
};

const defaultArticle = {
  title: "",
  description: "",
  body: "",
  tags: [],
  author_id: "",
  tablename: "",
  created_at: "",
  id: 0,
  updated_at: "",
  following: false,
  favorited: false,
  favoritesCount: 0,
  author: null,
};

export const profile = reactive(userDefault);
export const comment = reactive("");
export const tags = reactive<string[]>([]);
export const user = reactive(userDefault);
export const comments = reactive([]) as unknown as ReactiveArray<
  Record<string, unknown>
>;
export const isAuthenticated = reactive(false);
export const articles = reactive([]) as unknown as ReactiveArray<any>;
export let article = reactive<any>(defaultArticle);

const setCookie = (cname: string, cvalue: string | null) => {
  const d = new Date();
  d.setTime(d.getTime() + (1 * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

export const setUser = (newUser: any) => {
  Object.entries(newUser)
    //@ts-ignore
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

export const fetchArticles = async (params: any) => {
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

export const setArticles = (newArticles: any[]) => {
  articles.value = newArticles;
};

export const toggleArticleFavorite = async (params: any) => {
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

export const setArticle = (newArticle: any) => {
  console.log("Handling action: setArticle");
  article = reactive(newArticle);
  // todo Below doesn't work with children
  //Object.entries(newArticle).forEach(([key, value]) => article[key].value = value)
  setArticles([newArticle]);
};

export const deleteArticle = async (data: any) => {
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
      if (article.id === id) {
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

export const fetchProfile = async (params: any) => {
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

export const setProfile = (newProfile: any) => {
  // @ts-ignore
  Object.entries(newProfile).forEach(([key, value]) =>
    profile[key].value = value
  );
};

export const unsetProfile = () => {
  setProfile(userDefault);
};

export const unsetUser = () => {
  Object.entries(userDefault).forEach(([key, value]) => {
    //@ts-ignore
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

export const updateUser = async (user: any) => {
  console.log("Handling action: updateUser");
  let params: any = {
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
  { id, commentId }: { id: number | string; commentId: number },
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

export const setComments = (newComments: any[]) => {
  comments.value = newComments;
};

export const setComment = (newComment: any) => {
  console.log("Handling action: setComment");
  comment.value = newComment;
  comments.push(newComment);
  if (!comments.value.length) {
    setComments([newComment]);
  } else {
    comments.push(newComment);
  }
};

export const updateArticle = async (newArticle: any) => {
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

export const createArticle = async (newArticle: any) => {
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
