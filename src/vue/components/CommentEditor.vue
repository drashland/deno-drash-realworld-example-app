<template>
  <div>
    <ListErrors :errors="errors" />
    <form class="card comment-form" @submit.prevent="onSubmit(id, comment)">
      <div class="card-block">
        <textarea
          class="form-control"
          v-model="comment"
          placeholder="Write a comment..."
          rows="3"
        >
        </textarea>
      </div>
      <div class="card-footer">
        <img :src="userImage" class="comment-author-img" />
        <button class="btn btn-sm btn-primary">Post Comment</button>
      </div>
    </form>
  </div>
</template>

<script>
import ListErrors from "@/components/ListErrors.vue";
export default {
  name: "CommentEditor",
  components: { ListErrors },
  props: {
    id: { type: Number, required: true },
    content: { type: String, required: false },
    userImage: { type: String, required: false }
  },
  data() {
    return {
      comment: this.content || null,
      errors: {}
    };
  },
  methods: {
    onSubmit(id, comment) {
      console.log("Dispatching event: createArticleComment")
      this.$store
        .dispatch("createArticleComment", { id, comment })
        .then(() => {
          this.comment = null;
          this.errors = {};
        })
        .catch(({ response }) => {
          this.errors = response.data.errors;
        });
    }
  }
};
</script>
