<template>
  <view class="order-page">
    <view class="order-header">
      <text class="order-title">船票详情</text>
    </view>

    <scroll-view class="order-content">
      <view v-if="ticketInfo">
        <text>出发地：{{ ticketInfo.fromIsland.islandname }}</text>
        <text>目的地：{{ ticketInfo.toIsland.islandname }}</text>
        <text>时间：{{ ticketInfo.schedule }}</text>
        <text>价格：{{ ticketInfo.cost }}</text>
        <text>预订方式：{{ ticketInfo.bookingmethod }}</text>
      </view>
      <!-- 其他订单信息 -->
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
const ticketInfo = ref({});

const onLoad = (options) => {
  const { ticketId } = options.query.ticketId;
  fetch(`https://island.zhangshui.com/island/product/ilTransportation/queryById?id=${ticketId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token
    }
  }).then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Network response was not ok.');
  }).then(data => {
    console.log('Ticket Info:', data);
    ticketInfo.value = data.result;
  }).catch(error => {
    console.error('Failed to fetch ticket info:', error);
  });
};
onMounted(() => {
  if (getCurrentPages().options) {
    onLoad(getCurrentPages().options);
  }
});
</script>

<style scoped>
.order-page {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
}

.order-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  background-color: #0066CC;
  color: white;
}

.order-title {
  font-size: 18px;
  font-weight: bold;
}

.order-content {
  padding: 20px;
}
</style>