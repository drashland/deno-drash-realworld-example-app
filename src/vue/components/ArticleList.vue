<template>
  <div>
    <div v-if="is_loading" class="article-preview">Loading articles...</div>
    <div v-else>
      <div v-if="articles.length === 0" class="article-preview">
        No articles are here... yet.
      </div>
      <ArticlePreview
        v-for="(article, index) in articles"
        :article="article"
        :key="article.title + index"
      />
      <Pagination :pages="pages" :currentPage.sync="currentPage" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ArticlePreview from "./ArticlePreview.vue";
import Pagination from "./Pagination.vue";
export default {
  name: "ArticleList",
  components: {
    ArticlePreview,
    Pagination
  },
  props: {
    type: {
      type: String,
      required: false,
      default: "all"
    },
    author: {
      type: String,
      required: false
    },
    tag: {
      type: String,
      required: false
    },
    favorited: {
      type: String,
      required: false
    },
    itemsPerPage: {
      type: Number,
      required: false,
      default: 10
    }
  },
  data() {
    return {
      currentPage: 1
    };
  },
  computed: {
    ...mapGetters([
      "articles",
      "articles_count",
      "is_loading",
    ]),
    params() {
      const { type } = this;
      const filters = {
        offset: (this.currentPage - 1) * this.itemsPerPage,
        limit: this.itemsPerPage
      };
      if (this.author) {
        filters.author = this.author;
      }
      if (this.tag) {
        filters.tag = this.tag;
      }
      if (this.favorited) {
        filters.favorited = this.favorited;
      }
      return {
        type,
        filters
      };
    },
    pages() {
      if (this.isLoading || this.articles_count <= this.itemsPerPage) {
        return [];
      }
      return [
        ...Array(Math.ceil(this.articles_count / this.itemsPerPage)).keys()
      ].map(e => e + 1);
    },
  },
  watch: {
    currentPage(newValue) {
      this.params.filters.offset = (newValue - 1) * this.itemsPerPage;
      this.fetchArticles();
    },
    type() {
      this.resetPagination();
      this.fetchArticles();
    },
    author() {
      this.resetPagination();
      this.fetchArticles();
    },
    tag() {
      this.resetPagination();
      this.fetchArticles();
    },
    favorited() {
      this.resetPagination();
      this.fetchArticles();
    }
  },
  mounted() {
    this.fetchArticles();
  },
  methods: {
    fetchArticles() {
      this.$store.dispatch("fetchArticles", this.params.filters);
    },
    resetPagination() {
      this.params.offset = 0;
      this.currentPage = 1;
    }
  }
};
</script>
