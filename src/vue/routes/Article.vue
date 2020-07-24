<template>
  <div class="article-page">
    <div class="banner">
      <div class="container">
        <h1>{{ article.title }}</h1>
        <ArticleMeta :article="article" :actions="true"></ArticleMeta>
      </div>
    </div>
    <div class="container page">
      <div class="row article-content">
        <div class="col-xs-12">
          <div v-html="parseMarkdown(article.body)"></div>
          <ul class="tag-list" v-if="article.tags && article.tags.length !== 1 && !!article.tags[0]">
            <li v-for="(tag, index) of article.tags" :key="tag + index">
              <Tag
                :name="tag"
                className="tag-default tag-pill tag-outline"
              ></Tag>
            </li>
          </ul>
        </div>
      </div>
      <hr />
      <div class="article-actions">
        <ArticleMeta :article="article" :actions="true"></ArticleMeta>
      </div>
      <div class="row">
        <div class="col-xs-12 col-md-8 offset-md-2">
          <CommentEditor
            v-if="is_authenticated"
            :slug="slug"
            :userImage="user.image"
          >
          </CommentEditor>
          <p v-else>
            <router-link :to="{ name: 'login' }">Sign in</router-link>
            or
            <router-link :to="{ name: 'register' }">sign up</router-link>
            to add comments on this article.
          </p>
          <Comment
            v-for="(comment, index) in comments"
            :slug="slug"
            :comment="comment"
            :key="index"
          >
          </Comment>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { store } from "../../public/js/_app.js";
import marked from "marked";
import ArticleMeta from "@/components/ArticleMeta.vue";
import Comment from "@/components/Comment.vue";
import CommentEditor from "@/components/CommentEditor.vue";
import Tag from "@/components/Tag.vue";
export default {
  name: "Article",
  props: {
    slug: {
      type: String,
      required: true
    }
  },
  components: {
    ArticleMeta,
    Comment,
    CommentEditor,
    Tag
  },
  async beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.$store.dispatch("fetchArticle", to.params.slug);
      vm.$store.dispatch("fetchArticleComments", to.params.slug);
    });
  },
  computed: {
    ...mapGetters([
      "article",
      "comments",
      "is_authenticated",
      "user"
    ])
  },
  methods: {
    articleCreatedAt() {
      if (this.article && this.article.created_at) {
        return this.article.created_at;
      }
      return null;
    },
    authorUsername() {
      if (this.article && this.article.author) {
        return this.article.author.username;
      }
      return null;
    },
    authorImage() {
      if (this.article && this.article.author && this.article.author.image) {
        return article.author.image;
      }
      return null;
    },
    parseMarkdown(content) {
      if (content) {
        return marked(content);
      }
    }
  }
};
</script>
