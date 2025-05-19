<template>
  <view class="about-us-page">
    <!-- 头像和介绍 -->
    <view class="profile-section">
      <image class="avatar" src="https://wlmtsys.com:9000/travel/logo.png" />
      <text class="app-name">海岛智游侠</text>
      <text class="slogan">让每次海岛旅行都充满智慧与欢乐</text>
      <text class="desc">我们致力于为用户提供智能、便捷的海岛旅游体验</text>
    </view>

    <!-- 信息卡片 -->
    <view class="card-list">
      <view class="card">
        <view class="card-icon"><uni-icons type="email" size="24" color="#4A90E2" /></view>
        <view class="card-content">
          <text class="card-title">联系客服</text>
          <text class="card-desc">为您提供专业的服务支持</text>
        </view>
      </view>
      <view class="card">
        <view class="card-icon"><uni-icons type="info" size="24" color="#4A90E2" /></view>
        <view class="card-content">
          <text class="card-title">当前版本</text>
          <text class="card-desc">Version 2.0.0</text>
        </view>
      </view>
      <view class="card">
        <view class="card-icon"><uni-icons type="chat" size="24" color="#4A90E2" /></view>
        <view class="card-content">
          <text class="card-title">意见反馈</text>
          <text class="card-desc">帮助我们变得更好</text>
        </view>
      </view>
    </view>

    <!-- 底部版权 -->
    <view class="footer">
      <text>© 2025 海岛智游侠</text>
      <text>保留所有权利</text>
    </view>
  </view>
</template>

<script setup>
const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.about-us-page {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 40rpx;
}

.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 70rpx;
  margin-bottom: 30rpx;
}
.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-bottom: 20rpx;
}
.app-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #222;
  margin-bottom: 10rpx;
}
.slogan {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 6rpx;
}
.desc {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
}
.card-list {
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}
.card {
  display: flex;
  align-items: center;
  background: #f8fafd;
  border-radius: 20rpx;
  padding: 24rpx 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
}
.card-icon {
  margin-right: 20rpx;
  background: #eaf3ff;
  border-radius: 50%;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-title {
  font-size: 28rpx;
  color: #222;
  font-weight: 500;
}
.card-desc {
  font-size: 22rpx;
  color: #888;
  margin-top: 4rpx;
  display: block;
}
.card-content {
  display: flex;
  flex-direction: column;
}
.footer {
  margin-top: 60rpx;
  text-align: center;
  color: #bbb;
  font-size: 22rpx;
  line-height: 1.8;
}
</style>