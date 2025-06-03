<template>
    <view class="container">
      <view class="title">我的活动收藏</view>
      <view v-if="loading" class="loading">加载中...</view>
      <view v-else-if="activities.length === 0" class="empty">暂无收藏的活动</view>
      <view v-else class="activity-list">
        <view class="activity-card" v-for="item in activities" :key="item.productId" @tap="toDetail(item)">
          <image :src="item.priductImage" class="activity-img" />
          <view class="activity-info">
            <text class="activity-title">{{ item.productName }}</text>
            <text class="activity-type">{{ item.productType }}</text>
          </view>
        </view>
      </view>
    </view>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '@/store/modules/user';
  const userStore = useUserStore();
  
  const activities = ref([]);
  const loading = ref(true);
  
  const fetchActivityCollect = async () => {
    loading.value = true;
    uni.request({
      url: 'https://island.zhangshuiyi.com/island/island/productCollect/myProduct',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'X-Access-Token': userStore.token
      },
      data: {
        userId: userStore.userInfo?.id || '',
        productType: 'FeaturedRoute' // 只查活动收藏，查全部可不传
      },
      success: (res) => {
        if (res.data.code === 200 && res.data.success) {
          // 这里假设 result 是数组
          activities.value = Array.isArray(res.data.result) ? res.data.result : [];
        } else {
          uni.showToast({ title: res.data.message || '获取失败', icon: 'none' });
        }
      },
      fail: () => {
        uni.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        loading.value = false;
      }
    });
  };
  
  const toDetail = (item) => {
    // 跳转到活动详情页
    uni.navigateTo({
      url: `/pages/activity/activity?id=${item.productId}`
    });
  };
  
  onMounted(fetchActivityCollect);
  </script>
  
  <style scoped>
  .container {
    padding: 30rpx;
  }
  .title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 30rpx;
  }
  .loading, .empty {
    text-align: center;
    color: #999;
    margin-top: 100rpx;
  }
  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
  }
  .activity-card {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    padding: 20rpx;
  }
  .activity-img {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    margin-right: 30rpx;
    object-fit: cover;
  }
  .activity-info {
    display: flex;
    flex-direction: column;
  }
  .activity-title {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }
  .activity-type {
    font-size: 22rpx;
    color: #999;
    margin-top: 10rpx;
  }
  </style>