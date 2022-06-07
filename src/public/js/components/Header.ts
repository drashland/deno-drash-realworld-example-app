import { Component, html, computed, classNames } from "./deps.ts"
import { isAuthenticated, user } from "../state.ts"

export class Header extends Component {

  #uri = window.location.pathname

  connectedCallback() {
    
    window.addEventListener("hashchange", () => {
      this.#uri = window.location.pathname;
    });
  }

  #getClassName(uri: string) {
    return classNames({
      'nav-link': true,
      'active': this.#uri === uri
    })
  }
    override template = this.html(html`
      <nav class="navbar navbar-light">
        <div class="container">
          <a class="navbar-brand" href="/">
            conduit
          </a>
          ${isAuthenticated.truthy(html`
          <ul class="nav navbar-nav pull-xs-right">
          <li class="nav-item">
            <a
              class=${this.#getClassName('/')}
              href="/"
            >
              Home
            </a>
          </li>
          <li class="nav-item">
            <a
              class=${this.#getClassName('/editor')}
              href="/editor?new=true"
            >
              <i class="ion-compose"></i>New Article
            </a>
          </li>
          <li class="nav-item">
            <a
              class=${this.#getClassName('/settings')}
              href="/settings"
            >
              <i class="ion-gear-a"></i>Settings
            </a>
          </li>
          ${user.username.value ? html`
            <li class="nav-item">
              <a
                class=${this.#getClassName('/profile')}
                href=${"/profile?username=" + user.username.value}
              >
                ${user.username.value}
              </a>
            </li>`
          : ''}
        </ul>`, html`
            <ul class="nav navbar-nav pull-xs-right">
              <li class="nav-item">
                <a
                  class=${this.#getClassName('/')}
                  href="/"
                >
                  Home
                </a>
              </li>
              <li class="nav-item">
                <a
                  class=${this.#getClassName('/login')}
                  href="/login"
                >
                  <i class="ion-compose"></i>Sign in
                </a>
              </li>
              <li class="nav-item">
                <a
                  class=${this.#getClassName('/register')}
                  href="/register"
                >
                  <i class="ion-compose"></i>Sign up
                </a>
              </li>
            </ul>`
    )}
        </div>
      </nav>
    `)
}
