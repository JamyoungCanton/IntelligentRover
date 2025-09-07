<template>
  <view class="page">
    <!-- 轮播图 -->
    <view class="carousel">
      <swiper :autoplay="true" :interval="3000" :duration="500" :circular="true">
        <swiper-item v-for="(item, index) in carouselItems" :key="index">
          <view class="carousel-item">
            <image :src="item.image" class="carousel-image"></image>
          </view>
        </swiper-item>
      </swiper>
      <view class="carousel-text">
        <text class="title">一日畅游</text>
        <p><text class="subtitle">欢乐无限 · 欢迎来到海岛一日游</text></p>
      </view>
    </view>

    <!-- 导航栏 -->
    <view class="navbar">
      <scroll-view class="nav-scroll" scroll-x>
        <view
          v-for="(tab, index) in tabs"
          :key="index"
          class="nav-item"
          :class="{ active: activeTab === tab.value }"
          @click="setActive(tab.value)"
        >
          <image :src="tab.imagetabs" :style="tab.imgtabStyle"></image>
          {{ tab.name }}
        </view>
      </scroll-view>
    </view>

    <!-- 筛选和排序 -->
    <view class="filter-bar">
      <view class="sub-filter">
        <view class="sub-filter-item" @click="setSort('price')">价格</view>
        <view class="sub-filter-item" @click="setSort('sales')">销量</view>
        <view class="sub-filter-item" @click="setSort('rating')">好评</view>
      </view>
    </view>

    <!-- 景点列表 -->
    <view class="spot-grid">
      <view
        v-for="item in sortedSpots"
        :key="item.id"
        class="spot-item"
        @click="goAttraction(item.id)"
      >
        <view class="img">
          <image :src="item.image" mode="aspectFill"></image>
          <view class="rating">
            <image :src="item.imagestar" :style="item.starStyle" class="starlove"></image>
            <text>{{ item.rating }}</text>
          </view>
        </view>
        <view class="spot-info">
          <text class="spot-name">{{ item.name }}</text>
          <text class="spot-desc">{{ item.desc }}</text>
          <view class="spot-footer">
            <text class="price">¥{{ item.price }}<text style="color: darkgray; font-size: 15px;">起</text></text>
            <text class="sales">已售{{ item.sales }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';

const baseurl = 'https://island.zhangshuiyi.com';

// 用户认证检查
const hasToken = () => {
  if (userStore.token === '') {
    uni.showToast({
      title: '未登录,请先登录',
      icon: 'none',
      duration: 1500
    });
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    }, 500);
    return false;
  }
  return true;
};

const activeTab = ref('all');
const sortType = ref('');
const showFilter = ref(false); // 控制筛选面板的显示隐藏
const userStore = useUserStore();

// 定义标签页数据
const tabs = ref([
  { name: '全部', value: 'all', type: 1, imagetabs: '/static/dayTravel/all.png', imgtabStyle: { width: '13px', height: '13px', objectFit: 'contain' } },
  { name: '休闲', value: 'beach', type: 2, imagetabs: '/static/dayTravel/travel.png', imgtabStyle: { width: '13px', height: '13px', objectFit: 'contain' } },
  { name: '运动', value: 'water', type: 3, imagetabs: '/static/dayTravel/swim.png', imgtabStyle: { width: '15px', height: '15px', objectFit: 'contain' } },
  { name: '文化体验', value: 'culture', type: 4, imagetabs: '/static/dayTravel/culture.png', imgtabStyle: { width: '13px', height: '13px', objectFit: 'contain' } },
  { name: '美食', value: 'food', type: 5, imagetabs: '/static/dayTravel/food.png', imgtabStyle: { width: '18px', height: '18px', objectFit: 'contain' } }
]);

