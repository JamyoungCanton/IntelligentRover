<template>
  <view class="index-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar-wrapper" :style="{ paddingTop: `${statusBarHeight}px` }">
      <!-- 顶部导航栏标题 -->
      <view class="nav-bar-title" :style="{ paddingTop: safeAreaInsets.top + 'px' }">山海智游侠</view>
      <!-- 轮播图 -->
      <swiper class="banner-swiper" :autoplay="true" :interval="3000" circular>
        <swiper-item v-for="item in bannerList" :key="item">
          <image class="banner-item" :src="item" mode="widthFix"></image>
        </swiper-item>
      </swiper>
    </view>

    <!-- 主要内容区 -->
    <view class="index-main-wrapper">
      <!-- 通知栏 -->
      <view class="notice-wrapper">
        <view class="notice-tag">通知</view>
        <view class="notice-text-container">
          <view class="notice-text">欢迎来到山海智游侠，这里为您带来意想不到的海岛之旅，欢乐无限，期待您的到来~</view>
        </view>
      </view>

      <!-- 图标导航 -->
      <view class="icon-nav-wrapper">
        <view v-for="item in navButtonList" :key="item.name" class="icon-item" @click="toPage(item.path)">
          <view class="icon-btn">
            <image :src="item.icon"></image>
          </view>
          <text class="icon-text">{{ item.name }}</text>
        </view>
      </view>

      <!-- 热门活动 -->
      <view class="section-wrapper">
        <view class="section-title">热门活动</view>
      </view>
      <view class="activity-wrapper">
        <template v-if="!activityLoading">
          <view class="activity-card" v-for="activity in activities" :key="activity.id"
            @click="toActivity(activity.id)">
            <view class="activity-img">
              <image :src="activity.image"></image>
            </view>
            <view class="activity-info">
              <text class="activity-name">{{ activity.name }}</text>
              <view class="activity-rating">
                <text class="rating">{{ activity.rating }}</text>
                <text class="comments">{{ activity.comments }}</text>
              </view>
              <view class="price-container">
                <text class="original-price">优惠价 ¥{{ activity.discountPrice }}</text>
                <text class="discount-price">¥{{ activity.originalPrice }}</text>
              </view>
            </view>
          </view>
        </template>
        <template v-else>
          <uv-skeletons :loading="activityLoading" :skeleton="activitySkeleton"></uv-skeletons>
        </template>
      </view>


      <!-- 精选路线 -->
      <view class="section-wrapper">
        <view class="section-title">精选路线</view>
      </view>
      <!-- <view class="route-hot-tag">
          <image class="hot-img" src="https://wuminghui.top:9000/travel/角标-推荐.svg"></image>
        </view> -->
      <view class="route-wrapper"  @click="viewMore('热门活动')">
        <view class="route-badge">
        </view>
        <view class="route-banner">
          <image src="https://wuminghui.top:9000/travel/首页-精选路线.jpg"></image>
        </view>
        <view class="route-info">
          <text class="route-name">浪漫双岛游游 东澳岛-外伶仃岛2日游</text>
          <view class="route-rating">
            <text class="rating">4.7分</text>
            <text class="comments"> 1205条评论</text>
            <text class="route-price">¥688.00起</text>
          </view>
        </view>
      </view>

      <!-- 景点攻略部分 -->
      <view class="section-wrapper mb-30">
        <uv-tabs :list="tabList" @click="handleChangeTab" :lineColor="themeColor" :scrollable="false"
          :activeStyle="{ color: '#303133', fontWeight: 'bold', transform: 'scale(1.05)' }"></uv-tabs>
      </view>
      <view v-if="!spotLoading" class="spot-wrapper">
        <view class="spot-item" v-for="spot in spotList" :key="spot.id" @click="navigateToSpot(activeTab, spot.id)">
          <image class="spot-img" :src="spot.imageUrl ? spot.imageUrl : defaultImage"></image>
          <view class="spot-info">
            <view class="spot-name">{{ spot.name }} <uv-tags v-if="spot.type" :text="spot.type" size="mini" key="" plain
                plainFill />
            </view>
            <template v-if="activeTab == '景点攻略'">
              <view class="spot-desc">
                <uv-icon name="map" :top="1" :size="12"></uv-icon> <text class="mr-20">{{ spot.location }}</text>
                <uv-icon name="clock" :top="1" :size="12"></uv-icon> <text>{{ spot.time }}</text>
              </view>
              <view class="spot-desc" v-html="spot.description"></view>
            </template>
            <template v-if="activeTab == '酒店住宿'">
              <view class="spot-desc">
                <uv-icon name="phone" :top="2" :size="12"></uv-icon> <text>{{ spot.bookingmethod }}</text>
              </view>
            </template>
            <template v-if="activeTab == '美食推荐'">
              <view class="spot-desc">
                <uv-icon name="map" :top="1" :size="12"></uv-icon> <text class="mr-20">{{ spot.address }}</text>
                <uv-icon name="clock" :top="1" :size="12"></uv-icon> <text>{{ spot.time }}</text>
              </view>
              <view class="spot-desc" v-html="spot.description"></view>
            </template>
            <view class="spot-rating">
              <uv-rate v-model="spot.rating" :size="14" activeColor="#ffb800" allowHalf></uv-rate>
              <text class="spot-price">{{ spot.price }}</text>
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
      <view v-else class="spot-wrapper" style="margin: 0 20rpx;">
        <uv-skeletons :loading="spotLoading" :skeleton="spotSkeleton"></uv-skeletons>
      </view>
    </view>

    <view class="blank"></view>

    <!-- 底部导航 -->
    <Tabbar />

    <!-- AI悬浮窗 -->
    <view class="ai-float-btn animate-pulse" @click="navigateToChat" @touchstart="startDrag" @touchmove="moveDrag"
      @touchend="endDrag" :style="{ left: dragX + 'px', top: dragY + 'px' }">
      <view class="ai-btn">
        <img src="https://wuminghui.top:9000/wlmtsys/2025/06/02/c64d05235ba845b88ade471516742c80.png" alt=""
          style="width: 45px;height: 45px;">
      </view>
      <text class="ai-text">智能导游</text>
    </view>
  </view>
