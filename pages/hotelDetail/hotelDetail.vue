<template>
  <view class="hotel-detail-container">
    <!-- 顶部图片轮播 -->
    <swiper class="hotel-swiper" :indicator-dots="true" :autoplay="true" :interval="4000" :duration="500">
      <swiper-item v-for="(img, idx) in hotelImages" :key="idx">
        <image :src="img" class="hotel-img" mode="aspectFill" />
      </swiper-item>
    </swiper>
    <!-- 酒店信息 -->
    <view class="hotel-info">
      <view class="hotel-title-row">
        <text class="hotel-title">{{ hotelData.name }}</text>
        <view class="hotel-rating">
          <uni-rate :value="hotelData.rating" size="20" readonly />
          <text class="score">{{ hotelData.rating }}</text>
        </view>
      </view>
      <view class="hotel-checkin-row">
        <view class="checkin-item">
          <uni-icons type="calendar" size="18" color="#007AFF" />
          <text>入住时间：14:00</text>
        </view>
        <view class="checkin-item" style="margin-left: 32rpx;">
          <uni-icons type="calendar" size="18" color="#007AFF" />
          <text>退房时间：12:00</text>
        </view>
      </view>
      <view class="hotel-tags">
        <text class="tag" v-for="tag in hotelTags" :key="tag">{{ tag }}</text>
      </view>
    </view>
    <!-- 价格区块 -->
    <view class="hotel-price-card">
      <text class="current-price">¥{{ hotelData.price }}</text>
      <text class="original-price">¥{{ originalPrice }} 起/晚</text>
      <button class="discount-btn">限时特惠</button>
    </view>
    <!-- 房型信息 -->
    <view class="room-info-section">
      <view class="room-features">
        <view class="feature-item" v-for="f in roomFeatures" :key="f.name">
          <image :src="f.icon" class="feature-icon" />
          <text class="feature-label" :class="{ highlight: f.highlight }">{{ f.label }}</text>
        </view>
      </view>
      <view class="room-detail-list">
        <view class="room-detail-item">
          <uni-icons type="person" size="18" color="#1B4B98" />
          <text>床型由酒店前台随机安排，可住2人</text>
        </view>
        <view class="room-detail-item">
          <uni-icons type="info" size="18" color="#1B4B98" />
          <text>加床：该房型不可加床</text>
        </view>
        <view class="room-detail-item">
          <uni-icons type="info" size="18" color="#1B4B98" />
          <text>无餐食</text>
        </view>
        <view class="room-detail-item">
          <uni-icons type="info" size="18" color="#1B4B98" />
          <text>自助早餐￥48每份</text>
        </view>
      </view>
    </view>
    <!-- 设施信息 -->
    <view class="facility-section">
      <view v-for="(group, idx) in displayedFacilityGroups" :key="idx" class="facility-group">
        <view class="facility-title">
          <image v-if="group.icon" :src="group.icon" class="facility-icon" />
          {{ group.title }}
        </view>
        <view class="facility-items">
          <view class="facility-row" v-for="(row, rowIdx) in group.itemRows" :key="rowIdx">
            <text class="facility-item" :class="{ highlight: row[0]?.includes('需前台索要'), green: row[0]?.includes('免费') }">{{ row[0] }}</text>
            <text class="facility-item" v-if="row[1]" :class="{ highlight: row[1]?.includes('需前台索要'), green: row[1]?.includes('免费') }">{{ row[1] }}</text>
          </view>
        </view>
      </view>
      <view class="toggle-btn" @click="toggleFacilities">
        <text>{{ showAllFacilities ? '收起' : '查看更多' }}</text>
        <uni-icons :type="showAllFacilities ? 'top' : 'bottom'" size="18" color="#007AFF" />
      </view>
    </view>
    <!-- 评论区 -->
    <view class="hotel-reviews">
      <text class="section-title">住客点评</text>
      <!-- 用户输入评论 -->
      <view class="comment-input-wrapper">
        <view v-if="allowComment" class="comment-input-area">
          <view class="comment-user-row">
            <image :src="userInfo.avatar || 'https://wuminghui.top:9000/default-avatar.png'" class="user-avatar"></image>
            <text class="user-name">{{ userInfo.realname || userInfo.username || '游客' }}</text>
          </view>
          <textarea
            v-model="newComment"
            class="comment-textarea"
            placeholder="写下你的评论..."
            :maxlength="200"
          />
          <view class="comment-footer-row">
            <text class="word-count">{{ newComment.length }}/200</text>
            <button 
              class="submit-btn" 
              :disabled="!newComment.trim()"
              @click="submitComment"
            >发表评论</button>
          </view>
        </view>
        <view v-else style="color:#999;text-align:center;padding:20px 0;">
          仅限已支付该酒店订单的用户评论
        </view>
      </view>
      <!-- 评论列表 -->
      <view v-if="!comments || comments.length === 0" class="no-comments">
        <uni-icons type="chat" size="24" color="#999"></uni-icons>
        <text>暂无评论，快来发表第一条评论吧！</text>
      </view>
      <template v-else>
        <view class="review-card" v-for="(comment, index) in displayedComments" :key="index">
          <image :src="comment.avatar" class="review-avatar" />
          <view class="review-content">
            <view class="review-header">
              <text class="review-user">{{ comment.userName }}</text>
              <text class="review-date">{{ comment.createTime }}</text>
            </view>
            <text class="review-text">{{ comment.content }}</text>
          </view>
        </view>
        <!-- 显示更多按钮 -->
        <view v-if="comments.length > 3" class="show-more" @click="toggleComments">
          <text>{{ showAllComments ? '收起' : `显示更多(${comments.length - 3}条)` }}</text>
          <uni-icons 
            :type="showAllComments ? 'top' : 'bottom'" 
            size="14" 
            color="#3B82F6"
          ></uni-icons>
        </view>
      </template>
    </view>
    <!-- 日期选择 -->
    <view class="date-picker-section">
      <text>选择入住日期：</text>
      <picker mode="date" :value="checkinDate" :start="todayStr" @change="onCheckinDateChange">
        <view class="picker-value">{{ checkinDate || '请选择' }}</view>
      </picker>
    </view>
    <view class="date-picker-section">
      <text>选择退房日期：</text>
      <picker mode="date" :value="checkoutDate" :start="checkinDate || todayStr" @change="onCheckoutDateChange">
        <view class="picker-value">{{ checkoutDate || '请选择' }}</view>
      </picker>
    </view>
    <!-- 预订按钮吸底 -->
    <view class="book-bar">
      <button class="book-now-btn" @click="createOrder(hotelData)">立即预订</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
