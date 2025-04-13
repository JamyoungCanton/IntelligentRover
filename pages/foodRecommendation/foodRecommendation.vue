<template>
  <view class="container">
    <!-- 头部导航栏 -->
    <view class="header">
      <text class="header-title">美食推荐</text>
      <view class="search-box">
        <input type="text" v-model="searchKeyword" placeholder="搜索餐厅" class="search-input" @input="onSearchInput" />
        <uni-icons type="search" size="24" color="#333" @click="onSearch" />
      </view>
    </view>

    <!-- 主内容区域 -->
    <view class="main">
      <!-- 筛选标签 -->
      <scroll-view class="filter-scroll" scroll-x>
        <view class="filter-tags">
          <view v-for="(tag, index) in filterTags" :key="index" :class="['filter-tag', { active: tag.active }]"
            @click="selectTag(index)">
            {{ tag.name }}
          </view>
        </view>
      </scroll-view>

      <!-- 排序选择器 -->
      <view class="sort-selector" @click="toggleSortPopup">
        <text class="sort-text">{{ currentSort.name }}</text>
        <uni-icons type="down" size="12" color="#999" />
      </view>

      <!-- 排序弹出层 -->
      <view class="sort-popup" v-if="showSortPopup">
        <view class="sort-popup-mask" @click="toggleSortPopup"></view>
        <view class="sort-popup-content">
          <view v-for="(sort, index) in sortOptions" :key="index" :class="['sort-option', { active: sort.active }]"
            @click="selectSort(index)">
            {{ sort.name }}
          </view>
        </view>
      </view>

      <!-- 餐厅列表 -->
      <scroll-view scroll-y class="restaurant-list">
        <view v-for="(restaurant, index) in displayedRestaurants" :key="index" class="restaurant-card">
          <view class="restaurant-image" @click="goToFoodDetails(restaurant)">
            <image :src="restaurant.imageURL" mode="aspectFill" />
            <text :class="['tag', restaurant.tagType]">{{ restaurant.tag }}</text>
          </view>
          <view class="restaurant-info">
            <!-- 第一行：餐厅名称和地址 -->
            <view class="name-address-row">
              <text class="restaurant-name" @click="goToFoodDetails(restaurant)">{{ restaurant.name }}</text>
              <text class="distance">{{ restaurant.address }}</text>
            </view>
            <!-- 第二行：营业时间 -->
            <view class="business-hours-row">
              <text class="business-hours">营业时间: {{ formatTime(restaurant.starthour) }} - {{
                formatTime(restaurant.endhour) }}</text>
            </view>
            <!-- 第三行：评分和月售 -->
            <view class="rating-box">
              <view class="star-rating">
                <uni-icons v-for="n in 5" :key="n" :type="n <= Math.floor(restaurant.rating) ? 'star-filled' : 'star'"
                  size="14" :color="n <= Math.floor(restaurant.rating) ? '#FFA500' : '#CCCCCC'" />
                <text v-if="restaurant.rating % 1 !== 0" class="half-star">
                  <uni-icons type="star-filled" size="14" color="#FFA500" style="width: 50%;" />
                </text>
              </view>
              <text class="rating">{{ restaurant.rating }}</text>
              <text class="monthly-sale">月售 {{ restaurant.monthSale }}</text>
            </view>
            <!-- 第四行：价格和预订按钮 -->
            <view class="price-book-row">
              <text class="price">人均 ¥{{ restaurant.priceaverage }}</text>
              <view class="book-button" @click.stop="onBooking(restaurant)"
                style="padding: 8rpx 50rpx; font-size: 30rpx; height: 60rpx; line-height: 60rpx;">
                预订
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 悬浮按钮 -->
    <view class="float-button">
      <uni-icons type="calendar" size="24" color="#FFFFFF" />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';

