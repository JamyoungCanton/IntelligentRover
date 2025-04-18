<template>
  <view class="page">
    <view class="nav-bar fixed-top flex-row items-center px-32" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
      <view class="flex-row items-center text-white">
        <uni-icons type="spinner-cycle" size="24" color="#FFFFFF" />
        <text class="nav-title">海岛智游侠</text>
        <uni-icons type="spinner-cycle" size="24" color="#FFFFFF" />
      </view>
    </view>
    <scroll-view class="main-content" scroll-y @scroll="handleScroll">
      <!-- 轮播图 -->
      <view class="banner-container">
        <swiper class="swiper" circular :indicator-dots="indicatorDots" :autoplay="autoplay" :interval="interval"
          :duration="duration">
          <swiper-item>
            <image src="http://island.zhangshuiyi.com/static_file/attractions/8海龟保护区.jpg"
              mode="aspectFill" class="swiper-item" />
          </swiper-item>
          <swiper-item>
            <image src="https://ai-public.mastergo.com/ai/img_res/a44a5f661a986db716a71f19589a90e9.jpg"
              mode="aspectFill" class="swiper-item" />
          </swiper-item>
          <swiper-item>
            <image src="https://wlmtsys.com:9000/travel/18.jpg" mode="aspectFill"
              class="swiper-item" />
          </swiper-item>
          <swiper-item>
            <image src="http://island.zhangshuiyi.com/static_file/attractions/10珊瑚礁区.jpg"
              mode="aspectFill" class="swiper-item" />
          </swiper-item>
        </swiper>
        
        <!-- 搜索框 -->
        <view class="search-box">
          <uni-icons type="search" size="16" color="#1E88E5" />
          <input type="text" class="search-input" placeholder="搜索景点/美食/住宿" />
        </view>
      </view>

      <!-- 功能导航 -->
      <view class="grid-container animate-fade-in">
        <view v-for="(item, index) in gridItems" :key="index" class="grid-item" @click="navigateTo(item.path)">
          <view class="grid-image-container" :class="{'animate-float': animateIndex === index}">
            <image :src="item.image" mode="aspectFill" />
          </view>
          <text class="grid-text">{{ item.text }}</text>
        </view>
      </view>

      <!-- 热门活动 -->
      <view class="section animate-slide-up" :class="{'visible': scrollPosition > 200}">
        <text class="section-title">热门活动</text>
        <view class="activity-grid">
          <view v-for="(activity, index) in displayedActivities" :key="index" class="activity-card"
            @click="navigateToActivity(activity.id)">
            <image :src="activity.image" mode="aspectFill" class="activity-image" />
            <view class="activity-info">
              <text class="activity-title">{{ activity.title }}</text>
              <text class="activity-price">{{ activity.price }}</text>
            </view>
          </view>
        </view>
        <view v-if="activities.length > 9" class="expand-btn" @click="toggleActivities">
          {{ isExpanded ? '收起' : '展开更多活动' }}
        </view>
      </view>

      <!-- 精选路线 -->
      <view class="section animate-slide-up" :class="{'visible': scrollPosition > 400}" style="animation-delay: 0.2s;">
        <text class="section-title">精选路线</text>
        <view class="route-card" @click="navigateToRoute">
          <image src="https://ai-public.mastergo.com/ai/img_res/29f6b0ecc3a2e6885a39cbde9d4a762e.jpg" mode="aspectFill"
            class="route-image" />
          <view class="route-info">
            <text class="route-title">海岸线探索</text>
            <text class="route-desc">东澳岛-外伶仃岛 2日游</text>
            <text class="route-price">¥688/人起</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="ai-float-btn animate-pulse" @click="navigateToChat" @touchstart="startDrag" @touchmove="moveDrag" @touchend="endDrag"
      :style="{ left: dragX + 'px', top: dragY + 'px' }">
      <view class="ai-btn">
        <img src="https://wlmtsys.com:9000/travel/logo.png" alt="" style="width: 45px;height: 45px;">
      </view>
      <text class="ai-text">智能导游</text>
    </view>

    <Tabbar />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user';
