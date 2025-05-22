<template>
  <view class="container">


    <!-- 顶部区域 -->
    <view class="header" :style="{ paddingTop: `${statusBarHeight}px` }">
      <!-- <view class="header"> -->

      <!-- 顶部导航 -->
      <view class="nav-bar fixed-top flex-row items-center px-32" :style="{ paddingTop: safeAreaInsets.top + 'px' }"
        style="position: fixed; top: 0; left: 0; right: 0; z-index: 9999;">
        <view class="flex-row items-center text-white">
          <uni-icons type="spinner-cycle" size="24" color="#FFFFFF" />
          <text class="nav-title"
            style="color: #FFFFFF; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;">海岛智游侠</text>
          <uni-icons type="spinner-cycle" size="24" color="#FFFFFF" />
        </view>
      </view>

      <!-- 轮播图 -->
      <swiper class="banner-swiper" :autoplay="true" :interval="3000" :circular="true">
        <swiper-item v-for="(item, index) in bannerList" :key="index">
          <image class="banner" :src="item" mode="widthFix"></image>
        </swiper-item>
      </swiper>

      <!-- <view class="logo">
      <image class="logo-img" src="https://wuminghui.top:9000/travel/LOGO.png"></image>
      <text class="logo-text">海岛智游侠</text>
      </view> -->
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
            <image class="icon" src="https://wuminghui.top:9000/travel/首页-景点攻略.svg"></image>
          </view>
          <text class="icon-text">景点攻略</text>
        </view>
        <view class="icon-item" @click="navigateTo('船票预订')">
          <view class="icon-bg">
            <image class="icon" src="https://wuminghui.top:9000/travel/首页-船票预订.svg"></image>
          </view>
          <text class="icon-text">船票预订</text>
        </view>
        <view class="icon-item" @click="navigateTo('美食推荐')">
          <view class="icon-bg">
            <image class="icon" src="https://wuminghui.top:9000/travel/首页-美食推荐.svg"></image>
          </view>
          <text class="icon-text">美食推荐</text>
        </view>
        <view class="icon-item" @click="navigateTo('酒店住宿')">
          <view class="icon-bg">
            <image class="icon" src="https://wuminghui.top:9000/travel/首页-酒店住宿.svg"></image>
          </view>
          <text class="icon-text">酒店住宿</text>
        </view>
        <view class="icon-item" @click="navigateTo('停车收费')">
          <view class="icon-bg">
            <image class="icon" src="https://wuminghui.top:9000/travel/首页-停车收费.svg"></image>
          </view>
          <text class="icon-text">停车收费</text>
        </view>
        <view class="icon-item" @click="navigateTo('一日畅游')">
          <view class="icon-bg">
            <image class="icon" src="https://wuminghui.top:9000/travel/首页-一日畅游.svg"></image>
          </view>
          <text class="icon-text">一日畅游</text>
        </view>
        <view class="icon-item" @click="navigateTo('社区互动')">
          <view class="icon-bg">
            <image class="icon" src="https://wuminghui.top:9000/travel/首页-社区互动.svg"></image>
          </view>
          <text class="icon-text">社区互动</text>
        </view>
        <view class="icon-item" @click="navigateTo('更多服务')">
          <view class="icon-bg">
            <image class="icon" src="https://wuminghui.top:9000/travel/首页-更多服务.svg"></image>
          </view>
          <text class="icon-text">更多服务</text>
        </view>
      </view>

      <!-- 会员充值卡片 -->
      <!-- <view class="member-card" @click="navigateToMembership">
        <view class="member-card-left">
          <view class="member-title">会员专享</view>
          <view class="member-desc">享受更多折扣与特权</view>
        </view>
        <view class="member-btn">立即充值</view>
      </view> -->

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
              <view class="price-container">
                <text class="activity-price">{{ activity.memberPrice }}</text>
                <text class="original-price" v-if="activity.originalPrice">{{ activity.originalPrice }}</text>
              </view>
              <!-- <view class="member-price" v-if="activity.memberPrice">
                <text class="member-tag">会员价</text>
                <text class="member-price-value">{{ activity.memberPrice }}</text>
              </view> -->
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
          <view class="route-hot-tag">
            <image class="hot-img" src="https://wuminghui.top:9000/travel/角标-推荐.svg"></image>
          </view>
          <image class="route-img" src="https://wuminghui.top:9000/travel/首页-精选路线.jpg"></image>
          <view class="route-info">
            <text class="route-name">浪漫双岛游游 东澳岛-外伶仃岛2日游</text>
            <view class="route-rating">
              <text class="rating">4.7分</text>
              <text class="comments"> 1205条评论</text>
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
          <view class="spot-item" v-for="(spot, index) in visibleSpots" :key="index"
            @click="navigateToSpot(activeTab, spot.id)">
            <image class="spot-img"
              :src="spot.image || 'https://wuminghui.top:9000/travel/retouch_2025032816113042(1).png'"></image>
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
        <!-- 注释掉展开更多按钮但保留代码 -->
        <!-- <view class="expand-btn" @click="toggleExpand">
          <text>{{ isExpanded ? '收起' : '展开更多' }}</text>
          <image class="expand-icon"
            :src="isExpanded ? 'https://wuminghui.top:9000/travel/up.png' : 'https://wuminghui.top:9000/travel/down.png'">
          </image>
        </view> -->
      </view>
    </view>

    <view class="blank"></view>

    <!-- 底部导航 -->
    <Tabbar />

    <!-- AI悬浮窗 -->
    <view class="ai-float-btn animate-pulse" @click="navigateToChat" @touchstart="startDrag" @touchmove="moveDrag"
      @touchend="endDrag" :style="{ left: dragX + 'px', top: dragY + 'px' }">
      <view class="ai-btn">
        <img src="https://wuminghui.top:9000/travel/logo.png" alt="" style="width: 45px;height: 45px;">
      </view>
      <text class="ai-text">智能导游</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';
