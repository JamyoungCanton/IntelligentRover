<template>
  <view class="container">
    <!-- 顶部区域 -->
    <view class="header" :style="{ paddingTop: `${statusBarHeight}px` }">
      <image class="banner" src="https://wlmtsys.com:9000/travel/Banner1.jpg" mode="widthFix"></image>
      <view class="logo">
        <image class="logo-img" src="https://wlmtsys.com:9000/travel/LOGO.png"></image>
        <text class="logo-text">海岛智游侠</text>
      </view>
    </view>

    <!-- 主要内容区 -->
    <view class="content-box">

      <!-- 通知栏 -->
      <view class="notice">
        <view class="notice-content">
          <view class="notice-icon">通知</view>
          <view class="notice-text-container">
            <view class="notice-text">欢迎来到海岛智游侠，这里为您带来意想不到的海岛之旅，欢乐无限，期待您的到来~</view>
          </view>
        </view>
      </view>

      <!-- 图标导航 -->
      <view class="icon-nav">
        <view class="icon-item" @click="navigateTo('景点攻略')">
          <view class="icon-bg">
            <image class="icon" src="https://wlmtsys.com:9000/travel/首页-景点攻略.svg"></image>
          </view>
          <text class="icon-text">景点攻略</text>
        </view>
        <view class="icon-item" @click="navigateTo('船票预订')">
          <view class="icon-bg">
            <image class="icon" src="https://wlmtsys.com:9000/travel/首页-船票预订.svg"></image>
          </view>
          <text class="icon-text">船票预订</text>
        </view>
        <view class="icon-item" @click="navigateTo('美食推荐')">
          <view class="icon-bg">
            <image class="icon" src="https://wlmtsys.com:9000/travel/首页-美食推荐.svg"></image>
          </view>
          <text class="icon-text">美食推荐</text>
        </view>
        <view class="icon-item" @click="navigateTo('酒店住宿')">
          <view class="icon-bg">
            <image class="icon" src="https://wlmtsys.com:9000/travel/首页-酒店住宿.svg"></image>
          </view>
          <text class="icon-text">酒店住宿</text>
        </view>
        <view class="icon-item" @click="navigateTo('停车收费')">
          <view class="icon-bg">
            <image class="icon" src="https://wlmtsys.com:9000/travel/首页-停车收费.svg"></image>
          </view>
          <text class="icon-text">停车收费</text>
        </view>
        <view class="icon-item" @click="navigateTo('一日畅游')">
          <view class="icon-bg">
            <image class="icon" src="https://wlmtsys.com:9000/travel/首页-一日畅游.svg"></image>
          </view>
          <text class="icon-text">一日畅游</text>
        </view>
        <view class="icon-item" @click="navigateTo('社区互动')">
          <view class="icon-bg">
            <image class="icon" src="https://wlmtsys.com:9000/travel/首页-社区互动.svg"></image>
          </view>
          <text class="icon-text">社区互动</text>
        </view>
        <view class="icon-item" @click="navigateTo('更多服务')">
          <view class="icon-bg">
            <image class="icon" src="https://wlmtsys.com:9000/travel/首页-更多服务.svg"></image>
          </view>
          <text class="icon-text">更多服务</text>
        </view>
      </view>

      <!-- 热门活动 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">热门活动</text>
          <text class="section-more" @click="viewMore('热门活动')">查看更多 ></text>
        </view>
        <view class="activity-list">
          <view class="activity-item" v-for="activity in activities" :key="activity.id"
            @click="navigateToActivity(activity.id)">
            <image class="activity-img" :src="activity.image"></image>
            <view class="activity-info">
              <text class="activity-name">{{ activity.name }}</text>
              <view class="activity-rating">
                <text class="rating">{{ activity.rating }}</text>
                <text class="comments">{{ activity.comments }}</text>
              </view>
              <text class="activity-price">{{ activity.price }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 精选路线 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">精选路线</text>
          <text class="section-more" @click="viewMore('精选路线')">查看更多 ></text>
        </view>
        <view class="route-item" @click="navigateToRoute(1)">
          <view class="hot-tag">
            <image class="hot-img" src="https://wlmtsys.com:9000/travel/角标-推荐.svg"></image>
          </view>
          <image class="route-img" src="https://wlmtsys.com:9000/travel/首页-精选路线.jpg"></image>
          <view class="route-info">
            <text class="route-name">浪漫双岛游游 东澳岛-外伶仃岛2日游</text>
            <view class="route-rating">
              <text class="rating">4.7分</text>
              <text class="comments">| 1205条评论</text>
            </view>
            <text class="route-price">¥328.00起</text>
          </view>
        </view>
      </view>

      <!-- 景点攻略部分 -->
      <view class="spot-section">
        <view class="tabs">
          <view class="tab" :class="{ active: activeTab === '景点攻略' }" @click="switchTab('景点攻略')">景点攻略</view>
          <view class="tab" :class="{ active: activeTab === '酒店住宿' }" @click="switchTab('酒店住宿')">酒店住宿</view>
          <view class="tab" :class="{ active: activeTab === '美食推荐' }" @click="switchTab('美食推荐')">美食推荐</view>
        </view>

        <view class="spot-list">
          <view class="spot-item" v-for="(spot, index) in visibleSpots" :key="index" @click="navigateToSpot(spot.name)">
            <image class="spot-img" :src="spot.image || 'https://wlmtsys.com:9000/travel/retouch_2025032816113042(1).png'"></image>
            <view class="spot-info">
              <view class="spot-name-row">
                <text class="spot-name">{{ spot.name }}</text>
                <text class="spot-rating">{{ spot.rating }}</text>
              </view>
              <view class="spot-price-row">
                <text class="spot-price">{{ spot.price }}</text>
                <text class="spot-comments">{{ spot.comments }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="expand-btn" @click="toggleExpand">
          <text>{{ isExpanded ? '收起' : '展开更多' }}</text>
          <image class="expand-icon"
            :src="isExpanded ? 'https://wlmtsys.com:9000/travel/up.png' : 'https://wlmtsys.com:9000/travel/down.png'">
          </image>
        </view>
      </view>
    </view>

    <view class="blank"></view>

    <!-- 底部导航 -->
    <Tabbar />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';
import { onShow } from '@dcloudio/uni-app';
import Tabbar from '../Tabbar/Tabbar.vue';


const safeAreaInsets = ref({});
const statusBarHeight = ref(0);

const userStore = useUserStore();
const activeTab = ref('景点攻略');
const isExpanded = ref(false);
const activities = ref([]);
const spots = ref([
  { id: 1, name: '鱼仓海市', rating: '4.7分', comments: '1205条', price: '218/人' },
  { id: 2, name: '鱼仓海市', rating: '4.7分', comments: '1205条', price: '218/人' },
  { id: 3, name: '鱼仓海市', rating: '4.7分', comments: '1205条', price: '218/人' },
  { id: 4, name: '鱼仓海市', rating: '4.7分', comments: '1205条', price: '218/人' },
]);

const visibleSpots = computed(() => {
  return isExpanded.value ? spots.value : spots.value.slice(0, 4);
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const imageUrls = ref([]);
const combinedArray = ref([]);

const getSpotsList = (type) => {
  if (type === '景点攻略') {
    uni.request({
      url: 'https://island.zhangshuiyi.com/island/product/ilAttractions/list',
      method: 'GET',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Access-Token': userStore.token
      },
      success: (res) => {
        if (res.data.success) {
          spots.value = res.data.result.records.map(item => ({
            id: item.id || 0,
            name: item.name || '未知名称',
            image: item.imageUrl || 'https://wlmtsys.com:9000/travel/retouch_2025032816113042(1).png',
            rating: (item.rating || 0) + '分',
            comments: (item.commentCount || 0) + '条',
            price: `¥${item.ticketprice || 0}/人`
          }));
        }
      },
      fail: () => {
        console.error('景点攻略数据请求失败');
        uni.showToast({
          title: '景点攻略数据加载失败',
          icon: 'none'
        });
      }
    });
  } else if (type === '酒店住宿') {
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
        console.log("酒店住宿响应数据", res)
        if (res.data.success) {
          spots.value = res.data.result.records.map(item => ({
            id: item.id || 0,
            name: item.name || '未知名称',
            image: item.imageUrl || '/static/index/retouch_2025032816113042(1).png',
            rating: (item.rating || 0) + '分',
            comments: (item.commentCount || 0) + '条',
            price: `¥${item.price || 0}/晚`
          }));
        }
      },
      fail: (err) => {
        console.error('酒店住宿请求失败', err);
        uni.showToast({
          title: '加载失败，请稍后重试',
          icon: 'none'
        });
      }
    });
  } else if (type === '美食推荐') {
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
        console.log("美食推荐响应数据", res)
        if (res.data.success) {
          spots.value = res.data.result.records.map(item => ({
            id: item.id || 0,
            name: item.name || '未知名称',
            image: item.imageUrl || 'https://wlmtsys.com:9000/travel/retouch_2025032816113042(1).png',
            rating: (item.rating || 0) + '分',
            comments: (item.commentCount || 0) + '条',
            price: `¥${item.price || 0}/人`
          }));
        }
      },
      fail: (err) => {
        console.error('美食推荐请求失败', err);
        uni.showToast({
          title: '加载失败，请稍后重试',
          icon: 'none'
        });
      }
    });
  }
};

