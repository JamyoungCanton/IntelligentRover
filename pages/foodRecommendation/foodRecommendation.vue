<template>
  <view class="container">
    <!-- 头部导航栏 -->
    <view class="header" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="header-content">
        <view class="back-icon" @click="goBack">
          <uni-icons type="back" size="24" color="#333"></uni-icons>
        </view>
        <text class="header-title">餐厅列表</text>
      </view>
      <view class="search-sort-row">
        <view class="search-box">
          <input 
            type="text" 
            v-model="searchKeyword" 
            placeholder="请输入..." 
            class="search-input" 
            @confirm="onSearch"
            confirm-type="search"
          />
          <uni-icons type="search" size="24" color="#333" @click="onSearch" />
        </view>
        <view class="sort-selector" @click="toggleSortPopup">
          <text class="sort-text">{{ currentSort.name }}</text>
          <uni-icons type="down" size="12" color="#999" />
        </view>
      </view>
    </view>

    <!-- 主内容区域 -->
    <view class="main">
      <!-- 顶部图片区域（模仿景点攻略） -->
      <view class="hero">
        <image :src="heroImage || (imageUrls[4] || '')" class="hero-img" mode="aspectFill" />
        <view class="hero-dim"></view>
        <view class="hero-overlay">
          <text class="hero-title">餐厅列表</text>
          <text class="hero-subtitle">发现令人心动的美食之地</text>
        </view>
      </view>
      <!-- 筛选标签 -->
      <scroll-view class="filter-scroll" scroll-x>
        <view class="filter-tags">
          <view v-for="(tag, index) in filterTags" :key="index" :class="['filter-tag', { active: tag.active }]"
            @click="selectTag(index)">
            {{ tag.name }}
          </view>
        </view>
      </scroll-view>

      

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
      <view class="restaurant-list">
        <view v-for="(restaurant, index) in displayedRestaurants" :key="index" class="restaurant-card">
          <view class="restaurant-image" @click="goToFoodDetails(restaurant)">
            <image :src="restaurant.imageURL" mode="aspectFill" />
          </view>
          <view class="restaurant-info">
            <!-- 标题 -->
            <view class="name-row">
              <text class="restaurant-name" @click="goToFoodDetails(restaurant)">{{ restaurant.name }}</text>
            </view>
            <!-- 评分 -->
            <view class="rating-row">
              <view class="star-rating">
                <uni-icons v-for="n in 5" :key="n" :type="n <= Math.floor(restaurant.rating) ? 'star-filled' : 'star'" size="14" :color="n <= Math.floor(restaurant.rating) ? '#FFB020' : '#E5E7EB'" />
              </view>
              <text class="rating">{{ restaurant.rating }}</text>
            </view>
            <!-- 价格 + 地址 -->
            <view class="price-address-row">
              <text class="price">人均 ¥{{ restaurant.priceaverage }}</text>
              <view class="addr">
                <uni-icons type="location" size="16" color="#9CA3AF" />
                <text class="distance">{{ restaurant.address }}</text>
              </view>
            </view>
            <!-- 营业时间（绿色点） -->
            <view class="business-hours-row">
              <view class="green-dot"></view>
              <text class="business-hours">营业时间：{{ formatTime(restaurant.starthour) }} - {{ formatTime(restaurant.endhour) }}</text>
            </view>
            <!-- 底部：月售 + 立即预订 -->
            <view class="bottom-row">
              <text class="monthly-sale">月售 {{ restaurant.monthSale }} 单</text>
              <view class="book-button" @click.stop="goToFoodDetails(restaurant)">立即预订</view>
            </view>
          </view>
        </view>
      </view>
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

const safeAreaInsets = ref({});
const statusBarHeight = ref(0);
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
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f1.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f2.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f3.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f4.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f5.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f6.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f7.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f8.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f9.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f10.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f11.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f12.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f13.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f14.jpeg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f15.png",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f16.png",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f17.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f18.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f19.jpg",
  "https://gitee.com/luo-shaominggitee/island_image/raw/main/food/f20.jpg",
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
  uni.navigateBack({
    delta: 1,
    fail: () => {
      // 如果返回失败（没有上一页），则跳转到首页
      uni.switchTab({
        url: '/pages/index/index'
      });
    }
  });
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

  // 执行搜索
  const count = displayedRestaurants.value.length;
  if (count > 0) {
    uni.showToast({
      title: `找到${count}家相关餐厅`,
      icon: 'success'
    });
  } else {
    uni.showToast({
      title: '未找到相关餐厅',
      icon: 'none'
    });
  }
};

const onSearchInput = () => {
  // 实时搜索，不需要额外处理，因为已经在computed中处理了
};


