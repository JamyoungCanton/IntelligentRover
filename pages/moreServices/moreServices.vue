
<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-content">
        <text class="nav-title">更多服务</text>
        <view class="search-btn">
          <uni-icons type="search" size="22" color="#666666"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 主要内容区 -->
    <view class="main-content">
      <!-- 天气卡片 -->
      <view class="weather-card">
        <view class="weather-main">
          <view class="weather-info">
            <text class="temperature">28°C</text>
            <text class="location">万山群岛，晴</text>
          </view>
          <image class="weather-icon" src="https://ai-public.mastergo.com/ai/img_res/bf53904b482a5630076fdac368da803d.jpg" mode="aspectFit"></image>
        </view>

        <!-- 天气预报滚动区 -->
        <scroll-view class="weather-forecast" scroll-x>
          <view class="forecast-items">
            <view class="forecast-item">
              <text class="time">现在</text>
              <image class="forecast-icon" src="https://wuminghui.top:9000/wlmtsys/2025/05/19/34bdf4c7d7df4176809257ac3594630d.png"></image>
              <text class="temp">28°</text>
            </view>
            <view class="forecast-item">
              <text class="time">14:00</text>
              <image class="forecast-icon" src="https://wuminghui.top:9000/wlmtsys/2025/05/19/eb3b7432f593494daf8052daf907b730.png" mode="aspectFit"></image>
              <text class="temp">29°</text>
            </view>
            <view class="forecast-item">
              <text class="time">15:00</text>
              <image class="forecast-icon" src="https://wuminghui.top:9000/wlmtsys/2025/05/19/19fc218e86a443f88d4af4a2da4d36e1.png" mode="aspectFit"></image>
              <text class="temp">27°</text>
            </view>
            <view class="forecast-item">
              <text class="time">16:00</text>
              <image class="forecast-icon" src="https://wuminghui.top:9000/wlmtsys/2025/05/19/d34b4e568aae48d18845c9acf138fd13.png" mode="aspectFit"></image>
              <text class="temp">26°</text>
            </view>
          </view>
        </scroll-view>

        <!-- 天气详情 -->
        <view class="weather-details">
          <view class="detail-item">
            <text class="detail-label">风力</text>
            <text class="detail-value">3级</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">湿度</text>
            <text class="detail-value">65%</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">能见度</text>
            <text class="detail-value">10km</text>
          </view>
        </view>
      </view>

      <!-- 紧急服务 -->
      <view class="section">
        <text class="section-title">紧急服务</text>
        <button class="emergency-btn warn" >
          <uni-icons type="phone-filled" size="20" color="#FFFFFF"></uni-icons>
          <text class="emergency-text">紧急求助 120</text>
        </button>
        <view class="emergency-grid">
          <view class="emergency-item">
            <image
              src="https://wuminghui.top:9000/wlmtsys/2025/05/19/b0d1e9f642a346ee9cdce177fde55d70.png"
              mode="scaleToFill"
              style="height: 35rpx; width: 35rpx;"
            />
            <text class="item-title">医疗救助</text>
            <text class="item-desc">0759-120</text>
          </view>
          <view class="emergency-item">
            <uni-icons type="refreshempty" size="24" color="#0066FF"></uni-icons>
            <text class="item-title">海上救援</text>
            <text class="item-desc">12395</text>
          </view>
          <view class="emergency-item">
            <uni-icons type="notification" size="24" color="#0066FF"></uni-icons>
            <text class="item-title">警务支持</text>
            <text class="item-desc">110</text>
          </view>
          <view class="emergency-item">
            <uni-icons type="help" size="24" color="#0066FF"></uni-icons>
            <text class="item-title">消防救援</text>
            <text class="item-desc">119</text>
          </view>
        </view>
      </view>

      <!-- 常用服务 -->
      <view class="section">
        <text class="section-title">常用服务</text>
        <view class="service-grid">
          <view class="service-item" v-for="(item, index) in commonServices" :key="index">
            <view class="icon-box">
              <uni-icons :type="item.icon" size="24" color="#0066FF"></uni-icons>
            </view>
            <text class="service-name">{{ item.name }}</text>
          </view>
        </view>
      </view>

      <!-- 其他服务 -->
      <view class="section">
        <text class="section-title">其他服务</text>
        <view class="other-service-grid">
          <view class="service-item" v-for="(item, index) in otherServices" :key="index">
            <view class="icon-box">
              <uni-icons :type="item.icon" size="24" color="#0066FF"></uni-icons>
            </view>
            <text class="service-name">{{ item.name }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
  
  </view>
</template>

<script  setup>
import { ref } from 'vue';

const commonServices = ref([
  { icon: 'location', name: '景点攻略' },
  { icon: 'location', name: '船票预定' },
  { icon: 'shop', name: '美食推荐' },
  { icon: 'home', name: '住宿预定' },
  { icon: 'flag', name: '停车收费' },
  { icon: 'paperplane', name: '小票积分' },
  { icon: 'staff', name: '交通指南' }
]);

const otherServices = ref([
  { icon: 'shield', name: '旅游保险' },
  { icon: 'person', name: '导游服务' },
  { icon: 'chat', name: '翻译服务' },
  { icon: 'car', name: '租车服务' },
  { icon: 'gift', name: '快递服务' },
  { icon: 'help', name: '医疗援助' }
]);


</script>

<style>
page {
  height: 100%;
  background-color: #F5F5F5;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.nav-bar {
  background-color: #FFFFFF;
  border-bottom: 1px solid #EEEEEE;
  flex-shrink: 0;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 500;
  color: #333333;
}

.search-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-content {
  flex: 1;
  padding: 32rpx;
  overflow: auto;
}

.weather-card {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.weather-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.weather-info {
  display: flex;
  flex-direction: column;
}

.temperature {
  font-size: 48rpx;
  font-weight: 500;
  color: #333333;
}

.location {
  margin-top: 8rpx;
  font-size: 28rpx;
  color: #666666;
}

.weather-icon {
  width: 128rpx;
  height: 128rpx;
}

.weather-forecast {
  margin-top: 32rpx;
}

.forecast-items {
  display: flex;
  padding: 8rpx 0;
}

.forecast-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 48rpx;
}

.time {
  font-size: 24rpx;
  color: #666666;
}

.forecast-icon {
  width: 60rpx;
  height: 60rpx;
  margin: 18rpx 0;
}

.temp {
  font-size: 28rpx;
  font-weight: 500;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32rpx;
  margin-top: 32rpx;
}

.detail-item {
  text-align: center;
}

.detail-label {
  font-size: 24rpx;
  color: #666666;
}

.detail-value {
  display: block;
  margin-top: 8rpx;
  font-size: 28rpx;
  color: #333333;
}

.section {
  margin-top: 48rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 32rpx;
}

.emergency-btn {
  display: flex;
  margin-top: 20rpx;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  background-color: #FF4D4F;
  border-radius: 8rpx;
}

.emergency-text {
  margin-left: 16rpx;
  color: #FFFFFF;
  font-size: 32rpx;
}

.emergency-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32rpx;
  margin-top: 32rpx;
}

.emergency-item {
  background-color: #FFFFFF;
  padding: 32rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.item-title {
  display: block;
  margin-top: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.item-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #666666;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32rpx;
  margin-top: 22rpx;
}

.other-service-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32rpx;
  margin-top: 22rpx;
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-box {
  width: 96rpx;
  height: 96rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.service-name {
  font-size: 24rpx;
  color: #333333;
}


</style>

