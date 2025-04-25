<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="nav-title">船票预定</text>
      <uni-icons type="refresh" size="24" color="#ffffff" class="history-icon" />
    </view>

    <!-- 主内容区域 -->
    <scroll-view class="content-container" scroll-y>
      <view class="search-card">
        <view class="location-row">
          <view class="location-item">
            <text class="label">出发地</text>
            <input class="value" v-model="fromLocation" placeholder="出发地如:东澳岛" />
          </view>
          <view class="exchange-btn">
            <uni-icons type="loop" size="20" color="#0066CC" @click="swapLocations" />
          </view>
          <view class="location-item align-right">
            <text class="label">目的地</text>
            <input class="value" v-model="toLocation" placeholder="目的地如:万山岛" />
          </view>
        </view>
        
        <view class="date-row">
          <view class="date-item">
            <text class="label">出发日期</text>
            <picker mode="date" :value="currentDate" @change="onDateChange">
              <view class="value" style="padding-left: 10px;">{{ currentDate }}</view>
            </picker>
          </view>
          <view class="date-item align-right" style="margin-left: 35px;">
            <text class="label">乘车人数</text>
            <picker mode="selector" :range="passengerOptions" @change="onPassengerChange">
              <view class="value" style="padding-left: 10px;">{{ passengerCount }} 人</view>
            </picker>
          </view>
        </view>

        <button class="search-btn" type="primary" @click="fetchTickets">查询船票</button>
      </view>

      <view class="filter-bar">
        <view class="filter-left">
          <view class="sort-item">
            <text class="sort-text" @click="toggleSort('time')">时间</text>
            <image :src="sortType.time ? '/static/down.png' : '/static/up.png'" mode="aspectFill" class="sort-arrow" />
			<text class="sort-text" @click="toggleSort('price')">价格</text>
            <image :src="sortType.price ? '/static/down.png' : '/static/up.png'" mode="aspectFill" class="sort-arrow" />
          </view>
        </view>
      </view>

      <view class="ticket-list">
        <view class="ticket-card" v-for="(ticket, index) in tickets" :key="index" @click="goToDetails(ticket.id)">
          <view class="time-row">
            <text class="time">{{ ticket.time }}</text>
            <text class="duration">{{ ticket.duration }}</text>
          </view>
          <view class="ship-row">
            <text class="ship-name" style="color: gray;">{{ ticket.shipName }}</text>
            <text class="price" style="color: blue; font-size: 20px;">{{ ticket.price }}起</text>
          </view>
          <view class="action-row">
            <text class="remain">剩余 {{ ticket.remain }} 张</text>
			<button class="book-btn primary" type="button">预订</button>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
const fromLocation = ref('');
const toLocation = ref('');
const currentDate = ref(new Date().toISOString().split('T')[0]);
const passengerCount = ref(1);
const passengerOptions = ref(Array.from({ length: 10 }, (_, i) => i + 1));
const tickets = ref([]);
const showFilter = ref(false);
const sortType = ref({});

// 检查登录状态
const hasToken = () => {
  if (userStore.token === '') {
    // 提示未登录，请先登录
    uni.showToast({
      title: '未登录,请先登录',
      icon: 'none',
      duration: 1500
    });
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    }, 500);
    return false;
  }
  return true;
};

// 交换出发地和目的地
const swapLocations = () => {
  [fromLocation.value, toLocation.value] = [toLocation.value, fromLocation.value];
};

// 日期选择器
const onDateChange = (e) => {
  currentDate.value = e.detail.value;
};

// 人数选择器
const onPassengerChange = (e) => {
  passengerCount.value = passengerOptions.value[e.detail.value];
};

// 获取船票数据
const fetchTickets = () => {
  if (!hasToken()) return;

  uni.request({
    url: 'https://island.zhangshuiyi.com/island/product/ilTransportation/list',
    method: 'GET',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token
    },
    data: {
      pageNo: 1,
      pageSize: 50,
      fromLocation: fromLocation.value,
      toLocation: toLocation.value,
      date: currentDate.value,
      passengers: passengerCount.value
    },
    success: (res) => {
      if (res.data.success) {
        tickets.value = res.data.result.records.map(item => ({
          id: item.id, // 确保包含 id
          time: formatTime(item.schedule),
          duration: `约 ${item.duration} 小时`,
          shipName: `${item.mode} | ${item.cabintype}`,
          price: `¥ ${item.cost}`,
          remain: item.inventory
        }));
      } else {
        console.error('获取船票失败:', res.data.message);
      }
    },
    fail: (err) => {
      console.error('请求船票列表失败:', err);
    }
  });
};

// 格式化时间
const formatTime = (schedule) => {
  const times = schedule.split(',');
  return `${times[0]} - ${times[1]}`;
};

// 排序船票
const toggleSort = (type) => {
  if (sortType.value[type]) {
    sortType.value[type] = false;
    tickets.value.sort(((a, b) => {
      if (type === 'time') {
        return a.time.localeCompare(b.time);
      } else if (type === 'price') {
        return parseFloat(a.price.replace('¥ ', '')) - parseFloat(b.price.replace('¥ ', ''));
      }
      return 0;
    }));
  } else {
    sortType.value[type] = true;
    tickets.value.sort(((a, b) => {
      if (type === 'time') {
        return sortType.value[type] ? b.time.localeCompare(a.time) : a.time.localeCompare(b.time);
      } else if (type === 'price') {
        return sortType.value[type] ? parseFloat(b.price.replace('¥ ', '')) - parseFloat(a.price.replace('¥ ', '')) : parseFloat(a.price.replace('¥ ', '')) - parseFloat(b.price.replace('¥ ', ''));
      }
      return 0;
    }));
  }
};

// 跳转到详情页
const goToDetails = (ticketId) => {
  uni.navigateTo({
    url: `/pages/ticketDetails/ticketDetails?ticketId=${ticketId}`
  });
};

// 页面加载时获取船票
onMounted(() => {
  fetchTickets();
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #0066CC;
  color: white;
}

.nav-title {
  font-size: 18px;
  font-weight: bold;
}

.history-icon {
  margin-right: 5px;
}

.content-container {
  height: calc(100vh - 60px);
}

.search-card {
  background-color: white;
  padding: 20px;
  margin: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.location-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.location-item {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.value {
  background-color: #eeeded;
  width: 130px;
  height: 40px;
  line-height: 40px;
}

.exchange-btn {
  display: flex;
  align-items: center;
  margin: 15px 15px 0px 10px;
}

.date-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.date-item {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.search-btn {
  width: 100%;
  height: 45px;
  border-radius: 22px;
  background-color: #0066CC;
  color: white;
  font-size: 16px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background-color: white;
  margin: 0 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ticket-list {
  padding: 15px;
}

.ticket-card {
  background-color: white;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.time-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.ship-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.book-btn {
  background-color: #0066CC;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  width: 100px;
  height: 40px;
  line-height: 20px;
  margin-right: 5px;
  font-size: 20px;
}

input {
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 5px;
}

.sort-arrow {
  width: 16px;
  height: 16px;
  margin-left: 5px;
}
</style>