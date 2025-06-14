<template>
  <view class="container" :style="`padding-top: ${statusBarHeight + 44}px;`">
    <!-- 自定义顶部导航栏 -->
    <view
      class="custom-nav"
      :style="`padding-top: ${statusBarHeight}px; height: ${statusBarHeight}px;`"
    >
      <view class="nav-left" @click="goBack">
        <uni-icons type="back" size="28" color="#333" />
      </view>
      <view class="nav-title">我的好友</view>
      <view class="nav-right"></view>
    </view>

    <!-- 好友分类选择 -->
    <view class="friend-type-select">
      <view 
        class="type-item" 
        :class="{ active: activeType === 'follow' }"
        @click="switchType('follow')"
      >
        关注
      </view>
      <view 
        class="type-item" 
        :class="{ active: activeType === 'fans' }"
        @click="switchType('fans')"
      >
        粉丝
      </view>
    </view>

    <!-- 好友列表 -->
    <view class="friend-list">
      <!-- 关注列表 -->
      <template v-if="activeType === 'follow'">
        <view class="list-header">
          共 <text class="count">{{ focusTotal }}</text> 个关注
        </view>
        <view v-if="focusList.length === 0" class="empty-state">
          <text>暂无关注</text>
        </view>
        <view v-else>
          <view v-for="user in focusList" :key="user.id" class="friend-item">
            <image :src="user.avatar || defaultAvatar" class="friend-avatar" />
            <view class="friend-info">
              <text class="friend-name">{{ user.username }}</text>
              <text class="friend-desc">{{ (user.fans || 0) + '粉丝' }}</text>
            </view>
            <button class="follow-btn" @click="unfollow(user)">已关注</button>
          </view>
        </view>
      </template>

      <!-- 粉丝列表 -->
      <template v-if="activeType === 'fans'">
        <view class="list-header">
          共 <text class="count">{{ fansTotal }}</text> 个粉丝
        </view>
        <view v-if="fansList.length === 0" class="empty-state">
          <text>暂无粉丝</text>
        </view>
        <view v-else>
          <view v-for="fan in fansList" :key="fan.id" class="friend-item">
            <image :src="fan.avatar || defaultAvatar" class="friend-avatar" />
            <view class="friend-info">
              <text class="friend-name">{{ fan.username }}</text>
              <text class="friend-desc">{{ (fan.fans || 0) + '粉丝' }}</text>
            </view>
            <button class="follow-btn" @click="followBack(fan)">回关</button>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
const statusBarHeight = ref(0);
const activeType = ref('follow');
const focusList = ref([]);
const fansList = ref([]);
const focusTotal = ref(0);
const fansTotal = ref(0);
const defaultAvatar = 'https://static-typical-avatar-url.png';

onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0;
  getFocusList();
});

const switchType = (type) => {
  activeType.value = type;
  if (type === 'follow') {
    getFocusList();
  } else {
    getFansList();
  }
};

const getFocusList = () => {
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/sys/user/queryFocusList',
    method: 'GET',
    header: {
      'X-Access-Token': userStore.token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: (res) => {
      if (res.statusCode === 200 && res.data.code === 200) {
        focusList.value = res.data.result?.records || [];
        focusTotal.value = res.data.result?.total || 0;
      }
    }
  });
};

const getFansList = () => {
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/sys/user/queryFansList',
    method: 'GET',
    header: {
      'X-Access-Token': userStore.token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: (res) => {
      if (res.statusCode === 200 && res.data.code === 200) {
        fansList.value = res.data.result?.records || [];
        fansTotal.value = res.data.result?.total || 0;
      }
    }
  });
};

const unfollow = (user) => {
  uni.showModal({
    title: '取消关注',
    content: `确定要取消关注 ${user.username} 吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.request({
          url: 'https://island.zhangshuiyi.com/island/sys/user/focus',
          method: 'POST',
          header: {
            'X-Access-Token': userStore.token,
            'Content-Type': 'application/json'
          },
          data: {
            focusId: user.id,
            operation: 2
          },
          success: (res) => {
            if (res.data.success) {
              uni.showToast({ title: '已取消关注', icon: 'success' });
              getFocusList();
            } else {
              uni.showToast({ title: res.data.message || '取消关注失败', icon: 'none' });
            }
          }
        });
      }
    }
  });
};

const followBack = (fan) => {
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/sys/user/focus',
    method: 'POST',
    header: {
      'X-Access-Token': userStore.token,
      'Content-Type': 'application/json'
    },
    data: {
      focusId: fan.id,
      operation: 1
    },
    success: (res) => {
      if (res.data.success) {
        uni.showToast({ title: '已回关', icon: 'success' });
        getFansList();
      } else {
        uni.showToast({ title: res.data.message || '回关失败', icon: 'none' });
      }
    }
  });
};

const goBack = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 999;
  border-bottom: 1px solid #f0f0f0;
}

.nav-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  padding-left: 20rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.nav-right {
  width: 60rpx;
}

.friend-type-select {
  display: flex;
  background-color: #fff;
  padding: 20rpx 30rpx;
  margin-top: 20rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.type-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
  
  &.active {
    color: #007aff;
    font-weight: 500;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 4rpx;
      background-color: #007aff;
      border-radius: 2rpx;
    }
  }
}

.friend-list {
  margin-top: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
}

.list-header {
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
  
  .count {
    color: #007aff;
    font-weight: bold;
  }
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.friend-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.friend-info {
  flex: 1;
  
  .friend-name {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
  }
  
  .friend-desc {
    font-size: 24rpx;
    color: #999;
    margin-top: 8rpx;
  }
}

.follow-btn {
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  background-color: #fff;
  color: #007aff;
  border: 1rpx solid #007aff;
  
  &:active {
    opacity: 0.8;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
  
  &::before {
    content: '👥';
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }
}
</style>
