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
    <!-- <!-- <view class="section-container" style="margin-top: 5px;">
      <view class="section-title">用户点评</view>
      <view class="comment-list">
        <view v-if="allowComment"> -->
          <!-- 评论输入区 -->
          <!-- <view class="comment-input-area">
            <view class="comment-user-info">
              <image :src="userStore.userInfo.avatar || '/static/daytravelDetail/man.png'" class="user-avatar" mode="aspectFill"></image>
              <text class="user-name">{{ userStore.userInfo.realname || userStore.userInfo.username || '游客' }}</text>
            </view>
            <textarea
              v-model="newComment"
              class="comment-textarea"
              placeholder="写下你的评论..."
              :maxlength="200"
            />
            <view class="comment-footer">
              <text class="word-count">{{ newComment.length }}/200</text>
              <button 
                class="submit-btn" 
                :disabled="!newComment.trim()"
                @click="submitComment"
              >发表评论</button>
            </view>
          </view>
        </view>
        <view v-else style="color:#999;text-align:center;padding:20px 0;">
          仅限已支付该一日游订单的用户评论
        </view> -->
        <!-- 评论列表 -->
        <!-- <view v-for="(review, index) in reviews" :key="index" class="comment-item">
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
    </view> -->

    <!-- 底部购买按钮 -->
    <view class="bottom-bar">
      <view class="bottom-price">
        <text class="current-price">¥{{ productDetail.price || 0 }}</text>
        <text class="price-desc">起/人</text>
      </view>
      <view class="buy-button" @click="handleBooking">立即预订</view>
    </view>

    <!-- 预订信息区块 -->
    <view class="booking-section">
      <view class="section-title">预订信息</view>
      
      <!-- 日期选择 -->
      <view class="date-picker-row">
        <view class="date-picker-item">
          <text class="date-label">出行日期</text>
          <picker mode="date" :value="selectedDate" :start="todayStr" @change="onDateChange">
            <view class="picker-value" :class="{ 'unselected': !selectedDate }">
              <uni-icons type="calendar" size="18" color="#007AFF"></uni-icons>
              <text>{{ selectedDate || '请选择出行日期' }}</text>
            </view>
          </picker>
        </view>
      </view>

      <!-- 用户信息输入 -->
      <view class="user-info-row">
        <view class="input-item">
          <text class="input-label">姓名</text>
          <input 
            v-model="realname" 
            class="info-input" 
            placeholder="请输入姓名"
            placeholder-class="placeholder"
          />
        </view>
        <view class="input-item">
          <text class="input-label">手机号</text>
          <input 
            v-model="phone" 
            class="info-input" 
            type="number" 
            maxlength="11"
            placeholder="请输入手机号码"
            placeholder-class="placeholder"
          />
        </view>
      </view>
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
const reviews = ref<Review[]>([]);
const selectedDate = ref('');
const today = new Date();
const pad = (n: number) => n < 10 ? '0' + n : n;
const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
const packageId = ref('');
const startDate = ref('');
const realname = ref('');
const phone = ref('');
const allowComment = ref(false); // 是否允许评论
const newComment = ref('');

