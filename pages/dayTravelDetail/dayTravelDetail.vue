<template>
  <view class="container">
    <!-- 顶部图片区域 -->
    <view class="header-image-container">
      <image class="header-image" :src="productDetail.coverImage || '/static/daytravelDetail/man.png'" mode="aspectFill"></image>
    </view>

    <!-- 标题和价格区域 -->
    <view class="title-container">
      <view class="title" style="color: #333;">{{ productDetail.title || '加载中...' }}</view>
      <view class="subtitle">{{ productDetail.subtitle || '加载中...' }}</view>
      <view class="price-container">
        <text class="price">¥{{ productDetail.price || 0 }}</text>
      </view>
    </view>

    <!-- 行程亮点区域 -->
    <view class="section-container">
      <view class="section-title">行程亮点</view>
      <view class="highlight-list">
        <view v-for="(item, index) in highlights" :key="index" class="highlight-item">
          <image :src="getHighlightIcon(item.icon)" class="highlight-icon"></image>
          <text class="highlight-text">{{ item.text }}</text>
        </view>
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

    <!-- 费用说明部分 -->
    <view class="usage-section">
      <view class="section-title">费用说明</view>
      <view style="color: #333; font-size: 17px;">费用包含</view>
      <view class="usage-list">
        <view v-for="(item, index) in usageList" :key="index" class="usage-item">
          <text>{{ item }}</text>
        </view>
      </view>
    </view>

    <!-- 预订须知部分 -->
    <view class="section-container">
      <view class="section-title">预订须知</view>
      <view class="notes-list">
        <view v-for="(item, index) in notesList" :key="index" class="notes-item">
          <view class="notes-content">{{ item.content }}</view>
        </view>
      </view>
    </view>

    <!-- 用户评论区域 -->
    <view class="section-container" v-if="reviews.length > 0" style="margin-top: 5px;">
      <view class="section-title">用户点评</view>
      <view class="comment-list">
        <view class="comment-item" v-for="(review, index) in reviews" :key="index">
          <view class="comment-header">
            <image class="user-avatar" :src="review.avatar" mode="aspectFill"></image>
            <view class="user-info">
              <text class="user-name">{{ review.username }}</text>
              <view class="rating-star">
                <view class="star-icon" v-for="star in 5" :key="star">
                  <image src="/static/dayTravel/star.png" class="starimg"></image>
                </view>
              </view>
            </view>
          </view>
          <view class="comment-content">{{ review.content }}</view>
        </view>
      </view>
    </view>

    <!-- 底部购买按钮 -->
    <view class="bottom-bar">
      <view class="bottom-price">
        <text class="current-price">¥{{ productDetail.price || 0 }}</text>
        <text class="price-desc">起/人</text>
      </view>
      <view class="buy-button" @click="handleBooking">立即预订</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();

// 数据结构定义
interface ProductDetail {
  id: string | number;
  title: string;
  subtitle: string;
  coverImage: string;
  price: number;
  originalPrice: number;
}
interface Highlight {
  icon: string;
  text: string;
}
interface Note {
  content: string;
}
interface Review {
  avatar: string;
  username: string;
  content: string;
}

// 响应式数据
const productDetail = reactive<ProductDetail>({
  id: '',
  title: '',
  subtitle: '',
  coverImage: '',
  price: 0,
  originalPrice: 0
});
const highlights = ref<Highlight[]>([]);
interface AvailableDate {
  day: string;
  weekday: string;
  date: string;
  price: string | number;
  available: boolean;
}
const availableDates = ref<AvailableDate[]>([]);
const usageList = ref<string[]>([]);
const notesList = ref<Note[]>([]);
const reviews = ref<Review[]>([
  {
    avatar: '/static/daytravelDetail/man.png',
    username: '用户1',
    content: '非常喜欢这个行程，景色很美，导游也很专业！'
  },
  {
    avatar: '/static/daytravelDetail/man.png',
    username: '用户2',
    content: '性价比很高，推荐给大家！'
  }
]);
const selectedDateIndex = ref(0);
const packageId = ref('');

// 页面加载时获取数据
onLoad((options) => {
  if (options.id) {
    packageId.value = options.id;
    fetchProductDetail();
  }
});

