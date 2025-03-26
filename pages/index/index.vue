
<template>
  <view class="page">
    <view class="nav-bar fixed-top flex-row items-center px-32" :style="{paddingTop:safeAreaInsets.top + 'px'}">
      <view class="flex-row items-center text-white">
        <uni-icons type="spinner-cycle" size="24" color="#4CAF50" />
        <uni-icons type="spinner-cycle" size="24" color="#FFD700" />
        <text class="nav-title">海岛智游侠</text>
        <uni-icons type="spinner-cycle" size="24" color="#FFD700" />
        <uni-icons type="spinner-cycle" size="24" color="#4CAF50" />
      </view>
    </view>

    


    <scroll-view class="main-content" scroll-y>
      <view class="search-container">
        <view class="search-box">
          <uni-icons type="search" size="16" color="#999" />
          <input type="text" class="search-input" placeholder="搜索景点/美食/住宿" />
        </view>
      </view>

      <view class="banner">
        <image src="https://ai-public.mastergo.com/ai/img_res/a44a5f661a986db716a71f19589a90e9.jpg" mode="aspectFill" />
      </view>

      <view class="grid-container">
        <view v-for="(item, index) in gridItems" :key="index" class="grid-item" @click="navigateTo(item.path)">
          <view class="grid-image-container">
            <image :src="item.image" mode="aspectFill" />
          </view>
          <text class="grid-text">{{ item.text }}</text>
        </view>
      </view>

      <view class="section">
        <text class="section-title">热门活动</text>
        <view class="activity-container">
          <view 
            v-for="(activity, index) in activities" 
            :key="index" 
            class="activity-card"
            @click="navigateToActivity"
          >
            <image :src="activity.image" mode="aspectFill" class="activity-image" />
            <view class="activity-info">
              <text class="activity-title">{{ activity.title }}</text>
              <text class="activity-price">{{ activity.price }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">精选路线</text>
        <view class="route-card" @click="navigateToRoute">
          <image src="https://ai-public.mastergo.com/ai/img_res/29f6b0ecc3a2e6885a39cbde9d4a762e.jpg" mode="aspectFill" class="route-image" />
          <view class="route-info">
            <text class="route-title">浪漫双岛游</text>
            <text class="route-desc">东澳岛-外伶仃岛 2日游</text>
            <text class="route-price">¥688/人起</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="ai-float-btn" @click="showAiDialog">
      <view class="ai-btn">
        <img src="/static/chat/robot-avatar.png" alt="">
      </view>
      <text class="ai-text">智能导游</text>
    </view>
<!-- 
    <navbar></navbar> -->
    <!-- <uni-popup ref="aiPopup" type="bottom">
      <view class="ai-dialog">
        <view class="dialog-header">
          <text class="dialog-title">智能导游</text>
          <view class="close-btn" @click="hideAiDialog">
            <uni-icons type="close" size="20" color="#999" />
          </view>
        </view>

        <view class="dialog-content">
          <view class="voice-input">
            <uni-icons type="mic" size="40" color="#4A88FF" />
            <text class="voice-tip">点击开始语音输入</text>
          </view>

          <view class="quick-actions">
            <view class="action-btn" v-for="(action, index) in quickActions" :key="index">
              <uni-icons :type="action.icon" size="16" color="#4A88FF" />
              <text class="action-text">{{ action.text }}</text>
            </view>
          </view>

          <view class="ai-message">
            <view class="message-content">
              <uni-icons type="spinner-cycle" size="20" color="#4A88FF" />
              <view class="message-body">
                <text class="message-text">您好！我是万山群岛智能导游。请问需要什么帮助？</text>
                <view class="play-voice">
                  <uni-icons type="play" size="12" color="#4A88FF" />
                  <text class="play-text">播放语音</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </uni-popup> -->

    
  </view>
</template>

<script  setup>
import { ref } from 'vue';
// import navbar from '../navbar/navbar.vue';

const aiPopup = ref();

const showAiDialog = () => {
  // aiPopup.value.open();
  uni.navigateTo({
    url: '/pages/chat/chat'
  });
};

// const hideAiDialog = () => {
//   aiPopup.value.close();
// };

const gridItems = [
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/298a09126b167b2389171cf1732d0efd.jpg',
    text: '景点攻略',
    path: '/pages/attractionGuide/attractionGuide'
  },
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/67e82bbc342b0532a7d47d9a9495e4e6.jpg',
    text: '船票预订',
    path: '/pages/ticketBooking/ticketBooking'
  },
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/a46f5a2748b96ebacfead5f2ce9a2d23.jpg',
    text: '美食推荐',
    path: '/pages/foodRecommendation/foodRecommendation'
  },
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/d4eaef4d2ae27ea58ef90ce8114cbbc0.jpg',
    text: '住宿预订',
    path: '/pages/hotelBooking/hotelBooking'
  },
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/6e3b763c2b9b0240282a50a27279cc92.jpg',
    text: '停车收费',
    path:'/pages/parkingFees/parkingFees'
  },
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/868a88ac3f0c7165d1ff7e4edcd8c6de.jpg',
    text: '小票积分',
    path: '/pages/ticketPoints/ticketPoints'
  },
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/ff98fe41d0920a84166f2cb230b71b03.jpg',
    text: '交通指南',
    path: '/pages/transportationGuide/transportationGuide'
  },
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/a23f3a06a4a4106ad0a8dbe37d4ba3c8.jpg',
    text: '更多服务',
    path: '/pages/moreServices/moreServices'
  }
];