</template>

<script setup>
// ---------------- import ----------------
import { ref, computed, onMounted, reactive } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import Tabbar from '../Tabbar/Tabbar.vue';
import request from '@/utils/request.js'; // 导入请求函数
// ---------------- setup ----------------
onShow(() => {
  handleGetActivityList();
});
onMounted(() => {
  const { statusBarHeight: sbHeight, safeAreaInsets: insets } = uni.getSystemInfoSync();
  statusBarHeight.value = sbHeight;
  safeAreaInsets.value = insets;
  activeTab.value = '景点攻略';
  handleGetSpotsList('景点攻略');
  handleGetActivityList();
});
onPullDownRefresh(() => {
  activeTab.value = '景点攻略';
  handleGetSpotsList('景点攻略');
  handleGetActivityList();
  uni.stopPullDownRefresh();
});
// ---------------- data ----------------
// 导航按钮列表
const navButtonList = reactive([{
  name: '景点攻略',
  icon: 'https://img.icons8.com/fluency/96/beach.png',
  path: '/pages/attractionGuide/attractionGuide'
}, {
  name: '船票预订',
  icon: 'https://img.icons8.com/fluency/96/sail-boat.png',
  path: '/pages/ticketBooking/ticketBooking'
}, {
  name: '美食推荐',
  icon: 'https://img.icons8.com/fluency/96/restaurant.png',
  path: '/pages/foodRecommendation/foodRecommendation'
}, {
  name: '酒店住宿',
  icon: 'https://img.icons8.com/fluency/96/5-star-hotel.png',
  path: '/pages/hotelBooking/hotelBooking'
}, {
  name: '停车收费',
  icon: 'https://img.icons8.com/fluency/96/parking.png',
  path: '/pages/parkingFees/parkingFees'
}, {
  name: '一日畅游',
  icon: 'https://img.icons8.com/fluency/96/beach-umbrella.png',
  path: '/pages/dayTravel/dayTravel'
}, {
  name: '社区互动',
  icon: 'https://img.icons8.com/fluency/96/communication.png',
  path: '/pages/ticketPoints/ticketPoints'
}, {
  name: '更多服务',
  icon: 'https://img.icons8.com/fluency/96/more.png',
  path: '/pages/moreServices/moreServices'
}
]);
const tabList = reactive([
  { name: '景点攻略' },
  { name: '酒店住宿' },
  { name: '美食推荐' }
])
const activeTab = ref('景点攻略'); // 默认选中的标签
const safeAreaInsets = ref({});
const statusBarHeight = ref(0);
const bannerList = ref([
  'https://wuminghui.top:9000/travel/Banner1.jpg',
  'https://wuminghui.top:9000/travel/Banner2.jpg',
  'https://wuminghui.top:9000/travel/Banner3.jpg'
]);
const activities = ref([]);
const activityLoading = ref(false); // 活动列表加载状态
const activitySkeleton = ref([{
  type: 'flex',
  children: [{
    type: 'custom',
    style: 'width:300rpx;height:360rpx;borderRadius:25rpx;'
  }, {
    type: 'custom',
    style: 'width:300rpx;height:360rpx;borderRadius:25rpx;marginLeft:20rpx;'
  }, {
    type: 'custom',
    style: 'width:300rpx;height:360rpx;borderRadius:25rpx;marginLeft:20rpx;'
  }]
}])
const spotList = ref([]); // 景点列表数据
const spotSkeleton = ref([{
  type: 'flex',
  num: 3,
  children: [{
    type: 'custom',
    num: 1,
    style: 'width:150rpx;height:150rpx;marginRight: 30rpx;marginLeft: 20rpx;'
  }, {
    type: 'line',
    num: 3,
    style: [null, 'width:360rpx;', 'width:200rpx;']
  }]
}]);
const spotLoading = ref(false); // 景点列表加载状态
// 缺省图片
const defaultImage = ref('https://wuminghui.top:9000/travel/retouch_2025032816113042(1).png');
// 注释掉但保留展开/收起方法
// const toggleExpand = () => {
//   isExpanded.value = !isExpanded.value;
// };
// ---------------- methods ----------------
// 管理接口
const handleGetSpotsList = async (type) => {
  spotLoading.value = true;
  let res;
  if (type === '景点攻略') {
    res = await request(`/product/ilAttractions/list`);
  } else if (type === '酒店住宿') {
    res = await request(`/product/ilAccommodations/list`, { pageNo: 1, pageSize: 50 });
  } else if (type === '美食推荐') {
    res = await request(`/product/ilDining/list`, { pageNo: 1, pageSize: 50 });
  }
  // 数据处理
  spotList.value = res.records.map(item => {
    if (type === '景点攻略') {
      item.price = item.ticketprice === 0 ? '免费' : `¥${item.ticketprice}/人`
      // 06:00:00 - 18:00:00  -> 06:00 - 18:00
      item.time = item.starttime.replace(/:00$/, '') + ' - ' + item.endtime.replace(/:00$/, '')
    } else if (type === '酒店住宿') {
      item.type = item.hoteltheme;
      item.price = item.price === 0 ? '免费' : `¥${item.price}/人`
    } else if (type === '美食推荐') {
      item.time = item.starthour.replace(/:00$/, '') + ' - ' + item.endhour.replace(/:00$/, '')
      item.price = item.price === 0 ? '免费' : `¥${item.price}/人`
    }
    return item;
  });
  spotLoading.value = false;
};

