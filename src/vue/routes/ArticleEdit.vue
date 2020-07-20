<template>
  <div class="editor-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-10 offset-md-1 col-xs-12">
          <ListErrors :errors="errors" />
          <form @submit.prevent="onPublish(article.slug)">
            <fieldset :disabled="publishing_article">
              <fieldset class="form-group">
                <input
                  type="text"
                  class="form-control form-control-lg"
                  v-model="article.title"
                  placeholder="Article Title"
                />
              </fieldset>
              <fieldset class="form-group">
                <input
                  type="text"
                  class="form-control"
                  v-model="article.description"
                  placeholder="What's this article about?"
                />
              </fieldset>
              <fieldset class="form-group">
                <textarea
                  class="form-control"
                  rows="8"
                  v-model="article.body"
                  placeholder="Write your article (in markdown)"
                >
                </textarea>
              </fieldset>
              <fieldset class="form-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Enter tags"
                  v-model="tag_input"
                  @keypress.enter.prevent="addTag(tag_input)"
                />
                <div class="tag-list">
                  <span
                    class="tag-default tag-pill"
                    v-for="(tag, index) of tags"
                    :key="tag + index"
                  >
                    <i class="ion-close-round" @click="removeTag(tag)"> </i>
                    {{ tag }}
                  </span>
                </div>
              </fieldset>
            </fieldset>
            <button
              :disabled="publishing_article"
              class="btn btn-lg pull-xs-right btn-primary"
              type="submit"
            >
              Publish Article
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { store } from "../../public/js/_app.js";
import ListErrors from "@/components/ListErrors.vue";
export default {
  name: "ArticleEdit",
  components: { ListErrors },
  props: {
    previousArticle: {
      type: Object,
      required: false
    }
  },
  data() {
    return {
      tag_input: null,
      publishing_article: false,
      errors: {}
    };
  },
  computed: {
    ...mapGetters([
      "article",
      "tags"
    ])
  },
  methods: {
    onPublish(slug) {
      // If the article has a slug, then it already exists in the database; and
      // that means we're updating the article--not creating a new one.
      let action = slug ? "updateArticle" : "createArticle";
      swal({
        text: "Please wait...",
        buttons: false,
      });
      this.publishing_article = true;
      this.$store.dispatch(action, this.article)
        .then((response) => {
          swal.close();
          console.log(response);
          this.publishing_article = false;
          this.$store.dispatch("unsetArticle");
          this.tag_input = null;
          if (response.data.article) {
            this.$router.push({
              name: "article",
              params: { slug: response.data.article.slug }
            });
            return;
          }
          let error = "";
          for (let key in response.errors) {
            error += `${response.errors[key]} `;
          }
          console.log(error);
          swal({
            title: "Oops!",
            text: error,
            icon: "error"
          });
        });
    },
    removeTag(tag) {
      this.$store.dispatch("deleteArticleTag", tag);
    },
    addTag(tag) {
      this.$store.dispatch("createArticleTag", tag);
      this.tag_input = null;
    }
  }
};
</script>