let hotelId = ref('')
let hotelData = ref({})
const hotelImages = ref([])

const checkinDate = ref('');
const checkoutDate = ref('');
const today = new Date();
const pad = n => n < 10 ? '0' + n : n;
const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

const onCheckinDateChange = (e) => {
  checkinDate.value = e.detail.value;
  // 如果退房日期早于入住日期，自动清空退房日期
  if (checkoutDate.value && checkoutDate.value <= checkinDate.value) {
    checkoutDate.value = '';
  }
};
const onCheckoutDateChange = (e) => {
  if (e.detail.value <= checkinDate.value) {
    uni.showToast({ title: '退房日期不能早于入住日期', icon: 'none' });
    return;
  }
  checkoutDate.value = e.detail.value;
};

const allowComment = ref(false); // 是否允许评论

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
      // 只要有 payStatus === 'PAID' 且 goodsId === 当前酒店id
      allowComment.value = res.data.result.records.some(item =>
        String(item.goodsId) === String(hotelId.value) && item.payStatus === 'PAID'
      );
    } else {
      allowComment.value = false;
    }
  } catch (e) {
    allowComment.value = false;
  }
};

onLoad((options) => {
  hotelId.value = options.id
  if (options.images) {
    try {
      hotelImages.value = JSON.parse(decodeURIComponent(options.images))
    } catch (e) {
      hotelImages.value = []
    }
  }
  getDetailList()
  checkOrderPaid(); // 检查是否支付过该商品
})

