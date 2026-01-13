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
        <view class="delete-btn" @tap.stop="handleDelete(post.id)">
          <image src="https://wuminghui.top:9000/wlmtsys/2025/06/10/5079bce8f2094183a05d5bc41c37d35f.png" style="width: 22px; height: 22px;" mode="aspectFit" />
        </view>

        <!-- 点击整个卡片跳详情 -->
        <view @tap="toDetail(post.id)">
          <view class="post-header">
            <text class="post-title">{{ post.title || '未命名帖子' }}</text>
          </view>
          <view class="post-content">{{ post.content }}</view>
          <image
            v-if="Array.isArray(post.images) && post.images.length"
            :src="post.images[0].url"
            class="post-image"
            mode="aspectFill"
          />

          <!-- 底部信息 -->
          <view class="item-bottom">
            <!-- 左侧：时间 · 分区 -->
            <view class="item-bottom-left">
              <text class="left-data">
                {{ formatCreateTime(post.createTime) }} · {{ post.area || '未知分区' }}
              </text>
            </view>
            <!-- 右侧：点赞/关注/评论 -->
            <view class="item-bottom-right">
              <uni-icons type="heart" size="18" color="#999" />
              <text class="data-detail">{{ post.likes ?? 0 }}</text>
              <uni-icons type="star" size="18" color="#999" />
              <text class="data-detail">{{ post.collect ?? 0 }}</text>
              <uni-icons type="chat" size="18" color="#999" />
              <text class="data-detail">{{ post.comments ?? 0 }}</text>
            </view>
          </view>
        </view>
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

// 原生时间格式化
const formatTime = (t: string) => t ? new Date(t).toLocaleString() : '';
// 截取到分钟
const formatCreateTime = (t: string) => t ? t.slice(0, 16) : '';

// 拉我的帖子
async function fetchMyPosts() {
  loading.value = true;
  const userId = String(uni.getStorageSync('userId') || userStore.userInfo.userId || userStore.userInfo.id);
  const token = uni.getStorageSync('token') || userStore.token;
  console.log('查询我的帖子用的 userId:', userId, typeof userId);
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
    console.log('接口返回:', res);
    if ((res.statusCode === 200 || res.statusCode === 0) && (res.data.success || res.data.code === 0)) {
      console.log('帖子列表:', res.data.result.list);
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
// 切换跳转逻辑
function switchTab(tab: 'my' | 'collect') {
  if (tab === currentTab.value) return;
  currentTab.value = tab;

  if (tab === 'collect') {
    uni.redirectTo({ url: '/pages/collectpost/collectpost' });
  } else {
    uni.redirectTo({ url: '/pages/post/mypost' }); // 替换为你实际的"我的发布"路径
  }
}

onMounted(fetchMyPosts);
</script>

<style  lang="scss" scoped>
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
.delete-btn {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 2rpx 8rpx rgba(255,77,79,0.12);
  transition: background 0.2s;
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