// 获取活动列表
const handleGetActivityList = async () => {
  activityLoading.value = true;
  const res = await request(`/product/ilActivities/list`, { pageNo: 1, pageSize: 300 });
  activities.value = res.records.map(activity => {
    const priceNum = Number(activity.price) || 0;
    const originalPrice = (priceNum * 1.2).toFixed(2); // 原价为现价*1.2
    return {
      id: activity.id,
      name: activity.type,
      image: activity.imageUrl || 'https://wuminghui.top:9000/travel/首页-热门活动-海钓体验.jpg',
      rating: '4.7分',
      comments: '1205条评论',
      priceNum,
      discountPrice: priceNum.toFixed(2), // 优惠价就是现价
      originalPrice: originalPrice,       // 原价为现价*1.2
      price: '¥' + priceNum + '/人起'
    };
  });
  activityLoading.value = false;
};

// 换页   
const handleChangeTab = (tab) => {
  activeTab.value = tab.name;
  handleGetSpotsList(tab.name);
};

// 查看更多
const viewMore = (type) => {
  uni.navigateTo({
    url: `/pages/${type === '热门活动' ? 'activity/activity' : 'itinerary/itinerary'}`
  });
};

const toPage = (path) => {
    uni.navigateTo({ url: path });
};

const toActivity = (id) => {
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

// 提取纯数字价格
const getOriginalPrice = (priceStr) => {
  // 只取第一个数字
  const match = priceStr.match(/\\d+(\\.\\d+)?/);
  return match ? Number(match[0]).toFixed(2) : '0.00';
};
const getDiscountPrice = (priceStr) => {
  const original = getOriginalPrice(priceStr);
  return (original * 0.9).toFixed(2);
};
</script>

<style lang="scss" scoped>
.index-container {
  position: relative;

  /* 顶部导航栏 */
  .nav-bar-wrapper {
    position: relative;
    height: 260rpx;
    background-color: transparent;
  }

  /* 顶部导航栏标题 */
  .nav-bar-title {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9999; // 确保在顶部
    color: #FFFFFF;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    text-align: center;
    text-shadow: 0 3px 9px #666;
  }

  /* 轮播图 */
  .banner-swiper {
    width: 100%;
    height: 500rpx;
    position: absolute;
    top: 0;
    left: 0;

    .banner-item {
      width: 100%;
      height: 260rpx;
      position: absolute;
      top: 0;
      left: 0;
    }
  }

  /* 主要内容区 */
  .index-main-wrapper {
    width: 100%;
    position: relative;

    /* 通知栏 */
    .notice-wrapper {
      width: 650rpx;
      position: absolute;
      top: -50rpx;
      display: flex;
      align-items: center;
      background-color: #00b2b2;
      color: white;
      padding: 20rpx;
      margin: 20rpx;
      border-radius: 10rpx;
      box-shadow: $app-shadow;
      overflow: hidden;

      .notice-tag {
        font-size: 28rpx;
        font-weight: bold;
        background-color: white;
        color: #00b2b2;
        padding: 5rpx 10rpx;
        border-radius: 8rpx;
        flex-shrink: 0;
        margin-right: 20rpx;
      }

      .notice-text-container {
        flex: 1;
        overflow: hidden;

        .notice-text {
          font-size: 28rpx;
          white-space: nowrap;
          animation: marquee 15s linear infinite;

          // 滚动动画
          @keyframes marquee {
            0% {
              transform: translateX(100%);
            }

            100% {
              transform: translateX(-200%);
            }
          }
        }
      }
    }

    /* 图标导航 */
    .icon-nav-wrapper {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20rpx;
      padding: 0 20rpx;
      padding-top: 40px;
      margin: 20rpx;

      .icon-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
      }

      // 按钮大小
      .icon-btn {
        width: 60rpx;
        height: 60rpx;

        // 图标大小
        image {
          width: 100%;
          height: 100%;
        }
      }

      .icon-text {
        font-size: 24rpx;
        color: #333;
      }
    }

    // 精选路线
    .route-wrapper {
      width: 100%;
      height: 400rpx;
      position: relative;

      .route-badge {
        position: absolute;
        z-index: 15;
        top: -10rpx;
        right: 0;
        overflow: hidden;
        width: 150rpx;
        height: 150rpx;
        // background-color: #00b2b2;

        &::before {
          background-color: #cd5c5c;
          position: absolute;
          z-index: 19;
          top: 0;
          left: 26rpx;
          content: "";
          width: 50rpx;
          height: 10rpx;
        }

        // 徽标
        &::after {
            position: absolute;
            z-index: 20;
            content: "推荐";
            text-align: center;
            background-color: #f56c6c;
            color: #fff;
            width: 180rpx;
            height: 50rpx;
            transform: rotate(45deg);
            top: 20rpx;
            right: -45rpx;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            text-transform: uppercase;
            font-size: $fs-base;
          }
      }

      .route-banner {
        width: 100%;
        height: 100%;
        position: relative;

        image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
        }

        &::before {
          position: absolute;
          content: "";
          width: 100%;
          height: 100%;
          z-index: 10;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.7));
        }
      }

      .route-info {
        width: calc(100% - 40rpx);
        padding: 20rpx;
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 20;
        color: #fff;
        display: flex;
        flex-direction: column;
        gap: 10rpx;

        .route-name {
          font-size: $fs-large;
          font-weight: bold;
        }

        .route-rating {
          display: flex;
          align-items: flex-end;
          font-size: 24rpx;
          color: #ddd;

          .rating::after {
            content: "|";
            margin: 0 8rpx;
            color: #ccc;
          }

          .route-price {
            margin-left: auto;
            color: #ff6600;
            font-size: $fs-large;
            font-weight: bold;
          }
        }
      }
    }
  }
}