// 页面加载时获取数据
onLoad((options) => {
  console.log('dayTravelDetail页面收到的参数:', options);
  
  if (options.id) {
    packageId.value = options.id;
    fetchProductDetail();
  }
  if (options.date) {
    startDate.value = options.date; // 设置初始日期
  }
  
  // 处理传入的图片参数
  if (options.imageURL) {
    const imageUrl = decodeURIComponent(options.imageURL);
    console.log('接收到传入的图片URL:', imageUrl);
    // 优先使用传入的图片
    productDetail.coverImage = imageUrl;
  }
  
  checkOrderPaid(); // 检查是否支付过该商品
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
      // 只有在没有传入图片时才使用后端返回的图片
      if (!productDetail.coverImage) {
        productDetail.coverImage = data.images?.[0]?.url?.replace(/<[^>]+>/g, '') || '/static/daytravelDetail/man.png';
      }
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

// 检查是否支付过该商品
const checkOrderPaid = async () => {
  if (!userStore.token) {
    allowComment.value = false;
    return;
  }
  try {
    const res = await uni.request({
      url: 'https://island.zhangshuiyi.com/island/front/order/getMyOrderList',
      method: 'GET',
      header: {
        'X-Access-Token': userStore.token,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        pageNo: 1,
        pageSize: 100
      }
    });
    if (res.data.success && res.data.result && Array.isArray(res.data.result.records)) {
      // 只要有 payStatus === 'PAID' 且 goodsId === 当前商品id
      allowComment.value = res.data.result.records.some(item =>
        String(item.goodsId) === String(productDetail.id) && item.payStatus === 'PAID'
      );
    } else {
      allowComment.value = false;
    }
  } catch (e) {
    allowComment.value = false;
  }
};

// 日期选择
const selectDate = (index: number) => {
  selectedDate.value = availableDates.value[index].date;
};

// 行程图标
const getHighlightIcon = (iconPath: string) => iconPath;

// 创建订单
const createOrder = () => {
  if (!selectedDate.value) {
    uni.showToast({ title: '请选择出行日期', icon: 'none' });
    return;
  }
  if (!realname.value.trim()) {
    uni.showToast({ title: '请输入姓名', icon: 'none' });
    return;
  }
  if (!phone.value.trim()) {
    uni.showToast({ title: '请输入手机号码', icon: 'none' });
    return;
  }
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone.value.trim())) {
    uni.showToast({ title: '请输入有效的手机号', icon: 'none' });
    return;
  }
  // 固定年份为今年，拼接时间
  const year = new Date().getFullYear();
  let [month, day] = selectedDate.value.split('-').slice(1);
  if (!month || !day) {
    // 兼容用户选择格式为yyyy-mm-dd
    const arr = selectedDate.value.split('-');
    month = arr[1];
    day = arr[2];
  }
  const startDateStr = `${year}-${month}-${day} 08:00:00`;
  const endDateStr = `${year}-${month}-${day} 22:00:00`;
  const orderData = {
    contract: {
      contractName: realname.value,
      contractPhone: phone.value
    },
    items: [
      {
        bookInfo: {
          date: `${year}-${month}-${day}`,
          fullname: realname.value,
          idCardNo: '',
          idCardType: 'ID_CARD',
          schedule: ''
        },
        productId: productDetail.id.toString(),
        productType: "OneDay",
        quantity: 1
      }
    ],
    travelStartDate: startDateStr,
    travelEndDate: endDateStr
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
        uni.navigateTo({
          url: `/pages/dayTravelOrder/dayTravelOrder?orderSn=${res.data.result.orderSn}&date=${year}-${month}-${day}&title=${encodeURIComponent(productDetail.title)}&price=${productDetail.price}&score=${productDetail.score}&soldSum=${productDetail.soldSum}&coverImage=${encodeURIComponent(productDetail.coverImage)}`
        });
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

const onDateChange = (e: any) => {
  selectedDate.value = e.detail.value;
};

const submitComment = async () => {
  if (!allowComment.value) {
    uni.showToast({
      title: '仅限已支付该一日游订单的用户评论',
      icon: 'none'
    });
    return;
  }
  if (!newComment.value.trim()) {
    uni.showToast({
      title: '评论内容不能为空',
      icon: 'none'
    });
    return;
  }
  if (!userStore.token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    return;
  }
  // 这里补充你的评论提交接口逻辑
  // ...
  newComment.value = '';
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
  width: 340rpx;
  height: 80rpx;
  background-color: #4dabf7;
  color: #fff;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
}

/* 预订信息区块样式 */
.booking-section {
  background: #fff;
  border-radius: 16rpx;
  margin: 24rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 6rpx;
  height: 32rpx;
  background: #007AFF;
  margin-right: 16rpx;
  border-radius: 3rpx;
}

/* 日期选择样式 */
.date-picker-row {
  margin-bottom: 24rpx;
}

.date-picker-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.date-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.picker-value {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 24rpx;
  background: #f8fafc;
  border: 1.5px solid #e0e0e0;
  border-radius: 12rpx;
  color: #007AFF;
  font-size: 28rpx;
  transition: all 0.3s ease;
}

.picker-value.unselected {
  color: #999;
  background: #f5f5f5;
  border-color: #eee;
}

.picker-value:active {
  border-color: #007AFF;
  background: #f0f9ff;
}

/* 用户信息输入样式 */
.user-info-row {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.input-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.input-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.info-input {
  padding: 20rpx 24rpx;
  background: #f8fafc;
  border: 1.5px solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  transition: all 0.3s ease;
}

.info-input:focus {
  border-color: #007AFF;
  background: #f0f9ff;
}

.placeholder {
  color: #999;
}

/* 适配暗色模式 */
@media (prefers-color-scheme: dark) {
  .booking-section {
    background: #1a1a1a;
  }
  
  .section-title {
    color: #fff;
  }
  
  .date-label,
  .input-label {
    color: #999;
  }
  
  .picker-value,
  .info-input {
    background: #2a2a2a;
    border-color: #333;
    color: #fff;
  }
  
  .picker-value.unselected {
    color: #666;
    background: #2a2a2a;
  }
  
  .placeholder {
    color: #666;
  }
}

/* 添加输入框动画效果 */
.info-input {
  position: relative;
  overflow: hidden;
}

.info-input:focus {
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}

/* 添加必填标记 */
.input-label::after {
  content: '*';
  color: #ff4d4f;
  margin-left: 4rpx;
}

/* 添加输入框图标 */
.input-item {
  position: relative;
}

.input-item::before {
  content: '';
  position: absolute;
  left: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 32rpx;
  height: 32rpx;
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0.5;
}

.input-item:nth-child(1)::before {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MyLjY3IDAgNC44NCAyLjE3IDQuODQgNC44NCAwIDIuNjctMi4xNyA0Ljg0LTQuODQgNC44NC0yLjY3IDAtNC44NC0yLjE3LTQuODQtNC44NCAwLTIuNjcgMi4xNy00Ljg0IDQuODQtNC44NHptMCAxMmM0LjQyIDAgOC4xNy0yLjI4IDkuNTQtNS41Ni0yLjMxLTEuODEtNS4yMy0yLjg4LTkuNTQtMi44OHMtNy4yMyAxLjA3LTkuNTQgMi44OGMxLjM3IDMuMjggNS4xMiA1LjU2IDkuNTQgNS41NnoiIGZpbGw9IiMwMDdBRkYiLz48L3N2Zz4=');
}

.input-item:nth-child(2)::before {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTIwIDRINGMtMS4xIDAtMS45OS45LTEuOTkgMkwyIDE4YzAgMS4xLjkgMiAyIDJoMTZjMS4xIDAgMi0uOSAyLTJWNmMwLTEuMS0uOS0yLTItMnptLS40IDQuMjVsLTcuMDcgNC40MmMtLjMyLjItLjc0LjItMS4wNiAwTDQuNCA4LjI1Yy0uMjUtLjE2LS40LS40My0uNC0uNzIgMC0uNjcuNzMtMS4wNyAxLjMtLjcyTDEyIDExbDYuNy00LjE5Yy41Ny0uMzUgMS4zLjA1IDEuMy43MiAwIC4yOS0uMTUuNTYtLjQuNzJ6IiBmaWxsPSIjMDA3QUZGIi8+PC9zdmc+');
}

/* 调整输入框内边距，为图标留出空间 */
.info-input {
  padding-left: 72rpx;
}
</style>