// 创建订单函数
const createOrder = (restaurant) => {
  // 构建订单数据
  const orderData = {
    contract: {
      contractName: userStore.userInfo?.realname || '游客',
      contractPhone: userStore.userInfo?.phone || '13800138000'
    },
    items: [
      {
        bookInfo: {
          date: new Date().toISOString().split('T')[0], // 当前日期
          fullname: userStore.userInfo?.realname || '游客',
          idCardNo: userStore.userInfo?.idCard || '110101199001011234',
          idCardType: "ID_CARD",
          schedule: restaurant.starthour || '12:00'  // 使用餐厅营业开始时间
        },
        productId: restaurant.id,
        productType: "Dining",
        quantity: 1
      }
    ],
    travelStartDate: new Date().toISOString().split('T')[0],
    travelEndDate: new Date().toISOString().split('T')[0]
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
  console.log("跳转到餐厅详情页面", restaurant);
  console.log("餐厅图片数据：", restaurant.imageURL);
  uni.navigateTo({
    url: `/pages/foodDetails/foodDetails?id=${restaurant.id}&startTime=${encodeURIComponent(restaurant.starthour)}&endTime=${encodeURIComponent(restaurant.endhour)}&imageURL=${encodeURIComponent(restaurant.imageURL)}&images=${encodeURIComponent(JSON.stringify([restaurant.imageURL]))}`
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
        // 跳转到预订页面，并传递餐厅信息
        uni.navigateTo({
          url: `/pages/foodConfirm/foodConfirm?id=${restaurant.id}&startTime=${encodeURIComponent(restaurant.starthour)}&endTime=${encodeURIComponent(restaurant.endhour)}`
        });
        // createOrder(restaurant);
      } else {
        console.log('用户取消预订');
      }
    }
  });
};

onMounted(() => {
  const { statusBarHeight: sbHeight, safeAreaInsets: insets } = uni.getSystemInfoSync();
  statusBarHeight.value = sbHeight;
  safeAreaInsets.value = insets;
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
      'X-Access-Token': userStore.token || ''
    },
    success: (res) => {
      if (res.data.success) {
      restaurants.value = res.data.result.records;
        // 使用默认图片数组
      combinedArray.value = restaurants.value.map((item, index) => ({
        ...item,
          imageURL: imageUrls.value[index % imageUrls.value.length] // 循环使用默认图片
      }));
      } else {
        console.error('获取餐厅列表失败:', res.data.message);
        uni.showToast({
          title: '获取餐厅列表失败',
          icon: 'none',
          duration: 2000
        });
      }
    },
    fail: (err) => {
      console.error('获取餐厅列表失败:', err);
      uni.showToast({
        title: '网络错误，请重试',
        icon: 'none',
        duration: 2000
      });
}
  });
};
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
  position: relative;
  width: 100%;
  background: #FFFFFF;
  padding: 0 32rpx;
  border-bottom: 1px solid #f5f5f5;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  position: relative;
}

.back-icon {
  position: absolute;
  left: 0;
  padding: 10rpx;
  z-index: 101;
}

.search-sort-row { display:flex; gap:16rpx; align-items:center; margin:16rpx 0; }
.search-box { flex:1; display:flex; align-items:center; background-color:#F5F5F5; border-radius:16rpx; padding:8rpx 16rpx; }

.search-input {
  flex: 1;
  height: 60rpx;
  font-size: 28rpx;
  background: transparent;
  margin-right: 8rpx;
  padding: 0 10rpx;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  text-align: center;
}

.main {
  flex: 1;
  margin-top: 0;
  padding: 0 32rpx;
}

/* 顶部图片（模仿景点攻略） */
.hero { position: relative; height: 320rpx; margin: 0 0 16rpx 0; border-radius: 24rpx; overflow: hidden; }
.hero-img { width: 100%; height: 100%; }
.hero-dim { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: rgba(0,0,0,0.20); z-index: 1; }
.hero-overlay { position: absolute; left: 0; right: 0; bottom: 80rpx; padding: 0 24rpx; z-index: 2; display: flex; flex-direction: column; align-items: center; }
.hero-title { color: #fff; font-size: 40rpx; font-weight: 800; }
.hero-subtitle { color: rgba(255,255,255,0.85); font-size: 26rpx; margin-top: 10rpx; }
.hero-search { position: absolute; left: 24rpx; right: 24rpx; bottom: 10rpx; z-index: 3; }
.search-wrap { display: flex; align-items: center; background: #fff; border-radius: 40rpx; box-shadow: 0 8rpx 24rpx rgba(15,174,223,0.12); padding: 0 28rpx; height: 72rpx; }
.search-icon { margin-right: 12rpx; }
.placeholder { color: #bbb; }

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

.sort-selector { display:flex; align-items:center; padding:16rpx 20rpx; background-color:#F5F5F5; border-radius:16rpx; }

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

.restaurant-list { }

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

.name-row { margin-bottom: 12rpx; }
.rating-row { display:flex; align-items:center; gap:12rpx; margin-bottom:12rpx; }

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

.business-hours-row { display: flex; align-items: center; gap: 8rpx; margin: 12rpx 0; }
.green-dot { width: 12rpx; height: 12rpx; background: #22C55E; border-radius: 50%; }

.business-hours {
  font-size: 14px;
  color: #666666;
}

.price-address-row { display: flex; justify-content: space-between; align-items: center; margin-top: 12rpx; }
.addr { display: flex; align-items: center; gap: 8rpx; max-width: 60%; }

.price {
  font-size: 14px;
  color: #666666;
}

.distance { font-size: 14px; color: #999999; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.bottom-row { display: flex; justify-content: space-between; align-items: center; margin-top: 16rpx; }
.book-button { background: #FF7A45; color: #FFFFFF; font-size: 28rpx; padding: 10rpx 32rpx; border-radius: 9999rpx; }

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
  const heroImage = computed(() => {
    const list = combinedArray.value || [];
    if (!list.length) return '';
    const top = list.slice().sort((a,b) => Number(b.rating || 0) - Number(a.rating || 0))[0];
    return top?.imageURL || '';
  });