import Tabbar from '../Tabbar/Tabbar.vue';

const background = ref(['color1', 'color2', 'color3'])
const indicatorDots = ref(true)
const autoplay = ref(true)
const interval = ref(2000)
const duration = ref(500)

// 添加动画状态
const animationReady = ref(false);
const scrollPosition = ref(0);
const animateIndex = ref(-1);

// 处理滚动事件
const handleScroll = (e) => {
  scrollPosition.value = e.detail.scrollTop;
};

// 定时切换动画的图标
const startIconAnimation = () => {
  setInterval(() => {
    animateIndex.value = Math.floor(Math.random() * 8);
    setTimeout(() => {
      animateIndex.value = -1;
    }, 2000);
  }, 3000);
};

onMounted(() => {
  setTimeout(() => {
    animationReady.value = true;
  }, 100);
  
  // 启动图标动画
  startIconAnimation();
});

const getMore = () => {
  uni.showToast({
    title: '点击查看更多',
    icon: 'none'
  })
}

const changeIndicatorDots = () => {
  indicatorDots.value = !indicatorDots.value
}

const changeAutoplay = () => {
  autoplay.value = !autoplay.value
}

const intervalChange = (e) => {
  interval.value = e.target.value
}

const durationChange = (e) => {
  duration.value = e.target.value
}

const dragX = ref(uni.getSystemInfoSync().screenWidth - 58); // 96 是按钮的宽度
const dragY = ref((uni.getSystemInfoSync().screenHeight - 58) / 2);
const startX = ref(0);
const startY = ref(0);
const offsetX = ref(0);
const offsetY = ref(0);


const userStore = useUserStore();

const startDrag = (e) => {
  const { clientX, clientY } = e.touches[0];
  startX.value = clientX;
  startY.value = clientY;
  offsetX.value = dragX.value;
  offsetY.value = dragY.value;
};

const moveDrag = (e) => {
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

const gridItems = [
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/298a09126b167b2389171cf1732d0efd.jpg',
    text: '景点攻略',
    path: '/pages/attractionGuide/attractionGuide'
  },
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/67e82bbc342b0532a7d47d9a9495e4e6.jpg',
    text: '船票预订',
    path: '/pages/ticketBooking/ticketBooking'
  },
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/a46f5a2748b96ebacfead5f2ce9a2d23.jpg',
    text: '美食推荐',
    path: '/pages/foodRecommendation/foodRecommendation'
  },
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/d4eaef4d2ae27ea58ef90ce8114cbbc0.jpg',
    text: '住宿预订',
    path: '/pages/hotelBooking/hotelBooking'
  },
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/6e3b763c2b9b0240282a50a27279cc92.jpg',
    text: '停车收费',
    path: '/pages/parkingFees/parkingFees'
  },
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/868a88ac3f0c7165d1ff7e4edcd8c6de.jpg',
    text: '社区互动',
    path: '/pages/ticketPoints/ticketPoints'
  },
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/ff98fe41d0920a84166f2cb230b71b03.jpg',
    text: '一日游',
    path: '/pages/dayTravel/dayTravel'
  },
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/a23f3a06a4a4106ad0a8dbe37d4ba3c8.jpg',
    text: '更多服务',
    path: '/pages/moreServices/moreServices'
  }
];

const activities = ref([
  {
    id: 1,
    image: 'https://ai-public.mastergo.com/ai/img_res/8b2e19990586b743036f49f399c57074.jpg',
    title: '海钓',
    price: '¥288/人起'
  },
  {
    id: 2,
    image: 'https://ai-public.mastergo.com/ai/img_res/553e2a3f698900f0619f5ee2615903a9.jpg',
    title: '浮潜',
    price: '¥368/人起'
  },
  {
    id: 3,
    image: 'https://ai-public.mastergo.com/ai/img_res/a44a5f661a986db716a71f19589a90e9.jpg',
    title: '徒步',
    price: '¥198/人起'
  }
]);