const switchTab = (tab) => {
  activeTab.value = tab;
  getSpotsList(tab);
};

const viewMore = (type) => {
  uni.navigateTo({
    url: `/pages/${type === '热门活动' ? 'activity/activity' : 'itinerary/itinerary'}`
  });
};

const navigateTo = (destination) => {
  const routes = {
    '景点攻略': '/pages/attractionGuide/attractionGuide',
    '船票预订': '/pages/ticketBooking/ticketBooking',
    '美食推荐': '/pages/foodRecommendation/foodRecommendation',
    '酒店住宿': '/pages/hotelBooking/hotelBooking',
    '停车收费': '/pages/parkingFees/parkingFees',
    '一日畅游': '/pages/dayTravel/dayTravel',
    '社区互动': '/pages/ticketPoints/ticketPoints',
    '更多服务': '/pages/moreServices/moreServices'
  };
  uni.navigateTo({
    url: routes[destination]
  });
};

const navigateToActivity = (id) => {
  console.log("跳转到活动详情页面");
  console.log(`/pages/activity/activity?id=${id}`);
  uni.navigateTo({
    url: `/pages/activity/activity?id=${id}`
  });
};

const navigateToRoute = (routeId) => {
  console.log("跳转到路线详情页面");
  console.log(`/pages/itineraryDetails/itineraryDetails?id=${routeId}`);
  // uni.navigateTo({
  //   url: `/pages/itineraryDetails/itineraryDetails?id=${routeId}`
  // });
  uni.navigateTo({
    url: '/pages/route/route'
  });
};

