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
      <!-- 评论列表横滑，仅保留最新评论 -->
      <scroll-view scroll-x class="comment-scroll" v-if="comments.length">
        <view
          class="comment-card"
          v-for="(item, idx) in displayedComments"
          :key="item.id || idx"
        >
          <view class="comment-header">
            <image :src="item.avatar || '/static/my/default-avatar.png'" class="comment-avatar" />
            <view class="comment-user">
              <text class="comment-username">{{ item.username || '匿名用户' }}</text>
              <text class="comment-date">{{ item.createTime }}</text>
          </view>
          </view>
          <view class="comment-content">{{ item.comment }}</view>
          <!-- 评论图片横滑 -->
          <scroll-view scroll-x class="comment-img-scroll" v-if="item.images && item.images.length">
            <image
              v-for="(img, imgIdx) in item.images"
              :key="imgIdx"
              :src="img"
              class="comment-img"
            />
          </scroll-view>
          </view>
        <!-- "查看更多"按钮 -->
        <view
          v-if="!showAllComments && comments.length > 3"
          class="comment-more-btn"
          @click="toggleComments"
        >
          查看更多
        </view>
      </scroll-view>
      <view v-else class="no-comments">
        <uni-icons type="chat" size="24" color="#999"></uni-icons>
        <text>暂无评论</text>
      </view>
      <!-- 游客实拍 -->
      <view class="tourist-album-section" v-if="touristImages.length">
        <view class="album-title-row">
          <text class="album-title">游客实拍</text>
            </view>
        <scroll-view scroll-x class="tourist-album-scroll">
          <image
            v-for="(img, idx) in touristImages"
            :key="idx"
            :src="img"
            class="tourist-album-img"
          />
        </scroll-view>
          </view>
    </view>
    <!-- 日期选择 -->
    <view class="date-picker-section">
      <view class="date-picker-row">
        <view class="date-picker-item">
          <text class="date-label">入住</text>
          <picker mode="date" :value="checkinDate" :start="todayStr" @change="onCheckinDateChange">
            <view class="picker-value" :class="{ 'unselected': !checkinDate }">
              {{ checkinDate || '请选择' }}
            </view>
          </picker>
        </view>
        <view class="date-divider">
          <view class="divider-line"></view>
          <text class="divider-text">至</text>
          <view class="divider-line"></view>
        </view>
        <view class="date-picker-item">
          <text class="date-label">退房</text>
          <picker mode="date" :value="checkoutDate" :start="checkinDate || todayStr" @change="onCheckoutDateChange">
            <view class="picker-value" :class="{ 'unselected': !checkoutDate }">
              {{ checkoutDate || '请选择' }}
            </view>
          </picker>
        </view>
      </view>
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
    uni.showToast({
      title: '退房日期已重置',
      icon: 'none'
    });
  }
};
const onCheckoutDateChange = (e) => {
  if (e.detail.value <= checkinDate.value) {
    uni.showToast({
      title: '退房日期不能早于入住日期',
      icon: 'none'
    });
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
  console.log('onLoad options:', options); // 打印所有参数
  hotelId.value = options.id
  console.log('onLoad 传入的 id:', hotelId.value); // 打印路由参数id
  if (options.images) {
    try {
      hotelImages.value = JSON.parse(decodeURIComponent(options.images))
      console.log('成功解析传入的图片数据:', hotelImages.value);
    } catch (e) {
      console.error('解析图片数据失败:', e);
      hotelImages.value = []
    }
  } else {
    console.log('未传入图片数据');
  }
  getDetailList()
  checkOrderPaid(); // 检查是否支付过该商品
})

const getDetailList = () => {
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/product/ilAccommodations/queryById',
      method: 'GET',
    data: { id: hotelId.value },
      header: {
      'Content-Type': 'application/x-www-form-urlencoded',
        'X-Access-Token': userStore.token
      },
    success: (res) => {
      console.log('酒店详情接口返回：', res.data);
      if (res.data && res.data.result) {
        hotelData.value = res.data.result;
        // 如果后端返回的id为空，则用传入的id补上
        if (!hotelData.value.id) {
          hotelData.value.id = hotelId.value;
        }
        // 优先使用传入的图片数据，如果传入的图片为空，再使用后端返回的图片
        if (hotelImages.value && hotelImages.value.length > 0) {
          console.log('使用传入的图片数据:', hotelImages.value);
        } else if (hotelData.value.images && hotelData.value.images.length) {
          hotelImages.value = hotelData.value.images;
          console.log('使用后端返回的图片数据:', hotelImages.value);
        } else if (hotelData.value.imageUrl) {
          hotelImages.value = [hotelData.value.imageUrl];
          console.log('使用后端返回的单张图片:', hotelImages.value);
        } else {
          hotelImages.value = [];
          console.log('没有可用的图片数据');
        }
        comments.value = res.data.result.comments || [];
        console.log('评论数据：', comments.value);
      }
    }
  })
}

