<template>
  <view class="page">
    <view class="header">
      <!-- 搜索框 -->
      <view class="search-header">
        <view class="search-input-wrap">
          <uni-icons type="search" size="16" color="#999999" class="search-icon"></uni-icons>
          <input
            type="text"
            v-model="searchContent"
            class="search-input"
            placeholder="搜索酒店名称、地标、商圈"
            placeholder-class="placeholder"
          />
        </view>
      </view>

      <!-- 排序选择行：推荐优先 / 价格排序 / 评分排序 -->
      <view class="sort-row">
        <view class="sort-left" @click="toggleSortMenu">
          <text class="sort-text">{{ currentSortLabel }}</text>
          <uni-icons :type="showSortMenu ? 'top' : 'bottom'" size="16" color="#666"></uni-icons>
        </view>
      </view>
      <!-- 排序下拉菜单 -->
      <view v-if="showSortMenu" class="sort-menu">
        <view
          class="sort-menu-item"
          v-for="item in sortOptions"
          :key="item.value"
          @click="selectSort(item.value)"
        >
          <text :class="['sort-menu-text', { 'sort-menu-text-active': currentSort === item.value }]">
            {{ item.label }}
          </text>
        </view>
      </view>

      <!-- 入住/人数行 -->
      <view class="date-guest">
        <view class="date-section">
          <text class="label">入住-离店</text>

          <view class="example-body">
            <uni-datetime-picker v-model="range" type="daterange" @maskClick="maskClick" />
          </view>
        </view>
        <view class="guest-section">
          <view class="content" @click="showGuestPicker">
            <uni-icons type="person" size="16" color="#1B4B98"></uni-icons>
            <text class="info">{{ guestCount }}人</text>
          </view>
        </view>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <view class="hotel-list">
        <view class="hotel-card" v-for="(hotel, index) in filteredHotels" :key="index">
          <image
            @click="goHotelDetail(hotel)"
            :src="hotel.imageURL"
            mode="aspectFill"
            class="hotel-image"
          ></image>
          <view class="hotel-info">
            <!-- 酒店名称 -->
            <view class="hotel-header">
              <text class="hotel-name ellipsis">{{ hotel.name }}</text>
            </view>

            <!-- 标签行：房型 / 类型 / 主题 -->
            <view class="tag-row">
              <text v-if="hotel.roomtype" class="tag tag-blue">{{ hotel.roomtype }}</text>
              <text v-if="hotel.hoteltype" class="tag tag-yellow">{{ hotel.hoteltype }}</text>
              <text v-if="hotel.hoteltheme" class="tag tag-green">{{ hotel.hoteltheme }}</text>
            </view>

            <!-- 评分行 -->
            <view class="rating-row">
              <view class="rating-left">
                <uni-icons type="star-filled" size="16" color="#FFB400"></uni-icons>
                <text class="score">{{ hotel.rating || 4.6 }}</text>
                <text class="rating-count">
                  {{ hotel.commentnum ? `${hotel.commentnum} 条评价` : '98 条评价' }}
                </text>
              </view>
            </view>

            <!-- 价格 + 预订按钮 -->
            <view class="hotel-distance-row">
              <view class="price-book">
                <view class="price">
                  <text class="price-currency">¥</text>
                  <text class="price-amount">{{ hotel.price }}</text>
                  <text class="price-unit">起/晚</text>
                </view>
                <button class="book-btn" @click="goHotelDetail(hotel)">立即预订</button>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 弹出框 -->
    <view v-if="showGuestPickerModal" class="guest-picker-modal">
      <view class="guest-picker-content">
        <view class="guest-option" v-for="(option, index) in guestOptions" :key="index"
          @click="selectGuestCount(option)">
          {{ option }}人
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';
import { computed, watch } from 'vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();
const hotelList = ref([]);
const combinedArray = ref([]);


const single = ref('');
const datetimesingle = ref('');
const range = ref(['2025-4-10', '2025-4-12']);

const searchContent = ref('');

