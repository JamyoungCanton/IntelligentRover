
<template>
  <view class="page">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="nav-title">停车收费</text>
      <uni-icons @click="onHistoryClick" type="clock" size="24" color="#ffffff"></uni-icons>
    </view>

    <!-- 主内容区 -->
    <scroll-view class="main-content" scroll-y>
      <!-- 车牌输入卡片 -->
      <view class="card">
        <text class="label">请输入车牌号</text>
        <view class="plate-input">
          <input 
            type="text"
            class="province-input"
            v-model="plateProvince"
            placeholder="粤"
            maxlength="1"
          />
          <input
            type="text"
            class="number-input"
            v-model="plateNumber"
            placeholder="A12345"
            maxlength="6"
          />
          <view class="change-btn">
            <uni-icons type="loop" size="24" color="#666666"></uni-icons>
          </view>
        </view>

        <scroll-view class="history-plates" scroll-x>
          <view
            v-for="(plate, index) in historyPlates"
            :key="index"
            :class="['plate-item', { active: plate.active }]"
          >
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
        <text class="title">选择支付方式</text>
        <view class="payment-list">
          <label class="payment-item" v-for="(item, index) in paymentMethods" :key="index">
            <view class="payment-info">
              <uni-icons :type="item.icon" size="24" :color="item.color"></uni-icons>
              <text>{{ item.name }}</text>
            </view>
            <radio 
              :value="item.value" 
              :checked="selectedPayment === item.value"
              @click="selectedPayment = item.value"
              color="#1E88E5"
            />
          </label>
        </view>
      </view>

      <!-- 帮助按钮区 -->
      <view class="help-section">
        <view class="help-btn" @click="onHelpClick">
          <uni-icons type="help" size="20" color="#666666"></uni-icons>
          <text>常见问题</text>
        </view>
        <view class="help-btn" @click="onServiceClick">
          <uni-icons type="phone" size="20" color="#666666"></uni-icons>
          <text>联系客服</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部支付栏 -->
    <view class="bottom-bar">
      <view class="total-price">
        总计：<text class="price">¥15.00</text>
      </view>
      <button class="pay-btn" @click="onPayClick">立即支付</button>
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
  { name: '微信支付', icon: 'wallet', color: '#07C160', value: 'wechat' },
  { name: '支付宝', icon: 'wallet', color: '#1677FF', value: 'alipay' }
]);



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
  background-color: #1E88E5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  flex-shrink: 0;
}

.nav-title {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 500;
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
  margin-bottom: 32rpx;
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

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
}

.payment-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.help-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.help-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  color: #666666;
}

.bottom-bar {
  height: 120rpx;
  background-color: #ffffff;
  padding: 0rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.total-price {
  font-size: 28rpx;
  color: #666666;
}

.pay-btn {
  background-color: #1E88E5;
  color: #ffffff;
  padding: 0rpx 64rpx;
  border-radius: 8rpx;
  font-size: 32rpx;
}


</style>

