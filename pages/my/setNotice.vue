<template>
  <view class="notification-page">

    <!-- 通知开关卡片 -->
    <view class="card">
      <view class="row" v-for="item in switchList" :key="item.title">
        <view class="row-left">
          <uni-icons :type="item.icon" size="22" color="#3688FF" />
          <text class="row-title">{{ item.title }}</text>
        </view>
        <switch :checked="item.checked" color="#3688FF" />
      </view>
    </view>

    <!-- 其他设置卡片 -->
    <view class="card">
      <view class="row arrow" v-for="item in arrowList" :key="item.title">
        <view class="row-left">
          <uni-icons :type="item.icon" size="22" color="#3688FF" />
          <text class="row-title">{{ item.title }}</text>
        </view>
        <view class="row-right">
          <text class="row-value">{{ item.value }}</text>
          <uni-icons type="right" size="18" color="#bbb" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const goBack = () => {
  uni.navigateBack();
};

const switchList = ref([
  { icon: 'notification', title: '接收通知', checked: false },
  { icon: 'sound', title: '活动通知', checked: false },
  { icon: 'calendar', title: '预订提醒', checked: false },
  { icon: 'email', title: '社交互动', checked: false },
  { icon: 'gear', title: '系统消息', checked: false }
]);

const arrowList = ref([
  { icon: 'volume-up', title: '提醒方式', value: '声音+震动' },
  { icon: 'music', title: '通知声音', value: '海浪声' },
  { icon: 'sound', title: '震动强度', value: '中' },
  { icon: 'arrow-up', title: '通知优先级', value: '' }
]);
</script>

<style scoped>
.notification-page {
  min-height: 100vh;
  background: #fff;
  padding-bottom: 40rpx;
}

.card {
  margin-top: 20rpx;
  width: 92%;
  margin: 0 auto 40rpx auto;
  background: #f8fafd;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
  padding: 0 0;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0rpx 32rpx;
  height: 110rpx;
  border-bottom: 1px solid #f0f0f0;
}
.row:last-child {
  border-bottom: none;
}
.row-left {
  display: flex;
  align-items: center;
}
.row-title {
  font-size: 28rpx;
  color: #222;
  margin-left: 18rpx;
}
.row-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.row-value {
  font-size: 26rpx;
  color: #888;
}
.arrow uni-icons[type='right'] {
  margin-left: 8rpx;
}
</style>