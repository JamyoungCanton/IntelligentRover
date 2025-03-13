
<template>
  <view class="page">
    <scroll-view class="content" scroll-y>
      <view class="user-info">
        <view class="avatar-container">
          <image class="avatar" src="https://ai-public.mastergo.com/ai/img_res/508713f1b448125ce860a6554331770f.jpg" />
        </view>
        <view class="user-detail">
          <text class="username">陈美玲</text>
          <text class="phone">138****5678</text>
        </view>
        <uni-icons type="right" size="14" color="#999" />
      </view>

      <view class="grid-container">
        <view class="grid-item" v-for="(item, index) in gridItems" :key="index">
          <view class="grid-icon">
            <image :src="item.icon" mode="aspectFit" />
          </view>
          <text class="grid-text">{{ item.text }}</text>
        </view>
      </view>

      <view class="menu-card">
        <view class="menu-item">
          <view class="menu-left">
            <uni-icons type="list" size="18" color="#3B82F6" />
            <text class="menu-text">全部订单</text>
          </view>
          <uni-icons type="right" size="14" color="#999" />
        </view>
      </view>

      <view class="menu-card">
        <view class="menu-item border-bottom">
          <view class="menu-left">
            <uni-icons type="gear" size="18" color="#3B82F6" />
            <text class="menu-text">账号设置</text>
          </view>
          <uni-icons type="right" size="14" color="#999" />
        </view>
        <view class="menu-item border-bottom">
          <view class="menu-left">
            <uni-icons type="notification" size="18" color="#3B82F6" />
            <text class="menu-text">通知设置</text>
          </view>
          <uni-icons type="right" size="14" color="#999" />
        </view>
        <view class="menu-item">
          <view class="menu-left">
            <uni-icons type="spinner-cycle" size="18" color="#3B82F6" />
            <text class="menu-text">语言切换</text>
          </view>
          <uni-icons type="right" size="14" color="#999" />
        </view>
      </view>

      <view class="menu-card">
        <view class="menu-item border-bottom">
          <view class="menu-left">
            <uni-icons type="chatboxes" size="18" color="#3B82F6" />
            <text class="menu-text">意见反馈</text>
          </view>
          <uni-icons type="right" size="14" color="#999" />
        </view>
        <view class="menu-item">
          <view class="menu-left">
            <uni-icons type="info" size="18" color="#3B82F6" />
            <text class="menu-text">关于我们</text>
          </view>
          <uni-icons type="right" size="14" color="#999" />
        </view>
      </view>
    </scroll-view>

    
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const gridItems = ref([
  {
    icon: 'https://ai-public.mastergo.com/ai/img_res/4192a970e1156a95833445f64fb4c1ba.jpg',
    text: '收藏行程'
  },
  {
    icon: 'https://ai-public.mastergo.com/ai/img_res/76778fc2a8a40ed9c6e1b9e5fc87f4e5.jpg',
    text: '历史订单'
  },
  {
    icon: 'https://ai-public.mastergo.com/ai/img_res/dab4ae9b672cb2e2be0c9e1ff722477b.jpg',
    text: '待出行'
  },
  {
    icon: 'https://ai-public.mastergo.com/ai/img_res/c2d8fdc4258102ea814c9a54ec7e97f3.jpg',
    text: '客服中心'
  }
]);
</script>

<style>
page {
  height: 100%;
  background-color: #F8F8F8;
}

.page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  overflow: auto;
  padding: 20rpx 0;
}

.user-info {
  margin: 0 30rpx;
  padding: 30rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.avatar-container {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  overflow: hidden;
  background-color: #F5F5F5;
}

.avatar {
  width: 100%;
  height: 100%;
}

.user-detail {
  flex: 1;
  margin-left: 30rpx;
}

.username {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
}

.phone {
  font-size: 12px;
  color: #999999;
  margin-top: 8rpx;
  display: block;
}

.grid-container {
  margin: 0 30rpx;
  padding: 30rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30rpx;
  margin-bottom: 30rpx;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.grid-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16rpx;
}

.grid-icon image {
  width: 100%;
  height: 100%;
}

.grid-text {
  font-size: 12px;
  color: #333333;
}

.menu-card {
  margin: 0 30rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
}

.menu-item {
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-text {
  font-size: 14px;
  color: #333333;
  margin-left: 20rpx;
}

.border-bottom {
  border-bottom: 1px solid #F5F5F5;
}


</style>

