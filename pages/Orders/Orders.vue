<template>
  <view class="page">
    <!-- 顶部标题栏 -->
    <view class="header">
      <view class="back-btn">
        
      </view>
      <text class="title">碧海渔排</text>
      <view class="favorite-btn">
        <uni-icons type="heart" size="24" color="#333"></uni-icons>
      </view>
    </view>

    <!-- 主视觉图 -->
    <view class="main-image">
      <image src="https://wlmtsys.com:9000/travel/bulider.png" mode="aspectFill"></image>
    </view>

    <!-- 评分和月售信息 -->
    <view class="rating-section">
      <view class="rating-stars">
        <uni-icons type="star-filled" size="20" color="#FFD700" v-for="n in 5" :key="n"></uni-icons>
		&nbsp;&nbsp;<view class="rating-score"><text>4.8 分</text></view>
      </view>
      <p class="monthly-sales">月售 2890 | 用户评价 1260</p>
    </view>

    <!-- 活动信息卡片 -->
    <view class="promotion-card">
      <p class="promotion-title">限时特惠活动</p>
      <text class="promotion-date">活动时间：2025.03.15 - 2025.04.15</text>
      <text class="promotion-price">4人套餐优惠价 ¥398（原价 ¥598）</text>
      <text class="promotion-details">包含：渔具租赁、专业指导、船票、午餐、饮用水等</text>
    </view>

    <!-- 联系方式 -->
    <view class="contact-section">
        <!-- 联系电话 -->
        <view class="contact-item">
          <view class="call-btn">
            <image src="/static/Orders/left-photo.png" class="icon"></image>
          </view>
          <text class="contact-text">0756-28895566</text>
          <view class="call-btn">
            <image src="/static/Orders/right-photo.png" class="icon"></image>
          </view>
        </view>
        
        <!-- 营业时间 -->
        <view class="contact-item">
          <view class="icon-container">
            <image src="/static/Orders/clock.png" class="icon"></image>
          </view>
          <text class="contact-text">活动时间：07:00 - 17:00（视天气情况调整）</text>
        </view>
        
        <!-- 地址 -->
        <view class="contact-item">
          <view class="icon-container">
            <image src="/static/Orders/location.png" class="icon"></image>
          </view>
          <text class="contact-text">广东省珠海市万山区万山岛码头</text>
        </view>
      </view>

    <!-- 地图展示 -->
    <view class="map-section">
      <image src="https://wlmtsys.com:9000/travel/map.png" mode="aspectFit"></image>
    </view>

    <!-- 底部价格和预订按钮 -->
    <view class="bottom-bar">
      <view class="price-info">
        <text class="current-price">¥398</text>
        <text class="original-price">¥598</text>
      </view>
      <button class="book-btn" @tap="gopayment">立即预订</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

// 返回按钮点击事件
const goBack = () => {
  uni.navigateBack();
};

const gopayment = ()=> {
  // 跳转到详情支付页面
  uni.navigateTo({ url: '/pages/payment/payment' })

}
const getSafeAreaInsets = () => {
        const systemInfo = uni.getSystemInfoSync();
        if (systemInfo.safeArea) {
			safeAreaTop.value = `${systemInfo.safeArea.top}px`;
            safeAreaBottom.value = `${systemInfo.safeArea.bottom}px`;
        }
	}
</script>

<style scoped>
.page {
  background-color: #f5f5f5;
  min-height: 125vh;
}

/* 顶部标题栏 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.back-btn, .favorite-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

/* 主视觉图 */
.main-image {
  width: 100%;
  height: 500rpx;
  overflow: hidden;
}

.main-image image {
  width: 100%;
  height: 100%;
}

/* 评分和月售信息 */
.rating-section {
  padding: 30rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
}

.rating-stars {
  display: flex;
  margin-bottom: 10rpx;
}

.rating-score {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.monthly-sales {
  font-size: 24rpx;
  color: #666;
}

/* 活动信息卡片 */
.promotion-card {
  background-color: #e6f2ff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 0 30rpx 30rpx;
}

.promotion-title {
  color: #007AFF;
  font-size: 32rpx;
  margin-bottom: 20rpx;
}

.promotion-date, .promotion-price, .promotion-details {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
}

/* 联系方式 */
.contact-section {
  background-color: #fff;
  padding: 30rpx;
  margin: 0 30rpx 30rpx;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.contact-item:last-child {
  margin-bottom: 0;
}

.icon-container {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.icon {
  width: 30rpx;
  height: 30rpx;
}

.contact-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.call-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
}
/* 地图展示 */
.map-section {
  margin: 0 30rpx 30rpx;
  border-radius: 20rpx;
  overflow: hidden;
  height: 300rpx;
}

.map-section image {
  width: 100%;
  height: 100%;
}

/* 底部价格和预订按钮 */
.bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background-color: #fff;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

.price-info {
  display: flex;
  align-items: center;
}

.current-price {
  font-size: 40rpx;
  color: #FF5A5F;
  font-weight: bold;
  margin-left: 50rpx;
}

.original-price {
  font-size: 28rpx;
  color: #999;
  text-decoration: line-through;
}

.book-btn {
  background-color: #007AFF;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  padding: 5rpx 50rpx;
  font-size: 32rpx;
  margin-right: 50rpx;
}
</style>