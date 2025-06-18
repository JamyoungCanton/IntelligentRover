<template>
  <view class="container">
    <button class="custom-button" @tap="goLogibOut">退出登录</button>
  </view>
</template>

<script  setup>

import { useUserStore } from '/store/modules/user'
const userStore = useUserStore()

const goLogibOut = async () => {
  const userStore = useUserStore()
  // 弹窗是否退出登录
  uni.showModal({
    title: '提示',
    content: '是否退出登录？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({
          title: '退出中...',
          mask: true
        });
        
        // 调用后端退出登录接口
        uni.request({
          url: 'https://island.zhangshuiyi.com/island/sys/logout',
          method: 'PUT', // 修改为PUT方法
          header: {
            'X-Access-Token': userStore.token
          },
          success: (logoutRes) => {
            uni.hideLoading();
            if (logoutRes.statusCode === 200 && logoutRes.data.success) {
              // 清除本地token和用户信息
              userStore.token = '';
              userStore.userInfo = null;
              uni.removeStorageSync('token');
              uni.removeStorageSync('userInfo');
              
              uni.showToast({ 
                title: '已退出登录', 
                icon: 'success',
                duration: 1500
              });
              
              setTimeout(() => {
                // 退出后跳转到首页
                uni.reLaunch({
                  url: '/pages/index/index'
                });
              }, 1500);
            } else {
              // 即使接口返回失败，也清除本地登录状态
              userStore.token = '';
              userStore.userInfo = null;
              uni.removeStorageSync('token');
              uni.removeStorageSync('userInfo');
              
              uni.showToast({ 
                title: '已退出登录', 
                icon: 'success',
                duration: 1500
              });
              
              setTimeout(() => {
                uni.reLaunch({
                  url: '/pages/index/index'
                });
              }, 1500);
            }
          },
          fail: (err) => {
            uni.hideLoading();
            console.error('退出登录失败:', err);
            // 即使请求失败，也清除本地登录状态
            userStore.token = '';
            userStore.userInfo = null;
            uni.removeStorageSync('token');
            uni.removeStorageSync('userInfo');
            
            uni.showToast({ 
              title: '已退出登录', 
              icon: 'success',
              duration: 1500
            });
            
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/index/index'
              });
            }, 1500);
          }
        });
      }
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