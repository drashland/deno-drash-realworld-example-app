<template>
  <div class="editor-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-10 offset-md-1 col-xs-12">
          <ListErrors :errors="errors" />
          <form @submit.prevent="onPublish(article.id)">
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
                <vue-tags-input
                  placeholder="Enter tags"
                  class="form-control"
                  v-model="tag"
                  :tags="tags"
                  @tags-changed="newTags => tags = newTags"
                />
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
import VueTagsInput from '@johmun/vue-tags-input';
export default {
  name: "ArticleEdit",
  components: {
    ListErrors,
    VueTagsInput
  },
  props: {
    previousArticle: {
      type: Object,
      required: false
    }
  },
  data() {
    return {
      tag: "",
      tags: [],
      publishing_article: false,
      errors: {}
    };
  },
  computed: {
    ...mapGetters([
      "article",
    ])
  },
  async beforeRouteEnter(to, from, next) {
    next((vm) => {
      // Unset the article if creating a new one
      if (to.params.new && to.params.new === true) {
        vm.$store.commit("setArticle", {})
        vm.$store.commit("setTags", [])
      } else { // set the tags for the article
        const article = store.getters.article
        const tags = article.tags
        if (tags && tags !== "" && tags.length) {
          vm.tags = tags
        }
      }
    })
  },
  methods: {
    onPublish(id) {
      console.log('got onpublish', id, this.article)
      // If the article has a id, then it already exists in the database; and
      // that means we're updating the article--not creating a new one.
      let action = id ? "updateArticle" : "createArticle";
      swal({
        text: "Please wait...",
        buttons: false,
      });
      const tags = this.tags.length ? this.tags.map(tag => tag.text) : []
      this.article.tags = tags
      this.publishing_article = true;
      console.log('publishing')
      this.$store.dispatch(action, this.article)
        .then((response) => {
          console.log('saved article', response.data.article)
          swal.close();
          this.publishing_article = false;
          this.$store.dispatch("unsetArticle");
          this.tag = ""
          this.tags = [];
          if (response.data.article) {
            this.$store.dispatch("setArticle", response.data.article)
            this.$router.push({
              name: "article",
              params: { id: response.data.article.id }
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
  }
};
</script>
<style lang="scss">
  /**
   * Override some styling with the vue-tags component,
   * to keep it consistent with the overall design of the form
   */
  form fieldset div.vue-tags-input.form-control {
    max-width: none; /* Use bootstraps "form-control" style */
  }
  .vue-tags-input div.ti-input {
    border: none; /* Border for input is already covered by botstraps "form-control" */
    padding: 0; /* Same as above */
  }
  .vue-tags-input div.ti-input ul.ti-tags > li.ti-tag {
    background-color: #5cb85c; /* Use conduits color instead of the blue that vue tags uses for the BG of each tag */
  }
</style>