const imageUrls = ref([
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h1.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h11.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h12.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h13.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h14.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h15.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h16.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h17.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h18.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h19.jpeg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/hotel/h20.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f2.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f3.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f4.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f5.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f6.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f7.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f8.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f9.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f10.jpg"
]);

// 排序选项
const sortOptions = ref([
  { label: '推荐优先', value: 'default' },
  { label: '价格从低到高', value: 'priceAsc' },
  { label: '价格从高到低', value: 'priceDesc' },
  { label: '评分优先', value: 'rating' }
]);

const currentSort = ref('default');
const showSortMenu = ref(false);

const currentSortLabel = computed(() => {
  const found = sortOptions.value.find(item => item.value === currentSort.value);
  return found ? found.label : '推荐优先';
});

const guestCount = ref(2); // 初始人数
const guestOptions = ref([1, 2, 3, 4]); // 可选人数
const showGuestPickerModal = ref(false); // 控制弹出框显示隐藏

// 打开/关闭排序下拉
const toggleSortMenu = () => {
  showSortMenu.value = !showSortMenu.value;
};

// 选择排序方式
const selectSort = (value) => {
  currentSort.value = value;
  showSortMenu.value = false;
};

onMounted(() => {
  hasToken();
  getHotelList();
});

const goHotelDetail = (hotel) => {
  console.log('跳转酒店详情，酒店数据：', hotel);
  console.log('酒店图片数据：', hotel.images);
  uni.navigateTo({
    url: `/pages/hotelDetail/hotelDetail?id=${hotel.id}&images=${encodeURIComponent(JSON.stringify(hotel.images))}`
  });
}
const hasToken = () => {
  if (userStore.token === '') {
    // 提示未登录，请先登录
    uni.showToast({
      title: '未登录,请先登录',
      icon: 'false',
      duration: 1500
    })
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    }, 500);
  }
}

const getHotelList = () => {
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/product/ilAccommodations/list',
    method: 'GET',
    data: {
      pageNo: 1,
      pageSize: 50
    },
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token
    },
    success: (res) => {
      hotelList.value = res.data.result.records;
      combinedArray.value = hotelList.value.map((item, index) => ({
        ...item,
        images: [imageUrls.value[index]],
        imageURL: imageUrls.value[index]
      }));
    },
    fail: (err) => {
      console.error('请求失败', err);
      uni.showToast({
        title: '加载失败，请稍后重试',
        icon: 'none'
      });
    }
  });
};

const filteredHotels = computed(() => {
  let list = combinedArray.value.slice();

  if (searchContent.value) {
    list = list.filter(item => item.name && item.name.includes(searchContent.value));
  }

  // 根据当前排序方式排序
  switch (currentSort.value) {
    case 'priceAsc':
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'priceDesc':
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'rating':
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'default':
    default:
      // 推荐优先：这里暂时保持接口原顺序
      break;
  }

  return list;
});

// 监听数据变化
watch(datetimesingle, (newval) => {
  console.log('单选:', datetimesingle.value);
});

watch(range, (newval) => {
  console.log('范围选:', range.value);
});

