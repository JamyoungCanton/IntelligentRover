
<template>
  <view class="page">
    <view class="header">
      <view class="search-header">
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
          <view class="content" >
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
          <view
            v-for="(btn, index) in filterButtons"
            :key="index"
            class="filter-btn"
            :class="{ active: activeFilter === btn.value }"
            @click="setActiveFilter(btn.value)"
          >
            {{ btn.label }}
          </view>
        </view>
      </scroll-view>

      <view class="hotel-list">
        <view class="hotel-card" v-for="(hotel, index) in filteredHotels" :key="index">
          <image :src="hotel.imageURL" mode="aspectFill" class="hotel-image"></image>
          <view class="hotel-info">
            <view class="hotel-header">
              <text class="hotel-name">{{ hotel.name }}</text>
              <view class="rating">
                <text class="score">{{ hotel.rating }}</text>
                <uni-rate :value="hotel.rating" size="10" readonly></uni-rate>
              </view>
            </view>
            <view class="location">
              <view class="start">
                <text class="location-text">星级: </text>
                <text class="location-amount">{{ hotel.starrating }}</text>
              </view>
              <view class="start">
                <text class="location-text">房型: </text>
                <text class="location-amount">{{ hotel.roomtype }}</text>
              </view>
              <view class="start">
                <text class="location-text">类型: </text>
                <text class="location-amount">{{ hotel.hoteltype }}</text>
              </view>
              <view class="start">
                <text class="location-text">主题: </text>
                <text class="location-amount">{{ hotel.hoteltheme }}</text>
              </view>
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

<script setup>
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';
import { computed } from 'vue';
const userStore = useUserStore();
const hotelList = ref([]);
const combinedArray = ref([]);

const imageUrls = ref([
  "https://wlmtsys.com:9000/travel/h1.jpg",
  "https://wlmtsys.com:9000/travel/h2.jpg",
  "https://wlmtsys.com:9000/travel/h3.jpg",
  "https://wlmtsys.com:9000/travel/h4.jpg",
  "https://wlmtsys.com:9000/travel/h5.jpg",
  "https://wlmtsys.com:9000/travel/h6.jpg",
  "https://wlmtsys.com:9000/travel/h7.jpg",
  "https://wlmtsys.com:9000/travel/h8.jpg",
  "https://wlmtsys.com:9000/travel/h9.jpeg",
  "https://wlmtsys.com:9000/travel/h10.jpg",
  "https://wlmtsys.com:9000/travel/h11.jpg",
  "https://wlmtsys.com:9000/travel/h12.jpg",
  "https://wlmtsys.com:9000/travel/h13.jpg",
  "https://wlmtsys.com:9000/travel/h14.jpg",
  "https://wlmtsys.com:9000/travel/h15.jpg",
  "https://wlmtsys.com:9000/travel/h16.jpg",
  "https://wlmtsys.com:9000/travel/h17.jpg",
  "https://wlmtsys.com:9000/travel/h18.jpg",
  "https://wlmtsys.com:9000/travel/h19.jpeg",
  "https://wlmtsys.com:9000/travel/h20.jpg",

]);

const filterButtons = ref([
  { label: '综合排序', value: 'comprehensive' },
  { label: '价格↑', value: 'priceup' },
  { label: '价格↓', value: 'pricedown' },
  { label: '评分', value: 'rating' }
]);

const activeFilter = ref('comprehensive');

const setActiveFilter = (value) => {
  activeFilter.value = value;
};

onMounted(() => {
  getHotelList();
});

const getHotelList = () => {
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/product/ilAccommodations/list',
    method: 'GET',
    data: {
      pageNo: 1,
      pageSize: 50
    },
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token
    },
    success: (res) => {
      hotelList.value = res.data.result.records;
      combinedArray.value = hotelList.value.map((item, index) => ({
        ...item,
        imageURL: imageUrls.value[index]
      }));
    },
    fail: (err) => {
      console.error('请求失败', err);
      uni.showToast({
        title: '加载失败，请稍后重试',
        icon: 'none'
      });
    }
  });
};

const filteredHotels = computed(() => {
  switch (activeFilter.value) {
    case 'comprehensive':
    getHotelList();
      return combinedArray.value;
    case 'priceup':
      return combinedArray.value.sort((a, b) => a.price - b.price);
      case 'pricedown':
      return combinedArray.value.sort((a, b) => b.price - a.price);
    case 'rating':
      return combinedArray.value.sort((a, b) => b.rating - a.rating);
    case 'location':
      return combinedArray.value.sort((a, b) => b.location - a.location);
  }
});



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
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.filter-btn {
  flex: 1;
  padding: 12rpx 30rpx;
  background: #e2e1e1;
  border-radius: 8rpx;
  text-align: center;
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
  flex-wrap: wrap;
  justify-content: space-between;
}

.location-text {
  font-size: 28rpx;
  color: #666666;
  margin-left: 8rpx;
}

.location-amount{
  font-size: 30rpx;
  font-weight: 500;
  color: #1B4B98;
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

