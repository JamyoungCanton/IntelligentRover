<template>
  <view class="container">
    <!-- 顶部图片区域 -->
    <view class="header-image-container">
      <image class="header-image" :src="productDetail.coverImage" mode="aspectFill"></image>
      <view class="back-button">
        <text class="iconfont">&#xe600;</text>
      </view>
      <view class="share-button">
        <text class="iconfont">&#xe603;</text>
      </view>
    </view>

    <!-- 标题和价格区域 -->
    <view class="title-container">
      <view class="title">{{ productDetail.title }}</view>
      <view class="subtitle">{{ productDetail.subtitle }}</view>
      <view class="price-container">
        <text class="price">¥{{ productDetail.price }}</text>
        <text class="original-price">¥{{ productDetail.originalPrice }}</text>
      </view>
    </view>

    <!-- 功能按钮区域 -->
    <view class="action-buttons">
      <view class="action-button" @click="handleAction('favorite')">
        <text class="iconfont">&#xe602;</text>
        <text>收藏</text>
      </view>
      <view class="action-button" @click="handleAction('share')">
        <text class="iconfont">&#xe601;</text>
        <text>分享</text>
      </view>
      <view class="action-button" @click="handleAction('service')">
        <text class="iconfont">&#xe604;</text>
        <text>客服</text>
      </view>
    </view>

    <!-- 日期选择区域 -->
    <view class="section-container date-selection">
      <view class="section-title">出行日期选择</view>
      <view class="date-grid">
        <view
          class="date-item"
          v-for="(item, index) in availableDates"
          :key="index"
          :class="{ 'date-selected': selectedDateIndex === index }"
          @click="selectDate(index)"
        >
          <text class="date-day">{{ item.day }}</text>
          <text class="date-week">{{ item.weekday }}</text>
        </view>
      </view>
    </view>

    <!-- 行程特色 -->
    <view class="section-container">
      <view class="section-title">行程特色</view>
      <view class="feature-list">
        <view class="feature-item" v-for="(feature, index) in productDetail.features" :key="index">
          <text class="feature-dot"></text>
          <text class="feature-text">{{ feature }}</text>
        </view>
      </view>
    </view>

    <!-- 用户评论区域 -->
    <view class="section-container" v-if="reviews.length > 0">
      <view class="section-title">用户点评</view>
      <view class="comment-list">
        <view class="comment-item" v-for="(review, index) in reviews" :key="index">
          <view class="comment-header">
            <image class="user-avatar" :src="review.avatar" mode="aspectFill"></image>
            <view class="user-info">
              <text class="user-name">{{ review.username }}</text>
              <view class="rating">
                <text
                  class="iconfont star-icon"
                  v-for="star in 5"
                  :key="star"
                >&#xe605;</text>
              </view>
            </view>
          </view>
          <view class="comment-content">
            {{ review.content }}
          </view>
        </view>
      </view>
    </view>

    <!-- 相关推荐 -->
    <view class="section-container" v-if="recommendations.length > 0">
      <view class="section-title">相关推荐</view>
      <view class="recommendation-list">
        <view
          class="recommendation-item"
          v-for="(item, index) in recommendations"
          :key="index"
          @click="navigateToProduct(item.id)"
        >
          <image class="recommendation-image" :src="item.image" mode="aspectFill"></image>
          <view class="recommendation-info">
            <text class="recommendation-title">{{ item.title }}</text>
            <text class="recommendation-price">¥{{ item.price }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部购买按钮 -->
    <view class="bottom-bar">
      <view class="bottom-price">
        <text class="current-price">¥{{ productDetail.price }}</text>
        <text class="price-desc">起/人</text>
      </view>
      <view class="buy-button" @click="handleBooking">立即预订</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

// 定义产品详情数据结构
interface ProductDetail {
  id: string | number;
  title: string;
  subtitle: string;
  coverImage: string;
  price: number;
  originalPrice: number;
  features: string[];
  description?: string;
  inclusions?: string[];
  exclusions?: string[];
}

// 定义评论数据结构
interface Review {
  id: string | number;
  username: string;
  avatar: string;
  rating: number;
  content: string;
  date: string;
}

// 定义推荐产品数据结构
interface RecommendedProduct {
  id: string | number;
  title: string;
  image: string;
  price: number;
}

// 定义日期选择数据结构
interface DateOption {
  day: string;
  weekday: string;
  date: string; // 完整日期，用于API传参
  available: boolean;
  price?: number; // 不同日期可能有不同价格
}

// 产品详情
const productDetail = reactive<ProductDetail>({
  id: 1,
  title: '三亚一日海景双享套餐',
  subtitle: '含接送机/可拼车/中文导游',
  coverImage: '/static/images/beach.jpg',
  price: 799,
  originalPrice: 999,
  features: [
    '专业领队全程陪同',
    '无购物无自费安排',
    '一价全包无隐形消费',
    '赠送海景下午茶'
  ]
});

// 可选日期
const availableDates = ref<DateOption[]>([
  { day: '14', weekday: '周一', date: '2025-01-14', available: true },
  { day: '15', weekday: '周二', date: '2025-01-15', available: true },
  { day: '16', weekday: '周三', date: '2025-01-16', available: true },
  { day: '17', weekday: '周四', date: '2025-01-17', available: true },
  { day: '18', weekday: '周五', date: '2025-01-18', available: true },
]);

// 用户评论
const reviews = ref<Review[]>([
  {
    id: 1,
    username: '王二',
    avatar: 'https://mp-a056c4c7-b4d0-4355-9c6a-3136b7fc2d66.cdn.bspapp.com/cloudstorage/b7b00e10-fd14-4b64-83b6-a02a1c7fe77b.png',
    rating: 5,
    content: '服务很好，环境很美，导游很专业。酒店早餐丰富，房间宽敞明亮，性价比很高！',
    date: '2024-12-10'
  },
  {
    id: 2,
    username: '张三',
    avatar: 'https://mp-a056c4c7-b4d0-4355-9c6a-3136b7fc2d66.cdn.bspapp.com/cloudstorage/b7b00e10-fd14-4b64-83b6-a02a1c7fe77b.png',
    rating: 5,
    content: '价格实惠，体验非常好，下次还会再来。一天的行程安排得很合理，不会太赶！',
    date: '2024-12-05'
  }
]);

// 相关推荐
const recommendations = ref<RecommendedProduct[]>([
  {
    id: 2,
    title: '三亚海岛度假5日游',
    image: '/static/images/beach.jpg',
    price: 799
  },
  {
    id: 3,
    title: '海南热带丛林探险',
    image: '/static/images/beach.jpg',
    price: 999
  }
]);

// 当前选中的日期索引
const selectedDateIndex = ref(0);

// 页面加载时获取数据
onMounted(() => {
  // 模拟从API获取数据
  fetchProductDetail();
  fetchAvailableDates();
  fetchReviews();
  fetchRecommendations();
});

// 获取产品详情
const fetchProductDetail = () => {
  // 实际项目中，这里应该是一个API请求
  // const productId = route.params.id;
  // uni.request({
  //   url: `https://api.example.com/products/${productId}`,
  //   method: 'GET',
  //   success: (res) => {
  //     Object.assign(productDetail, res.data);
  //   }
  // });

  // 模拟数据已经在上面定义
  console.log('获取产品详情成功');
};

// 获取可用日期
const fetchAvailableDates = () => {
  // 实际项目中，这里应该是一个API请求
  // uni.request({
  //   url: `https://api.example.com/products/${productDetail.id}/dates`,
  //   method: 'GET',
  //   success: (res) => {
  //     availableDates.value = res.data;
  //   }
  // });

  // 模拟数据已经在上面定义
  console.log('获取可用日期成功');
};

// 获取评论
const fetchReviews = () => {
  // 实际项目中，这里应该是一个API请求
  // uni.request({
  //   url: `https://api.example.com/products/${productDetail.id}/reviews`,
  //   method: 'GET',
  //   success: (res) => {
  //     reviews.value = res.data;
  //   }
  // });

  // 模拟数据已经在上面定义
  console.log('获取评论成功');
};

// 获取推荐产品
const fetchRecommendations = () => {
  // 实际项目中，这里应该是一个API请求
  // uni.request({
  //   url: `https://api.example.com/products/${productDetail.id}/recommendations`,
  //   method: 'GET',
  //   success: (res) => {
  //     recommendations.value = res.data;
  //   }
  // });

  // 模拟数据已经在上面定义
  console.log('获取推荐产品成功');
};

// 选择日期
const selectDate = (index: number) => {
  selectedDateIndex.value = index;
  console.log('选择日期:', availableDates.value[index].date);
};

// 处理功能按钮点击
const handleAction = (action: string) => {
  console.log('点击按钮:', action);
  switch (action) {
    case 'favorite':
      // 处理收藏逻辑
      uni.showToast({
        title: '收藏成功',
        icon: 'success'
      });
      break;
    case 'share':
      // 处理分享逻辑
      uni.showShareMenu({
        withShareTicket: true
      });
      break;
    case 'service':
      // 跳转至客服页面
      uni.showToast({
        title: '正在连接客服',
        icon: 'loading'
      });
      break;
  }
};

// 跳转到其他产品详情
const navigateToProduct = (productId: string | number) => {
  console.log('跳转到产品:', productId);
  uni.navigateTo({
    url: `/pages/index/index?id=${productId}`
  });
};

// 处理预订
const handleBooking = () => {
  console.log('立即预订，选择的日期:', availableDates.value[selectedDateIndex.value].date);
  // 跳转到预订页面
  uni.navigateTo({
    url: `/pages/booking/index?productId=${productDetail.id}&date=${availableDates.value[selectedDateIndex.value].date}`
  });
};
</script>

<style>
/* 引入图标字体 */
@font-face {
  font-family: 'iconfont';
  src: url('https://at.alicdn.com/t/font_8d5l8fzk5b87iudi.ttf') format('truetype');
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 24px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.container {
  display: flex;
  flex-direction: column;
  padding-bottom: 100rpx;
  background-color: #f8f8f8;
}

/* 顶部图片区域 */
.header-image-container {
  position: relative;
  width: 100%;
  height: 420rpx;
}

.header-image {
  width: 100%;
  height: 100%;
}

.back-button, .share-button {
  position: absolute;
  top: 40rpx;
  width: 60rpx;
  height: 60rpx;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.back-button {
  left: 20rpx;
}

.share-button {
  right: 20rpx;
}

/* 标题和价格区域 */
.title-container {
  padding: 30rpx;
  background-color: #fff;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.price-container {
  display: flex;
  align-items: center;
}

.price {
  font-size: 46rpx;
  font-weight: bold;
  color: #ff6b6b;
  margin-right: 15rpx;
}

.original-price {
  font-size: 28rpx;
  color: #999;
  text-decoration: line-through;
}

/* 功能按钮区域 */
.action-buttons {
  display: flex;
  background-color: #fff;
  padding: 20rpx 0;
  border-top: 1px solid #eee;
  margin-bottom: 20rpx;
}

.action-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.action-button text:last-child {
  font-size: 24rpx;
  color: #666;
  margin-top: 5rpx;
}

/* 日期选择区域 */
.section-container {
  background-color: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.date-grid {
  display: flex;
  justify-content: space-between;
}

.date-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
  width: 120rpx;
  border: 1px solid #eee;
  border-radius: 10rpx;
}

.date-selected {
  border-color: #4dabf7;
  background-color: #e7f5ff;
}

.date-day {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.date-week {
  font-size: 24rpx;
  color: #666;
  margin-top: 5rpx;
}

/* 行程特色 */
.feature-list {
  display: flex;
  flex-direction: column;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.feature-dot {
  width: 16rpx;
  height: 16rpx;
  background-color: #4dabf7;
  border-radius: 50%;
  margin-right: 15rpx;
}

.feature-text {
  font-size: 28rpx;
  color: #333;
}

/* 用户评论区域 */
.comment-list {
  display: flex;
  flex-direction: column;
}

.comment-item {
  margin-bottom: 30rpx;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
}

.rating {
  display: flex;
}

.star-icon {
  color: #ffb805;
  font-size: 26rpx;
  margin-right: 5rpx;
}

.comment-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

/* 相关推荐 */
.recommendation-list {
  display: flex;
  justify-content: space-between;
}

.recommendation-item {
  width: 48%;
}

.recommendation-image {
  width: 100%;
  height: 180rpx;
  border-radius: 10rpx;
  margin-bottom: 10rpx;
}

.recommendation-info {
  display: flex;
  flex-direction: column;
}

.recommendation-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 5rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recommendation-price {
  font-size: 28rpx;
  color: #ff6b6b;
  font-weight: bold;
}

/* 底部购买按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.bottom-price {
  flex: 1;
  display: flex;
  align-items: center;
}

.current-price {
  font-size: 46rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.price-desc {
  font-size: 24rpx;
  color: #999;
  margin-left: 5rpx;
}

.buy-button {
  width: 240rpx;
  height: 80rpx;
  background-color: #4dabf7;
  color: #fff;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
}
</style>