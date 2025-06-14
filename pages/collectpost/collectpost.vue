<template>
  <view class="container">
    <scroll-view 
      scroll-y 
      class="scroll-container"
      @refresherrefresh="onRefresh"
      refresher-enabled
      :refresher-triggered="isRefreshing"
    >
      <view v-if="loading && !isRefreshing" class="loading">
        <uni-icons type="spinner-cycle" size="24" color="#666"></uni-icons>
        <text>加载中...</text>
      </view>
      <view v-else-if="posts.length === 0" class="no-posts">
        <uni-icons type="star" size="48" color="#999"></uni-icons>
        <text>你还没有收藏任何帖子</text>
      </view>
      <view v-else class="post-list">
        <view 
          class="post-card" 
          v-for="post in posts" 
          :key="post.id"
          @tap="toDetail(post.id)"
        >
          <view class="post-header">
            <text class="post-title">{{ post.title || '未命名帖子' }}</text>
            <text class="post-time">{{ formatTime(post.createTime) }}</text>
          </view>
          <view class="post-content">{{ post.content }}</view>
          <image
            v-if="post.images?.length"
            :src="post.images[0].url"
            class="post-image"
            mode="aspectFill"
          />

          <view class="item-bottom">
            <view class="item-bottom-left">
              <text class="left-data">
                {{ formatCreateTime(post.createTime) }} · {{ post.area || '未知分区' }}
              </text>
            </view>
            <view class="item-bottom-right">
              <view class="right-data">
                <uni-icons type="heart" size="18" color="#999" />
                <text class="data-detail">{{ post.likes ?? 0 }}</text>
              </view>
              <view class="right-data">
                <uni-icons type="star" size="18" color="#999" />
                <text class="data-detail">{{ post.collect ?? post.focus ?? 0 }}</text>
              </view>
              <view class="right-data">
                <uni-icons type="chat" size="18" color="#999" />
                <text class="data-detail">{{ post.comments ?? 0 }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-tab-bar">
      <view
        class="tab-btn"
        :class="{ active: currentTab === 'my' }"
        @tap="switchTab('my')"
      >
        <uni-icons type="compose" size="22" :color="currentTab === 'my' ? '#fff' : '#0080ff'" />
        <text>我的发布</text>
      </view>
      <view
        class="tab-btn"
        :class="{ active: currentTab === 'collect' }"
        @tap="switchTab('collect')"
      >
        <uni-icons type="star" size="22" :color="currentTab === 'collect' ? '#fff' : '#0080ff'" />
        <text>我的收藏</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
const posts = ref<any[]>([]);
const loading = ref(true);
const isRefreshing = ref(false);
const currentTab = ref<'my' | 'collect'>('collect');

// 格式化时间
const formatTime = (t: string) => t ? new Date(t).toLocaleString() : '';
const formatCreateTime = (t: string) => t ? t.slice(0, 16) : '';

// 获取收藏帖子
async function fetchCollectPosts() {
  if (!userStore.token) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/login/login' });
    }, 800);
    return;
  }

  try {
    const res: any = await uni.request({
      url: 'https://island.zhangshuiyi.com/island/collectRecord',
      method: 'GET',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Access-Token': userStore.token
      }
    });

    console.log('收藏接口返回原始数据：', res.data);

    if (res.statusCode === 200 && res.data.success) {
      let arr = [];
      if (Array.isArray(res.data.result)) {
        arr = res.data.result;
      } else if (Array.isArray(res.data.result?.result)) {
        arr = res.data.result.result;
      }
      posts.value = arr;
    } else {
      uni.showToast({ 
        title: res.data.message || '获取收藏失败', 
        icon: 'none' 
      });
    }
  } catch (e) {
    console.error('获取收藏异常:', e);
    uni.showToast({ 
      title: '网络异常，请稍后重试', 
      icon: 'none' 
    });
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
}

// 下拉刷新
async function onRefresh() {
  isRefreshing.value = true;
  await fetchCollectPosts();
}

// 跳转详情
function toDetail(id: string) {
  uni.navigateTo({
    url: `/pages/post/postDetail?id=${id}`
  });
}

// 切换标签
function switchTab(tab: 'my' | 'collect') {
  if (tab === currentTab.value) return;
  
  if (tab === 'collect') {
    if (!userStore.token) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => {
        uni.redirectTo({ url: '/pages/login/login' });
      }, 800);
      return;
    }
  }
  
  currentTab.value = tab;
  if (tab === 'my') {
    uni.redirectTo({ url: '/pages/post/mypost' });
  } else {
    uni.redirectTo({ url: '/pages/collectpost/collectpost' });
  }
}

onMounted(fetchCollectPosts);
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}

.scroll-container {
  flex: 1;
  height: calc(100vh - 120rpx);
  padding-bottom: 100rpx;
}

.loading, .no-posts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  color: #888;
  font-size: 28rpx;
  gap: 20rpx;
}

.post-list {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.post-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.post-card:active {
  transform: scale(0.98);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.post-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.post-time {
  font-size: 24rpx;
  color: #999;
}

.post-content {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  line-height: 1.6;
}

.post-image {
  width: 100%;
  height: 300rpx;
  border-radius: 12rpx;
  object-fit: cover;
  margin-bottom: 20rpx;
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1px solid #f0f0f0;
}

.item-bottom-left {
  font-size: 24rpx;
  color: #999;
}

.item-bottom-right {
  display: flex;
  gap: 20rpx;
}

.right-data {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.data-detail {
  font-size: 24rpx;
  color: #999;
}

.bottom-tab-bar {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(255,255,255,0.98);
  box-shadow: 0 -2px 10px rgba(0,0,0,0.08);
  padding: 12px 0 20px 0;
  z-index: 99;
}

.tab-btn {
  flex: 1;
  margin: 0 18rpx;
  background: linear-gradient(135deg, #f8f9fa, #e6f0ff);
  border-radius: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0 10rpx 0;
  font-size: 26rpx;
  color: #0080ff;
  box-shadow: 0 2px 8px rgba(0,128,255,0.08);
  transition: all 0.2s;
}

.tab-btn.active {
  background: linear-gradient(135deg, #0080ff, #0066cc);
  color: #fff;
  box-shadow: 0 4px 16px rgba(0,128,255,0.18);
}
</style>

