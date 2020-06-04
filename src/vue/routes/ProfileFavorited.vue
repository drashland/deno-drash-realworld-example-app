<template>
  <div class="profile-page">
    <ArticleList :favorited="favorited" :items-per-page="5">
    </ArticleList>
  </div>
</template>

<script>
import ArticleList from "@/components/ArticleList.vue";
export default {
  name: "ProfileFavorited",
  components: {
    ArticleList
  },
  mounted() {
    console.log("ProfileFavorited mounted!");
  },
  computed: {
    favorited() {
      return this.$route.params.username;
    }
  }
};
</script>