const quickActions = [
  { icon: 'calendar', text: '2 天行程' },
  { icon: 'spinner-cycle', text: '我想去海钓' },
  { icon: 'spinner-cycle', text: '美食推荐' },
  { icon: 'spinner-cycle', text: '住宿预订' }
];

const navigateTo = (path) => {
  uni.navigateTo({
    url: path
  });
};

// 跳转到 chat 页面
const navigateToChat = () => {
  uni.switchTab({
    url: '/pages/chat/chat'
  });
};

// 跳转到 热门活动 页面
const navigateToActivity = (id) => {
  console.log("跳转到活动详情页面")
  console.log(`/pages/activity/activity?id=${id}`)
  uni.navigateTo({
    url: `/pages/activity/activity?id=${id}`
  });
};

// 跳转到 精选路线 页面
const navigateToRoute = () => {
  uni.navigateTo({
    url: '/pages/route/route'
  });
};

const scrollLeft = ref(0);
const scrollWidth = ref(0);
const sliderValue = ref(0);

// 控制活动展示的响应式变量
const isExpanded = ref(false);
const displayedActivities = computed(() => {
  return isExpanded.value ? activities.value : activities.value.slice(0, 9);
});

// 切换活动展开/收起的方法
const toggleActivities = () => {
  isExpanded.value = !isExpanded.value;
};

const onScroll = (e) => {
  const scrollLeft = e.detail.scrollLeft;
  const scrollView = uni.createSelectorQuery().select('.activity-container');
  scrollView.fields({
    scrollOffset: true,
    size: true
  }, (res) => {
    const maxScroll = res.scrollWidth - res.width;
    const value = (scrollLeft / maxScroll) * 100;
    sliderValue.value = value;
  }).exec();
};

// 获取屏幕安全距离
const safeAreaInsets = ref(uni.getSystemInfoSync().safeAreaInsets || { top: 0 });


// 发起请求获取活动列表
const getActivitiesList = () => {
  // 构建请求参数
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
      console.log('活动列表响应数据:', res.data);
      // 如果请求成功，更新活动
      if (res.data.success) {
        // 清空activities数组
        activities.value = [];

        // 遍历响应数据，将活动信息添加到activities数组中
        const activityList = res.data.result.records
        for (let activity of activityList) {
          activities.value.push({
            id: activity.id,
            image: activity.imageUrl || 'https://ai-public.mastergo.com/ai/img_res/8b2e19990586b743036f49f399c57074.jpg',
            title: activity.type,
            price: '¥' + activity.price + '/人起'
          })
        }

      }
    },
    fail: () => {
      // 处理请求失败的场景
      console.error('网络请求失败');
    }

  })
}

// 每次进入页面时调用
onShow(() => {
  // 发起请求获取活动列表
  getActivitiesList();
});
</script>

