<template>
  <view class="container">
    <view class="nav">
      <text class="nav-title">支付结果</text>
      <view class="nav-right"></view>
    </view>

    <view class="main">
      <view class="success-icon">
        <uni-icons type="checkmarkempty" size="80" color="#4CAF50"></uni-icons>
      </view>

      <text class="success-title">支付成功</text>
      <text class="success-desc">您的订单已完成支付，祝您旅途愉快！</text>

      <view class="order-info">
        <view class="info-item">
          <text class="item-label">订单金额</text>
          <text class="item-value">¥ {{ amount }}</text>
        </view>
        <view class="info-item">
          <text class="item-label">支付方式</text>
          <text class="item-value">{{ payment === 'wechat' ? '微信支付' : '支付宝' }}</text>
        </view>
        <view class="info-item">
          <text class="item-label">订单编号</text>
          <text class="item-value">{{ orderId }}</text>
        </view>
      </view>
      <button class="btn primary" @tap="navigatortoOrder">查看订单详情</button>
      <button class="btn default" @tap="ToitineraryEvaluation">评价一下</button>
      <button class="btn default" @tap="Toindex">返回首页</button>
    </view>
  </view>
</template>

<script setup>
import Navbar from '../navbar/navbar.vue';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

const price = ref('');
const payment = ref('');
const orderId = ref('');
const amount = ref(0);

onLoad((options) => {
  price.value = options.price || '0.00';
  payment.value = options.payment || '未知方式';
  orderId.value = options.orderId || '暂无订单号';
  amount.value = options.amount;
});

const navigatortoOrder = () => {
  uni.switchTab({
    url: '/pages/order/order'
  });
};
const ToitineraryEvaluation = () => {
  uni.navigateTo({
    url: '/pages/itineraryEvaluation/itineraryEvaluation'
  });
};
const Toindex = () => {
  uni.switchTab({
    url: '/pages/index/index'
  });
};
// 注册组件
const components = {
  Navbar
};

</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #ffffff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.nav-left,
.nav-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  margin-left: 40%;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 30rpx 0;
}

.success-icon {
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  background-color: rgba(76, 175, 80, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.success-title {
  font-size: 20px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 20rpx;
}

.success-desc {
  font-size: 14px;
  color: #999999;
  text-align: center;
  margin-bottom: 40rpx;
}

.order-info {
  width: 100%;
  background-color: #f8f8f8;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.info-item:last-child {
  margin-bottom: 0;
}

.item-label {
  font-size: 14px;
  color: #999999;
}

.item-value {
  font-size: 14px;
  color: #333333;
}

.btn {
  width: 100%;
  height: 88rpx;
  border-radius: 8rpx;
  font-size: 16px;
  margin-bottom: 20rpx;
}

.btn.primary {
  background-color: #4CAF50;
  color: white;
}

.btn.default {
  background-color: #ffffff;
  border: 2rpx solid #e5e5e5;
  color: #666666;
}

.tab-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100rpx;
  background-color: #ffffff;
  border-top: 2rpx solid #f5f5f5;
  padding: 0 20rpx;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tab-text {
  font-size: 12px;
  color: #999999;
  margin-top: 8rpx;
}

.tab-text.active {
  color: #4CAF50;
}

.navbar {
  position: fixed;
  bottom: 0;
  width: 100%;
  margin-bottom: 0px;
}
</style>