import { onShow } from '@dcloudio/uni-app';
import Tabbar from '../Tabbar/Tabbar.vue';


const safeAreaInsets = ref({});
const statusBarHeight = ref(0);
const bannerList = ref([
  'https://wuminghui.top:9000/travel/Banner1.jpg',
  'https://wuminghui.top:9000/travel/Banner2.jpg',
  'https://wuminghui.top:9000/travel/Banner3.jpg'

]);

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
  // return isExpanded.value ? spots.value : spots.value.slice(0, 4);
  return spots.value; // 修改为始终返回全部景点
});

// 注释掉但保留展开/收起方法
// const toggleExpand = () => {
//   isExpanded.value = !isExpanded.value;
// };

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
            image: item.imageUrl || 'https://wuminghui.top:9000/travel/retouch_2025032816113042(1).png',
            rating: (item.rating || 0) + '分',
            comments: (item.commentCount || 0) + '条',
            price: item.ticketprice === 0 ? '免费' : `¥${item.ticketprice}/人`
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
            price: item.price === 0 ? '免费' : `¥${item.price}/晚`
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
            image: item.imageUrl || 'https://wuminghui.top:9000/travel/retouch_2025032816113042(1).png',
            rating: (item.rating || 0) + '分',
            comments: (item.commentCount || 0) + '条',
            price: item.price === 0 ? '免费' : `¥${item.price}/人`
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
  if (destination === '社区互动') {
    // 如果是社区互动页面，使用 uni.switchTab
    uni.switchTab({
      url: routes[destination]
    });
  } else {
    // 其他页面使用 uni.navigateTo
    uni.navigateTo({
      url: routes[destination]
    });
  }
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

const navigateToSpot = (type, id) => {
  console.log(type, id)
  let url = '';
  switch (type) {
    case '景点攻略':
      url = `/pages/attractionDetail/attractionDetail?id=${id}`;
      break;
    case '美食推荐':
      url = `/pages/foodDetails/foodDetails?id=${id}`;
      break;
    case '酒店住宿':
      url = `/pages/hotelDetail/hotelDetail?id=${id}`;
      break;
  }
  uni.navigateTo({
    url: url
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
        activities.value = res.data.result.records.map(activity => {
          // 根据价格随机生成折扣信息
          const price = parseFloat(activity.price) || 100;
          const discount = Math.floor(Math.random() * 3) + 7; // 生成7-9之间的随机数
          const discountRate = discount / 10; // 折扣率，0.7-0.9
          const originalPrice = Math.floor(price / discountRate);
          const memberPrice = Math.floor(price * 0.9); // 优惠价格比当前价格再便宜10%
          
          return {
            id: activity.id,
            name: activity.type,
            image: activity.imageUrl || 'https://wuminghui.top:9000/travel/首页-热门活动-海钓体验.jpg',
            rating: '4.7分',
            comments: '1205条评论',
            price: '¥' + activity.price + '/人起',
            originalPrice: '¥' + originalPrice + '/人',
            discount: discount + '折',
            memberPrice: '¥' + memberPrice + '/人'
          };
        });
      }
    },
    fail: () => {
      console.error('网络请求失败');
    }
  });
};


// AI悬浮窗
const dragX = ref(uni.getSystemInfoSync().screenWidth - 58); // 96 是按钮的宽度
const dragY = ref((uni.getSystemInfoSync().screenHeight - 58) / 2);
const startX = ref(0);
const startY = ref(0);
const offsetX = ref(0);
const offsetY = ref(0);
// 跳转到 chat 页面
const navigateToChat = () => {
  uni.switchTab({
    url: '/pages/chat/chat'
  });
};

const startDrag = (e) => {
  const { clientX, clientY } = e.touches[0];
  startX.value = clientX;
  startY.value = clientY;
  offsetX.value = dragX.value;
  offsetY.value = dragY.value;
};

