<template>
  <view class="page">
    <scroll-view class="content" scroll-y>
      <!-- 已登录 -->
      <view class="user-info" v-if="token">
        <view class="avatar-container">
          <image class="avatar" :src="userInfo.avatar" />
        </view>
        <view class="user-detail">
          <text class="username">{{ userInfo.username }}</text>
          <text class="phone">{{ userInfo.phone }}</text>
        </view>
        <uni-icons type="right" size="14" color="#999" />
      </view>
      <!-- 未登录 -->
      <view class="user-info" v-if="!token">
        <view class="avatar-container">
          <image class="avatar" src="/static/my/noLogin.png" />
        </view>
        <view class="user-detail" @tap="goLogin()">
          <text class="username" style="font-size: 38rpx; color: #354972; margin-left: 40rpx; ">
            去登录</text>
        </view>
      </view>

      <view class="grid-container">
        <view class="grid-item" v-for="(item, index) in gridItems" :key="index" @tap="handleGridItemClick(item)">
            <view class="grid-icon">
                  <image :src="item.img" mode="aspectFit" :style="item.Style" />
            </view>
            <text class="grid-text">{{ item.text }}</text>
        </view>
      </view>

      <view class="menu-card">
        <view class="menu-item">
          <view class="menu-left">
            <uni-icons type="list" size="18" color="#3B82F6" />
            <text class="menu-text">全部订单</text>
          </view>
          <uni-icons type="right" size="14" color="#999" />
        </view>
      </view>

      <view class="menu-card">
        <view class="menu-item border-bottom"  @tap="goLoginOut">
          <view class="menu-left">
            <uni-icons type="gear" size="18" color="#3B82F6" />
            <text class="menu-text">账号设置</text>
          </view>
          <uni-icons type="right" size="14" color="#999" />
        </view>
        <view class="menu-item border-bottom" @click="goSettingNotice">
          <view class="menu-left">
            <uni-icons type="notification" size="18" color="#3B82F6" />
            <text class="menu-text">通知设置</text>
          </view>
          <uni-icons type="right" size="14" color="#999" />
        </view>
        <view class="menu-item" @click="goLanguage">
          <view class="menu-left">
            <uni-icons type="spinner-cycle" size="18" color="#3B82F6" />
            <text class="menu-text">语言切换</text>
          </view>
          <uni-icons type="right" size="14" color="#999" />
        </view>
      </view>

      <view class="menu-card">
        <view class="menu-item border-bottom" @click="goFeedback">
          <view class="menu-left">
            <uni-icons type="chatboxes" size="18" color="#3B82F6" />
            <text class="menu-text">意见反馈</text>
          </view>
          <uni-icons type="right" size="14" color="#999" />
        </view>
        <view class="menu-item" @click="goAboutUs">
          <view class="menu-left">
            <uni-icons type="info" size="18" color="#3B82F6" />
            <text class="menu-text">关于我们</text>
          </view>
          <uni-icons type="right" size="14" color="#999" />
        </view>
      </view>
    </scroll-view>
    <Tabbar />

  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow} from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user.js';
import Tabbar from '../Tabbar/Tabbar.vue';
const userStore = useUserStore();

const gridItems = ref([
  {
    img: 'https://wuminghui.top:9000/travel/collectItinerary.png',
    text: '我的帖子',
    onClick: 'goCollectPost'
  },
  {
    img: 'https://wuminghui.top:9000/travel/historyOrder.png',
    text: '历史订单',
	onClick: 'gohisorder'
  },
  {
    img: 'https://wuminghui.top:9000/wlmtsys/2025/04/17/712db376d9ae469c829f04a5087a240a.png',
    text: '待出行',
  },
  {
    img: 'https://wuminghui.top:9000/travel/customerService.png',
    text: '客服中心'
  }
]);

// 跳转登录页
const goLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login',
  })
}

// 判断是否登录

// 获取store当中的userInfo
const userInfo = ref(null);
onShow(() => {
  userInfo.value = userStore.userInfo;
  // console.log(userInfo.value);

});


// 获取store当中的token
const token = ref(null);
onShow(() => {
  token.value = userStore.token;
  // console.log(token.value);

});


// 跳转历史订单
const gohisorder = () => {
  uni.navigateTo({
    url:'/pages/historical-Orders/historical-Orders',
  })
}
const handleGridItemClick = (item) => {
  if (item.onClick === 'gohisorder') {
    gohisorder();
  }
  if (item.onClick === 'goCollectPost') {
    uni.navigateTo({
      url: '/pages/post/mypost',
    })
  }
}
// 退出登录页
const goLoginOut = () => {
  uni.navigateTo({ url: '/pages/my/setAccount' })
}

// 通知设置
const goSettingNotice = () => {
  uni.navigateTo({ url: '/pages/my/setNotice' })
}

// 语言切换
const goLanguage = () => {
  uni.navigateTo({ url: '/pages/my/selectLanguage' })
}
// 意见反馈
const goFeedback = () => {
  uni.navigateTo({ url: '/pages/my/feedback' })
}
// 关于我们
const goAboutUs = () => {
  uni.navigateTo({ url: '/pages/my/aboutUs' })
}

</script>

<style>
page {
  height: 100%;
  background-color: #F8F8F8;
}

.page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  overflow: auto;
  padding: 20rpx 0;
}

.user-info {
  margin: 0 30rpx;
  padding: 30rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.avatar-container {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  overflow: hidden;
  background-color: #F5F5F5;
}

.avatar {
  width: 100%;
  height: 100%;
}

.user-detail {
  flex: 1;
  margin-left: 30rpx;
}

.username {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
}

.phone {
  font-size: 12px;
  color: #999999;
  margin-top: 8rpx;
  display: block;
}

.grid-container {
  margin: 0 30rpx;
  padding: 30rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30rpx;
  margin-bottom: 30rpx;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.grid-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 16rpx;
}

.grid-icon image {
  width: 100%;
  height: 100%;
}

.grid-text {
  font-size: 12px;
  color: #333333;
}

.menu-card {
  margin: 0 30rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
}

.menu-item {
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-text {
  font-size: 14px;
  color: #333333;
  margin-left: 20rpx;
}

.border-bottom {
  border-bottom: 1px solid #F5F5F5;
}
</style>