const getDetailList = () => {
  uni.request({
      url: `https://island.zhangshuiyi.com/island/front/product/accommodations/${hotelId.value}`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'X-Access-Token': userStore.token
      },
      success:(res)=>{
        hotelData.value = res.data
     },
  })
}

const createOrder = (hotel) => {
  if (!checkinDate.value) {
    uni.showToast({ title: '请选择入住日期', icon: 'none' });
    return;
  }
  if (!checkoutDate.value) {
    uni.showToast({ title: '请选择退房日期', icon: 'none' });
    return;
  }
  // 拼接入住和退房时间
  const travelStartDate = `${checkinDate.value} 14:00:00`;
  const travelEndDate = `${checkoutDate.value} 12:00:00`;

  const orderData = {
    contract: {
      contractName: userStore.userInfo.realname || '',
      contractPhone: userStore.userInfo.phone || ''
    },
    items: [
      {
        bookInfo: {
          date: checkinDate.value,
          fullname: userStore.userInfo.realname || '',
          idCardNo: userStore.userInfo.idCardNo || '',
          idCardType: 'ID_CARD',
          schedule: ''
        },
        productId: hotel.id,
        productType: "Accommodations",
        quantity: 1
      }
    ],
    travelStartDate,
    travelEndDate
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
      if (res.data.code === 200) {
        uni.showToast({
          title: '订单创建成功',
          icon: 'success',
          duration: 1500
        });
        const orderSn = res.data.result.orderSn;
        uni.navigateTo({ url: `/pages/confirmHotelOrder/confirmHotelOrder?id=${hotelData.value.id}&orderSn=${orderSn}` })
      } else {
        uni.showToast({
          title: res.data.message || '订单创建失败',
          icon: 'none'
        });
      }
    },
    fail: (err) => {
      uni.showToast({
        title: '创建订单失败，请稍后重试',
        icon: 'none'
      });
    }
  });
};

const roomFeatures = [
  { icon: 'https://wuminghui.top:9000/wlmtsys/2025/06/04/6d41ad755669479499f89b809c17ea0a.png', label: '30-45㎡', name: 'area' },
  { icon: 'https://wuminghui.top:9000/wlmtsys/2025/06/04/b112f7d21da844f3a457ce5f86af8187.png', label: '7-18层', name: 'floor' },
  { icon: 'https://wuminghui.top:9000/wlmtsys/2025/06/04/547a5244f25349ed94e371ba683afabd.png', label: 'Wi-Fi 免费', name: 'wifi', highlight: true },
  { icon: 'https://wuminghui.top:9000/wlmtsys/2025/06/04/13857e1feecc4befb7daaf69f407f088.png', label: '封闭窗', name: 'window' },
  { icon: 'https://wuminghui.top:9000/wlmtsys/2025/06/04/15a03126aed746fb9b62e3a46907b347.png', label: '部分禁烟', name: 'smoke' }
];

const originalPrice = computed(() => {
  // 价格可能是字符串，需转为数字
  const price = Number(hotelData.value.price) || 0;
  // 乘以1.3并四舍五入到整数
  return Math.round(price * 1.3);
  // 如果要保留一位小数用：return (price * 1.3).toFixed(1);
});

const comments = ref([]);
const newComment = ref('');
const showAllComments = ref(false);
const displayedComments = computed(() => {
  if (showAllComments.value) {
    return comments.value;
  } else {
    return comments.value.slice(0, 3);
  }
});

const submitComment = () => {
  if (!allowComment.value) {
    uni.showToast({
      title: '仅限已支付该酒店订单的用户评论',
      icon: 'none'
    });
    return;
  }
  // 实现提交评论的逻辑
  console.log('Submitting comment:', newComment.value);
  newComment.value = '';
};

const toggleComments = () => {
  showAllComments.value = !showAllComments.value;
};

const hotelTags = computed(() => {
  // 假设后端返回的标签字段叫 tags，是数组
  return hotelData.value.tags || [];
});

const userInfo = computed(() => userStore.userInfo || {});

