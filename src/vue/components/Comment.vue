<template>
  <div class="card">
    <div class="card-block">
      <p class="card-text">{{ comment.body }}</p>
    </div>
    <div class="card-footer">
      <a href="" class="comment-author">
        <img :src="comment.author_image" class="comment-author-img" />
      </a>
      <router-link
        class="comment-author"
        :to="{ name: 'profile', params: { username: comment.author_username } }"
      >
        {{ comment.author_username }}
      </router-link>
      <span class="date-posted">{{ comment.created_at | date }}</span>
      <span v-if="isCurrentUser" class="mod-options">
        <i class="ion-trash-a" @click="destroy(slug, comment.id)"></i>
      </span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "Comment",
  props: {
    slug: { type: String, required: true },
    comment: { type: Object, required: true }
  },
  computed: {
    ...mapGetters([
      "user"
    ]),
    isCurrentUser() {
      if (this.user.username && this.comment.author_username) {
        return this.comment.author_username === this.user.username;
      }
      return false;
    },
  },
  methods: {
    destroy(slug, commentId) {
      this.$store.dispatch("deleteComment", { slug, commentId });
    }
  }
};
</script>
