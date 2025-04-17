<template>
  <view class="container">
    <!-- 顶部图片区域 -->
    <view class="header-image-container">
      <image class="header-image" src="https://wlmtsys.com:9000/wlmtsys/2025/04/17/df79d846c28b4b4c8943147884fd8667.png" mode="aspectFill"></image>
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
        <image src="/static/daytravelDetail/email.png" class="three"></image>
        <text> 专业教练</text>
      </view>
      <view class="action-button" @click="handleAction('share')">
        <image src="/static/daytravelDetail/food.png" class="three"></image>
        <text>海鲜午餐</text>
      </view>
      <view class="action-button" @click="handleAction('service')">
        <image src="/static/daytravelDetail/save.png" class="three"></image>
        <text>旅游保险</text>
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
		  <text class="date-price">{{ item.price }}</text>
        </view>
      </view>
    </view>

    <!-- 行程安排部分 -->
        <view class="schedule-section">
          <view class="section-title">行程安排</view>
          <view class="timeline">
            <view v-for="(item, index) in scheduleList" :key="index" class="timeline-item">
              <view class="time-point">
                <view class="circle" />
                <view v-if="index !== scheduleList.length - 1" class="line" />
              </view>
              <view class="time-content">
                <view class="time">{{ item.time }}</view>
                <view class="content">{{ item.content }}</view>
              </view>
            </view>
          </view>
        </view>
    
        <!-- 费用说明部分 -->
        <view class="usage-section">
          <view class="section-title">费用说明</view>
		  <view style="color: color: #333;font-size: 17px;">费用包含</view>
          <view class="usage-list">
            <view v-for="(item, index) in usageList" :key="index" class="usage-item">
              <view class="dot" />
              <text>{{ item }}</text>
            </view>
          </view>
		  <!-- 费用不含 -->
		  <view style="color: color: #333;font-size: 17px;">费用不含</view>
		  <view class="usage-list">
		    <view v-for="(item, index) in nousageList" :key="index" class="usage-item">
		      <view class="dot" />
		      <text>{{ item }}</text>
		    </view>
		  </view>
        </view>

    <!-- 用户评论区域 -->
    <view class="section-container" v-if="reviews.length > 0">
	<view class="findAll">查看全部</view>
      <view class="section-title">用户点评</view>
      <view class="comment-list">
        <view class="comment-item" v-for="(review, index) in reviews" :key="index">
          <view class="comment-header">
            <image class="user-avatar" :src="review.avatar" mode="aspectFill"></image>
            <view class="user-info">
              <text class="user-name">{{ review.username }}</text>
              <view class="rating">
                <view
                  class="iconfont star-icon"
                  v-for="star in 5"
                  :key="star"
                ><image src="/static/dayTravel/star.png" class="starimg"></image></view>
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
  { day: '14', weekday: '周一', date: '2025-01-14', price: 799, available: true },
  { day: '15', weekday: '周二', date: '2025-01-15', price: 799,available: true },
  { day: '16', weekday: '周三', date: '2025-01-16', price: 799,available: true },
  { day: '17', weekday: '周四', date: '2025-01-17', price: 799,available: true },
  { day: '18', weekday: '周五', date: '2025-01-18', price: 799,available: true },
]);

// 行程安排数据
const scheduleList = ref([
  { time: '08:30', content: '酒店集合出发' },
  { time: '09:30', content: '抵达海南，清蓝慧村' },
  { time: '10:00', content: '快艇深海体验' },
  { time: '12:00', content: '海鲜特色午餐' },
  { time: '14:00', content: '海底世界体验' },
  { time: '16:00', content: '自由活动，拍照' },
  { time: '17:00', content: '返程' }
]);

// 费用说明数据
const usageList = ref([
  '费用门票',
  '专业接待',
  '安排住宿',
  '海鲜午餐',
  '景点咨询'
]);

// 费用说明数据
const nousageList = ref([
  '个人消费',
  '保险服务',
  '小费'
]);

// 用户评论
const reviews = ref<Review[]>([
  {
    id: 1,
    username: '李小姐',
    avatar: '/static/daytravelDetail/man.png',
    rating: 5,
    content: '教练很专业，海鲜午餐很新鲜，整体体验非常棒！',
    date: '2024-01-15'
  },
  {
    id: 2,
    username: '张先生',
    avatar: '/static/daytravelDetail/man.png',
    rating: 5,
    content: '海底漫步太神奇了，第一次体验这么特别的项目。',
    date: '2024-01-14'
  },
  {
    id: 3,
    username: '王小姐',
    avatar: '/static/daytravelDetail/man.png',
    rating: 4,
    content: '整体不错，就是集合时间有点早。午餐很丰盛！',
    date: '2024-01-13'
  }
]);

// 相关推荐
const recommendations = ref<RecommendedProduct[]>([
  {
    id: 2,
    title: '三亚海岛度假5日游',
    image: 'https://wlmtsys.com:9000/wlmtsys/2025/04/17/f05760d6c1e146b7bb07bc32c5b47d2b.png',
    price: 799
  },
  {
    id: 3,
    title: '海南热带丛林探险',
    image: 'https://wlmtsys.com:9000/wlmtsys/2025/04/17/072f4bac0fa6481f9390c8145e356f22.png',
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
/* 原来的样式 */
.iconfont {
  font-family: "iconfont" !important;
  font-size: 24px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.left{
	width: 25px;
	height: 25px;
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
	
.three{
	width: 30px;
	height: 30px;
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
  background-color: #ffffff;
  border-radius: 5px;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-bottom: 20rpx;
  padding: 20rpx 0;
}

.action-button {
  width: 120px;
  height: 70px;
  background-color: #eff6ff;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 20px;
  padding-top: 5px;
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
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-top: 5rpx;
  margin-bottom: 20rpx;
}

.findAll{
	float: right;
	color: #8ba6ef;
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
.date-price {
  font-size: 24rpx;
  color: #1471c7;
  margin-top: 10rpx;
}

/* 行程安排样式 */
.schedule-section {
  background-color: #ffffff;
  margin-top: 10px;
  border-top: #f8f8f9;
  margin-left: 10px;
  margin-bottom: 20px;
}

.timeline {
  padding: 15px 0;
}

.timeline-item {
  display: flex;
  position: relative;
  margin-bottom: 5px;
}

.time-point {
  width: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #0077cc;
  margin-top: 6px;
}

.line {
  width: 1px;
  height: 50px;
  background-color: #0077cc;
  margin-top: 3px;
}

.time-content {
  flex: 1;
  padding-bottom: 15px;
  padding-left: 10px;
}

.time {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.content {
  font-size: 14px;
  color: #666;
  margin-top: 3px;
}

/* 费用说明样式 */
.usage-section {
  background-color: #ffffff;
  padding-bottom: 20px;
  margin-left: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #f8f8f9;
  border-top: 1px solid #f8f8f9;
}

.usage-list {
  padding: 15px 0;
}

.usage-item {
  color: #777c83;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #333;
  margin-right: 8px;
  flex-shrink: 0;
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

.starimg{
  width: 17px;
  height: 17px;
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