<style>
page {
  height: 100%;
  background-color: #E3F2FD;
  background-image: linear-gradient(to bottom, #BBDEFB, #E3F2FD);
}

.page {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 90rpx;
  background-color: #1976D2;
  background-image: linear-gradient(to right, #1976D2, #2196F3);
  z-index: 100;
  box-sizing: border-box;
}

.nav-title {
  font-size: 42rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin: 0 16rpx;
  font-family: 'Cursive', cursive;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.main-content {
  position: relative;
  flex: 1;
  overflow: auto;
  padding-bottom: 30rpx;
  box-sizing: border-box;
}

.banner-container {
  position: relative;
  width: 100%;
  margin-bottom: 20rpx;
  padding: 20rpx;
  box-sizing: border-box;
}

.swiper {
  height: 380rpx;
  width: 100%;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
}

.swiper-item {
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
}

.search-box {
  position: absolute;
  top: 40rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  width: 80%;
  height: 70rpx;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 35rpx;
  padding: 0 32rpx;
  z-index: 999;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
}

.search-input {
  flex: 1;
  height: 70rpx;
  font-size: 28rpx;
  margin-left: 16rpx;
  color: #555;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  padding: 30rpx 20rpx;
  background-color: #FFFFFF;
  border-radius: 20rpx;
  margin: 0 20rpx 20rpx 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
  background-image: linear-gradient(to bottom, #FFFFFF, #F5F9FF);
  box-sizing: border-box;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
}

.grid-item:active {
  transform: scale(0.95);
}

.grid-image-container {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(33, 150, 243, 0.2);
  transition: all 0.3s ease;
  border: 2rpx solid #E3F2FD;
}

.grid-image-container image {
  width: 100%;
  height: 100%;
}

.grid-text {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #444444;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120rpx;
  text-align: center;
}

.section {
  padding: 30rpx 20rpx;
  background-color: #FFFFFF;
  border-radius: 20rpx;
  margin: 0 20rpx 20rpx 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
  opacity: 0;
  transform: translateY(30rpx);
  transition: opacity 0.5s ease, transform 0.5s ease;
  background-image: linear-gradient(to bottom, #FFFFFF, #F5F9FF);
  box-sizing: border-box;
}

.section.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1976D2;
  margin-bottom: 30rpx;
  padding-left: 10rpx;
  border-left: 8rpx solid #1976D2;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.activity-card {
  width: 100%;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  background-color: #FFFFFF;
  transition: all 0.3s ease;
  border: 1px solid #E3F2FD;
}

.activity-card:active {
  transform: translateY(-5rpx);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
}

.expand-btn {
  text-align: center;
  color: #FFFFFF;
  padding: 20rpx;
  margin-top: 30rpx;
  font-size: 28rpx;
  background-color: #1976D2;
  background-image: linear-gradient(to right, #1976D2, #2196F3);
  border-radius: 30rpx;
  width: 60%;
  margin: 30rpx auto 0;
  box-shadow: 0 4rpx 12rpx rgba(33, 150, 243, 0.2);
  transition: all 0.3s ease;
}

.expand-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(33, 150, 243, 0.15);
}

.activity-image {
  width: 100%;
  height: 180rpx;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.activity-card:hover .activity-image {
  transform: scale(1.05);
}

.activity-info {
  padding: 12rpx 16rpx;
  display: flex;
  flex-direction: column;
}

.activity-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #444444;
  margin-bottom: 6rpx;
}

.activity-price {
  font-size: 24rpx;
  color: #1976D2;
  font-weight: 500;
}

.route-card {
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  background-color: #FFFFFF;
  transition: all 0.3s ease;
  border: 1px solid #E3F2FD;
}

.route-card:active {
  transform: translateY(-5rpx);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.route-image {
  width: 100%;
  height: 320rpx;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.route-card:hover .route-image {
  transform: scale(1.03);
}

.route-info {
  padding: 20rpx;
}

.route-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #444444;
}

.route-desc {
  font-size: 26rpx;
  color: #888888;
  margin-top: 8rpx;
}

.route-price {
  font-size: 28rpx;
  color: #1976D2;
  margin-top: 12rpx;
  font-weight: 500;
}

.ai-float-btn {
  position: fixed;
  right: 30rpx;
  bottom: 160rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
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

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(30rpx); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
  100% { transform: translateY(0); }
}

@keyframes wave {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out forwards;
}

.animate-pulse {
  animation: pulse 2s infinite;
}

.animate-float {
  animation: float 2s ease infinite;
}

/* 响应式调整 */
@media screen and (max-width: 375px) {
  .grid-container {
    gap: 10rpx;
    padding: 20rpx 10rpx;
  }
  
  .grid-image-container {
    width: 90rpx;
    height: 90rpx;
  }
  
  .activity-grid {
    gap: 15rpx;
  }
  
  .activity-title {
    font-size: 26rpx;
  }
  
  .activity-price {
    font-size: 22rpx;
  }
}

@media screen and (min-width: 768px) {
  .grid-container {
    gap: 40rpx;
    padding: 40rpx;
  }
  
  .grid-image-container {
    width: 120rpx;
    height: 120rpx;
  }
  
  .activity-grid {
    gap: 30rpx;
  }
  
  .activity-image {
    height: 220rpx;
  }
  
  .activity-info {
    padding: 20rpx;
  }
  
  .activity-title {
    font-size: 30rpx;
  }
  
  .activity-price {
    font-size: 26rpx;
  }
}
</style>