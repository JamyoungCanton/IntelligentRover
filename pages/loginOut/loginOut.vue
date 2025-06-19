<template>
  <view class="container">
    <button class="custom-button" @tap="goLogibOut">退出登录</button>
  </view>
</template>

<script  setup>

import { useUserStore } from '/store/modules/user'
const userStore = useUserStore()

const clearAllLoginCache = () => {
  userStore.token = '';
  userStore.userInfo = null;
  uni.removeStorageSync('token');
  uni.removeStorageSync('userInfo');
  uni.removeStorageSync('userId');
  uni.removeStorageSync('userPassword');
  uni.removeStorageSync('loginRedirectUrl');
};

const goLogibOut = async () => {
  uni.showModal({
    title: '提示',
    content: '是否退出登录？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '退出中...', mask: true });
        uni.request({
          url: 'https://island.zhangshuiyi.com/island/sys/logout',
          method: 'PUT',
          header: { 'X-Access-Token': userStore.token },
          complete: () => {
            uni.hideLoading();
            clearAllLoginCache();
            uni.showToast({ title: '已退出登录', icon: 'success', duration: 1500 });
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/index/index' });
            }, 1500);
          }
        });
      }
    }
  });
};




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