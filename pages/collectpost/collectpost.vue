<template>
  <view class="container">
    <view class="post-type-buttons">
      <view
        class="type-button"
        :class="{ active: currentTab === 'my' }"
        @tap="switchTab('my')"
      >
        <uni-icons type="compose" size="18" :color="currentTab === 'my' ? '#fff' : '#666'" />
        <text>我的发布</text>
      </view>
      <view
        class="type-button"
        :class="{ active: currentTab === 'collect' }"
        @tap="switchTab('collect')"
      >
        <uni-icons type="star" size="18" :color="currentTab === 'collect' ? '#fff' : '#666'" />
        <text>我的收藏</text>
      </view>
    </view>

    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="posts.length === 0" class="no-posts">你还没有收藏任何帖子</view>
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

        <!-- 底部信息 -->
        <view class="item-bottom">
          <view class="item-bottom-left">
            <text class="left-data">
              {{ formatCreateTime(post.createTime) }} · {{ post.area || '未知分区' }}
            </text>
          </view>
          <view class="item-bottom-right">
            <uni-icons type="heart" size="18" color="#999" />
            <text class="data-detail">{{ post.likes ?? 0 }}</text>
            <uni-icons type="star" size="18" color="#999" />
            <text class="data-detail">{{ post.focus ?? 0 }}</text>
            <uni-icons type="chat" size="18" color="#999" />
            <text class="data-detail">{{ post.comments ?? 0 }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';

const posts = ref<any[]>([]);
const loading = ref(true);
const userStore = useUserStore();
const currentTab = ref<'my' | 'collect'>('collect');


// 时间格式化
const formatTime = (t: string) => t ? new Date(t).toLocaleString() : '';
const formatCreateTime = (t: string) => t ? t.slice(0, 16) : '';

// 获取收藏帖子列表
async function fetchCollectedPosts() {
  loading.value = true;
  const userId = uni.getStorageSync('userId');
  const token = uni.getStorageSync('token') || userStore.token;

  try {
    const res: any = await new Promise((resolve, reject) => {
      uni.request({
        url: 'https://island.zhangshuiyi.com/island/posts/collect/list',
        method: 'GET',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Access-Token': token
        },
        data: { userId, pageNo: 1, pageSize: 20 },
        success: resolve,
        fail: reject
      });
    });

    if (res.statusCode === 200 && res.data.success) {
      posts.value = res.data.result.list || [];
    } else {
      uni.showToast({ title: res.data.message || '获取失败', icon: 'none' });
    }
  } catch (e) {
    console.error(e);
    uni.showToast({ title: '网络异常', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function toDetail(id: string) {
  uni.navigateTo({
    url: `/pages/post/postDetail?id=${id}`
  });
}
function switchTab(tab: 'my' | 'collect') {
  if (tab === currentTab.value) return;
  currentTab.value = tab;

  if (tab === 'my') {
    uni.redirectTo({ url: '/pages/post/mypost' }); // 使用 redirectTo 而非 navigateTo
  } else {
    uni.redirectTo({ url: '/pages/post/collectpost' });
  }
}
onMounted(fetchCollectedPosts);
</script>

<style lang="scss" scoped>
.post-type-buttons {
  display: flex;
  justify-content: space-between;
  padding: 12px 15px;
  background-color: #fff;
  margin: 15px;
  border-radius: 14px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 2;
  border: 1px solid #f0f0f0;
  background: linear-gradient(to bottom, #ffffff, #f8f8f8);
}

.type-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 15px;
  border-radius: 12px;
  width: 48%;
  background-color: #f8f9fa;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.type-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  transform: translateX(-100%);
  transition: 0.6s;
  z-index: 1;
}

.type-button:hover::before {
  transform: translateX(100%);
}

.type-button text {
  margin-left: 8px;
  font-size: 15px;
  font-weight: 500;
  position: relative;
  z-index: 2;
}

.type-button.active {
  background: linear-gradient(135deg, #0080ff, #0066CC);
  color: #fff;
  box-shadow: 0 4px 10px rgba(0, 102, 204, 0.25);
  transform: translateY(-2px);
  border: none;
}

.type-button:active {
  transform: scale(0.98);
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
.delete-text {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  font-size: 28rpx;
  color: #f56c6c;
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
  
  /* 交互按钮增强 */
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
</style>
