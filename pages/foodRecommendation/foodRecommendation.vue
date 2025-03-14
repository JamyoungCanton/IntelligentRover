<template>
  <view class="container">
    <!-- 头部导航栏 -->
    <view class="header">
      <!-- <uni-icons type="back" size="24" color="#333" @click="goBack"/> -->
      <text class="header-title">美食推荐</text>
      <uni-icons type="search" size="24" color="#333" @click="onSearch"/>
    </view>

    <!-- 主内容区域 -->
    <view class="main">
      <!-- 筛选标签 -->
      <scroll-view class="filter-scroll" scroll-x>
        <view class="filter-tags">
          <view 
            v-for="(tag, index) in filterTags" 
            :key="index"
            :class="['filter-tag', { active: tag.active }]"
            @click="selectTag(index)"
          >
            {{ tag.name }}
          </view>
        </view>
      </scroll-view>

      <!-- 排序选择器 -->
      <view class="sort-selector">
        <text class="sort-text">综合排序</text>
        <uni-icons type="down" size="12" color="#999"/>
      </view>

      <!-- 餐厅列表 -->
      <scroll-view scroll-y class="restaurant-list">
        <view 
          v-for="(restaurant, index) in restaurants" 
          :key="index" 
          class="restaurant-card"
        >
          <view class="restaurant-image">
            <image :src="restaurant.image" mode="aspectFill"/>
            <text :class="['tag', restaurant.tagType]">{{ restaurant.tag }}</text>
          </view>
          <view class="restaurant-info">
            <text class="restaurant-name">{{ restaurant.name }}</text>
            <view class="rating-box">
              <uni-icons type="star-filled" size="14" color="#FFA500"/>
              <text class="rating">{{ restaurant.rating }}</text>
              <text class="monthly-sale">月售 {{ restaurant.monthlySales }}</text>
            </view>
            <view class="price-distance">
              <text class="price">人均 ¥{{ restaurant.averagePrice }}</text>
              <text class="distance">距离 {{ restaurant.distance }}km</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 悬浮按钮 -->
    <view class="float-button">
      <uni-icons type="calendar" size="24" color="#FFFFFF"/>
    </view>

    
  </view>
</template>

<script setup>
import { ref } from 'vue';

const currentTab = ref(0);

const filterTags = ref([
  { name: '全部', active: true },
  { name: '海鲜', active: false },
  { name: '粤式', active: false },
  { name: '特色小吃', active: false },
  { name: '农家菜', active: false }
]);



const restaurants = ref([
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/a256aeabf41e28db3c1c0b25aec7373c.jpg',
    name: '万山渔港海鲜餐厅',
    rating: '4.8',
    monthlySales: '2380',
    averagePrice: '188',
    distance: '1.2',
    tag: '人气网红',
    tagType: 'popular'
  },
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/6dcb4b894c7f14fcac90ab68d7dc378e.jpg',
    name: '粤海味道',
    rating: '4.6',
    monthlySales: '1680',
    averagePrice: '128',
    distance: '0.8',
    tag: '特色推荐',
    tagType: 'featured'
  }
]);

const selectTag = (index) => {
  filterTags.value.forEach((tag, i) => {
    tag.active = i === index;
  });
};

const switchTab = (index) => {
  currentTab.value = index;
};

const goBack = () => {
  uni.navigateBack();
};

const onSearch = () => {
  uni.showToast({
    title: '搜索功能开发中',
    icon: 'none'
  });
};
</script>

<style>
/* 样式部分保持不变 */
page {
  height: 100%;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #FFFFFF;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  border-bottom: 1px solid #f5f5f5;
  z-index: 100;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
}

.main {
  flex: 1;
  margin-top: 88rpx;
  padding: 0 32rpx;
  overflow: hidden;
}

.filter-scroll {
  margin: 0 -32rpx;
  padding: 24rpx 32rpx;
  white-space: nowrap;
}

.filter-tags {
  display: inline-flex;
  gap: 24rpx;
}

.filter-tag {
  display: inline-block;
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  border: 1px solid #E5E5E5;
  font-size: 14px;
  color: #666666;
}

.filter-tag.active {
  color: #0066FF;
  border-color: #0066FF;
  background-color: rgba(0, 102, 255, 0.1);
}

.sort-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 32rpx 0;
  padding: 16rpx;
  background-color: #F5F5F5;
  border-radius: 16rpx;
}

.sort-text {
  font-size: 14px;
  color: #666666;
}

.restaurant-list {
  height: calc(100vh - 400rpx);
  overflow: auto;
}

.restaurant-card {
  margin-bottom: 32rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #FFFFFF;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.restaurant-image {
  position: relative;
  height: 360rpx;
}

.restaurant-image image {
  width: 100%;
  height: 100%;
}

.tag {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 12px;
  color: #FFFFFF;
}

.tag.popular {
  background-color: #FF6B00;
}

.tag.featured {
  background-color: #0066FF;
}

.restaurant-info {
  padding: 24rpx;
}

.restaurant-name {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 16rpx;
}

.rating-box {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.rating {
  font-size: 14px;
  color: #333333;
  margin: 0 16rpx 0 8rpx;
}

.monthly-sale {
  font-size: 14px;
  color: #999999;
}

.price-distance {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.price {
  color: #666666;
}

.distance {
  color: #999999;
}

.float-button {
  position: fixed;
  right: 32rpx;
  bottom: 140rpx;
  width: 100rpx;
  height: 100rpx;
  background: #0066FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(0, 102, 255, 0.3);
}


</style>