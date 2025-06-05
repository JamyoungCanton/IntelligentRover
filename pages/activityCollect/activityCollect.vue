<template>
    <view class="container">
      <view class="title">我的活动收藏</view>
      <view v-if="loading" class="loading">加载中...</view>
      <view v-else-if="activities.length === 0" class="empty">
        <uni-icons type="star" size="48" color="#ddd" />
        <text>暂无收藏的活动</text>
      </view>
      <view v-else class="activity-list">
        <view 
          class="activity-card" 
          v-for="item in activities" 
          :key="item.productId"
          @tap="toDetail(item)"
        >
          <image 
            :src="item.priductImage" 
            class="activity-img" 
            mode="aspectFill"
          />
          <view class="activity-info">
            <view class="activity-header">
              <text class="activity-title">{{ item.productName }}</text>
              <text class="activity-type">{{ getProductTypeText(item.productType) }}</text>
            </view>
            <view class="activity-time">
              <uni-icons type="calendar" size="14" color="#999" />
              <text>{{ formatTime(item.createTime) }}</text>
            </view>
          </view>
          <view class="activity-arrow">
            <uni-icons type="right" size="16" color="#999" />
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
  
  // 格式化时间
  const formatTime = (time) => {
    if (!time) return '';
    return time.slice(0, 10);
  };
  
  // 获取产品类型文本
  const getProductTypeText = (type) => {
    const typeMap = {
      'Attractions': '景点',
      'Dining': '餐饮',
      'Accommodations': '住宿',
      'Transportation': '交通',
      'FeaturedRoute': '特色路线'
    };
    return typeMap[type] || type;
  };
  
  const fetchActivityCollect = async () => {
    loading.value = true;
    try {
      const res = await uni.request({
        url: 'https://island.zhangshuiyi.com/island/island/productCollect/myProduct',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'X-Access-Token': userStore.token
        },
        data: {
          userId: userStore.userInfo?.id || '',
          productType: 'FeaturedRoute' // 只查询活动类型
        }
      });

      if (res.data.code === 200 && res.data.success) {
        activities.value = Array.isArray(res.data.result) ? res.data.result : [];
      } else {
        uni.showToast({ 
          title: res.data.message || '获取失败', 
          icon: 'none' 
        });
      }
    } catch (error) {
      console.error('获取收藏活动失败:', error);
      uni.showToast({ 
        title: '网络异常', 
        icon: 'none' 
      });
    } finally {
      loading.value = false;
    }
  };
  
  const toDetail = (item) => {
    uni.navigateTo({
      url: `/pages/activity/activity?id=${item.productId}`
    });
  };
  
  onMounted(fetchActivityCollect);
  </script>
  
  <style scoped>
  .container {
    padding: 30rpx;
    background-color: #f8f8f8;
    min-height: 100vh;
  }
  .title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 30rpx;
  }
  .loading {
    text-align: center;
    color: #999;
    margin-top: 100rpx;
    font-size: 28rpx;
  }
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 200rpx;
    color: #999;
  }
  .empty text {
    margin-top: 20rpx;
    font-size: 28rpx;
  }
  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }
  .activity-card {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    position: relative;
  }
  .activity-card:active {
    background-color: #fafafa;
  }
  .activity-img {
    width: 160rpx;
    height: 160rpx;
    border-radius: 12rpx;
    margin-right: 24rpx;
    background-color: #f5f5f5;
  }
  .activity-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 160rpx;
    padding: 4rpx 0;
  }
  .activity-header {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }
  .activity-title {
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  .activity-type {
    font-size: 24rpx;
    color: #666;
    background: #f5f5f5;
    padding: 4rpx 12rpx;
    border-radius: 20rpx;
    display: inline-block;
  }
  .activity-time {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 24rpx;
    color: #999;
  }
  .activity-arrow {
    padding: 20rpx;
    margin: -20rpx;
  }
  </style>