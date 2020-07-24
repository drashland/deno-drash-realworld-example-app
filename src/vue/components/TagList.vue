<template>
  <ul class="tag-list" v-if="tags.length !== 1 && !!tags[0]">
    <li
      class="tag-default tag-pill tag-outline"
      v-for="(tag, index) of tags"
      :key="index"
    >
      <span v-text="tag" />
    </li>
  </ul>
</template>

<script>
export default {
  name: "TagList",
  props: {
    tags: Array
  }
};
</script>
