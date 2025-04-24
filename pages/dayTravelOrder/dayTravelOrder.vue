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
          <view class="fee-item">
            <text class="fee-name">评分</text>
            <text class="fee-value">{{ productDetail.score }}</text>
          </view>
          <view class="fee-item">
            <text class="fee-name">已售数量</text>
            <text class="fee-value">{{ productDetail.soldSum }}</text>
          </view>
        </view>
      </view>

      <!-- 游客信息 -->
      <view class="card">
        <view class="card-header">
          <uni-icons type="person" size="20" color="#3B82F6" />
          <text class="card-title">游客信息</text>
        </view>
        <view class="input-wrapper">
          <input
            type="number"
            v-model="phone"
            class="phone-input"
            placeholder="请输入手机号码"
          />
          <view class="clear-icon" @click="clearPhone" v-if="phone">
            <uni-icons type="clear" size="20" color="#999" />
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
    </view>

    <!-- 底部支付按钮 -->
    <view class="bottom-bar">
      <button
        class="confirm-btn"
        @click="handleConfirmPayment"
      >确认支付 ¥{{ productDetail.price }}</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';
import { onLoad } from '@dcloudio/uni-app';

const userStore = useUserStore();
const packageId = ref('');
const productDetail = ref({
  id: '',
  title: '',
  subtitle: '',
  coverImage: '',
  price: 0,
  originalPrice: 0,
  score: 0,
  soldSum: 0
});
const phone = ref('');
const remark = ref('');
const selectedPayment = ref('wechat');

onLoad((options) => {
  if (options.id) {
	console.log(options.id);
    packageId.value = options.id;
    fetchProductDetail();
  }
});

const fetchProductDetail = async () => {
  try {
    const res = await uni.request({
      url: `https://island.zhangshuiyi.com/island/il-package/get/${packageId.value}`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'X-Access-Token': userStore.token || ''
      }
    });

    // 检查请求是否成功
    if (res.statusCode === 200 && res.data && res.data) {
      const data = res.data.result;
      productDetail.value = {
        id: data.id,
        title: data.title,
        subtitle: data.packname,
        coverImage: data.images && data.images[0] && data.images[0].url ? data.images[0].url.replace(/<[^>]+>/g, '') : '/static/daytravelDetail/man.png',
        price: parseFloat(data.price),
        originalPrice: parseFloat(data.priceDesc.split(',')[0]) || 0,
        score: data.score,
        soldSum: data.soldSum
      };
    } else {
      console.error('获取产品详情失败:', res[1].data.message || '未知错误');
      uni.showToast({
        title: res[1].data.message || '获取产品详情失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('请求失败:', error);
    uni.showToast({
      title: '网络异常，请稍后重试',
      icon: 'none'
    });
  }
};

const clearPhone = () => {
  phone.value = '';
};

const selectPayment = (payment) => {
  selectedPayment.value = payment;
};

const handleConfirmPayment = () => {
  uni.showToast({
    title: '支付成功',
    icon: 'success'
  });
  uni.navigateTo({
    url: `/pages/pay_success/pay_success?id=${productDetail.value.id}`
  });
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

.input-wrapper {
  position: relative;
}

.phone-input {
  width: 100%;
  height: 88rpx;
  padding: 0 32rpx;
  border: 1px solid #e5e5e5;
  border-radius: 16rpx;
  font-size: 28rpx;
}

.clear-icon {
  position: absolute;
  right: 32rpx;
  top: 50%;
  transform: translateY(-50%);
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
</style>