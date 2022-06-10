import { Footer } from "./Footer.ts";
import { Header } from "./Header.ts";
import { NotFound } from "./NotFound.ts";
import { Home } from "./pages/Home.ts";
import { Component, html, Router } from "./deps.ts";
import { Login } from "./pages/Login.ts";
import { Register } from "./pages/Register.ts";
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
      content: Favorited,
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
    const page = this.#pages.find((page) => {
      const pattern = new URLPattern({ pathname: page.path + "{/}?" });
      if (pattern.exec(window.location.href)) {
        return true;
      }
      return false;
    });
    checkIfUserIsAuthenticated().then((is) => {
      if (!is && page && page.protected) {
        window.location.href = "/login";
      }
    });
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
