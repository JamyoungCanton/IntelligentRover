<template>
  <view class="container">
    <!-- Header with back button and name -->
    <view class="header">
      <view class="back-button" @tap="goBack">
        <text class="iconfont icon-back">&#xe679;</text>
      </view>
      <text class="header-title">{{ restaurant.name }}</text>
      <view class="share-button">
        <text class="iconfont icon-share">&#xe60f;</text>
      </view>
    </view>
    
    <!-- Main image -->
    <view class="image-container">
      <image :src="restaurant.imageUrl || '/static/placeholder.png'" mode="aspectFill" class="main-image" />
    </view>
    
    <!-- Restaurant info card -->
    <view class="info-card">
      <view class="name-section">
        <text class="name">{{ restaurant.name }}</text>
        <view class="rating-container">
          <view class="stars">
            <text v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= Math.round(restaurant.rating) }">★</text>
          </view>
          <text class="rating-score">{{ restaurant.rating.toFixed(1) }}</text>
        </view>
      </view>
      
      <view class="price-sales">
        <view class="price">
          <text class="price-label">人均</text>
          <text class="price-value">¥{{ restaurant.priceaverage }}</text>
        </view>
        <view class="sales">
          <text class="sales-label">月售</text>
          <text class="sales-value">{{ restaurant.monthlySales }}+</text>
        </view>
      </view>
      
      <view class="divider"></view>
      
      <view class="detail-item">
        <text class="iconfont icon-time">&#xe65f;</text>
        <text class="detail-label">营业时间</text>
        <text class="detail-value">{{ restaurant.starthour }} - {{ restaurant.endhour }}</text>
      </view>
      
      <view class="detail-item">
        <text class="iconfont icon-phone">&#xe64a;</text>
        <text class="detail-label">预订电话</text>
        <text class="detail-value phone" @tap="callPhone">{{ restaurant.phone }}</text>
      </view>
      
      <view class="detail-item">
        <text class="iconfont icon-location">&#xe611;</text>
        <text class="detail-label">地址</text>
        <text class="detail-value address">{{ restaurant.address }}</text>
      </view>
    </view>
    
    <!-- Description card -->
    <view class="description-card">
      <view class="section-title">
        <text class="title-text">餐厅介绍</text>
        <view class="title-line"></view>
      </view>
      <text class="description-text">{{ restaurant.description }}</text>
    </view>
    
    <!-- Food types card -->
    <view class="food-types-card">
      <view class="section-title">
        <text class="title-text">菜品类型</text>
        <view class="title-line"></view>
      </view>
      <view class="food-tags">
        <text v-for="(item, index) in restaurant.foodTypes" :key="index" class="food-tag">
          {{ item }}
        </text>
      </view>
    </view>
    
    <!-- Recommended dishes -->
    <view class="dishes-card">
      <view class="section-title">
        <text class="title-text">推荐菜品</text>
        <view class="title-line"></view>
      </view>
      <scroll-view scroll-x class="dishes-scroll">
        <view class="dishes-container">
          <view v-for="(dish, index) in recommendedDishes" :key="index" class="dish-item">
            <image :src="dish.image" mode="aspectFill" class="dish-image" />
            <text class="dish-name">{{ dish.name }}</text>
            <text class="dish-price">¥{{ dish.price }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- Book button -->
    <view class="book-button-container">
      <button class="book-button" @tap="bookTable">立即预订</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      restaurant: {
        // Original fields
        address: "海南省三亚市海棠区海棠湾路88号",
        endhour: "22:00",
        id: 1,
        imageUrl: "https://wlmtsys.com:9000/huihui/baiyun.jpg",
        islandid: 1,
        name: "海鲜大排档",
        priceaverage: 128,
        starthour: "10:00",
        
        // Additional fields
        rating: 4.8,
        monthlySales: 2356,
        phone: "0898-88123456",
        description: "这家海鲜大排档位于三亚海棠湾，是当地最受欢迎的海鲜餐厅之一。餐厅环境舒适，视野开阔，可以欣赏到美丽的海景。主打新鲜的本地海鲜，食材每天从渔港直接采购，保证最佳的新鲜度和口感。招牌菜包括椒盐皮皮虾、清蒸石斑鱼、蒜蓉蒸扇贝等。餐厅还提供特色的海南本地菜肴，如文昌鸡、海南粉等，让您在享用海鲜的同时，也能品尝到地道的海南风味。",
        foodTypes: ["海鲜", "粤菜", "海南菜", "烧烤"]
      },
      recommendedDishes: [
        {
          name: "椒盐皮皮虾",
          price: 138,
          image: "https://wlmtsys.com:9000/huihui/baiyun.jpg"
        },
        {
          name: "清蒸石斑鱼",
          price: 198,
          image: "https://wlmtsys.com:9000/huihui/baiyun.jpg"
        },
        {
          name: "蒜蓉蒸扇贝",
          price: 88,
          image: "https://wlmtsys.com:9000/huihui/baiyun.jpg"
        },
        {
          name: "文昌鸡",
          price: 128,
          image: "https://wlmtsys.com:9000/huihui/baiyun.jpg"
        },
        {
          name: "海南粉",
          price: 38,
          image: "https://wlmtsys.com:9000/huihui/baiyun.jpg"
        }
      ]
    };
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    callPhone() {
      uni.makePhoneCall({
        phoneNumber: this.restaurant.phone
      });
    },
    bookTable() {
      uni.showToast({
        title: '预订功能即将上线',
        icon: 'none'
      });
    }
  }
}
</script>

