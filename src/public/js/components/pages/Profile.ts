import { classNames, Component, HashRouter, html } from "../deps.ts";
import { fetchProfile, isAuthenticated, profile, user } from "../../state.ts";
import { Articles } from "./Profile/Articles.ts";
import { Favorited } from "./Profile/Favorited.ts";

export interface Profile {
  username: string;
}
export class Profile extends Component {
  #pages = [
    {
      path: "/profile/:username",
      content: Articles,
    },
    {
      path: "/profile/:username/favorites",
      content: Favorited,
    },
  ];

  connectedCallback() {
    fetchProfile({ username: this.username });
  }

  #isCurrentUser() {
    if (user.username.value && profile.username.value) {
      return user.username.value === profile.username.value;
    }
    return false;
  }
  #follow() {
    if (!isAuthenticated.value) return;
    // TODO :: Add method to state
    //setFollowProfile({ username: this.username})
  }
  #unfollow() {
    // TODO :: Add method to state
    //setFollowProfile({ username: this.username })
  }

  override template = this.html(html`
    <div class="profile-page">
    <div class="user-info">
      <div class="container">
        <div class="row">
          <div class="col-xs-12 col-md-10 offset-md-1">
            <img src=${profile.image.value} class="user-img" />
            <h4>${profile.username.value}</h4>
            <p>${profile.bio.value}</p>
            ${
    this.#isCurrentUser()
      ? html`
            <div>
              <a
                class="btn btn-sm btn-outline-secondary action-btn"
                href="/settings"
              >
                <i class="ion-gear-a"></i> Edit Profile Settings
              </a>
            </div>
            `
      : html`
            <div>
              ${
        profile.following.truthy(
          html`
              <button
                class="btn btn-sm btn-secondary action-btn"
                on:click=${() => this.#unfollow()}
              >
                <i class="ion-plus-round"></i> Unfollow
                ${profile.username.value}
              </button>
              `,
          html`
              <button
                class="btn btn-sm btn-outline-secondary action-btn"
                on:click=${() => this.#follow()}
              >
                <i class="ion-plus-round"></i> Follow
                ${profile.username.value}
              </button>
              `,
        )
      }
            </div>`
  }
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-xs-12 col-md-10 offset-md-1">
          <div class="articles-toggle">
            <ul class="nav nav-pills outline-active">
              <li class="nav-item">
                <a
                  class=${
    classNames({
      "nav-link": true,
      active: window.location.href === `/profile/${profile.username.value}`,
    })
  }
                  href=${`/${profile.username.value}`}
                >
                  My Articles
                </a>
              </li>
              <li class="nav-item">
                <a
                  class=${
    classNames({
      "nav-link": true,
      active:
        window.location.href === `/profile/${profile.username.value}/favorites`,
    })
  }
                  active-class="active"
                  href=${`/profile/${profile.username.value}/favorites`}
                >
                  Favorited Articles
                </a>
              </li>
            </ul>
          </div>
          <${HashRouter} prop:routes=${this.#pages} />
        </div>
      </div>
    </div>
  </div>
    `);
}
