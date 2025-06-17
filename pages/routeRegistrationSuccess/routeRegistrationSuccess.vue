<template>
  <view class="container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="back" size="24"></uni-icons>
      </view>
      <text class="title">报名成功</text>
    </view>

    <view class="success-icon">
      <image :src="assets.successIcon" class="success-img"></image>
    </view>

    <text class="success-text">恭喜您，报名成功！</text>

    <view class="order-info">
      <text class="order-item">订单编号：{{ orderInfo.orderId }}</text>
      <text class="order-item">行程名称：{{ orderInfo.tourName }}</text>
      <text class="order-item">出发日期：{{ orderInfo.departureDate }}</text>
      <text class="order-item">出行人数：{{ orderInfo.travelers }}人</text>
    </view>

    <view class="notification">
      <view class="notice-item">
        <image :src="assets.infoIcon1" class="notice-icon"></image>
        <text class="notice-text">{{ notifications[0] }}</text>
      </view>
      <view class="notice-item">
        <image :src="assets.infoIcon2" class="notice-icon"></image>
        <text class="notice-text">{{ notifications[1] }}</text>
      </view>
    </view>

    <view class="action-buttons">
      <button class="detail-btn" @click="viewDetails">{{ buttons.viewDetails }}</button>
      <button class="home-btn" @click="goHome">{{ buttons.goHome }}</button>
    </view>

    <view class="tips">
      <text class="tips-title">{{ tips.title }}</text>
      <view class="tips-content">
        <text v-for="(item, index) in tips.items" :key="index" class="tips-item">{{ item }}</text>
      </view>
      <text class="countdown">{{ countdown }}秒后自动跳转到订单页面</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '@/store/modules/user';

const safeArea = ref({ top: 0, bottom: 0 });
const assets = ref({
  successIcon: '/static/route/success.png',
  infoIcon1: '/static/route/info1.png',
  infoIcon2: '/static/route/info2.png'
});
const orderInfo = ref({
  orderId: 'SD20230728001',
  tourName: '浪漫双岛游 2日1晚',
  departureDate: '2025年1月1日',
  travelers: 2
});
const notifications = ref([
  '行程详情和注意事项已发送至您的手机：138****8888，请注意查收。',
  '导游将在出发前1天与您联系，确认集合地点和时间。'
]);
const buttons = ref({
  viewDetails: '查看订单详情',
  goHome: '返回首页'
});
const tips = ref({
  title: '温馨提示',
  items: [
    '• 请提前准备好必要的证件和物品',
    '• 如需修改或取消行程，请提前48小时联系客服',
    '• 遇到问题可随时拨打咨询热线：400-888-8888'
  ]
});
const countdown = ref(3);

const getSafeAreaInfo = () => {
  const systemInfo = uni.getSystemInfoSync();
  safeArea.value = systemInfo.safeArea || { top: 0, bottom: 0 };
};

const goBack = () => {
  uni.navigateBack();
};

const viewDetails = () => {
  uni.switchTab({
    url: `/pages/order/order`
  });
};

const goHome = () => {
  uni.switchTab({
    url: '/pages/index/index'
  });
};

const payOrder = () => {
  const userStore = useUserStore();
  const token = userStore.token;
  
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 2000
    });
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    }, 2000);
    return;
  }

  uni.showLoading({
    title: '正在支付...',
    mask: true
  });

  // 修改为正确的请求方式
  uni.request({
    url: `https://island.zhangshuiyi.com/island/front/order/payOrder?orderSn=${this.orderSn}`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': token
    },
    success: (res) => {
      console.log('支付订单响应:', res);
      uni.hideLoading();
      
      if (res.statusCode === 401) {
        uni.showToast({
          title: '登录信息过期，请重新登录',
          icon: 'none',
          duration: 2000
        });
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/login/login'
          });
        }, 2000);
        return;
      }

      if (res.data && res.data.success) {
        uni.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 1500
        });
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/orderList/orderList'
          });
        }, 1500);
      } else {
        console.error('支付失败:', res.data);
        uni.showToast({
          title: res.data.message || '支付失败',
          icon: 'none'
        });
      }
    },
    fail: (err) => {
      console.error('支付请求失败:', err);
      uni.hideLoading();
      uni.showToast({
        title: '支付失败，请稍后重试',
        icon: 'none'
      });
    }
  });
};

onMounted(() => {
  getSafeAreaInfo();
  // 添加倒计时
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      uni.switchTab({
        url: '/pages/order/order'
      });
    }
  }, 1000);
});

// 在组件卸载时清除定时器
onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style scoped>
.container {
  background-color: #f7f7f7;
  padding: 0 20px;
  padding-top: v-bind('safeArea.top + "px"');
}

.header {
  display: flex;
  align-items: center;
  padding: 20px 0;
  background-color: #fff;
}

.back-btn {
  margin-right: auto;
}

.title {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  flex: 1;
}

.success-icon {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.success-img {
  width: 100px;
  height: 100px;
}

.success-text {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin: 20px 0;
  display: block;
}

.order-info {
  background-color: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 10px;
  text-align: center;
}

.order-item {
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
  display: block;
}

.notification {
  margin-bottom: 20px;
}

.notice-item {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 10px;
}

.notice-icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.notice-text {
  font-size: 14px;
  color: #333;
}

.action-buttons {
  margin-bottom: 30px;
}

.detail-btn,
.home-btn {
  width: 100%;
  padding: 12px;
  border-radius: 5px;
  font-size: 14px;
  margin-bottom: 15px;
  border: none;
}

.detail-btn {
  background-color: #FF6B6B;
  color: white;
}

.home-btn {
  background-color: transparent;
  color: #333;
  border: 1px solid #ddd;
}

.tips {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
}

.tips-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
}

.tips-content {
  margin-top: 20px;
}

.tips-item {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.countdown {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-top: 10px;
}
</style>