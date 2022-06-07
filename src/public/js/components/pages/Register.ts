import { Component, html, reactive, swal, computed, classNames } from "../deps.ts"
import { register } from "../../state.ts"

/**
 * todo this is where i got to
 * 
 * just finishing up logina nd register pages, should be good to move
 * onto othr stuff now
 */

export class Register extends Component {
    #errors = reactive<string[]>([]);

    #username = reactive('')

    #email = reactive('')

    #password = reactive('')

    async #onSubmit() {
        swal({
            text: "Please wait...",
            timer: 500,
            buttons: false,
          })
              
        const response = await register({
            email: this.#email.value,
            password: this.#password.value,
            username: this.#username.value
        });
        this.#email.value = ""
        this.#username.value = ""
        this.#password.value = ""
        if (response === true) {
            swal({
                title: "Welcome!",
                text: "Your registration was successful!",
                icon: "success",
            });
            return window.location.href = "/"
        }
        let error = "";
        const errors = []
        for (const key in response.errors) {
            for (const error of response.errors[key]) {
                errors.push(error)
            }
            error += `${response.errors[key]} `;
        }
        this.#errors.value = errors
        swal({
            title: "Registration failed!",
            text: error,
            icon: "error"
        });
      }

    override template = this.html(html`
        <div class="auth-page">
            <div class="container page">
                <div class="row">
                    <div class="col-md-6 offset-md-3 col-xs-12">
                        <h1 class="text-xs-center">Sign up</h1>
                        <p class="text-xs-center">
                            <a href="/login">
                            Have an account?
                            </a>
                        </p>
                        ${this.#errors.value.length ? html`
                        <ul class=${classNames({
                            'error-messages': true,
                            'd-none': this.#errors.value.length === 0
                        })}>
                            ${computed(() => this.#errors.value.map(v => html`<li>${v}</li>`))}
                        </ul>
                        ` : ''}
                        <form>
                            <fieldset class="form-group">
                                <input
                                    class="form-control form-control-lg"
                                    type="text"
                                    prop:value=${this.#username}
                                    placeholder="Username"
                                />
                            </fieldset>
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
                            <button on:click=${() => this.#onSubmit()} type="button" class="btn btn-lg btn-primary pull-xs-right">
                                Sign up
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `)
}