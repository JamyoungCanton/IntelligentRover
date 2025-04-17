<template>
  <view class="page">
    <view class="nav-bar fixed-top flex-row items-center px-32" :style="{ paddingTop: safeAreaInsets.top + 'px' }">
      <view class="flex-row items-center text-white">
        <uni-icons type="spinner-cycle" size="24" color="#4CAF50" />
        <uni-icons type="spinner-cycle" size="24" color="#FFD700" />
        <text class="nav-title">海岛智游侠</text>
        <uni-icons type="spinner-cycle" size="24" color="#FFD700" />
        <uni-icons type="spinner-cycle" size="24" color="#4CAF50" />
      </view>
    </view>
    <scroll-view class="main-content" scroll-y>
      <!-- 一个公告飘屏 -->
      <uni-notice-bar show-icon scrollable background-color="#EAF2FF" class="notice-bar"
        text="欢迎来到海岛智游侠，这里为您带来意想不到的海岛之旅，欢乐无限，期待您的到来~" />
		<view class="search-container">
		    <view class="search-box">
		        <uni-icons type="search" size="16" color="#999" />
		        <input type="text" class="search-input" placeholder="搜索景点/美食/住宿" />
		    </view>
		</view>
      <view class="uni-margin-wrap">
        <swiper class="swiper" circular :indicator-dots="indicatorDots" :autoplay="autoplay" :interval="interval"
          :duration="duration">
          <swiper-item>
            <image src="https://ai-public.mastergo.com/ai/img_res/a44a5f661a986db716a71f19589a90e9.jpg"
              style="height: 300px" mode="aspectFill" class="swiper-item" />
          </swiper-item>
          <swiper-item>
            <image src="http://island.zhangshuiyi.com/static_file/attractions/8海龟保护区.jpg" style="height: 300px"
              mode="aspectFill" class="swiper-item" />
          </swiper-item>
          <swiper-item>
            <image src="https://wlmtsys.com:9000/travel/18.jpg" style="height: 300px" mode="aspectFill"
              class="swiper-item" />
          </swiper-item>
          <swiper-item>
            <image src="http://island.zhangshuiyi.com/static_file/attractions/10珊瑚礁区.jpg" style="height: 300px"
              mode="aspectFill" class="swiper-item" />
          </swiper-item>

        </swiper>
      </view>

      <view class="grid-container">
        <view v-for="(item, index) in gridItems" :key="index" class="grid-item" @click="navigateTo(item.path)">
          <view class="grid-image-container">
            <image :src="item.image" mode="aspectFill" />
          </view>
          <text class="grid-text">{{ item.text }}</text>
        </view>
      </view>

      <view class="section">
        <text class="section-title">热门活动</text>
        <view class="activity-grid">
          <view v-for="(activity, index) in displayedActivities" :key="index" class="activity-card"
            @click="navigateToActivity(activity.id)">
            <image :src="activity.image" mode="aspectFill" class="activity-image" />
            <p><view class="activity-info">
              <text class="activity-title">{{ activity.title }}</text>
              <text class="activity-price">{{ activity.price }}</text>
            </view></p>
          </view>
        </view>
        <view v-if="activities.length > 9" class="expand-btn" @click="toggleActivities">
          {{ isExpanded ? '收起' : '展开更多活动' }}
        </view>
      </view>

      <view class="section">
        <text class="section-title">精选路线</text>
        <view class="route-card" @click="navigateToRoute">
          <image src="https://ai-public.mastergo.com/ai/img_res/29f6b0ecc3a2e6885a39cbde9d4a762e.jpg" mode="aspectFill"
            class="route-image" />
          <view class="route-info">
            <text class="route-title">浪漫双岛游</text>
            <text class="route-desc">东澳岛-外伶仃岛 2日游</text>
            <text class="route-price">¥688/人起</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="ai-float-btn" @click="navigateToChat" @touchstart="startDrag" @touchmove="moveDrag" @touchend="endDrag"
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
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user';
import Tabbar from '../Tabbar/Tabbar.vue';

const background = ref(['color1', 'color2', 'color3'])
const indicatorDots = ref(true)
const autoplay = ref(true)
const interval = ref(2000)
const duration = ref(500)

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
    title: '海钓体验',
    price: '¥288/人起'
  },
  {
    id: 2,
    image: 'https://ai-public.mastergo.com/ai/img_res/553e2a3f698900f0619f5ee2615903a9.jpg',
    title: '深潜探索',
    price: '¥368/人起'
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
  background-color: #f5f5f5;
}

