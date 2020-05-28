<template>
  <div class="article-meta">
    <router-link
      :to="{ name: 'profile', params: { username: article.author.username } }"
    >
      <img :src="article.author.image" />
    </router-link>
    <div class="info">
      <router-link
        :to="{ name: 'profile', params: { username: article.author.username } }"
        class="author"
      >
        {{ article.author.username }}
      </router-link>
      <span class="date">{{ article.createdAt | date }}</span>
    </div>
    <article-actions
      v-if="actions"
      :article="article"
      :canModify="isCurrentUser()"
    ></article-actions>
    <button
      v-else
      class="btn btn-sm pull-xs-right"
      @click="toggleFavorite"
      :class="{
        'btn-primary': article.favorited,
        'btn-outline-primary': !article.favorited
      }"
    >
      <i class="ion-heart"></i>
      <span class="counter"> {{ article.favoritesCount }} </span>
    </button>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ArticleActions from "@/components/ArticleActions.vue";

export default {
  name: "ArticleMeta",
  components: {
    ArticleActions
  },
  props: {
    article: {
      type: Object,
      required: true
    },
    actions: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    ...mapGetters([
      "is_authenticated",
      "user",
    ])
  },
  methods: {
    isCurrentUser() {
      if (this.user.username && this.article.author.username) {
        return this.user.username === this.article.author.username;
      }
      return false;
    },
    toggleFavorite() {
      if (!this.is_authenticated) {
        this.$router.push({ name: "login" });
        return;
      }
      this.$store.dispatch("setFavoriteArticle", {
        article_slug: this.article.slug,
        value: !this.article.favorited
      });
    }
  }
};
</script>
