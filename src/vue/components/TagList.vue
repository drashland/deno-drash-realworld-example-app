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
  /**
   * example usage:
       <input id="tag-input"
         @keypress.enter.prevent="addTag(tag_input)" // update tag state here
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
       ...
       computed: {
         ...mapGetters([
           "tags"
         ])
       }
   */
  export default {
  name: "TagList",
  props: {
    tags: Array
  }
};
</script>
