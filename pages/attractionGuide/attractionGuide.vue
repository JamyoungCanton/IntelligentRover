<template>
  <view class="page">
    <!-- 顶部只保留搜索和筛选 -->
    <view class="header-fixed">
      <view class="search-sort-row">
        <view class="search-wrap">
          <uni-icons type="search" size="20" color="#0faedf" class="search-icon"></uni-icons>
          <input v-model="searchInput" class="search-input" type="text" placeholder="搜索景点、攻略" placeholder-class="placeholder"/>
        </view>
        <view class="sort-wrap">
          <uni-data-select
            v-model="filterValue"
            :localdata="range"
            @change="changeFilter"
          ></uni-data-select>
        </view>
      </view>
    </view>
    <view class="category-fixed">
      <scroll-view class="category-list" scroll-x show-scrollbar="false">
        <view class="category-scroll">
          <button
            v-for="category in categories"
            :key="category"
            class="category-item"
            :class="{ active: selectedCategory === category }"
            @click="changeTab(category)"
          >
            {{ category }}
          </button>
        </view>
      </scroll-view>
    </view>

    <scroll-view class="content" scroll-y>
      <view class="spot-grid">
        <view
          v-for="item in filteredAttractions"
          :key="item.id"
          class="spot-item"
          @click="goAttraction(item.id)"
        >
          <image :src="item.imageUrl" mode="aspectFill"></image>
          <view class="spot-info">
            <view class="name-rating-row">
              <text class="spot-name">{{ item.name }}</text>
              <view class="rating">
                <uni-rate :value="item.rating" size="10" readonly></uni-rate>
                <text class="rating-score">{{ item.rating }}</text>
              </view>
            </view>
            <text class="spot-desc">开放时间：{{ formatTime(item.starttime) }} - {{ formatTime(item.endtime) }}</text>
            <view class="spot-footer">
              <view class="location">
                <text class="location-text">门票价格</text>
              </view>
              <text v-if="item.ticketprice !== 0" class="price">¥{{ item.ticketprice }}</text>
              <text v-if="item.ticketprice === 0" class="price">免费</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
const attractionGuidelist = ref([]);
const selectedCategory = ref('全部');
const categories = ['全部', '热门', '自然景观', '沙滩浴场', '观景台'];
const searchInput = ref('');
const filterValue = ref(0); // 新增，用于存储当前选中的筛选选项
const attractionGuidelistOriginal = ref([]); // 排序的原始数据


const range = [
  { value: 0, text: "综合排序 " },
  { value: 1, text: "价格从低到高" },
  { value: 2, text: "价格从高到低" },
  { value: 3, text: "按评分排序" }
]



const hasToken = () => {
  if(userStore.token === ''){
    // 提示未登录，请先登录
    uni.showToast({
      title: '未登录,请先登录',
      icon: 'false',
      duration: 1500
    })
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    }, 500);
  }
}

// 根据选中的分类筛选景点
// 根据选中的分类和筛选选项筛选景点
const filteredAttractions = computed(() => {
  let filtered = JSON.parse(JSON.stringify(attractionGuidelistOriginal.value)); // 每次都从原始列表拷贝一份

  if (searchInput.value) {
    filtered = filtered.filter(item => item.name.includes(searchInput.value));
  }

  if (selectedCategory.value === '全部') {
    // 不处理
  } else if (selectedCategory.value === '热门') {
    filtered = filtered.sort((a, b) => b.rating - a.rating);
  } else {
    filtered = filtered.filter(item => item.type === selectedCategory.value);
  }

  switch (filterValue.value) {
    case 1:
      filtered = filtered.sort((a, b) => a.ticketprice - b.ticketprice);
      break;
    case 2:
      filtered = filtered.sort((a, b) => b.ticketprice - a.ticketprice);
      break;
    case 3:
      filtered = filtered.sort((a, b) => b.rating - a.rating);
      break;
    default:
      // 综合排序，保持原始顺序（已经是原始顺序了）
  }

  return filtered;
});

// 格式化时间，只保留"时:分"
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  return timeStr.split(':').slice(0, 2).join(':');
};

