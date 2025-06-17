<template>
  <view class="page">
    <view class="content">
      <!-- 套餐基本信息 -->
      <view class="card">
        <view class="card-header">
          <uni-icons type="calendar" size="20" color="#3B82F6" />
          <text class="package-title">{{ productDetail.title }}</text>
        </view>
      </view>

      <!-- 套餐明细 -->
      <view class="card">
        <view class="card-header">
          <uni-icons type="list" size="20" color="#3B82F6" />
          <text class="card-title">套餐明细</text>
        </view>
        <view class="fee-list">
          <view class="fee-item">
            <text class="fee-name">套餐名称</text>
            <text class="fee-value">{{ productDetail.title }}</text>
          </view>
          <view class="fee-item">
            <text class="fee-name">价格</text>
            <text class="fee-value">¥{{ productDetail.price }}</text>
          </view>
        </view>
      </view>

      <!-- 备注信息 -->
      <view class="card">
        <view class="card-header">
          <uni-icons type="chatboxes" size="20" color="#3B82F6" />
          <text class="card-title">备注信息</text>
        </view>
        <textarea
          v-model="remark"
          class="remark-input"
          placeholder="请输入特殊需求或注意事项"
        />
      </view>

      <!-- 支付方式 -->
      <view class="card">
        <view class="card-header">
          <uni-icons type="wallet" size="20" color="#3B82F6" />
          <text class="card-title">支付方式</text>
        </view>
        <view class="payment-list">
          <view
            class="payment-item"
            :class="{ 'selected': selectedPayment === 'wechat' }"
            @click="selectPayment('wechat')"
          >
            <view class="payment-info">
              <uni-icons type="weixin" size="24" color="#07C160" />
              <text class="payment-name">微信支付</text>
            </view>
            <uni-icons
              v-if="selectedPayment === 'wechat'"
              type="checkbox-filled"
              size="20"
              color="#3B82F6"
            />
          </view>
          <view
            class="payment-item"
            :class="{ 'selected': selectedPayment === 'alipay' }"
            @click="selectPayment('alipay')"
          >
            <view class="payment-info">
              <uni-icons type="wallet" size="24" color="#1677FF" />
              <text class="payment-name">支付宝</text>
            </view>
            <uni-icons
              v-if="selectedPayment === 'alipay'"
              type="checkbox-filled"
              size="20"
              color="#3B82F6"
            />
          </view>
        </view>
      </view>

      <!-- 订单时间选择 -->
      <view class="card">
        <view class="card-header">
          <uni-icons type="calendar" size="20" color="#3B82F6" />
          <text class="card-title">订单时间</text>
        </view>
        <view class="time-select-row">
          <text class="time-label">开始时间</text>
          <view class="picker-value">{{ startDate || '未选择' }}</view>
        </view>
        <view class="time-select-row">
          <text class="time-label">持续时间</text>
          <text class="picker-value">10小时</text>
        </view>
      </view>
    </view>

    <!-- 底部支付按钮 -->
    <view class="bottom-bar">
      <button
        class="confirm-btn"
        :disabled="isPaying"
        :class="{'confirm-btn-disabled': isPaying}"
        @click="handleConfirmPayment"
      >{{ isPaying ? '支付处理中...' : `确认支付 ¥${productDetail.price}` }}</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';
import { onLoad } from '@dcloudio/uni-app';

const userStore = useUserStore();
const productDetail = ref({
  title: '',
  coverImage: '',
  price: 0,
  score: 0,
  soldSum: 0
});
const remark = ref('');
const selectedPayment = ref('wechat');
const startDate = ref('');
const orderSn = ref('');
const isPaying = ref(false);

onLoad((options) => {
  if (options.orderSn) orderSn.value = options.orderSn;
  if (options.date) {
    // 格式化日期显示
    const date = new Date(options.date);
    startDate.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  productDetail.value.title = options.title ? decodeURIComponent(options.title) : '';
  productDetail.value.price = options.price ? Number(options.price) : 0;
  productDetail.value.score = options.score ? Number(options.score) : 0;
  productDetail.value.soldSum = options.soldSum ? Number(options.soldSum) : 0;
  productDetail.value.coverImage = options.coverImage ? decodeURIComponent(options.coverImage) : '';
  console.log('orderSn:', orderSn.value);
});

const selectPayment = (payment) => {
  selectedPayment.value = payment;
};

// 确认支付
const handleConfirmPayment = async () => {
  if (isPaying.value) return;
  
  if (!orderSn.value) {
    uni.showToast({ title: '订单号缺失', icon: 'none' });
    return;
  }
  if (!userStore.token) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }

  isPaying.value = true;
  uni.showLoading({
    title: '支付处理中...'
  });

  try {
    console.log('开始支付，订单号：', orderSn.value, 'token:', userStore.token);
    const res = await uni.request({
      url: `https://island.zhangshuiyi.com/island/front/order/payOrder?orderSn=${orderSn.value}`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'X-Access-Token': userStore.token
      }
    });
    console.log('支付返回：', res.data);
    if (res.statusCode === 200 && res.data && res.data.success) {
      uni.hideLoading();
      uni.showToast({ title: '支付成功', icon: 'success' });
      uni.redirectTo({
        url: `/pages/pay_success/pay_success?orderSn=${orderSn.value}&price=${productDetail.value.price}&title=${encodeURIComponent(productDetail.value.title)}`
      });
    } else {
      uni.showToast({ title: res.data.message || '支付失败', icon: 'none' });
    }
  } catch (error) {
    console.error('支付异常：', error);
    uni.showToast({ title: '支付异常', icon: 'none' });
  } finally {
    isPaying.value = false;
    uni.hideLoading();
  }
};

</script>

<style>
page {
  height: 100%;
  background-color: #f5f5f5;
}

.page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
}


.content {
  flex: 1;
  padding: 32rpx;
  overflow-y: auto;
}

.card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}
.hotalName {
  margin-left: 16rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #3B82F6;
}

.card-title {
  margin-left: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.fee-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
}

.fee-name {
  color: #666666;
}

.fee-summary {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1px solid #f0f0f0;
}

.fee-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}

.fee-original {
  font-size: 26rpx;
  color: #999999;
  text-decoration: line-through;
}

.fee-discount {
  font-size: 26rpx;
  color: #ff4d4f;
}

.fee-name-highlight {
  font-size: 28rpx;
  font-weight: 500;
}

.fee-final {
  font-size: 36rpx;
  font-weight: 500;
  color: #3B82F6;
}

.remark-input {
  width: 100%;
  height: 180rpx;
  padding: 24rpx;
  border: 1px solid #e5e5e5;
  border-radius: 16rpx;
  font-size: 28rpx;
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border: 1px solid #e5e5e5;
  border-radius: 16rpx;
}

.payment-item.selected {
  border-color: #3B82F6;
}

.payment-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.payment-name {
  font-size: 28rpx;
}

.bottom-bar {
  padding: 32rpx;
  background-color: #ffffff;
  border-top: 1px solid #f0f0f0;
}

.confirm-btn {
  width: 100%;
  height: 88rpx;
  background-color: #3B82F6;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-select-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}
.time-label {
  width: 120rpx;
  color: #666;
  font-size: 28rpx;
}
.picker-value {
  flex: 1;
  color: #333;
  font-size: 28rpx;
  padding-left: 16rpx;
}

.confirm-btn-disabled {
  background-color: #93c5fd !important;
  opacity: 0.8;
}
</style>