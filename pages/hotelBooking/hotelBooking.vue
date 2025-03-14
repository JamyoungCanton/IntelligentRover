
<template>
  <view class="page">
    <view class="header">
      <view class="search-header">
        <!-- <view class="back-btn" @click="goBack">
          <uni-icons type="back" size="20" color="#666666"></uni-icons>
        </view> -->
        <view class="search-input-wrap">
          <uni-icons type="search" size="16" color="#999999" class="search-icon"></uni-icons>
          <input type="text" class="search-input" placeholder="搜索酒店名称、地标、商圈" placeholder-class="placeholder"/>
        </view>
        <view class="voice-btn">
          <uni-icons type="mic-filled" size="20" color="#1B4B98"></uni-icons>
        </view>
      </view>
      
      <view class="date-guest">
        <view class="date-section">
          <text class="label">入住-离店</text>
          <view class="content">
            <uni-icons type="calendar" size="16" color="#1B4B98"></uni-icons>
            <text class="info">8月15日-8月16日</text>
          </view>
        </view>
        <view class="guest-section">
          <text class="label">住客数</text>
          <view class="content">
            <uni-icons type="person" size="16" color="#1B4B98"></uni-icons>
            <text class="info">2人</text>
          </view>
        </view>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <scroll-view class="filter-scroll" scroll-x>
        <view class="filter-wrap">
          <view class="filter-btn active">综合排序</view>
          <view class="filter-btn">价格</view>
          <view class="filter-btn">评分</view>
          <view class="filter-btn">位置</view>
          <view class="filter-btn">筛选</view>
        </view>
      </scroll-view>

      <view class="hotel-list">
        <view class="hotel-card" v-for="(hotel, index) in hotelList" :key="index">
          <image :src="hotel.image" mode="aspectFill" class="hotel-image"></image>
          <view class="hotel-info">
            <view class="hotel-header">
              <text class="hotel-name">{{ hotel.name }}</text>
              <view class="rating">
                <text class="score">{{ hotel.score }}</text>
                <view class="stars">
                  <uni-icons v-for="n in 5" :key="n" type="star-filled" size="14" color="#FFCD3C"></uni-icons>
                </view>
              </view>
            </view>
            <view class="location">
              <uni-icons type="location" size="14" color="#666666"></uni-icons>
              <text class="location-text">{{ hotel.location }}</text>
            </view>
            <view class="price-book">
              <view class="price">
                <text class="price-label">起价</text>
                <text class="price-amount">¥{{ hotel.price }}</text>
              </view>
              <button class="book-btn">立即预订</button>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    
  </view>
</template>

<script  setup>
import { ref } from 'vue'

const goBack = () => {
  uni.navigateBack()
}

const hotelList = ref([
  {
    name: '海景湾度假酒店',
    score: '4.8',
    location: '万山群岛 · 距离海滩200米',
    price: '688',
    image: 'https://ai-public.mastergo.com/ai/img_res/b5b1594fa97ff73ddb1bf17fc90a7a62.jpg'
  },
  {
    name: '蓝湾精品酒店',
    score: '4.6',
    location: '万山群岛 · 商业中心区',
    price: '528',
    image: 'https://ai-public.mastergo.com/ai/img_res/4330171583e81cbb88de3465393ec235.jpg'
  },
  {
    name: '阳光海岸度假公寓',
    score: '4.7',
    location: '万山群岛 · 临近码头',
    price: '458',
    image: 'https://ai-public.mastergo.com/ai/img_res/58cf3d2730faf6aa3c2bab809d9811ca.jpg'
  }
])


</script>

<style>
page {
  height: 100%;
  background-color: #F5F7FA;
}

.page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header {
  background: #FFFFFF;
  flex-shrink: 0;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  height: 88rpx;
}

/* .back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
} */

.search-input-wrap {
  flex: 1;
  margin: 0 20rpx;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 20rpx;
}

.search-input {
  flex: 1;
  height: 64rpx;
  background: #F5F5F5;
  border-radius: 8rpx;
  padding: 0 20rpx 0 60rpx;
  font-size: 28rpx;
}

.placeholder {
  color: #999999;
}

.voice-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-guest {
  display: flex;
  padding: 20rpx 30rpx;
  border-top: 2rpx solid #F5F5F5;
}

.date-section {
  flex: 1;
  margin-right: 30rpx;
}

.guest-section {
  flex: 1;
}

.label {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 10rpx;
}

.content {
  display: flex;
  align-items: center;
}

.info {
  font-size: 28rpx;
  margin-left: 10rpx;
}

.filter-scroll {
  padding: 20rpx 30rpx;
  white-space: nowrap;
}

.filter-wrap {
  display: inline-flex;
  gap: 20rpx;
}

.filter-btn {
  padding: 12rpx 30rpx;
  background: #F5F5F5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #666666;
}

.filter-btn.active {
  background: #1B4B98;
  color: #FFFFFF;
}

.content {
  flex: 1;
  overflow: auto;
}

.hotel-list {
  padding: 0 30rpx;
}

.hotel-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
}

.hotel-image {
  width: 100%;
  height: 380rpx;
}

.hotel-info {
  padding: 30rpx;
}

.hotel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.hotel-name {
  font-size: 32rpx;
  font-weight: 500;
}

.rating {
  display: flex;
  align-items: center;
}

.score {
  color: #1B4B98;
  font-weight: 500;
  margin-right: 10rpx;
}

.stars {
  display: flex;
}

.location {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
}

.location-text {
  font-size: 28rpx;
  color: #666666;
  margin-left: 8rpx;
}

.price-book {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
}

.price-label {
  font-size: 24rpx;
  color: #999999;
}

.price-amount {
  font-size: 32rpx;
  font-weight: 500;
  color: #1B4B98;
  margin-left: 8rpx;
}

.book-btn {
  background: #1B4B98;
  color: #FFFFFF;
  font-size: 28rpx;
  padding: 1rpx 35rpx;
  border-radius: 8rpx;
  margin-right: 10rpx;
}


</style>