const navigateToSpot = (spotName) => {
  uni.navigateTo({
    url: '/pages/attractionDetail/attractionDetail',
    success: (res) => {
      res.eventChannel.emit('setSpotData', { name: spotName });
    }
  });
};

const getActivitiesList = () => {
  const params = {
    pageNo: 1,
    pageSize: 300
  };

  uni.request({
    url: 'https://island.zhangshuiyi.com/island/product/ilActivities/list',
    method: 'GET',
    data: params,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token
    },
    success: (res) => {
      if (res.data.success) {
        activities.value = res.data.result.records.map(activity => ({
          id: activity.id,
          name: activity.type,
          image: activity.imageUrl || 'https://wlmtsys.com:9000/travel/首页-热门活动-海钓体验.jpg',
          rating: '4.7分',
          comments: '1205条评论',
          price: '¥' + activity.price + '/人起'
        }));
      }
    },
    fail: () => {
      console.error('网络请求失败');
    }
  });
};

onShow(() => {
  getActivitiesList();
  getSpotsList('景点攻略'); // 默认加载景点数据
});
onMounted(() => {
  const { statusBarHeight: sbHeight, safeAreaInsets: insets } = uni.getSystemInfoSync();
  statusBarHeight.value = sbHeight;
  safeAreaInsets.value = insets;
});
</script>

<style scoped>
.container {
  background-color: #f5f5f5;
}

/* 顶部区域 */
.header {
  position: relative;
  height: 260rpx;
  background-color: transparent;
}

.banner {
  width: 100%;
  height: 100%;
}

.logo {
  position: absolute;
  top: 30rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-img {
  width: 80rpx;
  height: 80rpx;
}

.logo-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #003366;
}

/* 主要内容区 */
.content-box {
  position: relative;
  width: 100%;
  padding: 30rpx 0 0 0;
  background-color: rgb(224, 250, 255);
  /* 淡蓝色背景 */
  border-radius: 50rpx 50rpx 0 0;
  /* 顶部左右角圆角 */
  z-index: 10;
  /* 主要内容区的层级高于顶部区域 */
  top: 80rpx;
}

