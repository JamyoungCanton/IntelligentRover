<template>
  <view class="page">
    <scroll-view class="content" scroll-y>
      <!-- 已登录 -->
      <view class="user-info" v-if="userStore.token" @click="goProfileView">
        <view class="avatar-container">
          <image class="avatar" :src="userStore.userInfo.avatar || '/static/my/default-avatar.png'" />
        </view>
        <view class="user-detail">
          <text class="username">{{ userStore.userInfo.username }}</text>
          <text class="signature">
            {{ userStore.userInfo.departids ? userStore.userInfo.departids.slice(0, 10) : (userStore.userInfo.departIds ? userStore.userInfo.departIds.slice(0, 10) : '暂无签名') }}
          </text>
        </view>
        <uni-icons type="right" size="14" color="#999" />
      </view>
      <!-- 未登录 -->
      <view class="user-info" v-else>
        <view class="avatar-container">
          <image class="avatar" src="https://gitee.com/luo-shaominggitee/island_image/raw/main/img/my/noLogin.png" />
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
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user.js';
import Tabbar from '../Tabbar/Tabbar.vue';
const userStore = useUserStore();

const gridItems = ref([
  {
    img: 'https://gitee.com/luo-shaominggitee/island_image/raw/main/img/my/collectItinerary.png',
    text: '我的帖子',
    onClick: 'goCollectPost'
  },
  {
    img: 'https://gitee.com/luo-shaominggitee/island_image/raw/main/img/my/historyOrder.png',
    text: '历史订单',
	onClick: 'gohisorder'
  },
  {
    img: 'https://gitee.com/luo-shaominggitee/island_image/raw/main/img/my/pendingTravelOrders.png',
    text: '活动收藏',
    onClick: 'goActivityCollect'
  },
  {
    img: 'https://gitee.com/luo-shaominggitee/island_image/raw/main/img/my/customerService.png',
    text: '客服中心'
  }
]);

// 跳转登录页
const goLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login',
  })
}

// 跳转历史订单
const gohisorder = () => {
  uni.navigateTo({
    url:'/pages/historical-Orders/historical-Orders',
  })
}
const handleGridItemClick = (item) => {
  if (item.onClick === 'gohisorder') {
    gohisorder();
    return;
  }
  if (item.onClick === 'goCollectPost') {
    uni.navigateTo({
      url: '/pages/post/mypost',
    });
    return;
  }
  if (item.onClick === 'goActivityCollect') {
    uni.navigateTo({
      url: '/pages/activityCollect/activityCollect'
    });
    return;
  }
  // 如果没有 onClick 字段，且是客服中心
  if (item.text === '客服中心') {
    uni.showToast({
      title: '未到营业时间',
      icon: 'none',
      duration: 2000
    });
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

const goProfileView = () => {
  // 跳转到changemine页面，只读模式
  uni.navigateTo({ url: '/pages/my/changemine?mode=view' });
};

onShow(() => {
  if (userStore.token && userStore.userInfo.id) {
    uni.request({
      url: `https://island.zhangshuiyi.com/island/sys/user/select/${userStore.userInfo.id}`,
      method: 'GET',
      header: {
        'X-Access-Token': userStore.token
      },
      success: (res) => {
        console.log('后端返回个人信息:', res);
        if (res.data.success && res.data.result) {
          // 兼容后端返回departIds（大写I）字段
          if (res.data.result.departIds) {
            res.data.result.departids = res.data.result.departIds;
          }
          Object.assign(userStore.userInfo, res.data.result)
        }
      }
    })
  }
})

function saveProfile() {
  // ...原有校验和请求体构造
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/sys/user/update',
    method: 'PUT',
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token
    },
    data: { sysUserIdvo },
    success: (res) => {
      if (res.data.success) {
        // 保存成功后，立刻拉取后端数据
        uni.request({
          url: `https://island.zhangshuiyi.com/island/sys/user/select/${userStore.userInfo.id}`,
          method: 'GET',
          header: {
            'X-Access-Token': userStore.token
          },
          success: (res2) => {
            if (res2.data.success && res2.data.result) {
              userStore.userInfo = res2.data.result
            }
            uni.showToast({ title: '保存成功', icon: 'success' });
            setTimeout(() => uni.navigateBack(), 800);
          }
        })
      } else {
        uni.showToast({ title: res.data.message || '保存失败', icon: 'none' });
      }
    },
    fail: (err) => {
      uni.showToast({ title: '网络错误', icon: 'none' });
    }
  });
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

.signature {
  font-size: 12px;
  color: #bbb;
  margin-top: 2rpx;
  display: block;
}
</style>
