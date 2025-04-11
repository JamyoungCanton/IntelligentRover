<template>
  <view class="page">
    <!-- 导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: safeAreaInsets.top ? safeAreaInsets.top + 'px' : '0px' }">
      <uni-icons @click="goBack" type="back" size="24" color="#333333"></uni-icons>
      <text class="nav-title">交通指南</text>
      <uni-icons type="search" size="24" color="#333333"></uni-icons>
    </view>

    <!-- 主内容区 -->
    <scroll-view class="main-content" scroll-y>
      <!-- 车牌输入卡片 -->
      <view class="card">
        <text class="label">请输入车牌号</text>
        <view class="plate-input">
          <input type="text" class="province-input" v-model="plateProvince" placeholder="粤" maxlength="1" />
          <input type="text" class="number-input" v-model="plateNumber" placeholder="请输入车牌号" maxlength="6" />
          <view class="change-btn">
            <uni-icons type="loop" size="24" color="#666666"></uni-icons>
          </view>
        </view>

        <scroll-view class="history-plates" scroll-x>
          <view class="label">
            <text>我的车牌</text>
          </view>
          <view v-for="(plate, index) in historyPlates" :key="index" :class="['plate-item', { active: plate.active }]">
            {{ plate.text }}
          </view>
        </scroll-view>
      </view>

      <!-- 停车信息卡片 -->
      <view class="card">
        <view class="info-row">
          <text class="info-label">当前停车地点</text>
          <text class="info-value">万山群岛游客中心停车场</text>
        </view>
        <view class="info-row">
          <text class="info-label">入场时间</text>
          <text class="info-value">2024-01-20 09:30</text>
        </view>
        <view class="info-row">
          <text class="info-label">已停车时长</text>
          <text class="info-value">2 小时 30 分钟</text>
        </view>
        <view class="info-row">
          <text class="info-label">应付金额</text>
          <text class="price">¥15.00</text>
        </view>
        <text class="fee-standard">收费标准：首 2 小时 10 元，之后每小时 5 元</text>
      </view>

      <!-- 支付方式卡片 -->
      <view class="card">
        <text class="title">支付方式</text>
        <view class="payment-list">
          <label class="payment-item" v-for="(item, index) in paymentMethods" :key="index">
            <view class="payment-info">
              <image :src="item.icon" mode="scaleToFill" />
              <text>{{ item.name }}</text>
            </view>
            <radio :value="item.value" :checked="selectedPayment === item.value" @click="selectedPayment = item.value"
              color="#1E88E5" />
          </label>
        </view>
      </view>

      <view class="standard">
        <view class="payStanding">
          <text class="PayStandingTitle">收费标准</text>
        </view>
        <view class="payStandingContent">
          <text class="standingItem">1.首2小时内10元</text>
          <text class="standingItem">2.超出时间段每小时收5元</text>
          <text class="standingItem">3.24小时封顶50元</text>
        </view>
      </view>

    </scroll-view>

    <!-- 底部支付栏 -->
    <view class="bottom-bar">
      <button class="pay-btn" @click="onPayClick">立即支付 ￥15.00</button>
    </view>


  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const plateProvince = ref('');
const plateNumber = ref('');
const selectedPayment = ref('wechat');

const historyPlates = ref([
  { text: '粤 A12345', active: true },
  { text: '粤 B67890', active: false }
]);

const paymentMethods = ref([
  { name: '微信支付', icon: '/static/parkingFees/weixin.png', color: '#07C160', value: 'wechat' },
  { name: '支付宝', icon: '/static/parkingFees/zhifubao.png', color: '#1677FF', value: 'alipay' }
]);

// 获取屏幕的安全距离
const safeAreaInsets = uni.getSystemInfoSync().safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

const onHistoryClick = () => {
  // 处理历史记录点击
};

const onHelpClick = () => {
  // 处理帮助点击
};

const onServiceClick = () => {
  // 处理客服点击
};

const onPayClick = () => {
  // 处理支付点击
};
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

.main-content {
  flex: 1;
  padding: 32rpx;
  overflow: auto;
}

.card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  /* margin-righrt: 32rpx; */
  margin-bottom: 32rpx;
  width: 83%;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.label {
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 16rpx;
}

.plate-input {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.province-input {
  width: 100rpx;
  height: 88rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
}

.number-input {
  flex: 1;
  height: 88rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
}

.change-btn {
  width: 88rpx;
  height: 88rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-plates {
  white-space: nowrap;
}

.plate-item {
  display: inline-block;
  padding: 16rpx 32rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  margin-right: 24rpx;
  color: #666666;
}

.plate-item.active {
  border-color: #1E88E5;
  color: #1E88E5;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.info-label {
  font-size: 28rpx;
  color: #666666;
}

.info-value {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.price {
  font-size: 36rpx;
  font-weight: 500;
  color: #1E88E5;
}

.fee-standard {
  font-size: 24rpx;
  color: #999999;
}

.title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 32rpx;
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.payment-info image {
  width: 38rpx;
  height: 38rpx;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx;
  /* border: 2rpx solid #e0e0e0; */
  border-radius: 8rpx;
}

.payment-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.standard {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  width: 83%;
}

.payStandingContent {
  display: flex;
  flex-direction: column;
}

.PayStandingTitle {
  font-size: 32rpx;
  font-weight: 500;
}

.payStandingContent {
  margin-top: 22rpx;
  font-size: 26rpx;
  font-weight: 300;

}

.bottom-bar {
  height: 120rpx;
  background-color: #ffffff;
  padding: 0rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  align-content: center;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}


.pay-btn {
  background-color: #1E88E5;
  color: #ffffff;
  padding: 0rpx 64rpx;
  border-radius: 8rpx;
  font-size: 32rpx;
  width: 500rpx;
}
</style>
