<template>
  <view class="page">
    <!-- 顶部 Banner 和 搜索卡片 -->
    <view class="header-container">
      <!-- 背景图片 -->
      <image class="header-bg" src="https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h1.jpg" mode="aspectFill"></image>
      <view class="header-mask"></view>
      
      <!-- 搜索卡片 -->
      <view class="search-card">
        <!-- 地点与搜索 -->
        <view class="search-row border-bottom">
          <view class="location-box">
            <text class="location-text">珠海</text>
            <uni-icons type="bottom" size="12" color="#333" class="location-icon"></uni-icons>
          </view>
          <view class="search-input-box">
            <input 
              type="text" 
              v-model="searchContent" 
              placeholder="酒店" 
              placeholder-class="search-placeholder"
              class="search-input"
            />
          </view>
        </view>
        
        <!-- 日期选择 -->
        <view class="date-row border-bottom">
          <view class="date-item">
            <text class="date-val">{{ startDateDisplay.date }}</text>
            <text class="date-week">{{ startDateDisplay.week }}</text>
          </view>
          <view class="date-line"></view>
          <view class="date-item">
            <text class="date-val">{{ endDateDisplay.date }}</text>
            <text class="date-week">{{ endDateDisplay.week }}</text>
          </view>
          <!-- 隐形的日期选择器覆盖在上面 -->
          <view class="date-picker-overlay">
             <uni-datetime-picker v-model="range" type="daterange" :border="false" :clear-icon="false" class="hidden-picker" />
          </view>
        </view>
        
        <!-- 排序与查询按钮 -->
        <view class="action-row">
          <view class="sort-trigger" @click="toggleSortMenu">
             <text class="sort-label">{{ currentSortLabel }}</text>
             <uni-icons :type="showSortMenu ? 'top' : 'bottom'" size="12" color="#666"></uni-icons>
          </view>
          <button class="search-btn" @click="handleSearch">查询</button>
        </view>
      </view>
    </view>

    <!-- 排序菜单 -->
    <view v-if="showSortMenu" class="sort-menu-overlay" @click="showSortMenu = false">
        <view class="sort-menu" @click.stop>
            <view class="sort-menu-item" v-for="item in sortOptions" :key="item.value" @click="selectSort(item.value)">
                <text :class="['sort-menu-text', { 'active': currentSort === item.value }]">{{ item.label }}</text>
                <uni-icons v-if="currentSort === item.value" type="checkmarkempty" size="16" color="#4080FF"></uni-icons>
            </view>
        </view>
    </view>

    <scroll-view class="content" scroll-y>
      <view class="hotel-list">
        <view class="hotel-card" v-for="(hotel, index) in filteredHotels" :key="index" @click="goHotelDetail(hotel)">
          <image :src="hotel.imageURL" mode="aspectFill" class="hotel-image"></image>
          <view class="hotel-info">
            <view class="hotel-main">
                <text class="hotel-name ellipsis">{{ hotel.name }}</text>
                <view class="hotel-rating-row">
                    <uni-icons type="star-filled" size="14" color="#FFB400"></uni-icons>
                    <text class="hotel-score">{{ hotel.rating || 4.6 }}分</text>
                </view>
                <view class="hotel-tags">
                    <text class="hotel-tag">{{ hotel.hoteltype || '民宿' }}</text>
                    <text v-if="hotel.roomtype" class="hotel-tag">{{ hotel.roomtype }}</text>
                </view>
            </view>
            <view class="hotel-bottom">
                <view class="price-box">
                    <text class="currency">¥</text>
                    <text class="amount">{{ hotel.price }}</text>
                    <text class="unit">起/晚</text>
                </view>
                <button class="book-btn-sm" @click.stop="goHotelDetail(hotel)">立即预订</button>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '@/store/modules/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();
const hotelList = ref([]);
const combinedArray = ref([]);

// 默认日期：今天和后天
const today = new Date();
const afterTomorrow = new Date(today);
afterTomorrow.setDate(today.getDate() + 2);
const formatDateStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const range = ref([formatDateStr(today), formatDateStr(afterTomorrow)]);
const searchContent = ref('');

// 格式化日期显示
const startDateDisplay = computed(() => formatDate(range.value[0]));
const endDateDisplay = computed(() => formatDate(range.value[1]));

function formatDate(dateStr) {
    if (!dateStr) return { date: '--月--日', week: '' };
    const date = new Date(dateStr);
    // 处理时区问题，简单处理
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const w = weeks[date.getDay()];
    return {
        date: `${m}月${d}日`,
        week: w
    };
}

const imageUrls = ref([
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h1.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h11.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h12.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h13.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h14.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h15.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h16.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h17.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h18.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h19.jpeg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h20.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f2.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f3.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f4.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f5.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f6.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f7.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f8.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f9.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f10.jpg"
]);

// 排序选项
const sortOptions = ref([
  { label: '综合排序', value: 'default' },
  { label: '价格从低到高', value: 'priceAsc' },
  { label: '价格从高到低', value: 'priceDesc' },
  { label: '评分优先', value: 'rating' }
]);

const currentSort = ref('default');
const showSortMenu = ref(false);

const currentSortLabel = computed(() => {
  const found = sortOptions.value.find(item => item.value === currentSort.value);
  return found ? found.label : '综合排序';
});

// 打开/关闭排序下拉
const toggleSortMenu = () => {
  showSortMenu.value = !showSortMenu.value;
};

// 选择排序方式
const selectSort = (value) => {
  currentSort.value = value;
  showSortMenu.value = false;
};

onMounted(() => {
  hasToken();
  getHotelList();
});

const handleSearch = () => {
    uni.showLoading({
        title: '正在查询...'
    });
    
    setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
            title: '查询成功',
            icon: 'success'
        });
    }, 1500);
};

