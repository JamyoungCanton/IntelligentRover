<template>
  <view class="container">
    <button class="custom-button" @tap="">退出登录</button>
  </view>
</template>

<script  setup>
import { useUserStore } from `store/modules/user`
const userStore = useUserStore()
userStore.token = ''
console.log(userStore.token);




</script>

<style scoped>
.container {
  display: flex;
  justify-content: center; 
  align-items: center; 
  height: 100vh; 
}

.custom-button {
  padding: 10px 20px; 
  font-size: 16px; 
  color: white; 
  background-color: #007aff; 
  border: none; 
  border-radius: 5px;
}
</style>