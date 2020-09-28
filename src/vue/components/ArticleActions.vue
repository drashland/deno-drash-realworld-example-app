<template>
  <!-- Used when user is also author -->
  <span v-if="canModify">
    <router-link class="btn btn-sm btn-outline-secondary" :to="editArticleLink">
      <i class="ion-edit"></i> <span>&nbsp;Edit Article</span>
    </router-link>
    <span>&nbsp;&nbsp;</span>
    <button class="btn btn-outline-danger btn-sm" @click="deleteArticle">
      <i class="ion-trash-a"></i> <span>&nbsp;Delete Article</span>
    </button>
  </span>
  <!-- Used in ArticleView when not author -->
  <span v-else>
    <button class="btn btn-sm btn-outline-secondary" @click="toggleFollow">
      <i class="ion-plus-round"></i> <span>&nbsp;</span>
      <span v-text="followUserLabel" />
    </button>
    <span>&nbsp;&nbsp;</span>
    <button
      class="btn btn-sm"
      @click="toggleFavorite"
      :class="toggleFavoriteButtonClasses"
    >
      <i class="ion-heart"></i> <span>&nbsp;</span>
      <span v-text="favoriteArticleLabel" /> <span>&nbsp;</span>
      <span class="counter" v-text="favoriteCounter" />
    </button>
  </span>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "ArticleActions",
  props: {
    article: { type: Object, required: true },
    canModify: { type: Boolean, required: true }
  },
  computed: {
    ...mapGetters([
      "profile",
      "is_authenticated"
    ]),
    editArticleLink() {
      return { name: "article-edit", params: { slug: this.article.slug } };
    },
    favoriteArticleLabel() {
      return this.article.favorited ? "Unfavorite Article" : "Favorite Article";
    },
    favoriteCounter() {
      return `(${this.article.favoritesCount ? this.article.favoritesCount : 0})`;
    },
    followUserLabel() {
      if (this.article && this.article.author) {
        return `${this.profile.following ? "Unfollow" : "Follow"} ${
          this.article.author.username
        }`;
      }
    },
    toggleFavoriteButtonClasses() {
      return {
        "btn-primary": this.article.favorited,
        "btn-outline-primary": !this.article.favorited
      };
    },
  },
  methods: {
    async deleteArticle() {
      try {
        const result = await this.$store.dispatch("deleteArticle", {
          article_slug: this.article.slug
        });
        if (result === true) {
          swal({
            text: "Deleted the article. Going home...",
            timer: 1000,
            buttons: false,
          }).then(() => {
            this.$router.push("/");
          })
        } else {
          swal({
            title: "Oops!",
            text: "Something went wrong whilst trying to delete the article.",
            icon: "error"
          });
          console.error("Failed to delete the article:")
          console.error(result)
        }
      } catch (err) {
        console.error(err);
      }
    },
    toggleFavorite() {
      if (!this.is_authenticated) {
        this.$router.push({ name: "login" });
        return;
      }

      const action = this.article.favorited
        ? "unset"
        : "set";
      this.$store.dispatch("toggleArticleFavorite", {
        slug: this.article.slug,
        action: action
      });
    },
    toggleFollow() {
      if (!this.is_authenticated) {
        this.$router.push({ name: "login" });
        return;
      }
      this.$store.dispatch("setFollowProfile", {
        username: this.profile.username,
        value: !this.article.following
      });
    },
  }
};
</script>