const allFacilityGroups = ref([
  {
    title: '网络与通讯',
    icon: '',
    items: ['客房WIFI', '客房有线宽带 免费', '电话']
  },
  {
    title: '儿童设施服务',
    icon: '',
    items: ['儿童洗漱用品 需前台索要', '儿童浴巾', '儿童拖鞋 需前台索要']
  },
  {
    title: '卫浴设施',
    icon: '',
    items: ['私人浴室', '私人卫生间', '吹风机', '浴室化妆放大镜', '毛巾', '浴巾', '24小时热水', '拖鞋']
  },
  {
    title: '媒体科技',
    icon: '',
    items: ['智能客控', '液晶电视机', '有线频道', '音响', '智能门锁', '视频流服务']
  },
  {
    title: '客房设施',
    icon: '',
    items: ['空调', '暖气', '遮光窗帘', '床具:毯子或被子', '备用床具']
  },
  {
    title: '便利设施',
    icon: '',
    items: ['管家服务', '针线包 需前台索要', '开夜床', '衣架', '多种规格电源插座', '110V电压插座', '220V电压插座', '欢迎礼品']
  },
  {
    title: '安全设施',
    icon: '',
    items: ['烟雾报警器', '灭火器', '安全出口指示', '电子门锁']
  },
  {
    title: '浴室设施',
    icon: '',
    items: ['浴缸', '淋浴', '浴室电话', '浴室地垫']
  }
]);

// 工具函数：一维转二维，每行2个
function chunkArray(arr, size = 2) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// 控制显示全部还是部分
const showAllFacilities = ref(false);

// 只显示前3个分组，查看更多后显示全部
const displayedFacilityGroups = computed(() => {
  const groups = showAllFacilities.value ? allFacilityGroups.value : allFacilityGroups.value.slice(0, 3);
  // 每组的items转为二维
  return groups.map(group => ({
    ...group,
    itemRows: chunkArray(group.items, 2)
  }));
});

const toggleFacilities = () => {
  showAllFacilities.value = !showAllFacilities.value;
};
</script>

