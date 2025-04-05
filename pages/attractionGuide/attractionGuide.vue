<template>
  <view class="page">
    <view class="header">
      <view class="title-section">
        <text class="title">景点攻略</text>
        <view class="header-actions">
          <uni-icons type="heart" size="24" color="#FFFFFF" class="header-icon"></uni-icons>
          <uni-icons type="arrow-right" size="24" color="#FFFFFF" class="header-icon"></uni-icons>
        </view>
      </view>
      <view class="search-wrap">
        <uni-icons type="search" size="16" color="#999999" class="search-icon"></uni-icons>
        <input v-model="searchInput" class="search-input" type="text" placeholder="搜索景点、攻略" placeholder-class="placeholder"/>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
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

      <view class="filter-bar">
        <view class="filter-options">
          <view class="filter-item">
            <text>综合排序</text>
            <uni-icons type="bottom" size="12" color="#666666"></uni-icons>
          </view>
          <view class="filter-item">
            <text>筛选</text>
            <uni-icons type="filter" size="12" color="#666666"></uni-icons>
          </view>
        </view>
      </view>

      <view class="spot-grid">
        <view
          v-for="item in filteredAttractions"
          :key="item.id"
          class="spot-item"
        >
          <image :src="item.imageUrl" mode="aspectFill"></image>
          <view class="spot-info">
            <text class="spot-name">{{ item.name }}</text>
            <view class="rating">
              <uni-rate :value="item.rating" size="10" readonly></uni-rate>
              <text class="rating-score">{{ item.rating }}</text>
            </view>
            <text class="spot-desc">开放时间： {{ item.starttime }} - {{ item.endtime }}</text>
            <view class="spot-footer">
              <view class="location">
                <text class="location-text">门票价格</text>
              </view>
              <text class="price">{{ item.ticketprice }}</text>
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

// 根据选中的分类筛选景点
const filteredAttractions = computed(() => {
  if(searchInput.value){
   return attractionGuidelist.value.filter(item => item.name.includes(searchInput.value));
  }
  if (selectedCategory.value === '全部') {
    return attractionGuidelist.value;
  } 
  else if (selectedCategory.value === '热门') {
    return attractionGuidelist.value.sort((a,b) => b.rating - a.rating)
  }
  else {
    return attractionGuidelist.value.filter(item => item.type === selectedCategory.value);
  }
});

onMounted(() => {
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
    }
  });
});

// 切换分类
const changeTab = (category) => {
  selectedCategory.value = category;
};
</script>

<style>
page {
  height: 100%;
  background: #FFFFFF;
}

.page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header {
  background: #0066CC;
  padding: 20rpx 30rpx;
  flex-shrink: 0;
}

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.header-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-wrap {
  position: relative;
  margin-top: 10rpx;
}

.search-input {
  width: 77%;
  height: 72rpx;
  background: #FFFFFF;
  border-radius: 8rpx;
  padding: 0 80rpx;
  font-size: 28rpx;
  color: #333333;
}

.search-icon {
  position: absolute;
  left: 20rpx;
  top: 50%;
  transform: translateY(-50%);
}

.placeholder {
  color: #999999;
}

.content {
  flex: 1;
  overflow: auto;
}

.category-list {
  padding: 20rpx 30rpx;
  white-space: nowrap;
}

.category-scroll {
  display: inline-flex;
  gap: 15rpx;
}

.category-item {
  /* padding: 12rpx 30rpx; */
  background: #F5F5F5;
  border-radius: 8rpx;
  color: #666666;
  font-size: 28rpx;
  border: none;
}

.category-item.active {
  background: #0066CC;
  color: #FFFFFF;
}

.filter-bar {
  padding: 20rpx 30rpx;
}

.filter-options {
  display: flex;
  gap: 20rpx;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 20rpx;
  background: #F5F5F5;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666666;
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
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
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
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}

.rating-score {
  font-size: 24rpx;
  color: #999999;
  margin-left: 8rpx;
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
  font-size: 24rpx;
  color: #0066CC;
}


</style>

