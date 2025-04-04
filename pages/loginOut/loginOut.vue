<template>
  <view class="container">
    <button class="custom-button" @tap="goLogibOut">退出登录</button>
  </view>
</template>

<script  setup>

import { useUserStore } from '/store/modules/user'
const userStore = useUserStore()

const goLogibOut =async () => {
  const userStore = useUserStore()
  // 弹窗是否退出登录
   uni.showModal({
    title: '提示',
    content: '是否退出登录？',
     success: (res) => {
      if (res.confirm) {

        // 确认退出登录
       userStore.token = '';
       console.log(userStore.token);

       uni.navigateBack({
    delta: 1
  });
       
      }
      console.log(userStore.token);
    }
  });
 
}




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