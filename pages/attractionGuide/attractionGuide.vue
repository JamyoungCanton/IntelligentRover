<template>
  <view class="page">
    <scroll-view class="page-scroll" scroll-y>
      <view class="hero">
        <image v-if="heroImage" :src="heroImage" class="hero-img" mode="aspectFill" />
        <view class="hero-dim"></view>
        <view class="hero-overlay">
          <text class="hero-itle">探索美丽海岛</text>
          <text class="hero-subtitle">发现令人心动的旅行目的地</text>
        </view>
        <view class="hero-search">
          <view class="search-wrap">
            <uni-icons type="search" size="22" color="#9499A0" class="search-icon"></uni-icons>
            <input v-model="searchInput" class="search-input" type="text" placeholder="搜索景点名称或关键词" placeholder-class="placeholder" />
          </view>
        </view>
      </view>

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

      <view class="list">
        <view
          v-for="item in filteredAttractions"
          :key="item.id"
          class="list-item"
        >
          <image :src="item.imageUrl" class="item-thumb" mode="aspectFill" />
          <view class="item-body">
            <view class="item-header">
              <text class="item-title">{{ item.name }}</text>
              <text class="badge">{{ scenicLevel(item.rating) }}</text>
            </view>
            <text class="item-desc">开放时间：{{ formatTime(item.starttime) }} - {{ formatTime(item.endtime) }}</text>
            <view class="item-footer">
              <view class="rating-line">
                <uni-rate :value="item.rating" size="12" readonly></uni-rate>
                <text class="rating-score">{{ item.rating }}</text>
              </view>
              <view class="price-book">
                <text v-if="item.ticketprice !== 0" class="price">¥{{ item.ticketprice }}</text>
                <text v-else class="price">免费</text>
                <button class="book-btn" @click.stop="goAttraction(item.id, item.imageUrl)">预约</button>
              </view>   
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

const heroImage = computed(() => {
  const list = attractionGuidelistOriginal.value;
  return list && list.length > 0 ? list[9].imageUrl : '';
});

const scenicLevel = (rating) => {
  if (rating >= 4.5) return '5A景区';
  if (rating >= 3.5) return '4A景区';
  if (rating >= 2.5) return '3A景区';
  return '景区';
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
const goAttraction = (id, imageUrl) => {
  uni.navigateTo({
    url: `/pages/attractionDetail/attractionDetail?id=${id}&imageUrl=${encodeURIComponent(imageUrl)}`
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
.page { display: flex; height: 100vh; background-color: #f5f7fa; }
.page-scroll { width: 100%; }
.hero { position: relative; height: 320rpx; margin: 0 24rpx; border-radius: 24rpx; overflow: hidden; }
.hero-img { width: 100%; height: 100%; }
.hero-overlay { width: 100%; height:150rpx;position: absolute; left: 50%; transform: translateX(-50%); right: 0; bottom: 70rpx; padding: 30rpx; background: transparent; z-index: 2; }
.hero-itle{ position: absolute; color: #fff; text-align: center;font-size: 40rpx;font-weight: 800;margin-bottom: 20rpx;margin-left: 46%;transform: translateX(-46%);}
.hero-dim { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: rgba(0,0,0,0.20); z-index: 1; }
.hero-title { color: #fff; font-size: 50rpx; margin-bottom: 190rpx; align-items: center;}
.hero-subtitle {position: absolute;top:100rpx;left: 51%;transform: translateX(-50%); color: rgba(255, 255, 255, 0.85); font-size: 26rpx; margin-top: 20rpx; align-items: center;}
.hero-search { position: absolute; left: 24rpx; right: 24rpx; bottom: 10rpx; z-index: 10; }
.search-wrap { display: flex; align-items: center; background: #fff; border-radius: 40rpx; box-shadow: 0 8rpx 24rpx rgba(15,174,223,0.12); padding: 0 28rpx; height: 72rpx; }
.search-icon { margin-right: 12rpx; }
.search-input { flex: 1; border: none; background: transparent; font-size: 30rpx; color: #333; }
.placeholder { color: #bbb; }
.category-list { padding: 24rpx 24rpx 16rpx 24rpx; white-space: nowrap; background: #fff; border-top-left-radius: 24rpx; border-top-right-radius: 24rpx; margin: 0 0rpx; margin-top: 5rpx; }
.category-scroll { display: inline-flex; gap: 16rpx; }
.category-item { padding: 6rpx 32rpx; background: #f0f2f5; border-radius: 30rpx; color: #333; font-size: 28rpx; border: 3rpx solid rgba(15,174,223,0.08); }
.category-item.active { background: #4F46E5; color: #fff; box-shadow: 0 6rpx 16rpx rgba(15,174,223,0.18); }
.list { padding: 16rpx 24rpx 40rpx 24rpx; }
.list-item { display: flex; background: #fff; border-radius: 16rpx; overflow: hidden; box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.06); margin-bottom: 20rpx; }
.item-thumb { width: 240rpx; height: 180rpx; }
.item-body { flex: 1; padding: 20rpx; }
.item-header { display: flex; align-items: center; justify-content: space-between; }
.item-title { font-size: 30rpx; color: #333; font-weight: 600; flex: 1; margin-right: 16rpx; }
.badge { padding: 6rpx 16rpx; background: #e8f5ff; color: #0faedf; border-radius: 20rpx; font-size: 24rpx; }
.item-desc { margin-top: 8rpx; font-size: 24rpx; color: #999; }
.item-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 16rpx; }
.price-book { display: flex; align-items: center; gap: 16rpx; }
.price { font-size: 32rpx; color: #4F46E5; font-weight: 700; }
.book-btn { padding: 3rpx 22rpx; background: #4F46E5; color: #fff; border-radius: 15rpx; border: none; font-size: 26rpx; }
.rating-line { display: flex; align-items: center; gap: 8rpx; }
.rating-score { font-size: 24rpx; color: #FF9800; }
</style>

