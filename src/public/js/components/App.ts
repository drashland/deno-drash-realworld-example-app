import { Footer } from "./Footer.ts";
import { Header } from "./Header.ts";
import { NotFound } from "./NotFound.ts";
import { Home } from "./pages/Home.ts";
import { Component, HashRouter, html, Router } from "./deps.ts";
import { MyFeed } from "./pages/Home/MyFeed.ts";
import { Login } from "./pages/Login.ts";
import { Register } from "./pages/Register.ts";
import { Tag } from "./pages/Tag.ts";
import { Settings } from "./pages/Settings.ts";
import { Profile } from "./pages/Profile.ts";
import { Favorited } from "./pages/Profile/Favorited.ts";
import { checkIfUserIsAuthenticated } from "../state.ts";
import { Article } from "./pages/Article.ts";
import { ArticleEdit } from "./pages/ArticleEdit.ts";

export class App extends Component {
  #pages = [
    {
      path: "/",
      content: Home,
    },
    {
      path: "/my-feed",
      content: Home,
      protected: true,
    },
    {
      path: "/tag/:tag",
      content: Home,
    },
    {
      path: "/login",
      content: Login,
    },
    {
      path: "/register",
      content: Register,
    },
    {
      path: "/settings",
      content: Settings,
      protected: true,
    },
    {
      path: "/profile/:username",
      content: Profile,
      protected: true,
    },
    {
      path: "/profile/:username/favorites",
      content: Profile,
      protected: true,
    },
    {
      path: "/articles/:id",
      content: Article,
    },
    {
      path: "/editor/:id?",
      content: ArticleEdit,
      protected: true,
    },
  ];

  constructor() {
    super();
    // Initialise data needed for each page
    checkIfUserIsAuthenticated();
  }

  override template = this.html(html`
        <div id="app">
        <${Header} />
        <${Router} prop:routes=${this.#pages}>
            <${NotFound} slot="404" />
        </${Router}>
        <${Footer} />
        </div>  
    `);
}
