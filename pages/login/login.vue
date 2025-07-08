<template>
  <view class="container">
    <view class="header">
      <image class="logo" src="https://wuminghui.top:9000/wlmtsys/2025/06/02/c64d05235ba845b88ade471516742c80.png" mode="aspectFit" />
      <text class="title">山海智游侠</text>
    </view>

    <!-- 微信一键登录区域 -->
    <view class="wechat-login-btn-wrap">
      <button class="wechat-login-btn" open-type="getUserInfo" @tap="handleWechatLogin">
        <view class="wechat-btn-content">
          <text>微信一键登录</text>
        </view>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '/store/modules/user';
const userStore = useUserStore();

// 微信登录
const handleWechatLogin = () => {
  uni.login({
    provider: 'weixin',
    success: function (loginRes) {
      console.log('微信code:', loginRes.code);
      if (loginRes.code) {
        uni.request({
          url: 'https://island.zhangshuiyi.com/island/sys/wxlogin',
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          data: { code: loginRes.code },
          success: (res) => {
            console.log('微信登录返回数据:', res.data);
            if (res.data.success && res.data.result) {
              const { id, token, username } = res.data.result;
              // 存储 token
              if (token) {
                userStore.setToken(token);
                uni.setStorageSync('token', token);
              }
              // 存储用户信息
              const userInfo = {
                id,
                username,
                // 其他必要的用户信息字段
              };
              userStore.updateUserInfo(userInfo);
              if (id) {
                uni.setStorageSync('userId', id);
              }
              // 显示登录成功提示
              uni.showLoading({
                title: '登录成功',
                mask: true
              });
              setTimeout(() => {
                uni.hideLoading();
                uni.showToast({
                  title: '欢迎回来！',
                  icon: 'success',
                  duration: 2000
                });
                setTimeout(() => {
                  uni.reLaunch({ url: '/pages/index/index' });
                }, 1000);
              }, 1000);
            } else {
              uni.showToast({ 
                title: res.data.message || '微信登录失败', 
                icon: 'none',
                duration: 2000
              });
            }
          },
          fail: (err) => {
            console.error('微信登录请求失败:', err);
            uni.showToast({ 
              title: '网络连接失败，请检查网络后重试', 
              icon: 'none',
              duration: 2000 
            });
          }
        });
      } else {
        uni.showToast({ 
          title: '获取微信授权失败，请重试', 
          icon: 'none',
          duration: 2000 
        });
      }
    },
    fail: function (err) {
      console.error('微信登录失败:', err);
      uni.showToast({ 
        title: '微信登录失败，请稍后重试', 
        icon: 'none',
        duration: 2000 
      });
    }
  });
};
</script>

<style>
page {
  height: 100%;
  background-color: #f9f9f9;
}

.container {
  min-height: 100%;
  padding: 60rpx 40rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.logo {
  width: 140rpx;
  height: 130rpx;
  margin-bottom: 30rpx;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #333333;
}

.wechat-login-btn-wrap {
  display: flex;
  justify-content: center;
  margin-top: 80rpx;
  margin-bottom: 40rpx;
}

.wechat-login-btn {
  background-color: #07c160;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  border-radius: 50rpx;
  height: 100rpx;
  width: 80%;
  margin: 0 auto;
  box-shadow: 0 4rpx 16rpx rgba(7,193,96,0.08);
}

.wechat-btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.wechat-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 16rpx;
  vertical-align: middle;
}
</style>