<template>
  <div class="auth-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">Sign up</h1>
          <p class="text-xs-center">
            <router-link :to="{ name: 'login' }">
              Have an account?
            </router-link>
          </p>
          <ul v-if="errors" class="error-messages">
            <li v-for="(v, k) in errors" :key="k">{{ k }} {{ v | error }}</li>
          </ul>
          <form @submit.prevent="onSubmit">
            <fieldset class="form-group">
              <input
                class="form-control form-control-lg"
                type="text"
                v-model="username"
                placeholder="Username"
              />
            </fieldset>
            <fieldset class="form-group">
              <input
                class="form-control form-control-lg"
                type="text"
                v-model="email"
                placeholder="Email"
              />
            </fieldset>
            <fieldset class="form-group">
              <input
                class="form-control form-control-lg"
                type="password"
                v-model="password"
                placeholder="Password"
              />
            </fieldset>
            <button class="btn btn-lg btn-primary pull-xs-right">
              Sign up
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Register",
  data() {
    return {
      username: "",
      email: "",
      password: ""
    };
  },
  computed: {
    ...mapGetters([
      "errors",
      "is_authenticated",
    ])
  },
  methods: {
    async onSubmit() {
      swal({
          text: "Please wait...",
          timer: 500,
          buttons: false,
        })
        .then(async () => {
          return await this.$store.dispatch("register", {
              email: this.email,
              password: this.password,
              username: this.username
          });
        })
        .then((response) => {
          this.email = ""
          this.username = ""
          this.password = ""
          console.log(response);
          if (response === true) {
            swal({
              title: "Welcome!",
              text: "Your registration was successful!",
              icon: "success",
            });
            return this.$router.push({ name: "home" });
          }
          let error = "";
          for (let key in response.errors) {
            error += `${response.errors[key]} `;
          }
          console.log(error);
          swal({
            title: "Registration failed!",
            text: error,
            icon: "error"
          });
        });
    }
  }
};
</script>
