<template>
  <view class="tab-bar">
      <view v-for="(item, index) in tabBarItems" :key="index" class="tab-bar-item">
        <uni-icons :type="item.icon" size="24" color="#999999"></uni-icons>
        <text class="tab-bar-text">{{ item.text }}</text>
      </view>
    </view>
</template>

<script setup>
const tabBarItems = [
  { icon: 'home', text: '首页' },
  { icon: 'paperplane', text: '行程' },
  { icon: 'scan', text: '一码通' },
  { icon: 'list', text: '订单' },
  { icon: 'person', text: '我的' }
];
</script>

<style scoped>
  .tab-bar {
  display: flex;
  height: 120rpx;
  background-color: #FFFFFF;
  border-top: 2rpx solid #EEEEEE;
}

.tab-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tab-bar-text {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}
</style>