// 在组件挂载后执行
onMounted(() => {
  setTimeout(() => {
    // 将时间戳转换为日期时间字符串
    const date = new Date(Date.now() - 2 * 24 * 3600 * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    datetimesingle.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    single.value = '2021-2-12';
  }, 3000);
});

// 定义方法
const change = (e) => {
  // 获取事件对象中的值
  single.value = e.detail.value;
  console.log('change事件:', single.value);
};

const changeLog = (e) => {
  console.log('change事件:', e);
};

const goBack = () => {
  uni.navigateBack({
    delta: 1,
    fail: () => {
      uni.switchTab({ url: '/pages/index/index' });
    }
  });
};

const maskClick = (e) => {
  console.log('maskClick事件:', e);
};

// 显示弹出框
const showGuestPicker = () => {
  showGuestPickerModal.value = true;
};

// 选择人数
const selectGuestCount = (count) => {
  guestCount.value = count;
  closeGuestPickerModal();
};

// 关闭弹出框
const closeGuestPickerModal = () => {
  showGuestPickerModal.value = false;
};

// 创建酒店订单
const createHotelOrder = (hotel) => {

  
// 检查是否登录
if (userStore.token === '') {
  uni.showToast({
    title: '未登录，请先登录',
    icon: 'none',
    duration: 1500
  });
  setTimeout(() => {
    uni.navigateTo({
      url: '/pages/login/login'
    });
  }, 500);
  return;
}

// 检查入住和离店日期
if (!range.value || range.value.length !== 2) {
  uni.showToast({
    title: '请选择入住和离店日期',
    icon: 'none'
  });
  return;
}

// 准备订单数据
const orderData = {
  contract: {
    contractName: userStore.userInfo.realname || '',
    contractPhone: userStore.userInfo.phone || ''
  },
  items: [
    {
      bookInfo: {
        date: `${range.value[0]} - ${range.value[1]}`,
        fullname: userStore.userInfo.realname || '',
        idCardNo: userStore.userInfo.idCardNo || '',
        idCardType: 'ID_CARD',
        schedule: '' // 可以根据需要添加具体时间
      },
      productId: hotel.id,
      productType: 'Accommodations',
      quantity: 1
    }
  ]
};


// 创建订单请求
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
      // 可以跳转到订单详情页或其他页面/
      uni.navigateTo({ url: `/pages/confirmHotelOrder/confirmHotelOrder?id=${hotel.id}` })
    } else {
      uni.showToast({
        title: res.data.message || '订单创建失败',
        icon: 'none'
      });
    }
  },
  fail: (err) => {
    console.error('创建订单失败', err);
    uni.showToast({
      title: '创建订单失败，请稍后重试',
      icon: 'none'
    });
  }
});

}


</script>

<style>
page {
  height: 100%;
  background-color: #F5F7FA;
}

.page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 顶部导航栏 */
.top-bar {
  padding: 20rpx 30rpx;
  padding-top: 60rpx;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.03);
}

.top-bar-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.top-bar-left,
.top-bar-right {
  width: 60rpx;
  display: flex;
  justify-content: flex-start;
}

.top-bar-right {
  justify-content: flex-end;
}

.header {
  background: #FFFFFF;
  flex-shrink: 0;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  height: 88rpx;
}

.search-input-wrap {
  flex: 1;
  margin: 0 20rpx;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 20rpx;
}

.search-input {
  flex: 1;
  height: 64rpx;
  background: #F5F5F5;
  border-radius: 8rpx;
  padding: 0 20rpx 0 60rpx;
  font-size: 28rpx;
}

.placeholder {
  color: #999999;
}



.date-guest {
  display: flex;
  padding: 20rpx 30rpx;
  border-top: 2rpx solid #F5F5F5;
}

.date-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-right: 30rpx;
}

.guest-section {
  display: flex;
  align-items: center;
}

.label {
  font-size: 24rpx;
  color: #999999;
  /* margin-bottom: 10rpx; */
  margin-right: 10px;
}

.content {
  display: flex;
  align-items: center;
}

.info {
  font-size: 28rpx;
  margin-left: 10rpx;
}

.filter-scroll {
  padding: 20rpx 30rpx 0;
  white-space: nowrap;
}

.filter-wrap {
  display: inline-flex;
  gap: 20rpx;
}

.filter-btn {
  padding: 14rpx 34rpx;
  background: #f5f5f7;
  border-radius: 40rpx;
  text-align: center;
  font-size: 28rpx;
  color: #666666;
  border-width: 0;
}

.filter-btn.active {
  background: #1B4B98;
  color: #FFFFFF;
  box-shadow: 0 6rpx 12rpx rgba(27, 75, 152, 0.28);
}

