<template>
  <view class="itinerary-confirmation">
    <!-- 页面标题 -->
    <view class="page-title">行程确认</view>

    <!-- 行程安排 -->
    <view class="section">
      <view class="section-header">
        <image src="/static/icons/itinerary.png" mode="aspectFit"></image>
        <text>行程安排</text>
      </view>
      <view class="schedule-item" v-for="(scheduleItem, index) in item.schedule" :key="index">
        <text class="time">{{ scheduleItem.time }}</text>
        <text class="description">{{ scheduleItem.detail }}</text>
      </view>
    </view>

    <!-- 费用明细 -->
    <view class="section">
      <view class="section-header">
        <image src="/static/icons/cost.png" mode="aspectFit"></image>
        <text>费用明细</text>
      </view>
      <view class="cost-item" v-for="(costItem, index) in item.costDetails" :key="index">
        <text class="cost-name">{{ costItem.name }}</text>
        <text style="color: black;">{{ costItem.price }}</text>
      </view>
      <view class="cost-summary">
        <view class="summary-item">
          <text>原价</text>
          <text>{{ item.originalPrice }}</text>
        </view>
        <view class="summary-item">
          <text>优惠金额</text>
          <text style="color: black;">{{ item.discount }}</text>
        </view>
        <view class="summary-item total">
          <text>实付金额</text>
          <text style="color: cornflowerblue; border: 30px;">{{ item.finalPrice }}</text>
        </view>
      </view>
    </view>

    <!-- 游客信息 -->
    <view class="section">
      <view class="section-header">
        <image src="/static/icons/user.png" mode="aspectFit"></image>
        <text>游客信息</text>
      </view>
      <input class="user-input" v-model="userPhone" placeholder="请输入手机号码" />
    </view>

    <!-- 备注信息 -->
    <view class="section">
      <view class="section-header">
        <image src="/static/icons/notes.png" mode="aspectFit"></image>
        <text>备注信息</text>
      </view>
      <textarea class="notes-input" v-model="notes" placeholder="请输入特殊需求或注意事项" />
    </view>

    <!-- 支付方式 -->
    <!-- 支付方式 -->
<view class="section">
  <view class="section-header">
    <image src="/static/icons/payment.png" mode="aspectFit"></image>
    <text>支付方式</text>
  </view>
  <view class="payment-method" @tap="selectPaymentMethod('wechat')">
    <view class="payment-content">
      <image src="/static/icons/wechat.png" mode="aspectFit"></image>
      <text>微信支付</text>
    </view>
    <image v-if="selectedPayment === 'wechat'" src="/static/icons/checked.png" mode="aspectFit"></image>
  </view>
  <view class="payment-method" @tap="selectPaymentMethod('alipay')">
    <view class="payment-content">
      <image src="/static/icons/alipay.png" mode="aspectFit"></image>
      <text>支付宝</text>
    </view>
    <image v-if="selectedPayment === 'alipay'" src="/static/icons/checked.png" mode="aspectFit"></image>
  </view>
</view>

    <!-- 确认支付按钮 -->
    <button class="confirm-payment" @tap="confirmPayment">
      确认支付 {{ item.finalPrice }}
    </button>
  </view>
</template>

<script>
import { reactive, ref } from 'vue';

export default {
  setup() {
    // 行程数据
    const item = reactive({
      title: '海钓体验行程安排',
      schedule: [
        { time: '上午', detail: '前往"珊瑚海滩"，享受浮潜服务' },
        { time: '中午', detail: '在"海滩餐厅"享用午餐' },
        { time: '下午', detail: '参观"海岛文化博物馆"' },
        { time: '晚上', detail: '返回"海景酒店B"休息' }
      ],
      costDetails: [
        { name: '浮潜服务', price: '¥200/人' },
        { name: '午餐套餐', price: '¥150/人' },
        { name: '海景酒店住宿', price: '¥500/晚' }
      ],
      originalPrice: '¥850',
      discount: '-¥100',
      finalPrice: '¥750'
    });

    // 游客手机号
    const userPhone = ref('');

    // 备注信息
    const notes = ref('');

    // 支付方式
    const selectedPayment = ref('wechat');

    // 验证手机号格式
    const validatePhone = (phone) => {
      const phoneRegex = /^1[3-9]\d{9}$/; // 简单的中国大陆手机号正则
      return phoneRegex.test(phone);
    };

    // 选择支付方式
    const selectPaymentMethod = (method) => {
      selectedPayment.value = method;
    };

    // 显示提示框（封装 uni.showToast）
    const showToast = (options) => {
      try {
        uni.showToast(options);
      } catch (error) {
        console.error('显示提示框失败:', error);
      }
    };

    // 显示模态框（封装 uni.showModal）
    const showModal = (options, callback) => {
      try {
        uni.showModal({
          ...options,
          success: (res) => {
            if (res.confirm && typeof callback === 'function') {
              callback();
            }
          }
        });
      } catch (error) {
        console.error('显示模态框失败:', error);
      }
    };

    // 确认支付
    const confirmPayment = () => {
      if (!userPhone.value) {
        showToast({ title: '请输入手机号码', icon: 'none' });
        return;
      }

      if (!validatePhone(userPhone.value)) {
        showToast({ title: '请输入有效的手机号码', icon: 'none' });
        return;
      }

      showModal(
        {
          title: '确认支付',
          content: `您确认支付 ${item.finalPrice} 吗？`
        },
        () => {
          showToast({ title: '支付成功！', icon: 'success' });
          // 这里可以添加支付成功的逻辑，比如跳转到支付结果页面
        }
      );
    };

    return {
      item,
      userPhone,
      notes,
      selectedPayment,
      selectPaymentMethod,
      confirmPayment
    };
  }
};
</script>

<style>
.itinerary-confirmation {
  padding: 20px;
  background-color: #f5f5f5;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}

.section {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.section-header image {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.schedule-item {
  display: flex;
  margin-bottom: 10px;
}

.schedule-item .time {
  width: 80px;
  font-weight: bold;
  color: darkgrey;
}

.schedule-item .description {
  flex: 1;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: darkgrey;
}
.cost-summary {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #eeeeee;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: darkgrey;
}

.summary-item.total {
  font-weight: bold;
}

.user-input {
  border: 1px solid #eeeeee;
  border-radius: 8px;
  padding: 10px;
  margin-top: 10px;
}

.notes-input {
  border: 1px solid #eeeeee;
  border-radius: 8px;
  padding: 10px;
  height: 120px;
  margin-top: 10px;
  width: 100%;
}

.payment-method {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 8px;
  margin-bottom: 10px;
  border: 1px solid #f0f0f0;
}

.payment-content {
  display: flex;
  align-items: center;
}

.payment-content image {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.payment-content text {
  font-size: 16px;
  color: #333333;
}

.payment-method image:last-child {
  width: 24px;
  height: 24px;
}

.confirm-payment {
  background-color: #4285f4;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 15px;
  font-size: 16px;
  margin-top: 20px;
}
</style>