const currentTab = ref(0);
const filterTags = ref([
  { name: '全部', active: true, type: 'all' },
  { name: '海鲜', active: false, type: 'seafood' },
  { name: '粤式', active: false, type: 'cantonese' },
  { name: '特色小吃', active: false, type: 'snack' },
  { name: '农家菜', active: false, type: 'farmhouse' }
]);

const sortOptions = ref([
  { name: '综合排序', active: true, type: 'comprehensive' },
  { name: '价格从高到低', active: false, type: 'priceDesc' },
  { name: '价格从低到高', active: false, type: 'priceAsc' }
]);

const currentSort = computed(() => {
  return sortOptions.value.find(sort => sort.active) || sortOptions.value[0];
});

const restaurants = ref([]);
const userStore = useUserStore();
const combinedArray = ref([]);
const showSortPopup = ref(false);
const searchKeyword = ref('');

// 格式化时间函数
const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes || '00'}`;
};

// 根据筛选和排序条件显示餐厅列表
const displayedRestaurants = computed(() => {
  // 获取当前选中的标签
  const activeTag = filterTags.value.find(tag => tag.active);
  const activeSort = sortOptions.value.find(sort => sort.active);

  // 先进行搜索过滤
  let filteredList = combinedArray.value;
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim();
    filteredList = filteredList.filter(restaurant =>
      restaurant.name.toLowerCase().includes(keyword) ||
      restaurant.address.toLowerCase().includes(keyword)
    );
  }

  // 然后进行分类筛选
  if (activeTag.type !== 'all') {
    filteredList = combinedArray.value.filter(restaurant => {
      switch (activeTag.type) {
        case 'seafood':
          return restaurant.name.includes('海鲜') || restaurant.tag === '海鲜';
        case 'cantonese':
          return restaurant.name.includes('粤') || restaurant.tag === '粤式';
        case 'snack':
          return restaurant.name.includes('小吃') || restaurant.tag === '特色小吃';
        case 'farmhouse':
          return restaurant.name.includes('农家') || restaurant.tag === '农家菜';
        default:
          return true;
      }
    });
  }

  // 然后进行排序
  return filteredList.slice().sort((a, b) => {
    switch (activeSort.type) {
      case 'priceDesc':
        return b.priceaverage - a.priceaverage;
      case 'priceAsc':
        return a.priceaverage - b.priceaverage;
      default:
        // 综合排序：按评分和月售量综合排序
        return (b.rating * 0.6 + b.monthlySales * 0.4) -
          (a.rating * 0.6 + a.monthlySales * 0.4);
    }
  });
});

const imageUrls = ref([
  "https://wlmtsys.com:9000/travel/f1.jpg",
  "https://wlmtsys.com:9000/travel/f2.jpg",
  "https://wlmtsys.com:9000/travel/f3.jpg",
  "https://wlmtsys.com:9000/travel/f4.jpg",
  "https://wlmtsys.com:9000/travel/f5.jpg",
  "https://wlmtsys.com:9000/travel/f6.jpg",
  "https://wlmtsys.com:9000/travel/f7.jpg",
  "https://wlmtsys.com:9000/travel/f8.jpg",
  "https://wlmtsys.com:9000/travel/f9.jpg",
  "https://wlmtsys.com:9000/travel/f10.jpg",
  "https://wlmtsys.com:9000/travel/f11.jpg",
  "https://wlmtsys.com:9000/travel/f12.jpg",
  "https://wlmtsys.com:9000/travel/f13.jpg",
  "https://wlmtsys.com:9000/travel/f14.jpeg",
  "https://wlmtsys.com:9000/travel/f15.png",
  "https://wlmtsys.com:9000/travel/f16.png",
  "https://wlmtsys.com:9000/travel/f17.jpg",
  "https://wlmtsys.com:9000/travel/f18.jpg",
  "https://wlmtsys.com:9000/travel/f19.jpg",
  "https://wlmtsys.com:9000/travel/f20.jpg",
]);

// 选择分类标签
const selectTag = (index) => {
  filterTags.value.forEach((tag, i) => {
    tag.active = i === index;
  });
};

// 切换排序弹出层
const toggleSortPopup = () => {
  showSortPopup.value = !showSortPopup.value;
};

// 选择排序方式
const selectSort = (index) => {
  sortOptions.value.forEach((sort, i) => {
    sort.active = i === index;
  });
  showSortPopup.value = false;
};

const goBack = () => {
  uni.navigateBack();
};

const onSearch = () => {
  const keyword = searchKeyword.value.trim();
  if (!keyword) {
    uni.showToast({
      title: '请输入搜索关键词',
      icon: 'none'
    });
    return;
  }

  // 显示搜索成功提示
  const count = displayedRestaurants.value.length;
  uni.showToast({
    title: `找到${count}家相关餐厅`,
    icon: 'success'
  });
};

const onSearchInput = () => {
  // 实时搜索，不需要额外处理，因为已经在computed中处理了
};


// 创建订单函数
const createOrder = (restaurant) => {
  // 计算价格（使用人均价格）
  const price = restaurant.priceaverage || 100;  // 默认100元如果没有价格
  const quantity = 1;  // 默认预订1份
  const totalAmount = price * quantity;

  // 构建订单数据
  const orderData = {
    contract: {
      contractName: userStore.userInfo?.realname || '游客',  // 从用户信息中获取姓名
      contractPhone: userStore.userInfo?.phone || '13800138000'  // 从用户信息中获取电话
    },
    items: [
      {
        bookInfo: {
          date: new Date().toISOString().split('T')[0], // 当前日期
          fullname: userStore.userInfo?.realname || '游客',  // 预订人姓名
          idCardNo: userStore.userInfo?.idCard || '110101199001011234',  // 身份证号
          idCardType: "ID_CARD",  // 默认为身份证
          schedule: restaurant.starthour || '12:00'  // 使用餐厅营业开始时间
        },
        productId: restaurant.id,  // 餐厅ID
        productType: "Dining",  // 餐饮类型
        quantity: quantity,  // 预订数量
        price: price,  // 单价
        amount: totalAmount  // 总金额
      }
    ]
  };

  // 在控制台打印订单信息
  console.log('创建订单数据:', orderData);
  console.log('餐厅信息:', restaurant);

  // 发送创建订单请求
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/front/order/createOrder',
    method: 'POST',
    data: orderData,
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token || ''
    },
    success: (res) => {
      // 在控制台打印响应结果
      console.log('创建订单响应:', res.data);

      if (res.data.success) {
        uni.showToast({
          title: '预订成功',
          icon: 'success',
          duration: 2000
        });
        // 预订成功后跳转到订单页面
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/order/order'
          });
        }, 2000);
      } else {
        uni.showToast({
          title: res.data.message || '预订失败',
          icon: 'none',
          duration: 2000
        });
      }
    },
    fail: (err) => {
      // 在控制台打印错误信息
      console.error('创建订单失败:', err);

      uni.showToast({
        title: '网络错误，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  });
};


// 跳转到餐厅详情页面
const goToFoodDetails = (restaurant) => {
  console.log("跳转到餐厅详情页面")
  uni.navigateTo({
    url: `/pages/foodDetails/foodDetails?id=${restaurant.id}`
  });
};

const onBooking = (restaurant) => {
  // 在控制台打印点击预订的餐厅信息
  console.log('点击预订按钮:', restaurant);

  // 检查是否登录
  if (!userStore.token || !userStore.userInfo) {
    uni.showToast({
      title: '请先登录',
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

  // 创建订单确认框
  uni.showModal({
    title: '预订确认',
    content: `是否确认预订${restaurant.name}？`,
    success: (res) => {
      console.log('用户确认结果:', res);
      if (res.confirm) {
        console.log('用户确认预订');
        createOrder(restaurant);
      } else {
        console.log('用户取消预订');
      }
    }
  });
};

onMounted(() => {
  // 获取数据
  hasToken();
  getFoodList();
});

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

const getFoodList = () => {
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/product/ilDining/list',
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
      restaurants.value = res.data.result.records;
      combinedArray.value = restaurants.value.map((item, index) => ({
        ...item,
        imageURL: imageUrls.value[index]
      }));
    }
  })
}
</script>

<style>
/* 样式部分保持不变 */
page {
  height: 100%;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #FFFFFF;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  border-bottom: 1px solid #f5f5f5;
  z-index: 100;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #F5F5F5;
  border-radius: 32rpx;
  padding: 8rpx 16rpx;
  flex: 1;
  margin-left: 20rpx;
}

.search-input {
  flex: 1;
  height: 60rpx;
  font-size: 28rpx;
  background: transparent;
  margin-right: 8rpx;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
}

.main {
  flex: 1;
  margin-top: 88rpx;
  padding: 0 32rpx;
  overflow: hidden;
}

.filter-scroll {
  margin: 0 -32rpx;
  padding: 24rpx 32rpx;
  white-space: nowrap;
}

.filter-tags {
  display: inline-flex;
  gap: 24rpx;
}

.filter-tag {
  display: inline-block;
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  border: 1px solid #E5E5E5;
  font-size: 14px;
  color: #666666;
}

.filter-tag.active {
  color: #0066FF;
  border-color: #0066FF;
  background-color: rgba(0, 102, 255, 0.1);
}

.sort-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 32rpx 0;
  padding: 16rpx;
  background-color: #F5F5F5;
  border-radius: 16rpx;
}

.sort-text {
  font-size: 14px;
  color: #666666;
}

/* 排序弹出层样式 */
.sort-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.sort-popup-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
}

.sort-popup-content {
  position: absolute;
  top: 200rpx;
  left: 32rpx;
  right: 32rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
}

.sort-option {
  padding: 24rpx;
  font-size: 14px;
  color: #333333;
  text-align: center;
  border-bottom: 1px solid #F5F5F5;
}

.sort-option:last-child {
  border-bottom: none;
}

.sort-option.active {
  color: #0066FF;
}

.restaurant-list {
  height: calc(100vh - 400rpx);
  overflow: auto;
}

.restaurant-card {
  margin-bottom: 32rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #FFFFFF;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.restaurant-image {
  position: relative;
  height: 360rpx;
}

.restaurant-image image {
  width: 100%;
  height: 100%;
}

.tag {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 12px;
  color: #FFFFFF;
}

.tag.popular {
  background-color: #FF6B00;
}

.tag.featured {
  background-color: #0066FF;
}

.restaurant-info {
  padding: 24rpx;
}

.name-address-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.restaurant-name {
  font-size: 16px;
  font-weight: bold;
  /* 改为加粗 */
  color: #333333;
  flex-shrink: 0;
  margin-right: 16rpx;
  cursor: pointer;
  /* 添加鼠标悬停样式 */
}

.rating-box {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.rating {
  font-size: 14px;
  color: #333333;
  margin: 0 16rpx 0 8rpx;
}

.monthly-sale {
  font-size: 14px;
  color: #999999;
}

.business-hours-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.business-hours {
  font-size: 14px;
  color: #666666;
}

.price-book-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}

.price {
  font-size: 14px;
  color: #666666;
}

.distance {
  font-size: 14px;
  color: #999999;
  flex: 1;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 16rpx;
}

.book-button {
  background: #1B4B98;
  color: #FFFFFF;
  font-size: 28rpx;
  padding: 1rpx 35rpx;
  border-radius: 8rpx;
  margin-right: 10rpx;
  margin-top: -10rpx;
}

.float-button {
  position: fixed;
  right: 32rpx;
  bottom: 140rpx;
  width: 100rpx;
  height: 100rpx;
  background: #0066FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(0, 102, 255, 0.3);
}
</style>