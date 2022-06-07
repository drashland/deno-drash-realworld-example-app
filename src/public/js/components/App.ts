import { Footer } from "./Footer.ts"
import { Header } from "./Header.ts"
import { NotFound } from "./NotFound.ts"
import { Home } from "./pages/Home.ts"
import { Component, html, Router, HashRouter } from "./deps.ts"
import { MyFeed } from "./pages/Home/MyFeed.ts"
import { Login } from "./pages/Login.ts"
import { Register } from "./pages/Register.ts"
import { Tag } from "./pages/Tag.ts"
import { Settings } from "./pages/Settings.ts"
import { Profile } from "./pages/Profile.ts"
import { Favorited } from "./pages/Profile/Favorited.ts"
import { checkIfUserIsAuthenticated } from "../state.ts"
import { Article } from "./pages/Article.ts"
import { ArticleEdit } from "./pages/ArticleEdit.ts"

/**
 * TODO
 * 
 * I have used the normal router, now i just
 * need to make sure pages work, and eg update the auth checks
 * so header is correct, as im logged in but header is showing
 * signin/signup
 */

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
        // // Handle child routes with a default, by giving the name to the
        // // child.
        // // SO: https://github.com/vuejs/vue-router/issues/777
        /**
         * TODO Got here (wed 1 jun), just need to start going thru the
         * routes and adding them and their components
         * 
         * NOTE that a child path with `path` "", is never used, so
         * we dont need to do those ones
         */
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
      super()
      // Initialise data needed for each page
      checkIfUserIsAuthenticated()
    }

    override template = this.html(html`
        <div id="app">
        <${Header} />
        <${Router} prop:routes=${this.#pages}>
            <${NotFound} slot="404" />
        </${Router}>
        <${Footer} />
        </div>  
    `)
}