// 轮播图数据
const carouselItems = ref([
  {
    image: 'https://gitee.com/luo-shaominggitee/island_image/raw/00aa571dc9a58cf479273927eabcdae59012d58c/img/dayTravel/pexels-asadphoto-1449767.jpg',
  },
  {
    image: 'https://gitee.com/luo-shaominggitee/island_image/raw/2ade706a602ac493cb52d36999ec5e68f6ca0514/index/pexels-asadphoto-1591375.jpg',
  },
  {
    image: 'https://gitee.com/luo-shaominggitee/island_image/raw/2ade706a602ac493cb52d36999ec5e68f6ca0514/index/pexels-pok-rie-33563-673865.jpg',
  },
  {
    image: 'https://gitee.com/luo-shaominggitee/island_image/raw/00aa571dc9a58cf479273927eabcdae59012d58c/img/dayTravel/pexels-pok-rie-33563-982263.jpg',
  }
]);

// 景点图片存储列表（6张图片）
const spotImages = ref([
  'https://gitee.com/luo-shaominggitee/island_image/raw/00aa571dc9a58cf479273927eabcdae59012d58c/img/dayTravel/pexels-asadphoto-1449767.jpg',
  'https://gitee.com/luo-shaominggitee/island_image/raw/00aa571dc9a58cf479273927eabcdae59012d58c/img/dayTravel/pexels-francesco-ungaro-3157890.jpg',
  'https://gitee.com/luo-shaominggitee/island_image/raw/00aa571dc9a58cf479273927eabcdae59012d58c/img/dayTravel/pexels-belle-co-99483-847393.jpg',
  'https://gitee.com/luo-shaominggitee/island_image/raw/00aa571dc9a58cf479273927eabcdae59012d58c/img/dayTravel/pexels-pixabay-64219.jpg',
  'https://gitee.com/luo-shaominggitee/island_image/raw/00aa571dc9a58cf479273927eabcdae59012d58c/img/dayTravel/pexels-jayson-will-768546872-18817260.jpg',
  'https://gitee.com/luo-shaominggitee/island_image/raw/00aa571dc9a58cf479273927eabcdae59012d58c/img/dayTravel/pexels-jean-paul-wettstein-677916508-33779389.jpg'
]);

// 套餐列表数据
const spots = ref([]);

const fetchSpots = async () => {
  const tabObj = tabs.value.find(t => t.value === activeTab.value);
  let type = tabObj ? tabObj.type : 1; // 默认值为 1

  // 如果是 "全部" 类型，则不传递 type 参数
  if (activeTab.value === 'all') {
    type = null; // 或者 type = [1, 2, 3, 4, 5]; 如果后端支持传数组
  }

  console.log(type);
  try {
    const res = await uni.request({
      url: `${baseurl}/island/il-package/list`,
      method: 'POST',
      data: JSON.stringify({ type }), // 如果 type 是 null，后端需要处理这种情况
      header: {
        'Content-Type': 'application/json',
        'X-Access-Token': userStore.token || ''
      }
    });

    console.log("接口返回的数据：", res);

    if (res.statusCode === 200 && res.data && res.data.success) {
      const spotList = res.data.result || [];
      console.log('原始套餐数据:', JSON.stringify(spotList, null, 2));
      
      spots.value = spotList.map((item, index) => {
        console.log('处理套餐项:', item.id, '图片数据:', item.images);
        
        // 使用存储的图片列表，循环使用6张图片
        const imageUrl = spotImages.value[index % spotImages.value.length];
        console.log('使用存储图片URL:', imageUrl);
        
        return {
          id: item.id || '',
          name: item.packname || '',
          rating: item.score || 0,
          desc: (item.tags || '').replace(/,/g, ' · '),
          price: item.price ? parseFloat(item.price) : 0,
          sales: item.soldSum || 0,
          image: imageUrl,
          imagestar: '/static/dayTravel/star.png',
          starStyle: { width: '13px', height: '13px', objectFit: 'contain' }
        };
      });
      
      console.log('处理后的套餐列表:', JSON.stringify(spots.value, null, 2));
    } else {
      uni.showToast({ title: '套餐获取失败！', icon: 'none' });
    }
  } catch (err) {
    console.error('请求失败：', err.message);
    uni.showToast({ title: '网络异常', icon: 'none' });
  }
};