/* 通知栏 */
.notice {
  display: flex;
  align-items: center;
  background-color: #00b2b2;
  color: white;
  padding: 20rpx;
  margin: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.notice-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.notice-icon {
  font-size: 28rpx;
  font-weight: bold;
  background-color: white;
  color: #00b2b2;
  padding: 5rpx 10rpx;
  border-radius: 5rpx;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.notice-text-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  height: 40rpx;
}

.notice-text {
  font-size: 28rpx;
  white-space: nowrap;
  position: absolute;
  animation: marquee 15s linear infinite;
}

@keyframes marquee {
  0% {
    left: 100%;
    transform: translateX(0);
  }

  100% {
    left: 0;
    transform: translateX(-100%);
  }
}

/* 图标导航 */
.icon-nav {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  padding: 0 20rpx;
  margin: 20rpx;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
}

.icon-bg {
  background-color: white;
  width: 100%;
  height: 100rpx;
  border-radius: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10rpx;
}

.icon {
  width: 80rpx;
  height: 80rpx;
}

.icon-text {
  font-size: 24rpx;
}

/* 热门活动和精选路线的背景颜色与内容区一致 */
.section {
  margin: 20rpx;
  background-color: transparent;
  border-radius: 10rpx;
  padding: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
}

.section-more {
  color: #999;
  font-size: 24rpx;
}

/* 热门活动的卡片样式 */
.activity-list {
  display: flex;
  overflow-x: auto;
  gap: 30rpx;
  padding: 20rpx 0;
  scrollbar-width: none;
  /* 隐藏滚动条 */
  -webkit-overflow-scrolling: touch;
  /* iOS平滑滚动 */
}

.activity-list::-webkit-scrollbar {
  display: none;
  /* 隐藏滚动条 */
}

.activity-item {
  flex: 0 0 280rpx;
  background-color: white;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.activity-img {
  width: 100%;
  height: 200rpx;
  object-fit: cover;
}

.activity-info {
  padding: 10rpx;
}

.activity-name {
  font-size: 28rpx;
  margin: 10rpx 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-rating {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.activity-price {
  color: #ff6600;
  font-size: 28rpx;
  font-weight: bold;
  margin-top: 10rpx;
}

/* 精选路线卡片样式 */
.route-item {
  position: relative;
  background-color: white;
  border-radius: 10rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.hot-tag {
  position: absolute;
  top: 0;
  left: 0;
}

.hot-img {
  width: 80rpx;
  height: 40rpx;
}

.route-img {
  width: 100%;
  height: 300rpx;
}

.route-info {
  padding: 10rpx;
}

.route-name {
  font-size: 32rpx;
  margin-bottom: 10rpx;
}

.route-rating {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.route-price {
  color: #ff6600;
  font-size: 28rpx;
  font-weight: bold;
}

/* 景点攻略部分 */
.spot-section {
  /* margin: 20rpx; */
  padding: 20rpx;
  background-color: rgb(240, 253, 255);
  /* 更淡的蓝色背景 */
  border-radius: 40rpx;
  /* 顶部左右角圆角 */
}

.tabs {
  display: flex;
  justify-content: space-around;
  /* background-color: white; */
  padding: 10rpx 0;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}

.tab {
  padding: 10rpx 20rpx;
  font-size: 28rpx;
}

.tab.active {
  color: #1e9eff;
  border-bottom: 4rpx solid #1e9eff;
}

.spot-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.expand-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20rpx;
  background-color: white;
  border-radius: 10rpx;
  margin-top: 10rpx;
  font-size: 28rpx;
  color: #1e9eff;
}

.expand-icon {
  width: 24rpx;
  height: 24rpx;
  margin-left: 10rpx;
}

.spot-item {
  background-color: white;
  border-radius: 10rpx;
  overflow: hidden;
}

.spot-img {
  width: 100%;
  height: 180rpx;
}

.spot-info {
  padding: 10rpx;
  display: flex;
  flex-direction: column;
}

.spot-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.spot-name {
  font-size: 28rpx;
  flex: 1;
}

.spot-rating {
  font-size: 24rpx;
  color: #1e9eff;
  /* 淡蓝色 */
}

.spot-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.spot-price {
  color: #ff6600;
  font-size: 28rpx;
  font-weight: bold;
}

.spot-comments {
  font-size: 24rpx;
  color: #666;
}

/* 底部导航 */
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background-color: white;
  padding: 20rpx 0;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tabbar-icon {
  width: 40rpx;
  height: 40rpx;
  margin-bottom: 5rpx;
}

.tabbar-text {
  font-size: 24rpx;
  color: #666;
}

.tabbar-item.active .tabbar-text {
  color: #1e9eff;
}

/* 占位的 */
.blank {
  height: 200rpx;
}
</style>