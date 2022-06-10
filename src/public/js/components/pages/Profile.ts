import { classNames, Component, HashRouter, html, reactive } from "../deps.ts";
import {
  authUser,
  fetchProfile,
  isAuthenticated,
  updateReactiveObject,
  User,
  userDefault,
} from "../../state.ts";
import { Articles } from "./Profile/Articles.ts";
import { Favorited } from "./Profile/Favorited.ts";

export interface Profile {
  pathParams: {
    username: string;
  };
}
export class Profile extends Component {
  #profile = reactive<User>(userDefault);

  #loading = reactive(true);

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

  async connectedCallback() {
    const profile = await fetchProfile({
      username: this.pathParams.username,
    }) as User;
    if (profile) {
      updateReactiveObject(this.#profile, profile);
    }
    this.#loading.value = false;
  }

  #isCurrentUser() {
    if (authUser.username.value && this.#profile.username.value) {
      return authUser.username.value === this.#profile.username.value;
    }
    return false;
  }
  #follow() {
    if (!isAuthenticated.value) return;
    //setFollowProfile({ username: this.pathParams.username})
  }
  #unfollow() {
    //setFollowProfile({ username: this.pathParams.username })
  }

  override template = this.html(html`
    ${
    this.#loading.truthy(
      html`
      <p>Loading...</p>
    `,
      html`
    <div class="profile-page">
    <div class="user-info">
      <div class="container">
        <div class="row">
          <div class="col-xs-12 col-md-10 offset-md-1">
            <img src=${this.#profile.image} class="user-img" />
            <h4>${this.#profile.username}hh</h4>
            <p>${this.#profile.bio}</p>
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
            this.#profile.following.truthy(
              html`
              <button
                class="btn btn-sm btn-secondary action-btn"
                on:click=${() => this.#unfollow()}
              >
                <i class="ion-plus-round"></i> Unfollow
                ${this.#profile.username}
              </button>
              `,
              html`
              <button
                class="btn btn-sm btn-outline-secondary action-btn"
                on:click=${() => this.#follow()}
              >
                <i class="ion-plus-round"></i> Follow
                ${this.#profile.username}
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
          active:
            window.location.href === `/profile/${this.#profile.username.value}`,
        })
      }
                  href=${`/${this.#profile.username.value}`}
                >
                  My Articles
                </a>
              </li>
              <li class="nav-item">
                <a
                  class=${
        classNames({
          "nav-link": true,
          active: window.location.href ===
            `/profile/${this.pathParams.username}/favorites`,
        })
      }
                  active-class="active"
                  href=${`/profile/${this.pathParams.username}/favorites`}
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
    `,
    )
  }`);
}
