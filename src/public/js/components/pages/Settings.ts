import { Component, html, reactive, swal } from "../deps.ts";
import { authUser, logOut, updateUser } from "../../state.ts";

export class Settings extends Component {
  #authUser = reactive(authUser);

  connectedCallback() {
  }

  async #logout() {
    await logOut();
    window.location.href = "/";
  }

  async #updateSettings() {
    swal({
      text: "Updating your information... Please wait...",
      timer: 500,
      buttons: false,
    });
    const response = await updateUser(this.#authUser);
    if (response.user) {
      return swal({
        title: "Update successful!",
        icon: "success",
      });
    }
    let error = "";
    for (const key in response.errors) {
      error += `${response.errors[key]} `;
    }
    swal({
      title: "Update failed!",
      text: error,
      icon: "error",
    });
  }

  override template = this.html(html`
<div class="settings-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">Your Settings</h1>
          <form>
            <fieldset>
              <fieldset class="form-group">
                <input
                  class="form-control form-control-lg"
                  type="text"
                  prop:value=${this.#authUser.image}
                  placeholder="URL of profile picture"
                />
              </fieldset>
              <fieldset class="form-group">
                <input
                  class="form-control form-control-lg"
                  type="text"
                  prop:value=${this.#authUser.username}
                  placeholder="Your username"
                />
              </fieldset>
              <fieldset class="form-group">
                <textarea
                  class="form-control form-control-lg"
                  rows="8"
                  prop:value=${this.#authUser.bio}
                  placeholder="Short bio about you"
                ></textarea>
              </fieldset>
              <fieldset class="form-group">
                <input
                  class="form-control form-control-lg"
                  type="text"
                  prop:value=${this.#authUser.email}
                  placeholder="Email"
                />
              </fieldset>
              <fieldset class="form-group">
                <input
                  class="form-control form-control-lg"
                  type="password"
                  placeholder="*****"
                  prop:value=${this.#authUser.password}
                />
              </fieldset>
              <button type="button" on:click=${() =>
    this.#updateSettings()} class="btn btn-lg btn-primary pull-xs-right">
                Update Settings
              </button>
            </fieldset>
          </form>
          <!-- Line break for logout button -->
          <hr />
          <button on:click=${() =>
    this.#logout()} class="btn btn-outline-danger">
            Or click here to logout.
          </button>
        </div>
      </div>
    </div>
  </div>
    `);
}