const createOrder = (hotel) => {
  console.log('createOrder hotel:', hotel); // 打印 hotel
  if (!hotel.id) {
    uni.showToast({ title: '商品ID为空，无法下单', icon: 'none' });
    return;
  }
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

  console.log('下单参数：', JSON.stringify(orderData, null, 2));

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
        uni.navigateTo({
          url: `/pages/confirmHotelOrder/confirmHotelOrder?id=${hotelData.value.id}&orderSn=${orderSn}&type=住宿&productId=${hotelData.value.id}`,
          success: () => {
            // 成功跳转后，可以添加一些逻辑，比如重置表单或更新状态
          },
          fail: (err) => {
            uni.showToast({
              title: '跳转失败，请稍后重试',
              icon: 'none'
            });
          }
        });
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
const displayedComments = computed(() => showAllFacilities.value ? comments.value : comments.value.slice(0, 3));
const toggleComments = () => { showAllComments.value = true; };

// 聚合所有评论图片
const touristImages = computed(() => {
  const arr = [];
  comments.value.forEach(item => {
    if (item.images && item.images.length) {
      arr.push(...item.images);
  }
});
  return arr;
});

// 评论提交，type传"酒店"
const submitComment = () => {
  if (!allowComment.value) {
    uni.showToast({
      title: '仅限已支付该酒店订单的用户评论',
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
  // 假设你有图片上传功能，images为图片url数组
  const commentData = {
    avatar: userInfo.value.avatar || "",
    comment: newComment.value,
    productId: hotelId.value,
    type: "酒店", // 这里传"酒店"
    userId: userInfo.value.id,
    username: userInfo.value.realname || userInfo.value.username,
    images: uploadedPhotos?.value ? uploadedPhotos.value.map(i => i.url) : []
  };
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/il-user-comments/save',
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token
    },
    data: commentData,
    success: (res) => {
      if ((res.data.code === 0 || res.data.code === 200) && res.data.success) {
        uni.showToast({
          title: '提交成功',
          icon: 'success'
        });
  newComment.value = '';
        // 重新拉取评论
        getHotelComments();
      } else {
        uni.showToast({
          title: res.data.message || '提交失败',
          icon: 'none'
        });
      }
    }
  });
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
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}
.date-picker-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}
.date-picker-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.date-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 4rpx;
}
.picker-value {
  padding: 16rpx 24rpx;
  border: 1.5px solid #e0e0e0;
  border-radius: 12rpx;
  color: #007AFF;
  background: #f8fafc;
  font-size: 28rpx;
  text-align: center;
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
.date-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16rpx;
  padding-top: 15px;
}
.divider-line {
  width: 40rpx;
  height: 2rpx;
  background: #ddd;
  margin: 4rpx 0;
}
.divider-text {
  color: #999;
  font-size: 24rpx;
  margin: 8rpx 0;
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
.comment-scroll {
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  overflow-x: auto;
  padding: 10px 0;
}
.comment-card {
  display: inline-block;
  min-width: 220px;
  max-width: 70vw;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 16px;
  margin-right: 12px;
  vertical-align: top;
}
.comment-header { display: flex; align-items: center; }
.comment-avatar { width: 40px; height: 40px; border-radius: 50%; margin-right: 10px; }
.comment-user { display: flex; flex-direction: column; }
.comment-username { font-weight: bold; color: #333; }
.comment-date { color: #aaa; font-size: 12px; }
.comment-content { color: #444; font-size: 15px; margin-top: 6px; }
.comment-img-scroll {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  gap: 8px;
  margin-top: 8px;
}
.comment-img {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
}
.comment-more-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 60px;
  color: #19d4c5;
  font-size: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-left: 8px;
  cursor: pointer;
}
.tourist-album-section {
  margin: 24px 0 0 0;
  padding: 0 16px;
}
.album-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.album-title {
  font-size: 18px;
  font-weight: bold;
  color: #222;
}
.tourist-album-scroll {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  gap: 12px;
  padding-bottom: 8px;
}
.tourist-album-img {
  width: 90px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 8px;
}
/* 添加日期选择器的点击效果 */
.picker-value:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}
/* 适配暗色模式 */
@media (prefers-color-scheme: dark) {
  .date-picker-section {
    background: #1a1a1a;
  }
  
  .picker-value {
    background: #2a2a2a;
    border-color: #333;
    color: #007AFF;
  }
  
  .picker-value.unselected {
    color: #666;
    background: #2a2a2a;
    border-color: #333;
  }
  
  .date-label {
    color: #999;
  }
  
  .divider-text {
    color: #666;
  }
  
  .divider-line {
    background: #333;
  }
}
</style>