const activities = [
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/8b2e19990586b743036f49f399c57074.jpg',
    title: '海钓体验',
    price: '¥288/人起'
  },
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/553e2a3f698900f0619f5ee2615903a9.jpg',
    title: '深潜探索',
    price: '¥368/人起'
  }
];

const quickActions = [
  { icon: 'calendar', text: '2 天行程' },
  { icon: 'spinner-cycle', text: '我想去海钓' },
  { icon: 'spinner-cycle', text: '美食推荐' },
  { icon: 'spinner-cycle', text: '住宿预订' }
];

const navigateTo = (path) => {
  uni.navigateTo({
    url: path
  });
};

// 跳转到 chat 页面
const navigateToChat = () => {
  uni.navigateTo({
    url: '/pages/chat/chat'
  });
};

// 跳转到 热门活动 页面
const navigateToActivity = () => {
  uni.navigateTo({
    url: '/pages/activity/activity'
  });
};

// 跳转到 精选路线 页面
const navigateToRoute = () => {
  uni.navigateTo({
	url: '/pages/route/route'
  });
};

// 获取屏幕安全距离
const safeAreaInsets = uni.getSystemInfoSync().safeAreaInsets;
</script>

<style>
page {
  height: 100%;
  background-color: #f5f5f5;
}

.page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  display: flex;
  align-items: center;
  width: 100%;
  height: 78rpx;
  background-color: #4A88FF;
  z-index: 100;
}

.nav-title {
  font-size: 32rpx;
  color: #FFFFFF;
  margin: 0 16rpx;
  font-family: 'Cursive', cursive;
}

.main-content {
  flex: 1;
  overflow: auto;
}

.search-container {
  padding: 24rpx 32rpx;
  background-color: #FFFFFF;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  height: 80rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 0 32rpx;
}

.search-input {
  flex: 1;
  height: 80rpx;
  font-size: 28rpx;
  margin-left: 16rpx;
}

.banner {
  width: 100%;
  height: 384rpx;
}

.banner image {
  width: 100%;
  height: 100%;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32rpx;
  padding: 48rpx 32rpx;
  background-color: #FFFFFF;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.grid-image-container {
  width: 128rpx;
  height: 128rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.grid-image-container image {
  width: 100%;
  height: 100%;
}

.grid-text {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #333333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 128rpx;
}

.section {
  margin-top: 16rpx;
  padding: 48rpx 32rpx;
  /* margin-bottom: ; */
  background-color: #FFFFFF;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 132rpx;
  
}

.activity-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32rpx;
  margin-top: 22rpx;
}

.activity-card {
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.activity-image {
  width: 100%;
  height: 256rpx;
}

.activity-info {
  padding: 24rpx;
}

.activity-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.activity-price {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}

.route-card {
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  margin-top: 25rpx;
}

.route-image {
  width: 100%;
  height: 256rpx;
}

.route-info {
  padding: 24rpx;
}

.route-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.route-desc {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}

.route-price {
  font-size: 24rpx;
  color: #4A88FF;
  margin-top: 16rpx;
}

.ai-float-btn {
  position: fixed;
  right: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 99;
}

.ai-btn {
  width: 96rpx;
  height: 96rpx;
  background-color: #4A88FF;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(74, 136, 255, 0.2);
}
.ai-btn image{
  width: 44rpx;
  height: 44rpx;
  align-items: center;
  justify-content: center;
}

.ai-text {
  font-size: 20rpx;
  color: #FFFFFF;
  background-color: rgba(74, 136, 255, 0.8);
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  margin-top: 8rpx;
  white-space: nowrap;
}

.ai-dialog {
  background-color: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
}

.voice-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 256rpx;
  background-color: #f5f5f5;
  border-radius: 16rpx;
  margin-bottom: 32rpx;
}

.voice-tip {
  font-size: 24rpx;
  color: #999999;
  margin-top: 16rpx;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 16rpx 32rpx;
  background-color: #f5f5f5;
  border-radius: 16rpx;
}

.action-text {
  font-size: 24rpx;
  color: #333333;
  margin-left: 16rpx;
}

.ai-message {
  background-color: rgba(74, 136, 255, 0.05);
  border-radius: 16rpx;
  padding: 24rpx;
}

.message-content {
  display: flex;
  align-items: flex-start;
}

.message-body {
  margin-left: 16rpx;
}

.message-text {
  font-size: 24rpx;
  color: #333333;
}

.play-voice {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}

.play-text {
  font-size: 20rpx;
  color: #4A88FF;
  margin-left: 8rpx;
}



.text-active {
  color: #4A88FF;
}
</style>

