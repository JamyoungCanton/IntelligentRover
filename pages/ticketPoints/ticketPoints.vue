
<template>
  <view class="page">
    <view class="nav">
      <text class="nav-title">小票积分</text>
      <text class="nav-btn">积分规则</text>
    </view>

    <view class="main">
      <view class="points-card">
        <view class="points-info">
          <view>
            <text class="points-label">当前可用积分</text>
            <text class="points-value">2,580</text>
          </view>
          <view class="points-actions">
            <view class="action-btn">
              <uni-icons type="list" size="24" color="#ffffff" />
              <text>积分明细</text>
            </view>
            <view class="action-btn">
              <uni-icons type="gift" size="24" color="#ffffff" />
              <text>我的兑换</text>
            </view>
          </view>
        </view>
      </view>

      <view class="action-buttons">
        <button class="upload-btn">
          <uni-icons type="camera" size="20" color="#ffffff" />
          <text>上传小票</text>
        </button>
        <button class="exchange-btn">
          <uni-icons type="refresh" size="20" color="#1E88E5" />
          <text>积分兑换</text>
        </button>
      </view>

      <view class="hot-exchange">
        <view class="section-header">
          <text class="section-title">热门兑换</text>
          <text class="view-all">查看全部</text>
        </view>
        <scroll-view class="scroll-container" scroll-x>
          <view class="exchange-items">
            <view class="exchange-item">
              <image src="https://ai-public.mastergo.com/ai/img_res/9862da1b33d1d1334115fe5a444d0d20.jpg" mode="aspectFill" />
              <text class="item-title">50元代金券</text>
              <text class="item-points">500积分</text>
            </view>
            <view class="exchange-item">
              <image src="https://ai-public.mastergo.com/ai/img_res/fc99b4e0d5a4feab184e01b07bf93e60.jpg" mode="aspectFill" />
              <text class="item-title">电影票兑换券</text>
              <text class="item-points">800积分</text>
            </view>
            <view class="exchange-item">
              <image src="https://ai-public.mastergo.com/ai/img_res/5246591a0e6493e21db4ab167af5a935.jpg" mode="aspectFill" />
              <text class="item-title">星巴克咖啡券</text>
              <text class="item-points">1000积分</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="receipt-records">
        <text class="section-title">小票记录</text>
        <view class="record-list">
          <view class="record-item">
            <image class="receipt-image" src="https://ai-public.mastergo.com/ai/img_res/7332eb1b8feeb2ad5a1cc7c0ec5e7f4e.jpg" mode="aspectFill" />
            <view class="record-info">
              <view class="record-header">
                <text class="shop-name">万山海鲜餐厅</text>
                <text class="points-earned">+100积分</text>
              </view>
              <text class="amount">消费金额：￥328</text>
              <text class="time">2023-06-15 12:30</text>
            </view>
            <text class="status">已通过</text>
          </view>

          <view class="record-item">
            <image class="receipt-image" src="https://ai-public.mastergo.com/ai/img_res/7332eb1b8feeb2ad5a1cc7c0ec5e7f4e.jpg" mode="aspectFill" />
            <view class="record-info">
              <view class="record-header">
                <text class="shop-name">万山渔家乐</text>
                <text class="points-earned">+80积分</text>
              </view>
              <text class="amount">消费金额：￥256</text>
              <text class="time">2023-06-14 18:45</text>
            </view>
            <text class="status">已通过</text>
          </view>
        </view>
      </view>
    </view>

    
  </view>
</template>

<script lang="ts" setup>
</script>

<style>
page {
  height: 100%;
  background-color: #F8F9FA;
}

.page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background-color: #1E88E5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  z-index: 100;
}

.nav-title {
  font-size: 16px;
  color: #ffffff;
  font-weight: 500;
}

.nav-btn {
  font-size: 14px;
  color: #ffffff;
}

.main {
  flex: 1;
  padding: 120rpx 32rpx 0;
  overflow: auto;
}

.points-card {
  background-color: #1E88E5;
  border-radius: 16rpx;
  padding: 48rpx;
  margin-bottom: 48rpx;
}

.points-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.points-label {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8rpx;
}

.points-value {
  display: block;
  font-size: 24px;
  color: #ffffff;
  font-weight: 600;
}

.points-actions {
  display: flex;
  gap: 32rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.9;
}

.action-btn text {
  font-size: 14px;
  color: #ffffff;
  margin-top: 8rpx;
}

.action-buttons {
  display: flex;
  gap: 32rpx;
  margin-bottom: 48rpx;
}

.upload-btn, .exchange-btn {
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
}

.upload-btn {
  background-color: #1E88E5;
  color: #ffffff;
}

.exchange-btn {
  background-color: #ffffff;
  color: #1E88E5;
  border: 2rpx solid #1E88E5;
}

.upload-btn text, .exchange-btn text {
  margin-left: 16rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
}

.view-all {
  font-size: 14px;
  color: #808080;
}

.scroll-container {
  overflow: auto;
}

.exchange-items {
  display: flex;
  gap: 32rpx;
}

.exchange-item {
  flex-shrink: 0;
  width: 280rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.exchange-item image {
  width: 240rpx;
  height: 240rpx;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}

.item-title {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8rpx;
}

.item-points {
  font-size: 12px;
  color: #808080;
}

.receipt-records {
  margin-top: 48rpx;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.record-item {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding: 32rpx;
  border-radius: 16rpx;
}

.receipt-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  margin-right: 32rpx;
}

.record-info {
  flex: 1;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.shop-name {
  font-size: 14px;
  font-weight: 500;
  color: #333333;
}

.points-earned {
  font-size: 14px;
  color: #1E88E5;
}

.amount, .time {
  display: block;
  font-size: 14px;
  color: #808080;
  margin-bottom: 8rpx;
}

.status {
  font-size: 12px;
  color: #4CAF50;
  margin-left: 32rpx;
}


</style>

