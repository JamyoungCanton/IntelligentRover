<template>
  <view class="container">
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="posts.length === 0" class="no-posts">你还没有收藏任何帖子</view>
    <view v-else class="post-list">
      <view 
        class="post-card" 
        v-for="post in posts" 
        :key="postIdFor(post) || post.id"
      >
        <view @tap="toDetail(postIdFor(post))">
          <view class="post-header">
            <text class="post-title">{{ titleOf(post) }}</text>
          </view>
          <view class="post-content">{{ contentOf(post) }}</view>
          <image
            v-if="firstImage(post)"
            :src="firstImage(post)"
            class="post-image"
            mode="aspectFill"
          />

          <view class="item-bottom">
            <view class="item-bottom-left">
              <text class="left-data">
                {{ formatCreateTime(createTimeOf(post)) }} · {{ areaOf(post) }}
              </text>
            </view>
            <view class="item-bottom-right">
              <uni-icons type="heart" size="18" color="#999" />
              <text class="data-detail">{{ post.likes ?? 0 }}</text>
              <uni-icons type="star" size="18" color="#999" />
              <text class="data-detail">{{ post.collect ?? post.focus ?? 0 }}</text>
              <uni-icons type="chat" size="18" color="#999" />
              <text class="data-detail">{{ post.comments ?? 0 }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

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
const currentTab = ref<'my' | 'collect'>('collect');

// 格式化时间
const formatCreateTime = (t: string) => t ? t.slice(0, 16) : '';

const firstImage = (p: any): string => {
  if (!p) return '';
  const pickFromArr = (arr: any[]) => {
    if (!Array.isArray(arr) || !arr.length) return '';
    const v0 = arr[0];
    if (v0 && typeof v0 === 'object' && v0.url) return v0.url;
    if (typeof v0 === 'string') return v0;
    return '';
  };
  return (
    pickFromArr(p.images) ||
    pickFromArr(p.imageList) ||
    (p.imageURL || p.imageUrl || '') ||
    (p.post ? (pickFromArr(p.post.images) || p.post.imageURL || p.post.imageUrl || '') : '') ||
    (p.cover || '')
  );
};

const postIdFor = (p: any): string => {
  if (!p) return '';
  return String(p.id || p.postId || (p.post ? p.post.id : ''));
};

const titleOf = (p: any): string => {
  return (p.title || (p.post ? p.post.title : '') || '未命名帖子');
};

const contentOf = (p: any): string => {
  return (p.content || (p.post ? p.post.content : '') || '');
};

const areaOf = (p: any): string => {
  return (p.area || (p.post ? p.post.area : '') || '未知分区');
};

const createTimeOf = (p: any): string => {
  return (p.createTime || (p.post ? p.post.createTime : '') || '');
};

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
  }
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
.post-type-buttons {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1002;
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 10px 0 20px 0;
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.06);
}
.type-button {
  width: auto;
  min-width: 110px;
  flex: none;
  padding: 10px 22px;
}

.container {
  padding: 30rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
  padding-bottom: 100px;
}
.loading, .no-posts {
  text-align: center;
  margin-top: 100rpx;
  color: #888;
  font-size: 32rpx;
}
.post-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}
.post-card {
  position: relative;
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.05);
}
.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}
.post-title {
  font-size: 36rpx;
  font-weight: bold;
}
.post-time {
  font-size: 24rpx;
  color: #aaa;
}
.post-content {
  font-size: 28rpx;
  margin-bottom: 10rpx;
}
.post-image {
  width: 100%;
  height: 300rpx;
  border-radius: 12rpx;
  object-fit: cover;
}

.item-bottom{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-top: solid 1px #f0f0f0;
  margin-top: 5px;
  background: linear-gradient(to bottom, rgba(250,250,250,0.5), rgba(255,255,255,0.8));
}

.item-bottom-left{
  font-size: 13px;
  color: #999;
}

.item-bottom-right{
  display: flex;
  align-items: center;
}

.right-data{
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #666;
  
  .uni-icons {
    transition: all 0.2s ease;
    padding: 5px;
    border-radius: 50%;
    
    &:active {
      background-color: rgba(0, 0, 0, 0.05);
      transform: scale(1.1);
    }
  }
}

.data-detail{
  margin: 0 12px 0 4px;
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