.page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  display: flex;
  align-items: center;
  width: 100%;
  height: 78rpx;
  background-color: #4A88FF;
  z-index: 100;
}

.nav-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin: 0 16rpx;
  font-family: 'Cursive', cursive;
}

.main-content {
  position: relative;
  flex: 1;
  overflow: auto;
}

.search-box{
	position: absolute;
	top: 80px;
	right: 30px;
	align-items: center;
	display: flex;
	width: 300px;
	height: 80rpx;
	background-color: rgba(245, 245, 245, 0.7);
	border-radius: 8rpx;
	padding: 0 32rpx;
	z-index: 999;
}
.search-input{
	flex: 1;
	height: 80rpx;
	font-size: 28rpx;
	margin-left: 16rpx;
}
uni-notice-bar {
  background-color: #4A88FF;
  color: #FFFFFF;
  font-size: 24rpx;
}

.swiper-item {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
  color: #fff;
}

.banner {
  width: 100%;
  height: 384rpx;
}

.banner image {
  width: 100%;
  height: 100%;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32rpx;
  padding: 48rpx 32rpx;
  background-color: #FFFFFF;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.grid-image-container {
  width: 128rpx;
  height: 128rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.grid-image-container image {
  width: 100%;
  height: 100%;
}

.grid-text {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #333333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 128rpx;
}

.section {
  padding: 48rpx 32rpx;
  /* margin-bottom: ; */
  background-color: #FFFFFF;
}

.section-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 122rpx;
  padding-bottom: 20px;

}

.activity-container {
  width: 100%;
  white-space: nowrap;
  margin-top: 22rpx;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32rpx;
  padding: 0 32rpx;
}

.activity-card {
  margin-top: 20px;
  width: 100%;
  height: 200px;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.expand-btn {
  text-align: center;
  color: #4A88FF;
  padding: 16rpx;
  margin-top: 16rpx;
  font-size: 28rpx;
}

.activity-image {
  width: 100%;
  height: 256rpx;
}

.activity-info {
  padding: 24rpx;
  display: flex;
  flex-direction: column; /* 修改这里 */
  justify-content: space-between;
  align-items: flex-start; /* 根据需要调整对齐方式 */
}

.activity-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.activity-price {
  font-size: 24rpx;
  color: #4A88FF;
  margin-top: 8rpx;
  text-align: right;
}

.route-card {
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  margin-top: 25rpx;
}

.route-image {
  width: 100%;
  height: 256rpx;
}

.route-info {
  padding: 24rpx;
}

.route-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.route-desc {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}

.route-price {
  font-size: 24rpx;
  color: #4A88FF;
  margin-top: 16rpx;
}

.ai-float-btn {
  position: fixed;
  /* 移除 right: 0 */
  top: 50%;
  transform: translateY(250%);
  display: flex;
  flex-direction: column;
  cursor: move;
}

.ai-btn {
  width: 96rpx;
  height: 96rpx;
  background-color: #fff;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(74, 136, 255, 0.2);
}

.ai-btn image {
  width: 60rpx;
  /* 调整图片宽度 */
  height: 60rpx;
  /* 调整图片高度 */
  object-fit: contain;
  /* 保持图片原始比例并完整显示在容器内 */
}

.ai-text {
  font-size: 20rpx;
  color: #FFFFFF;
  background-color: rgba(74, 136, 255, 0.8);
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  margin-top: 8rpx;
  white-space: nowrap;
}

.ai-dialog {
  background-color: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
}

.voice-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 256rpx;
  background-color: #f5f5f5;
  border-radius: 16rpx;
  margin-bottom: 32rpx;
}

.voice-tip {
  font-size: 24rpx;
  color: #999999;
  margin-top: 16rpx;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 16rpx 32rpx;
  background-color: #f5f5f5;
  border-radius: 16rpx;
}

.action-text {
  font-size: 24rpx;
  color: #333333;
  margin-left: 16rpx;
}

.ai-message {
  background-color: rgba(74, 136, 255, 0.05);
  border-radius: 16rpx;
  padding: 24rpx;
}

.message-content {
  display: flex;
  align-items: flex-start;
}

.message-body {
  margin-left: 16rpx;
}

.message-text {
  font-size: 24rpx;
  color: #333333;
}

.play-voice {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}

.play-text {
  font-size: 20rpx;
  color: #4A88FF;
  margin-left: 8rpx;
}



.text-active {
  color: #4A88FF;
}
</style>
