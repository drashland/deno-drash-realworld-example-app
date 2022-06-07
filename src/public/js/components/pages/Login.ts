import {
  classNames,
  Component,
  computed,
  css,
  html,
  reactive,
  swal,
} from "../deps.ts";
import { logIn } from "../../state.ts";

export class Login extends Component {
  #errors = reactive<string[]>([]);

  #email = reactive("");

  #password = reactive("");

  async #onSubmit() {
    this.#errors.value = [];
    swal({
      text: "Logging you in... Please wait...",
      buttons: false,
    });

    const response = await logIn({
      email: this.#email.value,
      password: this.#password.value,
    });

    if (response === true) {
      swal.close();
      this.#email.value = "";
      this.#password.value = "";
      return window.location.href = "/";
    }

    const errors: string[] = [];
    Object.keys(response).forEach((field) => {
      for (const error of response[field]) {
        errors.push(error);
      }
    });
    this.#errors.value = errors;

    swal({
      title: "Login failed!",
      icon: "error",
    });
  }

  static styles = css`
        .d-none {
            display: none !important;
        }
    `;

  override template = this.html(html`
        <div class="auth-page">
            <div class="container page">
                <div class="row">
                    <div class="col-md-6 offset-md-3 col-xs-12">
                        <h1 class="text-xs-center">Sign in</h1>
                        <p class="text-xs-center">
                            <a href="/register">
                                Need an account?
                            </a>
                        </p>
                        <ul class=${
    classNames({
      "error-messages": true,
    })
  }>
                            ${
    computed(() => this.#errors.value.map((v) => html`<li>${v}</li>`))
  }
                        </ul>
                        <form>
                            <fieldset class="form-group">
                                <input
                                    class="form-control form-control-lg"
                                    type="text"
                                    prop:value=${this.#email}
                                    placeholder="Email"
                                />
                            </fieldset>
                            <fieldset class="form-group">
                                <input
                                    class="form-control form-control-lg"
                                    type="password"
                                    prop:value=${this.#password}
                                    placeholder="Password"
                                />
                            </fieldset>
                            <button type="button" on:click=${() =>
    this.#onSubmit()} class="btn btn-lg btn-primary pull-xs-right">
                                Sign in
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `);
}