.sort-row {
  padding: 10rpx 30rpx 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sort-left {
  display: flex;
  align-items: center;
  padding: 12rpx 20rpx;
  background-color: #f7f8fa;
  border-radius: 40rpx;
}

.sort-text {
  font-size: 26rpx;
  color: #333;
  margin-right: 6rpx;
}

.sort-menu {
  margin: 10rpx 30rpx 0;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.sort-menu-item {
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #f2f2f2;
}

.sort-menu-item:last-child {
  border-bottom-width: 0;
}

.sort-menu-text {
  font-size: 26rpx;
  color: #333;
}

.sort-menu-text-active {
  color: #1B4B98;
  font-weight: 600;
}

.content {
  flex: 1;
  overflow: auto;
}

.hotel-list {
  padding: 0 30rpx;
}


.hotel-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: row;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.04);
}

.hotel-image {
  width: 220rpx;
  height: 180rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.hotel-info {
  flex: 1;
  padding-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hotel-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  max-width: 420rpx;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hotel-tag {
  padding: 4rpx 14rpx;
  background: #f0f4ff;
  color: #1b4b98;
  border-radius: 100rpx;
  font-size: 22rpx;
}

.hotel-desc-row {
  margin-top: 8rpx;
}

.hotel-desc {
  font-size: 24rpx;
  color: #999;
}

.tag-row {
  margin-top: 8rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 100rpx;
}

.tag-blue {
  background-color: #e6f1ff;
  color: #1b4b98;
}

.tag-yellow {
  background-color: #fff5e0;
  color: #f59a23;
}

.tag-green {
  background-color: #e7f8ec;
  color: #25a86b;
}

.hotel-distance-row {
  margin-top: 4rpx;
}

.distance-text {
  font-size: 22rpx;
  color: #1b8cff;
}

.hotel-bottom {
  margin-top: 10rpx;
}

.rating-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating-score {
  display: flex;
  align-items: center;
}

.rating {
  display: flex;
  align-items: center;
}

.score {
  color: #1B4B98;
  font-weight: 500;
  margin-right: 10rpx;
}

.rating-count {
  margin-left: 10rpx;
  font-size: 22rpx;
  color: #999;
}

.stars {
  display: flex;
}

.location {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
  flex-wrap: wrap;
  justify-content: space-between;
}

.location-text {
  font-size: 28rpx;
  color: #666666;
  margin-left: 8rpx;
}

.location-amount {
  font-size: 30rpx;
  font-weight: 500;
  color: #1B4B98;
}

.price-book {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
}

.price-amount {
  font-size: 34rpx;
  font-weight: 600;
  color: #ff4081;
  margin-left: 4rpx;
}

.price-currency {
  font-size: 24rpx;
  color: #ff4081;
}

.price-unit {
  font-size: 22rpx;
  color: #999;
  margin-left: 6rpx;
}

.book-btn {
  background: #1B4B98;
  color: #FFFFFF;
  font-size: 28rpx;
  padding: 8rpx 32rpx;
  border-radius: 40rpx;
  margin-right: 10rpx;
}

.example-body {
  background-color: #fff;
}

/* 弹出框整体容器样式 */
.guest-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  /* 半透明黑色背景，营造遮罩效果 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  /* 确保弹出框在其他元素之上 */
}

/* 弹出框内容区域样式 */
.guest-picker-content {
  background-color: white;
  border-radius: 12px;
  /* 圆角 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  /* 阴影效果 */
  padding: 20px;
  width: 280px;
  /* 可根据内容调整宽度 */
}

/* 每个选项的样式 */
.guest-option {
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
  /* 底部边框 */
  font-size: 28rpx;
  /* 根据项目整体字体大小调整 */
  text-align: center;
  cursor: pointer;
  /* 鼠标悬停时显示指针 */
}

.guest-option:last-child {
  border-bottom: none;
  /* 最后一个选项去掉底部边框 */
}

/* 选项被选中时的样式（可根据需求添加，这里仅作示例） */
.guest-option.selected {
  background-color: #f0f0f0;
  /* 选中时的背景颜色 */
}
</style>