// tab 切换
const setActive = (tab) => {
  activeTab.value = tab;
  fetchSpots();
};

// 筛选面板显示隐藏切换
const toggleFilter = () => {
  showFilter.value = !showFilter.value;
};

// 设置排序方式
const setSort = (type) => {
  sortType.value = type;
};

// 排序后的套餐列表
const sortedSpots = computed(() => {
  let sorted = [...spots.value];
  if (sortType.value === 'price') {
    sorted = sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortType.value === 'sales') {
    sorted = sorted.sort((a, b) => (b.sales || 0) - (a.sales || 0));
  } else if (sortType.value === 'rating') {
    sorted = sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
  return sorted;
});

// 跳转到套餐详情页
const goAttraction = (id) => {
  // 找到对应的景点项，获取其图片
  const spotItem = spots.value.find(item => item.id === id);
  const imageUrl = spotItem ? spotItem.image : '';
  
  console.log('跳转到详情页，传递图片:', imageUrl);
  console.log('当前spots数据:', spots.value);
  
  uni.navigateTo({
    url: `/pages/dayTravelDetail/dayTravelDetail?id=${id}&imageURL=${encodeURIComponent(imageUrl)}`
  });
};

// 页面加载时执行
onMounted(() => {
  if (!hasToken()) {
    return;
  }
  fetchSpots();
});
</script>

<style>
.page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.carousel {
  position: relative;
  width: 100%;
  height: 150px; /* 根据需要调整轮播图的高度 */
}

.carousel-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  padding: 10px;
  border-radius: 5px;
  z-index: 10;
/*  background-color: rgba(0, 0, 0, 0.5); */
  width: 60%;
}

.title {
  font-weight: bold;
  font-size: 32px;
  margin-bottom: 5px;
  color: coral;
}

.subtitle {
  color: #FFFFFF;
  font-size: 16px;
}

.navbar {
  width: 100%;
  background-color: #f8f8f8f8;
  border-bottom: 1px solid #e5e5e5;
}

.nav-scroll {
  display: flex;
  overflow-x: auto; /* 水平滚动 */
  white-space: nowrap; /* 防止换行 */
}

.nav-item {
  display: inline-block; /* 使元素在同一行显示 */
  padding: 15px;
  cursor: pointer;
  color: #666;
}

.nav-item.active {
  color: #007aff;
  font-weight: bold;
  border-bottom: 2px solid #007aff;
}

.filter-bar {
  display: flex;
  align-items: center;
  background-color: #f8f8f8f8;
  padding: 10px;
  border-radius: 5px;
  height: 25px;
}

.filter-options {
  display: flex;
  gap: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
}

.icon {
  font-size: 16px;
}

.sub-filter {
  position: absolute;
  padding: 10px;
  z-index: 1000;
  right: 5px;
}

.sub-filter-item {
  margin-right: 10px;
  cursor: pointer;
  float: left;
  color: #666;
}

.sub-filter-item:hover {
  color: #007aff;
}

.spot-grid {
  padding: 0 30rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.spot-item {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0,0.1);
}

.spot-item image {
  width: 100%;
  height: 240rpx;
}

.spot-info {
  padding: 16rpx;
}

.spot-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.rating {
	width: 15%;
	height: 25px;
	line-height: 20px;
	font-size: 15px;
	position: absolute;
	align-items: center;
	border-radius: 10px;
	z-index: 10;
	background-color: rgba(0, 0, 0, 0.3);
	right: 2px;
	bottom: 7%;
	color: #FFFFFF;
	padding-left: 5px;
}

.spot-desc {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spot-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}

.location {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.location-text {
  font-size: 24rpx;
  color: #999999;
}

.img{
	position: relative;
}
.starlove{
	width: 5px;
	height: 5px;
}
.price {
  font-size: 35rpx;
  color: #cc1c42;
  font-weight: bold;
}

.sales {
  font-size: 15px;
  padding-right: 5rpx;
  color: #999999;
}
</style>