import Vue from "vue";

//
// Axios
//

import axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, axios);
Vue.axios.defaults.baseURL = "http://localhost:1667";

//
// Vue filters
//

import DateFilter from "@/common/date.filter.js";
import ErrorFilter from "@/common/error.filter.js";

Vue.config.productionTip = false;
Vue.filter("date", DateFilter);
Vue.filter("error", ErrorFilter);

//
// Vuex
//

import Vuex from "vuex";
Vue.use(Vuex);

import module from "@/store/module.js";

const store = new Vuex.Store({
  modules: {
    module,
  },
});

Vue.prototype.$store = Vuex;

//
// Vue Router
//

import VueRouter from "vue-router";
Vue.use(VueRouter);

import Home from "@/routes/Home.vue";
import HomeGlobal from "@/routes/HomeGlobal.vue";
import HomeMyFeed from "@/routes/HomeMyFeed.vue";
import HomeTag from "@/routes/HomeTag.vue";
import Login from "@/routes/Login.vue";
import Register from "@/routes/Register.vue";
import Settings from "@/routes/Settings.vue";
import Profile from "@/routes/Profile.vue";
import ProfileArticles from "@/routes/ProfileArticles.vue";
import ProfileFavorited from "@/routes/ProfileFavorited.vue";
import Article from "@/routes/Article.vue";
import ArticleEdit from "@/routes/ArticleEdit.vue";
import NotFound from "@/routes/404.vue";

const router = new VueRouter({
  routes: [
    {
      path: "/",
      component: Home,
      children: [
        {
          path: "",
          name: "home",
          component: HomeGlobal,
        },
        {
          path: "my-feed",
          name: "home-my-feed",
          component: HomeMyFeed,
        },
        {
          path: "tag/:tag",
          name: "home-tag",
          component: HomeTag,
        },
      ],
    },
    {
      name: "login",
      path: "/login",
      component: Login,
    },
    {
      name: "register",
      path: "/register",
      component: Register,
    },
    {
      name: "settings",
      path: "/settings",
      component: Settings,
    },
    // Handle child routes with a default, by giving the name to the
    // child.
    // SO: https://github.com/vuejs/vue-router/issues/777
    {
      path: "/@:username",
      component: Profile,
      children: [
        {
          path: "",
          name: "profile",
          component: ProfileArticles,
        },
        {
          name: "profile-favorites",
          path: "favorites",
          component: ProfileFavorited,
        },
      ],
    },
    {
      name: "article",
      path: "/articles/:slug",
      component: Article,
      props: true,
    },
    {
      name: "article-edit",
      path: "/editor/:slug?",
      props: true,
      component: ArticleEdit,
    },
    {
      path: "*",
      component: NotFound,
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    // Make "#" anchor links work as expected
    if (to.hash) {
      return {
        selector: to.hash,
        offset: { x: 0, y: 10 },
      };
    }
  },
});

// Ensure we checked auth before each page load.
router.beforeEach(async (to, from, next) => {
  if (to.path !== "/login" && to.path !== "/register" && to.path !== "/") {
    const result = await store.dispatch("checkIfUserIsAuthenticated");
    if (!result) {
      router.push("/login");
    }
    next();
  } else {
    next();
  }
});

//
// Vue app initialization
//

import App from "@/components/App.vue";

window.app = new Vue({
  el: "#app",
  template: "<App/>",
  components: {
    App,
  },
  router,
  store,
  mounted() {
    console.log("Vue mounted!");
  },
});

export { router, store };
