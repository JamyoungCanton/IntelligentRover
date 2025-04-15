<template>
  <view class="page">
    <!-- 轮播图 -->
    <view class="carousel">
      <swiper :autoplay="true" :interval="3000" :duration="500" :circular="true">
        <swiper-item v-for="(item, index) in carouselItems" :key="index">
          <view class="carousel-item">
            <image :src="item.image" class="carousel-image"></image>
            <view class="carousel-text">
              <text class="title">{{ item.title }}</text>
              <p><text class="subtitle">{{ item.subtitle }}</text></p>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 导航栏 -->
    <view class="navbar">
      <scroll-view class="nav-scroll" scroll-x>
        <view
          v-for="(tab, index) in tabs"
          :key="index"
          class="nav-item"
          :class="{ active: activeTab === tab.value }"
          @click="setActive(tab.value)"
        >
          {{ tab.name }}
        </view>
      </scroll-view>
    </view>

    <!-- 筛选和排序 -->
    <view class="filter-bar">
      <view class="filter-options">
        <view class="filter-item" @click="toggleFilter">
          <text>筛选</text>
        </view>
      </view>
      <view class="sub-filter">
        <view class="sub-filter-item" @click="setSort('price')">价格</view>
        <view class="sub-filter-item" @click="setSort('sales')">销量</view>
        <view class="sub-filter-item" @click="setSort('rating')">好评</view>
      </view>
    </view>

    <!-- 景点列表 -->
    <view class="spot-grid">
      <view
        v-for="item in sortedSpots"
        :key="item.id"
        class="spot-item"
        @click="goAttraction(item.id)"
      >
		<view class="img">
			<image :src="item.image" mode="aspectFill"></image>
			<view class="rating">
				<image :src="item.imagestar" :style="item.starStyle" class="starlove"></image>
				<text>{{ item.rating }}</text>
			</view>
		</view>
        <view class="spot-info">
          <text class="spot-name">{{ item.name }}</text>
          
          <text class="spot-desc">{{ item.desc }}</text>
          <view class="spot-footer">
            <text class="price">¥{{ item.price }}<text style="color: darkgray; font-size: 15px;">起</text></text>
            <text class="sales">已售{{ item.sales }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';

const activeTab = ref('all');
const sortType = ref('');
const tabs = ref([
  { name: '全部', value: 'all' },
  { name: '海滩休闲', value: 'beach' },
  { name: '水上运动', value: 'water' },
  { name: '文化体验', value: 'culture' },
  { name: '美食', value: 'food' }
]);

const carouselItems = ref([
  {
    image: '/static/dayTravel/lunbo1.png',
    title: '一日畅游',
    subtitle: '欢乐无限 · 欢迎来到海岛一日游'
  },
  // 更多轮播项...
]);

const spots = ref([
  {
    id: 1,
    name: '蓝湾浮潜体验',
    rating: 4.9,
    desc: '浮潜装备 · 专业教练 · 午餐',
    price: 299,
    sales: 1234,
    image: '/static/dayTravel/1.png',
	imagestar: '/static/dayTravel/star.png',
	starStyle: { width: '13px', height: '13px', objectFit: 'contain' }
  },
  {
    id: 2,
    name: '海滩BBQ派对',
    rating: 4.8,
    desc: '烧烤套餐 · 沙滩椅 · 饮品',
    price: 399,
    sales: 890,
    image: '/static/dayTravel/2.png',
	imagestar: '/static/dayTravel/star.png',
	starStyle: { width: '13px', height: '13px', objectFit: 'contain' }
  },
  {
    id: 3,
    name: '日落帆船巡游',
    rating: 4.9,
    desc: '帆船体验 · 香槟 · 晚餐',
    price: 599,
    sales: 678,
    image: '/static/dayTravel/3.png',
	imagestar: '/static/dayTravel/star.png',
	starStyle: { width: '13px', height: '13px', objectFit: 'contain' }
  },
  {
    id: 4,
    name: '珊瑚礁探索',
    rating: 4.7,
    desc: '潜水装备 · 专业向导 · 水下相机',
    price: 349,
    sales: 432,
    image: '/static/dayTravel/4.png',
	imagestar: '/static/dayTravel/star.png',
	starStyle: { width: '13px', height: '13px', objectFit: 'contain' }
  },
]);

const setActive = (tab) => {
  activeTab.value = tab;
};

const toggleFilter = () => {
  showFilter.value = !showFilter.value;
};

const setSort = (type) => {
  sortType.value = type;
};

const sortedSpots = computed(() => {
  let sorted = [...spots.value];
  if (sortType.value === 'price') {
    sorted = sorted.sort((a, b) => a.price - b.price);
  } else if (sortType.value === 'sales') {
    sorted = sorted.sort((a, b) => b.sales - a.sales);
  } else if (sortType.value === 'rating') {
    sorted = sorted.sort((a, b) => b.rating - a.rating);
  }
  return sorted;
});

const goAttraction = (id) => {
  uni.navigateTo({
    url: `/pages/attractionDetail/attractionDetail?id=${id}`
  });
};
</script>

<style>
.page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.carousel {
  position: relative;
  width: 100%;
  height: 140px; /* 根据需要调整轮播图的高度 */
}

.carousel-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  padding: 10px;
  border-radius: 5px;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.5);
  width: 60%;
}

.title {
  font-size: 32px;
  margin-bottom: 5px;
  color: coral;
}

.subtitle {
  font-size: 16px;
}

.navbar {
  width: 100%;
  background-color: #f8f8f8f8;
  border-bottom: 1px solid #e5e5e5;
}

.nav-scroll {
  display: flex;
  overflow-x: auto; /* 水平滚动 */
  white-space: nowrap; /* 防止换行 */
}

.nav-item {
  display: inline-block; /* 使元素在同一行显示 */
  padding: 15px;
  cursor: pointer;
  color: #666;
}

.nav-item.active {
  color: #007aff;
  font-weight: bold;
  border-bottom: 2px solid #007aff;
}

.filter-bar {
  display: flex;
  align-items: center;
  background-color: #f8f8f8f8;
  padding: 10px;
  border-radius: 5px;
}

.filter-options {
  display: flex;
  gap: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
}

.icon {
  font-size: 16px;
}

.sub-filter {
  position: absolute;
  padding: 10px;
  z-index: 1000;
  right: 5px;
}

.sub-filter-item {
  margin-right: 10px;
  cursor: pointer;
  float: left;
  color: #666;
}

.sub-filter-item:hover {
  color: #007aff;
}

.spot-grid {
  padding: 0 30rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.spot-item {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0,0.1);
}

.spot-item image {
  width: 100%;
  height: 240rpx;
}

.spot-info {
  padding: 16rpx;
}

.spot-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.rating {
	width: 40px;
	height: 25px;
	line-height: 25px;
	font-size: 15px;
	position: absolute;
	align-items: center;
	border-radius: 10px;
	z-index: 10;
	background-color: rgba(0, 0, 0, 0.3);
	right: 2px;
	bottom: 15px;
	color: #FFFFFF;
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

.img{
	position: relative;
}
.starlove{
	width: 5px;
	height: 5px;
}
.price {
  font-size: 35rpx;
  color: #cc1c42;
  font-weight: bold;
}

.sales {
  font-size: 15px;
  padding-right: 5rpx;
  color: #999999;
}
</style>