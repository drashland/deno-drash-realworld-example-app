<template>
  <div class="auth-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">Sign in</h1>
          <p class="text-xs-center">
            <router-link :to="{ name: 'register' }">
              Need an account?
            </router-link>
          </p>
          <ul v-if="errors" class="error-messages">
            <li v-for="(v, k) in errors" :key="k">{{ k }} {{ v | error }}</li>
          </ul>
          <form @submit.prevent="onSubmit(email, password)">
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
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import swal from "sweetalert";

export default {
  name: "Login",
  data() {
    return {
      email: null,
      password: null
    };
  },
  computed: {
    ...mapGetters([
      "errors",
    ])
  },
  mounted() {
    console.log("Login.vue mounted!");
  },
  methods: {
    async onSubmit(email, password) {
      swal({
          text: "Logging you in... Please wait...",
          buttons: false,
        });

      let response = await this.$store.dispatch("logIn", { email, password });

      if (response === true) {
        swal.close();
        return this.$router.push({ name: "home" });
      }

      swal({
        title: "Login failed!",
        text: response.errors.body.join(" "),
        icon: "error"
      });
    }
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      console.log("Resetting login form fields.");
      vm.email = null;
      vm.password = null;
    });
  }
};
</script>