onMounted(() => {
  hasToken();
  getAttractionList()
  
});

// 获取数据
const getAttractionList = () => {
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/product/ilAttractions/list',
    method: 'GET',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token
    },
    data:{
      pageNo: 1,
      pageSize: 50
    },
    success: (res) => {
    attractionGuidelist.value = res.data.result.records;
    attractionGuidelistOriginal.value = JSON.parse(JSON.stringify(res.data.result.records)); // 深拷贝
    }

  });
}

// 切换分类
const changeTab = (category) => {
  selectedCategory.value = category;
};

// 跳转到景点详情页
const goAttraction = (id) => {
  uni.navigateTo({
    url: `/pages/attractionDetail/attractionDetail?id=${id}`
  });
};

const getAttrictionDetail = () => {
  uni.request({
    url: `https://island.zhangshuiyi.com/island/front/product/attractions/${id.value}`,
    method: 'GET',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token || ''
    },
    success: (res) => {
      hotelData.value = res.data;
    }
  })
}
</script>

<style>
.page {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* background: #F5F7FA; */
  background-color: rgba(224, 250, 255);

}

.header-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: transparent;
  box-shadow: none;
  background-color: rgba(81, 219, 255);
}

.search-sort-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 32rpx 24rpx 12rpx 24rpx;
  background: transparent;
  gap: 20rpx;
}

.search-wrap {
  flex: 1.5;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(15,174,223,0.10);
  padding: 0 28rpx;
  height: 64rpx;
  margin-right: 0;
  transition: box-shadow 0.2s;
}

.search-wrap:focus-within {
  box-shadow: 0 6rpx 24rpx rgba(15,174,223,0.18);
}

.search-icon {
  margin-right: 10rpx;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 30rpx;
  color: #333;
  outline: none;
}

.placeholder {
  color: #bbb;
}

.sort-wrap {
  flex: 1;
  min-width: 160rpx;
  max-width: 200rpx;
  background: #fff;
  border-radius: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(15,174,223,0.10);
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s;
}

.sort-wrap:focus-within {
  box-shadow: 0 6rpx 24rpx rgba(15,174,223,0.18);
}

.sort-wrap uni-data-select {
  width: 100%;
  font-size: 28rpx;
}
.category-fixed {
  position: fixed;
  top: 105rpx; /* header-fixed的高度 */
  left: 0;
  right: 0;
  z-index: 998;
  background: #fff;
}


.content {
  flex: 1;
  overflow: auto;
  margin-top: 10rpx;
  padding-top: 175rpx; /* header-fixed高度+margin，避免内容被遮挡 */
  min-height: 100vh;
}

.category-list {
  padding: 10rpx 30rpx 10rpx 30rpx;
  white-space: nowrap;
  background: #FFFFFF;
}

.category-scroll {
  display: inline-flex;
  gap: 15rpx;
}

.category-item {
  padding: 8rpx 30rpx;
  background: #F5F7FA;
  border-radius: 30rpx;
  color: #666666;
  font-size: 28rpx;
  border: none;
  transition: all 0.3s ease;
}

.category-item.active {
  background: #0faedf;
  color: #FFFFFF;
  box-shadow: 0 4rpx 12rpx rgba(15, 174, 223, 0.15);
}

.spot-grid {
  padding: 20rpx 30rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  
  gap: 20rpx;
  background: #F5F7FA;
  background-color: rgba(224, 250, 255);

}

.spot-item {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.spot-item:active {
  transform: scale(0.98);
}

.spot-item image {
  width: 100%;
  height: 240rpx;
  object-fit: cover;
}

.spot-info {
  padding: 20rpx;
}

.name-rating-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.spot-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  flex: 1;
  margin-right: 16rpx;
}

.rating {
  display: flex;
  align-items: center;
  gap: 8rpx;
  white-space: nowrap;
}

.rating-score {
  font-size: 24rpx;
  color: #FF9800;
  line-height: 1;
}

.spot-desc {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spot-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}

.location {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.location-text {
  font-size: 24rpx;
  color: #999999;
}

.price {
  font-size: 32rpx;
  color: #FF5722;
  font-weight: bold;
}
</style>