// 获取产品详情
const fetchProductDetail = async () => {
  try {
    const res = await uni.request({
      url: `https://island.zhangshuiyi.com/island/il-package/get/${packageId.value}`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'X-Access-Token': userStore.token || ''
      }
    });

    if (res.statusCode === 200 && res.data && res.data.result) {
      const data = res.data.result;
      productDetail.id = data.id;
      productDetail.title = data.title;
      productDetail.subtitle = data.packname;
      productDetail.coverImage = data.images?.[0]?.url?.replace(/<[^>]+>/g, '') || '/static/daytravelDetail/man.png';
      productDetail.price = parseFloat(data.price);
      productDetail.originalPrice = parseFloat(data.priceDesc.split(',')[0]) || 0;

      highlights.value = data.ilPackageHeightlightList.map(item => ({ icon: item.icon, text: item.content }));
      availableDates.value = data.ilPackageDepartList.map(item => ({
        day: item.departDate.split('-')[2],
        weekday: item.xingqi,
        date: item.departDate,
        price: item.price,
        available: true
      }));
      usageList.value = data.priceDesc.split(',');
      notesList.value = data.notice.split(',').map(content => ({ content }));
    } else {
      uni.showToast({ title: '获取产品详情失败！', icon: 'none' });
    }
  } catch (err) {
    console.error('请求失败：', err);
    uni.showToast({ title: '网络异常', icon: 'none' });
  }
};

// 日期选择
const selectDate = (index: number) => {
  selectedDateIndex.value = index;
};

// 行程图标
const getHighlightIcon = (iconPath: string) => iconPath;

// 创建订单
const createOrder = () => {
  const selectedDate = availableDates.value[selectedDateIndex.value].date;
  const orderData = {
    contract: {
      contractName: userStore.userInfo.realname || '',
      contractPhone: userStore.userInfo.phone || ''
    },
    items: [
      {
        bookInfo: {
          date: selectedDate,
          fullname: userStore.userInfo.realname || '',
          idCardNo: userStore.userInfo.idCardNo || '',
          idCardType: 'ID_CARD',
          schedule: selectedDate
        },
        productId: productDetail.id.toString(),
        productType: "OneDay",
        quantity: 1
      }
    ]
  };

  uni.request({
    url: 'https://island.zhangshuiyi.com/island/front/order/createOrder',
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token
    },
    data: orderData,
    success: (res) => {
      if (res.data.code === 200 && res.data.success) {
        uni.showToast({ title: '订单创建成功', icon: 'success' });
        uni.navigateTo({ url: `/pages/dayTravelOrder/dayTravelOrder?id=${packageId.value}` });
      } else {
        uni.showToast({ title: res.data.message || '订单创建失败', icon: 'none' });
      }
    },
    fail: () => {
      uni.showToast({ title: '创建订单失败，请稍后重试', icon: 'none' });
    }
  });
};

// 点击预订按钮
const handleBooking = () => {
  if (!userStore.token) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }
  createOrder();
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

.left {
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

.three {
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
  padding: 25rpx;
  margin-top: 5px;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-top: 5rpx;
  margin-bottom: 15rpx;
}

.findAll {
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


/* 行程亮点样式 */
.highlight-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  align-items: center;
  margin-left: 30px;
}

.highlight-item {
  display: flex;
  align-items: center;
  margin-right: 20px;
  margin-bottom: 10px;
  flex-direction: column;
  background-color: #eff6ff;
  width: 27%;
  height: 65px;
  padding-top: 10px;
  border-radius: 10px;
  font-size: 10px;
}

.highlight-icon {
  width: 30px;
  height: 30px;
  align-items: center;
}

.highlight-text {
  font-size: 14px;
  color: #333;
}

/* 预订须知样式 */
.notes-list {
  margin-top: 10px;
}

.notes-item {
  margin-bottom: 15px;
}

.notes-title {
  font-weight: bold;
  font-size: 15px;
  color: #333;
  margin-bottom: 5px;
}

.notes-content {
  font-size: 14px;
  color: #666;
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
  position: relative;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
}

.rating-star {
  background-color: #ffffff;
  position: absolute;
  display: flex;
  top: 80%;
  left: 5%;
}

.star-icon {
  color: #ffb805;
  font-size: 26rpx;
  margin-right: 5rpx;
}

.starimg {
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
  border-radius: 10rpx;
}
</style>