<template>
  <view class="container">
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="posts.length === 0" class="no-posts">你还没有发布任何帖子</view>
    <view v-else class="post-list">
      <view 
        class="post-card" 
        v-for="post in posts" 
        :key="post.id"
      >
        <text class="delete-text" @tap.stop="handleDelete(post.id)">删除</text>

        <!-- 卡片内容区域点击跳详情 -->
        <view @tap="toDetail(post.id)">
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
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '/store/modules/user';

const userStore = useUserStore();
const posts = ref<any[]>([]);
const loading = ref(true);

// 时间格式化
const formatTime = (t: string) => t ? new Date(t).toLocaleString() : '';


// 拉我的帖子
async function fetchMyPosts() {
  loading.value = true;
  const userId = uni.getStorageSync('userId');
  const token = uni.getStorageSync('token') || userStore.token;
  try {
    const res: any = await new Promise((resolve, reject) => {
      uni.request({
        url: 'https://island.zhangshuiyi.com/island/posts/page',
        method: 'GET',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Access-Token': token
        },
        data: { userId, pageNo: 1, pageSize: 20, order: 1 },
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

// 删除帖子
async function handleDelete(postId: string) {
  const mod = await uni.showModal({
    title: '确认删除',
    content: '删除后不可恢复，是否继续？'
  });
  if (!mod.confirm) return;

  const token = uni.getStorageSync('token') || userStore.token;
  try {
    const res: any = await new Promise((resolve, reject) => {
      uni.request({
        url: 'https://island.zhangshuiyi.com/island/posts/deletePost',
        method: 'DELETE',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Access-Token': token
        },
        data: { id: postId },
        success: resolve,
        fail: reject
      });
    });
    // 按文档，200 或 204 都算成功
    if ((res.statusCode === 200 || res.statusCode === 204) && res.data.success !== false) {
      uni.showToast({ title: '删除成功', icon: 'success' });
      posts.value = posts.value.filter(p => p.id !== postId);
    } else {
      uni.showToast({ title: res.data.message || '删除失败', icon: 'none' });
    }
  } catch (e) {
    console.error(e);
    uni.showToast({ title: '网络异常', icon: 'none' });
  }
}

// 跳详情
function toDetail(id: string) {
  uni.navigateTo({
  url: `/pages/post/postDetail?id=${id}`
});
}


onMounted(fetchMyPosts);
</script>

<style scoped>
.container {
  padding: 20rpx;
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
</style>