<style>
.container {
  background-color: #f8f8f8;
  min-height: 100vh;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.back-button, .share-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.iconfont {
  font-family: "iconfont";
}

.icon-back, .icon-share {
  font-size: 40rpx;
  color: #333;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-container {
  width: 100%;
  height: 420rpx;
  overflow: hidden;
  margin-top: 88rpx; /* Space for the fixed header */
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-card {
  margin: 30rpx;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.name-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.rating-container {
  display: flex;
  align-items: center;
}

.stars {
  display: flex;
  margin-right: 10rpx;
}

.star {
  color: #ddd;
  font-size: 30rpx;
  margin-right: 4rpx;
}

.star.filled {
  color: #ffcc00;
}

.rating-score {
  font-size: 28rpx;
  color: #ff9500;
  font-weight: bold;
}

.price-sales {
  display: flex;
  margin-bottom: 20rpx;
}

.price, .sales {
  display: flex;
  align-items: center;
  margin-right: 40rpx;
}

.price-label, .sales-label {
  font-size: 26rpx;
  color: #999;
  margin-right: 10rpx;
}

.price-value {
  font-size: 30rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.sales-value {
  font-size: 28rpx;
  color: #666;
}

.divider {
  height: 1rpx;
  background-color: #f0f0f0;
  margin: 20rpx 0;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.icon-time, .icon-phone, .icon-location {
  font-size: 32rpx;
  color: #999;
  margin-right: 15rpx;
}

.detail-label {
  font-size: 28rpx;
  color: #999;
  width: 140rpx;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.phone {
  color: #4a90e2;
}

.address {
  line-height: 1.5;
}

.description-card, .food-types-card, .dishes-card {
  margin: 30rpx;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-right: 20rpx;
}

.title-line {
  flex: 1;
  height: 2rpx;
  background-color: #f0f0f0;
}

.description-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  text-align: justify;
}

.food-tags {
  display: flex;
  flex-wrap: wrap;
}

.food-tag {
  font-size: 24rpx;
  color: #666;
  background-color: #f0f0f0;
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
}

.dishes-scroll {
  width: 100%;
}

.dishes-container {
  display: flex;
  padding: 10rpx 0;
}

.dish-item {
  width: 200rpx;
  margin-right: 20rpx;
}

.dish-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 10rpx;
}

.dish-name {
  font-size: 26rpx;
  color: #333;
  margin-top: 10rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dish-price {
  font-size: 26rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.book-button-container {
  padding: 30rpx;
  margin-bottom: 50rpx;
}

.book-button {
  width: 100%;
  height: 90rpx;
  background-color: #ff6b6b;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>