<template>
  <view class="container">
    <view class="nav-bar">
      <uni-icons type="back" size="24" @click="goBack" />
      <text class="nav-title">我的好友</text>
    </view>
    <view class="tab-bar">
      <view
        class="tab"
        :class="{active: activeTab === 'follow'}"
        @click="activeTab = 'follow'"
      >关注</view>
      <view
        class="tab"
        :class="{active: activeTab === 'fans'}"
        @click="activeTab = 'fans'"
      >粉丝</view>
    </view>
    <view v-if="activeTab === 'follow'">
      <view v-if="focusList.length === 0" class="empty-state">暂无关注</view>
      <view v-else>
        <view v-for="user in focusList" :key="user.id" class="fan-item">
          <image :src="user.avatar || defaultAvatar" class="fan-avatar" />
          <view class="fan-info">
            <text class="fan-name">{{ user.username }}</text>
            <text class="fan-desc">{{ (user.fans || 0) + '粉丝' }}</text>
          </view>
          <button class="follow-back-btn" @click="unfollow(user)">已关注</button>
        </view>
      </view>
    </view>
    <view v-if="activeTab === 'fans'">
      <view v-if="fansList.length === 0" class="empty-state">暂无粉丝</view>
      <view v-else>
        <view v-for="fan in fansList" :key="fan.id" class="fan-item">
          <image :src="fan.avatar || defaultAvatar" class="fan-avatar" />
          <view class="fan-info">
            <text class="fan-name">{{ fan.username }}</text>
            <text class="fan-desc">{{ (fan.fans || 0) + '粉丝' }}</text>
          </view>
          <button class="follow-back-btn" @click="followBack(fan)">回关</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';
const userStore = useUserStore();

const activeTab = ref('follow');
const focusList = ref([]);
const fansList = ref([]);
const defaultAvatar = 'https://static-typical-avatar-url.png';

const goBack = () => {
  uni.navigateBack();
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
      } else {
        focusList.value = [];
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
        console.log('粉丝接口返回：', res.data);
        fansList.value = res.data.result?.records || [];
      } else {
        fansList.value = [];
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
      operation: 1 // 1为关注
    },
    success: (res) => {
      if (res.data.success) {
        uni.showToast({ title: '已回关', icon: 'success' });
        getFocusList(); // 刷新关注列表
      } else {
        uni.showToast({ title: res.data.message || '回关失败', icon: 'none' });
      }
    },
    fail: () => {
      uni.showToast({ title: '网络错误', icon: 'none' });
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
            operation: 2 // 2为取消关注
          },
          success: (res) => {
            if (res.data.success) {
              uni.showToast({ title: '已取消关注', icon: 'success' });
              getFocusList(); // 刷新关注列表
            } else {
              uni.showToast({ title: res.data.message || '取消关注失败', icon: 'none' });
            }
          },
          fail: () => {
            uni.showToast({ title: '网络错误', icon: 'none' });
          }
        });
      }
    }
  });
};

onMounted(() => {
  getFocusList();
  getFansList();
});
</script>

<style scoped>
.container {
  background: #fff;
  min-height: 100vh;
  padding-bottom: 30px;
  padding-top: 30px;
}
.nav-bar {
  display: flex;
  align-items: center;
  padding: 18px 20px 8px 10px;
  border-bottom: 1px solid #f0f0f0;
}
.nav-title {
  font-size: 20px;
  font-weight: bold;
  margin-left: 16px;
}
.tab-bar {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 14px 0;
  font-size: 16px;
  color: #666;
  cursor: pointer;
}
.tab.active {
  color: #007aff;
  border-bottom: 2px solid #007aff;
  font-weight: bold;
}
.fan-item {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #f5f5f5;
}
.fan-avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  margin-right: 18px;
  object-fit: cover;
  background: #f0f0f0;
}
.fan-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.fan-name {
  font-size: 18px;
  color: #222;
  font-weight: 500;
}
.fan-desc {
  font-size: 14px;
  color: #888;
  margin-top: 2px;
}
.follow-back-btn {
  border: 1.5px solid #007aff;
  color: #007aff;
  background: #fff;
  border-radius: 20px;
  padding: 6px 22px;
  font-size: 16px;
  margin-left: 10px;
  line-height: 1.8;
}
.empty-state {
  text-align: center;
  color: #bbb;
  font-size: 16px;
  margin: 40px 0;
}
</style>