/* 节标题 */
.section-wrapper {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
  margin-bottom: 20rpx;
  padding: 0 20rpx;

  .section-title {
    @include title;
  }

  .section-more {
    @include more;
  }
}




/* 热门活动的卡片样式 */
.activity-wrapper {
  display: flex;
  width: 100%;
  overflow-x: scroll;
  gap: 20rpx;
  padding: 20rpx;
  scrollbar-width: none;
  /* 隐藏滚动条 */
  -webkit-overflow-scrolling: touch;

  /* iOS平滑滚动 */
  &::-webkit-scrollbar {
    display: none;
    /* 隐藏滚动条 */
  }

  // 活动卡片样式
  .activity-card {
    width: 300rpx;
    flex-shrink: 0;
    background-color: #fff;
    border-radius: 25rpx;
    overflow: hidden;
    box-shadow: $app-shadow;

    // 活动图片
    .activity-img {
      width: 100%;
      height: 250rpx;

      image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    // 活动信息
    .activity-info {
      display: flex;
      flex-direction: column;
      background-color: #fff;
      padding: 5rpx 20rpx;

      // 活动名称
      .activity-name {
        width: 100%;
        color: #111827;
        font-size: $fs-base;
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      // 活动评分
      .activity-rating {
        display: flex;
        align-items: center;
        font-size: $fs-small;
        color: #666;

        // 丨分割线
        .rating::after {
          content: "|";
          margin: 0 4rpx;
        }
      }

      /* 添加热门活动价格容器样式 */
      .price-container {
        display: flex;
        align-items: flex-end;
        gap: 8rpx;


        // 原价
        .original-price {
          color: #FF9500;
          font-size: $fs-small;
          margin-right: 8rpx;
          white-space: nowrap;
        }

        .discount-price {
          color: #999;
          font-size: $fs-tiny;
          text-decoration: line-through;
        }
      }
    }
  }
}

// 热门景点
.spot-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 20rpx;

  .spot-item {
    display: flex;
    background-color: white;
    overflow: hidden;
    padding: 20rpx 40rpx;
    border-bottom: 1px solid #f5f5f5;

    .spot-img {
      width: 150rpx;
      height: 150rpx;
      flex-shrink: 0;
      border-radius: 15rpx;
    }

    .spot-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin-left: 30rpx;

      .spot-name {
        display: flex;
        align-items: center;
        gap: 10rpx;
        font-size: $fs-large;
        font-weight: bold;
        line-height: 1em;
      }

      .spot-desc {
        display: flex;
        align-items: center;
        gap: 5rpx;
        font-size: $fs-small;
        color: #999;
      }

      .spot-rating {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .spot-price {
          color: #ff5757;
          font-size: $fs-base;
          font-weight: bold;
        }
      }
    }
  }
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
</style>
