<template>
  <view class="page">

    <view class="content">
      <view class="card">
        <view class="card-header">
          <uni-icons type="calendar" size="20" color="#3B82F6"/>
          <text class="hotalName">{{hotelList.name}}</text>
        </view>
       
      </view>

      <view class="card">
        <view class="card-header">
          <uni-icons type="list" size="20" color="#3B82F6"/>
          <text class="card-title">酒店/民宿明细</text>
        </view>
        <view class="fee-list">
          <view class="fee-item">
            <text class="fee-name">房型</text>
            <text class="fee-value">{{hotelList.roomtype}}</text>
          </view>
          <view class="fee-item">
            <text class="fee-name">评分</text>
            <text class="fee-value">{{hotelList.tating}}</text>
          </view>
          <view class="fee-item">
            <text class="fee-name">房间库存</text>
            <text class="fee-value">{{hotelList.roominventory}}</text>
          </view>
          <view class="fee-item">
            <text class="fee-name">酒店类型</text>
            <text class="fee-value">{{hotelList.hoteltype}}</text>
          </view>
          <view class="fee-item">
            <text class="fee-name">酒店主题</text>
            <text class="fee-value">{{hotelList.hoteltheme}}</text>
          </view>
          <view class="fee-item">
            <text class="fee-name">星级</text>
            <text class="fee-value">{{hotelList.starrating}}</text>
          </view>
          <view class="fee-item">
            <text class="fee-name">地址</text>
            <text class="fee-value">{{hotelList.address}}</text>
          </view>
          <view class="fee-summary">
            <view class="fee-line">
              <text class="fee-name">原价</text>
              <text class="fee-original">¥{{hotelList.price}}</text>
            </view>
            <view class="fee-line">
              <text class="fee-name">优惠金额</text>
              <text class="fee-discount">-¥0</text>
            </view>
            <view class="fee-line">
              <text class="fee-name-highlight">实付金额</text>
              <text class="fee-final">¥{{hotelList.price}}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <uni-icons type="person" size="20" color="#3B82F6"/>
          <text class="card-title">游客信息</text>
        </view>
        <view class="input-wrapper">
          <input type="number" v-model="phone" class="phone-input" placeholder="请输入手机号码"/>
          <view class="clear-icon" @click="clearPhone" v-if="phone">
            <uni-icons type="clear" size="20" color="#999"/>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <uni-icons type="chatboxes" size="20" color="#3B82F6"/>
          <text class="card-title">备注信息</text>
        </view>
        <textarea v-model="remark" class="remark-input" placeholder="请输入特殊需求或注意事项"/>
      </view>

      <view class="card">
        <view class="card-header">
          <uni-icons type="wallet" size="20" color="#3B82F6"/>
          <text class="card-title">支付方式</text>
        </view>
        <view class="payment-list">
          <view class="payment-item" :class="{'selected': selectedPayment === 'wechat'}" @click="selectPayment('wechat')">
            <view class="payment-info">
              <uni-icons type="weixin" size="24" color="#07C160"/>
              <text class="payment-name">微信支付</text>
            </view>
            <uni-icons v-if="selectedPayment === 'wechat'" type="checkbox-filled" size="20" color="#3B82F6"/>
          </view>
          <view class="payment-item" :class="{'selected': selectedPayment === 'alipay'}" @click="selectPayment('alipay')">
            <view class="payment-info">
              <uni-icons type="wallet" size="24" color="#1677FF"/>
              <text class="payment-name">支付宝</text>
            </view>
            <uni-icons v-if="selectedPayment === 'alipay'" type="checkbox-filled" size="20" color="#3B82F6"/>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <button class="confirm-btn" @click="handleConfirmPayment">
        确认支付 ¥{{ hotelList.price }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/modules/user';
import { onLoad } from '@dcloudio/uni-app';
import { ref,onMounted } from 'vue';

const userStore = useUserStore();
const id = ref(''); 
const orderSn = ref('');
const hotelList = ref([]);

onLoad((options) => {
  id.value = options.id;
  orderSn.value = options.orderSn;
  console.log("接受到的id" ,id.value);
  console.log("接受到的orderSn",orderSn.value);
})
onMounted(() => {
  
  uni.request({
    url: `https://island.zhangshuiyi.com/island/front/product/accommodations/${id.value}`,
    method: 'GET',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token,
    },
    data: { id: id},
    success:(res)=>{
      hotelList.value = res.data;
    },fail:(err)=>{
      console.log(err);
      
    }
  })
  
})


const phone = ref('13800138000');
const remark = ref('');
const selectedPayment = ref('wechat');

const clearPhone = () => {
  phone.value = '';
};

const selectPayment = (payment) => {
  selectedPayment.value = payment;
};

// 确认支付
const handleConfirmPayment = () => {
  const userStore = useUserStore();
  console.log(userStore.token);
  payOrder(orderSn.value, userStore.token)
    .then(data => {
      console.log('支付接口返回：', data);
      // 检查 data.result.orderStatus
      // ...
      uni.showToast({
        title: '支付成功',
        icon: 'success'
      });
      // 从后端返回的 data.result 里获取 amount 和 orderSn
      const amount = data.result?.amount || hotelList.value.price;
      const orderId = data.result?.orderSn || orderSn.value;
      uni.navigateTo({
        url: `/pages/pay_success/pay_success?amount=${amount}&orderId=${orderId}`
      });
    })
    .catch(errMsg => {
      uni.showToast({
        title: errMsg,
        icon: 'none'
      });
    });
}

function payOrder(orderSn, token) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `https://island.zhangshuiyi.com/island/front/order/payOrder?orderSn=${orderSn}`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'X-Access-Token': token
      },
      data: {},
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          // 支付成功，订单状态已修改
          resolve(res.data);
        } else {
          // 支付失败
          reject(res.data.message || '支付失败');
        }
      },
      fail: (err) => {
        reject('网络错误');
      }
    });
  });
}
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