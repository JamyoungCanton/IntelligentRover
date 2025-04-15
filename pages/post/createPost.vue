<template>
  <div class="createPost">createPost</div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue';

export default defineComponent({
  setup() {
    // 对应onLoad/onShow
    onMounted(() => {
      // 初始化代码
    });
    
    // 对应onUnload
    onUnmounted(() => {
      // 清理代码
    });

    return {};
  }
});
</script>

<style scoped></style>