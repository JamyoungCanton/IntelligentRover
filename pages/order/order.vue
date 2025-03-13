
<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav">
      <view class="search-container">
        <view class="search-wrapper">
          <uni-icons class="search-icon" type="search" size="16" color="#999"></uni-icons>
          <input class="search-input" type="text" placeholder="搜索订单编号/景点名称" />
        </view>
        <view class="filter-btn">
          <uni-icons type="settings" size="20" color="#1890FF"></uni-icons>
        </view>
      </view>
      <scroll-view class="order-status-tabs" scroll-x>
        <view class="tabs-wrapper">
          <view v-for="(tab, index) in tabs" :key="index" 
                class="tab-item" 
                :class="{ active: currentTab === index }"
                @click="handleTabClick(index)">
            {{ tab }}
            <view v-if="currentTab === index" class="tab-indicator"></view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 主内容区 -->
    <scroll-view class="main-content" scroll-y>
      <view class="order-list">
        <!-- 订单项1 -->
        <view class="order-item">
          <view class="order-header">
            <text class="order-title">碧海渔排</text>
            <text class="order-status waiting">待支付</text>
          </view>
          <view class="order-info">
            <image class="order-image" src="https://ai-public.mastergo.com/ai/img_res/d12ebc8619a462d9b7de65e8ee0f61b9.jpg" mode="aspectFill"></image>
            <view class="order-details">
              <text class="detail-text">用餐日期：2024-01-18</text>
              <text class="detail-text">人数：2人</text>
              <text class="detail-text">订单号：2024011800001</text>
            </view>
          </view>
          <view class="order-footer">
            <text class="price">¥ 398</text>
            <view class="button-group">
              <button class="btn btn-default">取消订单</button>
              <button class="btn btn-primary">立即支付</button>
            </view>
          </view>
        </view>

        <!-- 订单项2 -->
        <view class="order-item">
          <view class="order-header">
            <text class="order-title">两天精选海岛行程</text>
            <text class="order-status paid">已支付</text>
          </view>
          <view class="order-info">
            <image class="order-image" src="https://ai-public.mastergo.com/ai/img_res/eca975b4a54bcecdd2e27d4c0f8a986a.jpg" mode="aspectFill"></image>
            <view class="order-details">
              <text class="detail-text">出发：2024-01-15</text>
              <text class="detail-text">结束：2024-01-16</text>
              <text class="detail-text">订单号：2024011500001</text>
            </view>
          </view>
          <view class="order-footer">
            <text class="price">¥ 1,288</text>
            <view class="button-group">
              <button class="btn btn-primary">查看详情</button>
            </view>
          </view>
        </view>

        <!-- 订单项3 -->
        <view class="order-item">
          <view class="order-header">
            <text class="order-title">完善群岛休闲游</text>
            <text class="order-status completed">已完成</text>
          </view>
          <view class="order-info">
            <image class="order-image" src="https://ai-public.mastergo.com/ai/img_res/a99c445c6e48f144ebfafad1f3e4e966.jpg" mode="aspectFill"></image>
            <view class="order-details">
              <text class="detail-text">出发：2024-01-01</text>
              <text class="detail-text">结束：2024-01-03</text>
              <text class="detail-text">订单号：2024010100001</text>
            </view>
          </view>
          <view class="order-footer">
            <text class="price">¥ 1,899</text>
            <view class="button-group">
              <button class="btn btn-default">删除订单</button>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    
  </view>
</template>

<script setup>
import { ref } from 'vue';

const tabs = ['全部', '待支付', '待出行', '进行中', '已完成'];
const currentTab = ref(0);




</script>

<style>
page {
  height: 100%;
}

.page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
}

/* 导航样式 */
.nav {
  background: #fff;
  padding-top: 20rpx;
  flex-shrink: 0;
}

.search-container {
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  margin-bottom: 20rpx;
}

.search-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 16rpx;
  padding: 20rpx;
  position: relative;
}

.search-icon {
  margin-right: 20rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
}

.filter-btn {
  margin-left: 20rpx;
  padding: 20rpx;
}

.order-status-tabs {
  white-space: nowrap;
  padding: 0 30rpx 20rpx;
}

.tabs-wrapper {
  display: inline-flex;
}

.tab-item {
  padding: 20rpx 30rpx;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #1890FF;
  font-weight: 500;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4rpx;
  background-color: #1890FF;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  overflow: auto;
}

.order-list {
  padding: 30rpx;
}

.order-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.order-title {
  font-size: 32rpx;
  font-weight: 500;
}

.order-status {
  font-size: 28rpx;
}

.order-status.waiting {
  color: #1890FF;
}

.order-status.paid {
  color: #52c41a;
}

.order-status.completed {
  color: #999;
}

.order-info {
  display: flex;
  margin-bottom: 20rpx;
}

.order-image {
  width: 200rpx;
  height: 140rpx;
  border-radius: 12rpx;
}

.order-details {
  flex: 1;
  margin-left: 20rpx;
}

.detail-text {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 2rpx solid #f5f5f5;
}

.price {
  font-size: 32rpx;
  font-weight: 500;
}

.button-group {
  display: flex;
  gap: 20rpx;
}

.btn {
  font-size: 24rpx;
  padding: 12rpx 30rpx;
  border-radius: 8rpx;
}

.btn-default {
  background: #fff;
  border: 2rpx solid #ddd;
  color: #666;
}

.btn-primary {
  background: #1890FF;
  color: #fff;
}


</style>