const moveDrag = (e) => {
  e.preventDefault(); // 阻止默认滚动行为
  const { clientX, clientY } = e.touches[0];
  const x = clientX - startX.value + offsetX.value;
  const y = clientY - startY.value + offsetY.value;
  // 实时限制按钮在页面内
  const screenWidth = uni.getSystemInfoSync().screenWidth;
  const screenHeight = uni.getSystemInfoSync().screenHeight;

  dragX.value = Math.max(0, Math.min(x, screenWidth - 58));
  dragY.value = Math.max(0, Math.min(y, screenHeight - 96));
};

const endDrag = () => {
  const screenWidth = uni.getSystemInfoSync().screenWidth;
  const screenHeight = uni.getSystemInfoSync().screenHeight;

  // 限制按钮在页面内
  dragX.value = Math.max(0, Math.min(dragX.value, screenWidth)) // 96 是按钮的宽度
  dragY.value = Math.max(0, Math.min(dragY.value, screenHeight - 96)); // 96 是按钮的高度

};

// 会员充值导航
const navigateToMembership = () => {
  uni.navigateTo({
    url: '/pages/membership/membership'
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

.banner-swiper {
  width: 100%;
  height: 500rpx;
  position: absolute;
  top: 0;
  left: 0;
}

.banner {
  width: 100%;
  height: 260rpx;
  position: absolute;
  top: 0;
  left: 0;
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
  /* padding: 30rpx 0 0 0; */
  background-color: rgb(224, 250, 255);
  /* 淡蓝色背景 */
  border-radius: 50rpx 50rpx 0 0;
  /* 顶部左右角圆角 */
  z-index: 10;
  /* 主要内容区的层级高于顶部区域 */
  top: 0rpx;
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

/* 会员充值卡片 */
.member-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #0098cc 0%, #005b94 100%);
  padding: 12rpx 20rpx;
  margin: 20rpx;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.member-card::before {
  content: "";
  position: absolute;
  top: -20rpx;
  right: -20rpx;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
  z-index: 1;
}

.member-card::after {
  content: "";
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  z-index: 1;
}

.member-card-left {
  flex: 1;
  position: relative;
  z-index: 2;
}

.member-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 4rpx;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.2);
}

.member-desc {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.9);
}

.member-btn {
  background: linear-gradient(135deg, #fff 0%, #e6f7ff 100%);
  color: #0076cf;
  padding: 6rpx 16rpx;
  border-radius: 30rpx;
  font-size: 22rpx;
  font-weight: bold;
  display: inline-block;
  margin-left: 20rpx;
  position: relative;
  z-index: 2;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
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

.activity-rating .rating::after {
  content: "|";
  margin: 0 8rpx;
  color: #ccc;
}

.activity-price {
  color: #ff6600;
  font-size: 28rpx;
  font-weight: bold;
}

/* 添加热门活动价格容器样式 */
.price-container {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 6rpx;
}

.original-price {
  color: #999;
  font-size: 22rpx;
  text-decoration: line-through;
}

/* 会员价样式 */
.member-price {
  display: flex;
  align-items: center;
  margin-top: 6rpx;
}

.member-tag {
  background-color: #FF9500;
  color: white;
  font-size: 18rpx;
  padding: 2rpx 6rpx;
  border-radius: 4rpx;
  margin-right: 6rpx;
}

.member-price-value {
  color: #FF9500;
  font-size: 24rpx;
  font-weight: bold;
}

/* 热门标签和折扣标签样式 */
.hot-tag {
  position: absolute;
  top: 10rpx;
  left: 0;
  background-color: #FF3B30;
  color: white;
  font-size: 20rpx;
  padding: 3rpx 10rpx 3rpx 15rpx;
  border-radius: 0 15rpx 15rpx 0;
  z-index: 1;
}

.discount-tag {
  position: absolute;
  top: 40rpx;
  right: 10rpx;
  background-color: #FF9500;
  color: white;
  font-size: 20rpx;
  padding: 3rpx 10rpx;
  border-radius: 15rpx;
  z-index: 1;
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

.route-rating .rating::after {
  content: "|";
  margin: 0 8rpx;
  color: #ccc;
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

/* AI悬浮窗 */
.ai-float-btn {
  position: fixed;
  right: 30rpx;
  bottom: 160rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
}

.animate-pulse {
  animation: pulse 2s infinite;
}

.ai-text {
  font-size: 22rpx;
  color: #FFFFFF;
  background-color: #1976D2;
  padding: 6rpx 20rpx;
  border-radius: 12rpx;
  margin-top: 10rpx;
  white-space: nowrap;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.ai-btn {
  width: 100rpx;
  height: 100rpx;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #E3F2FD;
}

.ai-btn:active {
  transform: scale(0.95);
}

.ai-btn image {
  width: 70rpx;
  height: 70rpx;
  object-fit: contain;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 90rpx;
  background-color: transparent;
  /* Changed from blue to transparent */
  background-image: none;
  /* Removed gradient */
  z-index: 100;
  box-sizing: border-box;
}

.nav-title {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  /* Added text shadow for better visibility against banner */
}
</style>
