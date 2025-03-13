
<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="nav-title">船票预定</text>
      <uni-icons type="refresh" size="24" color="#ffffff" class="history-icon" />
    </view>

    <!-- 主内容区域 -->
    <scroll-view class="content-container" scroll-y>
      <view class="search-card">
        <view class="location-row">
          <view class="location-item">
            <text class="label">出发地</text>
            <text class="value">万山港</text>
          </view>
          <view class="exchange-btn">
            <uni-icons type="loop" size="20" color="#0066CC" />
          </view>
          <view class="location-item align-right">
            <text class="label">目的地</text>
            <text class="value">东澳岛</text>
          </view>
        </view>
        
        <view class="date-row">
          <view class="date-item">
            <text class="label">出发日期</text>
            <text class="value">2024-01-20</text>
          </view>
          <view class="date-item align-right">
            <text class="label">乘车人数</text>
            <text class="value">2 人</text>
          </view>
        </view>

        <button class="search-btn" type="primary">查询船票</button>
      </view>

      <view class="filter-bar">
        <view class="filter-left">
          <uni-icons type="filter" size="16" color="#666666" />
          <text class="filter-text">筛选</text>
        </view>
        <view class="filter-right">
          <view class="sort-item">
            <text class="sort-text">时间</text>
            <uni-icons type="down" size="16" color="#666666" />
          </view>
          <view class="sort-item">
            <text class="sort-text">价格</text>
            <uni-icons type="down" size="16" color="#666666" />
          </view>
        </view>
      </view>

      <view class="ticket-list">
        <view class="ticket-card" v-for="(item, index) in tickets" :key="index">
          <view class="time-row">
            <text class="time">{{item.time}}</text>
            <text class="duration">{{item.duration}}</text>
          </view>
          <view class="ship-row">
            <text class="ship-name">{{item.shipName}}</text>
            <text class="price">{{item.price}}</text>
          </view>
          <view class="action-row">
            <text class="remain">剩余 {{item.remain}} 张</text>
            <button class="book-btn primary" type="button" size="mini">预订</button>
          </view>
        </view>
      </view>
    </scroll-view>

   
  </view>
</template>

<script  setup>
import { ref } from 'vue'

const tickets = ref([
  {
    time: '08:30 - 09:30',
    duration: '约 1 小时',
    shipName: '海钻号 · 豪华客轮',
    price: '¥ 138 起',
    remain: 42
  },
  {
    time: '10:30 - 11:30',
    duration: '约 1 小时',
    shipName: '海星号 · 豪华客轮',
    price: '¥ 138 起',
    remain: 28
  },
  {
    time: '14:30 - 15:30',
    duration: '约 1 小时',
    shipName: '海豚号 · 豪华客轮',
    price: '¥ 138 起',
    remain: 56
  }
])
</script>

<style>
page {
  height: 100%;
}

.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.nav-header {
  height: 88rpx;
  background-color: #0066CC;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  flex-shrink: 0;
}

.nav-title {
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
}

.history-icon {
  width: 48rpx;
  height: 48rpx;
}

.content-container {
  flex: 1;
  overflow: auto;
}

.search-card {
  margin: 32rpx;
  padding: 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.location-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.location-item {
  flex: 1;
}

.exchange-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.align-right {
  text-align: right;
}

.label {
  font-size: 14px;
  color: #333333;
  font-weight: 500;
  margin-bottom: 8rpx;
  display: block;
}

.value {
  font-size: 14px;
  color: #0066CC;
}

.date-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.date-item {
  flex: 1;
}

.search-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #0066CC;
  color: #ffffff;
  border-radius: 8rpx;
  font-size: 14px;
}

.filter-bar {
  margin: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-left {
  display: flex;
  align-items: center;
}

.filter-text {
  font-size: 14px;
  color: #666666;
  margin-left: 8rpx;
}

.filter-right {
  display: flex;
  align-items: center;
}

.sort-item {
  display: flex;
  align-items: center;
  margin-left: 32rpx;
}

.sort-text {
  font-size: 14px;
  color: #666666;
  margin-right: 8rpx;
}

.ticket-list {
  margin: 0 32rpx;
}

.ticket-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.time-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.time {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
}

.duration {
  font-size: 14px;
  color: #999999;
}

.ship-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.ship-name {
  font-size: 14px;
  color: #666666;
}

.price {
  font-size: 14px;
  color: #0066CC;
  font-weight: 500;
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remain {
  font-size: 14px;
  color: #999999;
}

.book-btn {
  padding: 0 32rpx;
  width: 230rpx;
  margin-right: 5rpx;
  height: 64rpx;
  line-height: 64rpx;
  background: #0066CC;
  color: #ffffff;
  font-size: 14px;
  border-radius: 8rpx;
  
}


</style>