<style scoped>
.hotel-detail-container {
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 120rpx;
}
.hotel-swiper {
  width: 100vw;
  height: 340rpx;
  border-radius: 0 0 24rpx 24rpx;
  overflow: hidden;
}
.hotel-img {
  width: 100vw;
  height: 340rpx;
  object-fit: cover;
}
.hotel-info {
  background: #fff;
  border-radius: 18rpx;
  margin: -40rpx 24rpx 0 24rpx;
  padding: 32rpx 24rpx 24rpx 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.06);
  position: relative;
  z-index: 2;
}
.hotel-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.hotel-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #222;
}
.hotel-rating {
  display: flex;
  align-items: center;
}
.score {
  margin-left: 8rpx;
  color: #ff9800;
  font-size: 24rpx;
}
.hotel-checkin-row {
  display: flex;
  gap: 32rpx;
  margin-top: 12rpx;
  margin-bottom: 8rpx;
}
.checkin-item {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666;
}
.checkin-item uni-icons {
  margin-right: 6rpx;
}
.hotel-tags {
  margin: 16rpx 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.tag {
  background: #e0f2fe;
  color: #007AFF;
  border-radius: 20rpx;
  padding: 6rpx 18rpx;
  font-size: 22rpx;
}
.hotel-price-card {
  background: linear-gradient(90deg, #fff7e6 0%, #fff 100%);
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 18rpx;
  box-shadow: 0 2rpx 8rpx rgba(255, 105, 5, 0.08);
}
.current-price {
  color: #ff5722;
  font-size: 32rpx;
  font-weight: bold;
}
.original-price {
  color: #bbb;
  text-decoration: line-through;
  margin-left: 12rpx;
}
.discount-btn {
  background: #ff5722;
  color: #fff;
  border-radius: 20rpx;
  padding: 6rpx 18rpx;
  margin-right: 5px;
  font-size: 22rpx;
}
.hotel-reviews {
  background-color: #fff;
  border: solid 1px #dbeafe;
  padding: 15px;
  margin-top: 10px;
  border-radius: 10px;
}
.review-card {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24rpx;
}
.review-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 18rpx;
}
.review-content {
  flex: 1;
}
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}
.review-user {
  font-weight: bold;
  color: #222;
}
.review-date {
  color: #bbb;
  font-size: 20rpx;
}
.review-text {
  color: #444;
  font-size: 24rpx;
}
.date-picker-section {
  background: #fff;
  border-radius: 16rpx;
  margin: 24rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 18rpx;
}
.picker-value {
  padding: 8rpx 18rpx;
  border: 1px solid #dbeafe;
  border-radius: 8rpx;
  color: #007AFF;
  background: #f0f9ff;
}
.book-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  box-shadow: 0 -2rpx 8rpx rgba(0,0,0,0.08);
  padding: 24rpx;
  z-index: 99;
}
.book-now-btn {
  width: 100%;
  background: linear-gradient(90deg, #ff9800 0%, #ff5722 100%);
  color: #fff;
  font-size: 28rpx;
  border-radius: 12rpx;
  padding: 18rpx 0;
  font-weight: bold;
  border: none;
}
.room-info-section {
  background: #fff;
  border-radius: 16rpx;
  margin: 24rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}
.section-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 18rpx;
}
.room-features {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 18rpx;
}
.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20%;
}
.feature-icon {
  width: 40rpx;
  height: 40rpx;
  margin-bottom: 8rpx;
}
.feature-label {
  font-size: 22rpx;
  color: #666;
}
.feature-label.highlight {
  color: #1B4B98;
  font-weight: bold;
}
.room-detail-list {
  margin-top: 10rpx;
}
.room-detail-item {
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #444;
  margin-bottom: 8rpx;
}
.room-detail-item uni-icons {
  margin-right: 8rpx;
}
.comment-input-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}
.comment-input-area {
  width: 90vw;           /* 移动端建议用vw，适配性好 */
  max-width: 600rpx;     /* 最大宽度，防止过宽 */
  min-width: 260rpx;
  background: #f8fafc;
  border-radius: 12rpx;
  padding: 24rpx 18rpx 18rpx 18rpx;
  margin-bottom: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  box-sizing: border-box;
}
.comment-user-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}
.user-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}
.user-name {
  font-size: 26rpx;
  color: #222;
  font-weight: bold;
}
.comment-textarea {
  width: 100%;
  height: 30px;
  max-height: 80px;
  border: 1px solid #e5e7eb;
  border-radius: 8rpx;
  padding: 12rpx;
  font-size: 24rpx;
  background: #fff;
  margin-bottom: 6rpx;
}
.comment-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.word-count {
  color: #bbb;
  font-size: 20rpx;
}
.submit-btn {
  background: #007AFF;
  color: #fff;
  border-radius: 8rpx;
  padding: 8rpx 28rpx;
  font-size: 24rpx;
  font-weight: bold;
  border: none;
  transition: background 0.2s;
}
.submit-btn:disabled {
  background: #e5e7eb;
  color: #aaa;
}
.no-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 18rpx;
}
.show-more {
  display: flex;
  align-items: center;
  margin-top: 18rpx;
  color: #007AFF;
  font-size: 22rpx;
}
.show-more uni-icons {
  margin-left: 8rpx;
}
.facility-section {
  background: #fff;
  border-radius: 16rpx;
  margin: 24rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}
.facility-group {
  margin-bottom: 18rpx;
}
.facility-title {
  font-weight: bold;
  font-size: 26rpx;
  margin-bottom: 8rpx;
  color: #222;
  display: flex;
  align-items: center;
}
.facility-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 8rpx;
}
.facility-items {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.facility-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 2rpx;
}
.facility-item {
  width: 48%;
  font-size: 22rpx;
  color: #444;
  text-align: left;
  word-break: break-all;
}
.facility-item.highlight {
  color: #ff9800;
}
.facility-item.green {
  color: #1abc9c;
}
.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #007AFF;
  font-size: 24rpx;
  margin-top: 10rpx;
  cursor: pointer;
  user-select: none;
}
</style>