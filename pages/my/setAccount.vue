<template>
  <view class="account-page">
    <!-- 个人信息卡片 -->
    <view class="profile-card" @click="goProfile">
      <image class="avatar" :src="userStore.userInfo.avatar" />
      <view class="profile-info">
        <text class="profile-name">{{ userStore.userInfo.username }}</text>
        <text class="profile-tip">{{ userStore.userInfo.signature }}</text>
      </view>
      <uni-icons type="right" size="22" color="#bbb" />
    </view>

    <!-- 账号绑定 -->
    <view class="section-title">账号绑定</view>
    <view class="card">
      <view class="row" @click="goProfile">
        <uni-icons type="phone" size="24" color="#4A90E2" />
        <text class="row-title">手机号绑定</text>
        <view class="row-value">{{ userStore.userInfo.phone || '未绑定' }}</view>
      </view>
      <view class="row" @click="goProfile">
        <uni-icons type="email" size="24" color="#4A90E2" />
        <text class="row-title">邮箱绑定</text>
        <view class="row-value">{{ userStore.userInfo.email || '未绑定' }}</view>
      </view>
    </view>

    <!-- 安全设置 -->
    <view class="section-title">安全设置</view>
    <view class="card">
      <view class="row">
        <uni-icons type="locked" size="24" color="#4A90E2" />
        <text class="row-title">修改账号密码</text>
        <uni-icons type="right" size="18" color="#bbb" />
      </view>
    </view>

    <!-- 退出账号按钮 -->
    <button class="logout-btn" @tap="goLogibOut">退出账号</button>
  </view>
</template>

<script setup>
import { useUserStore } from '/store/modules/user'
const userStore = useUserStore()

const goLogibOut = () => {
  uni.showModal({
    title: '提示',
    content: '是否退出登录？',
    success: (res) => {
      if (res.confirm) {
        userStore.token = '';
        uni.navigateBack({ delta: 1 });
      }
    }
  });
};

const goProfile = () => {
  // 跳转到changemine页面，编辑模式
  uni.navigateTo({ url: '/pages/my/changemine?mode=edit' });
};

// const goPassword = () => {
//   uni.navigateTo({ url: '/pages/my/changePassword' });
// };

</script>

<style scoped>
.account-page {
  background: #f6f7fa;
  min-height: 100vh;
  padding: 0 0 40rpx 0;
}
.profile-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 18rpx;
  margin: 32rpx 32rpx 0 32rpx;
  padding: 24rpx 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
}
.avatar {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}
.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.profile-name {
  font-size: 30rpx;
  color: #222;
  font-weight: 600;
}
.profile-tip {
  font-size: 24rpx;
  color: #888;
  margin-top: 6rpx;
}
.section-title {
  font-size: 26rpx;
  color: #888;
  margin: 36rpx 32rpx 10rpx 32rpx;
  font-weight: 500;
}
.card {
  background: #fff;
  border-radius: 18rpx;
  margin: 0 32rpx 0 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
  overflow: hidden;
}
.row {
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  height: 90rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}
.row:last-child {
  border-bottom: none;
}
.row-title {
  font-size: 28rpx;
  color: #222;
  margin-left: 18rpx;
  flex: 1;
}
.row-value {
  font-size: 26rpx;
  color: #888;
  margin-right: 12rpx;
}
.logout-btn {
  width: 88%;
  margin: 60rpx auto 0 auto;
  border-radius: 14rpx;
  font-size: 32rpx;
  font-weight: 600;
  background: #3b7cff;
  color: #fff;
  height: 90rpx;
  letter-spacing: 2rpx;
  box-shadow: 0 4rpx 16rpx rgba(22,119,255,0.08);
  border: none;
  display: block;
}
</style>