const goHotelDetail = (hotel) => {
  uni.navigateTo({
    url: `/pages/hotelDetail/hotelDetail?id=${hotel.id}&images=${encodeURIComponent(JSON.stringify(hotel.images))}`
  });
}

const hasToken = () => {
  if (userStore.token === '') {
    uni.showToast({
      title: '未登录,请先登录',
      icon: 'none',
      duration: 1500
    })
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    }, 500);
  }
}

const getHotelList = () => {
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/product/ilAccommodations/list',
    method: 'GET',
    data: {
      pageNo: 1,
      pageSize: 50
    },
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token
    },
    success: (res) => {
      hotelList.value = res.data.result.records;
      combinedArray.value = hotelList.value.map((item, index) => ({
        ...item,
        images: [imageUrls.value[index]],
        imageURL: imageUrls.value[index]
      }));
    },
    fail: (err) => {
      console.error('请求失败', err);
      uni.showToast({
        title: '加载失败，请稍后重试',
        icon: 'none'
      });
    }
  });
};

const filteredHotels = computed(() => {
  let list = combinedArray.value.slice();

  if (searchContent.value) {
    list = list.filter(item => item.name && item.name.includes(searchContent.value));
  }

  switch (currentSort.value) {
    case 'priceAsc':
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'priceDesc':
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'rating':
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'default':
    default:
      break;
  }

  return list;
});
</script>

<style>
page {
  height: 100%;
  background-color: #F5F7FA;
}

.page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Header Container */
.header-container {
  position: relative;
  width: 100%;
  height: 480rpx; /* Adjust height as needed */
  background-color: #fff;
  margin-bottom: 30rpx; /* Reduced spacing */
}

.header-bg {
  width: 100%;
  height: 380rpx;
  background-color: #eee;
}

.header-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 380rpx;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0));
}

.search-card {
  position: absolute;
  top: 200rpx; /* Overlap banner */
  left: 30rpx;
  right: 30rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);
  padding: 30rpx;
  z-index: 10;
}

.search-row {
  display: flex;
  align-items: center;
  padding-bottom: 20rpx;
  margin-bottom: 20rpx;
}

.border-bottom {
  border-bottom: 1rpx solid #F0F0F0;
}

.location-box {
  display: flex;
  align-items: center;
  margin-right: 30rpx;
  padding-right: 30rpx;
  border-right: 1rpx solid #eee;
}

.location-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-right: 10rpx;
}

.search-input-box {
  flex: 1;
}

.search-input {
  font-size: 30rpx;
  color: #333;
}

.search-placeholder {
  color: #999;
}

/* Date Row */
.date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20rpx;
  margin-bottom: 20rpx;
  position: relative;
}

.date-item {
  display: flex;
  align-items: baseline;
}

.date-val {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-right: 12rpx;
}

.date-week {
  font-size: 24rpx;
  color: #666;
}

.date-line {
  width: 60rpx;
  height: 2rpx;
  background: #eee;
  margin: 0 20rpx;
}

.date-picker-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 20;
}
.hidden-picker {
    width: 100%;
    height: 100%;
    opacity: 0;
}
/* Ensure the picker fills the container */
:deep(.uni-date-editor), :deep(.uni-date-editor--x) {
    width: 100%;
    height: 100%;
}
:deep(.uni-date__x-input) {
    height: 100%;
    width: 100%;
}

/* Action Row */
.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sort-trigger {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #666;
}

.sort-label {
    margin-right: 6rpx;
}

.search-btn {
  background: #4080FF;
  color: #FFFFFF;
  font-size: 32rpx;
  border-radius: 44rpx;
  padding: 0 50rpx;
  margin: 0;
  height: 60rpx;
  line-height: 60rpx;
  box-shadow: 0 4rpx 12rpx rgba(64, 128, 255, 0.3);
}

/* Sort Menu */
.sort-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.3);
    z-index: 99;
    display: flex;
    justify-content: center;
    align-items: center;
}

.sort-menu {
    width: 500rpx;
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
}

.sort-menu-item {
    padding: 30rpx 40rpx;
    border-bottom: 1rpx solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.sort-menu-text {
    font-size: 28rpx;
    color: #333;
}
.sort-menu-text.active {
    color: #4080FF;
    font-weight: 600;
}

/* Hotel List */
.content {
  flex: 1;
  overflow: auto;
}

.hotel-list {
  padding: 0 30rpx 30rpx;
}

.hotel-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: row;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.hotel-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.hotel-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hotel-main {
    display: flex;
    flex-direction: column;
}

.hotel-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
  line-height: 1.4;
}

.hotel-rating-row {
    display: flex;
    align-items: center;
    margin-bottom: 10rpx;
}

.hotel-score {
    font-size: 26rpx;
    color: #333;
    font-weight: 500;
    margin-left: 8rpx;
}

.hotel-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
}

.hotel-tag {
    font-size: 20rpx;
    padding: 4rpx 12rpx;
    background: #E8F0FF;
    color: #4080FF;
    border-radius: 6rpx;
}

.hotel-bottom {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.price-box {
    display: flex;
    align-items: baseline;
}

.currency {
    font-size: 24rpx;
    color: #4080FF;
    font-weight: 600;
}

.amount {
    font-size: 36rpx;
    color: #4080FF;
    font-weight: bold;
    margin: 0 4rpx;
}

.unit {
    font-size: 22rpx;
    color: #999;
}

.book-btn-sm {
  background: #4080FF;
  color: #FFFFFF;
  font-size: 26rpx;
  padding: 0;
  width: 140rpx;
  height: 56rpx;
  line-height: 56rpx;
  border-radius: 8rpx;
  margin: 0;
  text-align: center;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
