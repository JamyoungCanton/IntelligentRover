
<template>
  <view class="page">
    <view class="nav-bar" :style="{paddingTop:safeAreaInsets.top + 'px'}">
      <uni-icons @click="goBack" type="back" size="24" color="#333333"></uni-icons>
      <text class="nav-title">交通指南</text>
      <uni-icons type="search" size="24" color="#333333"></uni-icons>
    </view>

    <view class="content">
      <view class="search-card">
        <view class="search-input">
          <uni-icons type="location-filled" size="16" color="#1E88E5"></uni-icons>
          <input type="text" placeholder="请输入目的地" />
        </view>
        <view class="map-container">
          <image src="https://ai-public.mastergo.com/ai/img_res/7134febf19871ac51c93dcb9487df089.jpg" mode="aspectFill" />
        </view>
        <button class="nav-button" @click="startNavigation">开始导航</button>
      </view>

      <scroll-view class="tab-scroll" scroll-x>
        <view class="tab-container">
          <view 
            v-for="(tab, index) in tabs" 
            :key="index"
            :class="['tab-item', { active: currentTab === index }]"
            @click="changeTab(index)"
          >
            {{ tab }}
          </view>
        </view>
      </scroll-view>

      <view class="transport-list">
        <view 
          v-for="(station, index) in stations" 
          :key="index" 
          class="transport-card"
        >
          <view class="station-header">
            <view class="station-info">
              <text class="station-name">{{ station.name }}</text>
              <text class="station-distance">距离您 {{ station.distance }}</text>
            </view>
            <view class="detail-link">
              <text>详情</text>
              <uni-icons type="right" size="14" color="#1E88E5"></uni-icons>
            </view>
          </view>
          <view class="bus-lines">
            <view 
              v-for="(line, lineIndex) in station.lines" 
              :key="lineIndex" 
              class="bus-line"
            >
              {{ line }}路
            </view>
          </view>
        </view>
      </view>
    </view>

    
  </view>
</template>

<script setup>
import { ref } from 'vue';

//获取页面安全距离
const safeAreaInsets = uni.getSystemInfoSync().safeAreaInsets;
console.log(safeAreaInsets);




const currentTab = ref(0);
const tabs = ['公交', '出租车', '租车', '自驾'];

const stations = ref([
  {
    name: '万山码头公交站',
    distance: '300m',
    lines: [1, 2, 5]
  },
  {
    name: '海岛旅游中心站',
    distance: '500m',
    lines: [3, 6]
  },
  {
    name: '渔人码头站',
    distance: '800m',
    lines: [1, 4]
  }
]);



const changeTab = (index) => {
  currentTab.value = index;
};

const startNavigation = () => {
  // 导航逻辑
};

const goBack = () => {
  uni.navigateBack();
};
</script>

<style>
page {
  height: 100%;
  background-color: #F8F9FA;
}

.page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  background-color: #FFFFFF;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.nav-title {
  font-size: 34rpx;
  font-weight: 500;
  color: #333333;
}

.content {
  flex: 1;
  padding: 32rpx;
  overflow: auto;
}

.search-card {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.search-input {
  display: flex;
  align-items: center;
  background-color: #F5F5F5;
  padding: 16rpx;
  border-radius: 16rpx;
}

.search-input input {
  flex: 1;
  margin-left: 16rpx;
  font-size: 28rpx;
}

.map-container {
  margin-top: 32rpx;
  height: 400rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.map-container image {
  width: 100%;
  height: 100%;
}

.nav-button {
  margin-top: 32rpx;
  background-color: #1E88E5;
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 500;
}

.tab-scroll {
  margin-top: 48rpx;
}

.tab-container {
  display: flex;
  padding: 0 16rpx;
}

.tab-item {
  padding: 16rpx;
  margin-right: 48rpx;
  font-size: 28rpx;
  color: #666666;
  position: relative;
}

.tab-item.active {
  color: #1E88E5;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4rpx;
  background-color: #1E88E5;
}

.transport-list {
  margin-top: 32rpx;
}

.transport-card {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.station-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.station-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
}

.station-distance {
  display: block;
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}

.detail-link {
  display: flex;
  align-items: center;
  color: #1E88E5;
  font-size: 28rpx;
}

.bus-lines {
  display: flex;
  flex-wrap: wrap;
  margin-top: 24rpx;
  gap: 16rpx;
}

.bus-line {
  padding: 8rpx 16rpx;
  background-color: rgba(30, 136, 229, 0.1);
  color: #1E88E5;
  border-radius: 8rpx;
  font-size: 24rpx;
}


</style>

