<template>
  <view class="index-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar-wrapper" :style="{ paddingTop: `${statusBarHeight}px` }">
      <!-- 顶部导航栏标题 -->
      <view class="nav-bar-title" :style="{ paddingTop: safeAreaInsets.top + 'px' }">山海智游侠</view>
      <!-- AI入口卡片 -->
      <view class="ai-entry-card" @click="navigateToChat">
        <view class="ai-title">你好，今天想去哪里？</view>
        <view class="ai-input">
          <uv-icon name="search" :size="18" color="#9CA3AF"></uv-icon>
          <text class="ai-input-placeholder">请输入目的地或关键词...</text>
        </view>
        <view class="ai-tags">
          <view class="ai-tag">海岛游</view>
          <view class="ai-tag">亲子游</view>
          <view class="ai-tag">浮潜行</view>
          <view class="ai-tag">休闲度</view>
        </view>
      </view>
    </view>

    <!-- 主要内容区 -->
    <view class="index-main-wrapper">
     
      <!-- 图标导航 -->
      <view class="icon-nav-wrapper">
        <view v-for="item in navButtonList" :key="item.name" class="icon-item" @click="toPage(item.path)">
          <view class="icon-btn">
            <image :src="item.icon"></image>
          </view>
          <text class="icon-text">{{ item.name }}</text>
        </view>
      </view>


      <!-- 帖子瀑布流 -->
      <view class="section-wrapper mb-30">
        <view class="section-title">发现更多</view>
      </view>
      <view class="waterfall-wrapper">
        <view v-if="!postLoading" class="waterfall-alt">
          <view class="column">
            <view class="post-card animated" v-for="(item, idx) in leftPosts" :key="'L' + item.id" :style="{ animationDelay: `${idx * 60}ms` }" @click="toPostDetail(item.id)">
              <image class="post-img" :src="(item.images && item.images[0] && item.images[0].url) ? item.images[0].url : defaultImage" mode="widthFix" />
              <view class="post-info">
                <text class="post-title">{{ item.title || '无标题' }}</text>
                <view class="post-actions">
                  <view class="action-left">
                    <uv-icon name="thumb-up" :size="16"></uv-icon>
                    <text>{{ item.likes || 0 }}</text>
                  </view>
                  <button class="copy-btn" :class="{ active: item.collected }" @click.stop="collectProduct(item)">一键抄作业</button>
                </view>
              </view>
            </view>
          </view>
          <view class="column">
            <view class="post-card animated" v-for="(item, idx) in rightPosts" :key="'R' + item.id" :style="{ animationDelay: `${idx * 60}ms` }" @click="toPostDetail(item.id)">
              <image class="post-img" :src="(item.images && item.images[0] && item.images[0].url) ? item.images[0].url : defaultImage" mode="widthFix" />
              <view class="post-info">
                <text class="post-title">{{ item.title || '无标题' }}</text>
                <view class="post-actions">
                  <view class="action-left">
                    <uv-icon name="thumb-up" :size="16"></uv-icon>
                    <text>{{ item.likes || 0 }}</text>
                  </view>
                  <button class="copy-btn" :class="{ active: item.collected }" @click.stop="collectProduct(item)">一键抄作业</button>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="spot-wrapper" style="margin: 0 20rpx;">
          <uv-skeletons :loading="postLoading" :skeleton="spotSkeleton"></uv-skeletons>
        </view>
      </view>
    </view>

    <view class="blank"></view>

    <!-- 底部导航 -->
    <Tabbar />
    
    <!-- AI悬浮按钮 -->
    <AIFloatButton />
  </view>
</template>

<script setup>
// ---------------- import ----------------
import { ref, computed, onMounted, reactive } from 'vue';
import { onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import Tabbar from '../Tabbar/Tabbar.vue';
import AIFloatButton from '@/components/AIFloatButton.vue';
import { useUserStore } from '@/store/modules/user';
// ---------------- setup ----------------
onShow(() => {
});
onMounted(() => {
  // 使用新的 API 获取系统信息
  const windowInfo = uni.getWindowInfo();
  const deviceInfo = uni.getDeviceInfo();
  statusBarHeight.value = windowInfo.statusBarHeight || 0;
  safeAreaInsets.value = deviceInfo.safeAreaInsets || {};
  reloadPosts();
});
onPullDownRefresh(() => {
  reloadPosts();
  uni.stopPullDownRefresh();
});
onReachBottom(() => {
  fetchPosts();
});
// ---------------- data ----------------
// 导航按钮列表
const navButtonList = reactive([{
  name: '景点攻略',
  icon: 'https://gitee.com/luo-shaominggitee/island_image/raw/main/index/beach.png',
  path: '/pages/attractionGuide/attractionGuide'
}, {
  name: '我的收藏',
  icon: 'https://gitee.com/luo-shaominggitee/island_image/raw/main/index/heart.png',
  path: '/pages/favorite/favorite'
}, {
  name: '美食推荐',
  icon: 'https://gitee.com/luo-shaominggitee/island_image/raw/main/index/restaurant.png',
  path: '/pages/foodRecommendation/foodRecommendation'
}, {
  name: '酒店住宿',
  icon: 'https://gitee.com/luo-shaominggitee/island_image/raw/main/index/5-star-hotel.png',
  path: '/pages/hotelBooking/hotelBooking'
}
]);
// 帖子数据
const posts = ref([]);
const postLoading = ref(false);
const postPageNo = ref(1);
const postPageSize = ref(20);
const hasMore = ref(true);
const userStore = useUserStore();
const safeAreaInsets = ref({});
const statusBarHeight = ref(0);
  const themeColor = ref('#3c9cff'); // 主题颜色
  const bannerList = ref([
  'https://gitee.com/luo-shaominggitee/island_image/raw/00aa571dc9a58cf479273927eabcdae59012d58c/img/dayTravel/pexels-jayson-will-768546872-18817260.jpg',
  'https://gitee.com/luo-shaominggitee/island_image/raw/2ade706a602ac493cb52d36999ec5e68f6ca0514/index/pexels-pixabay-221471.jpg'
]);
const spotSkeleton = ref([{
  type: 'flex',
  num: 2,
  children: [{ type: 'custom', style: 'width:300rpx;height:360rpx;borderRadius:25rpx;' }, { type: 'custom', style: 'width:300rpx;height:300rpx;borderRadius:25rpx;marginLeft:20rpx;' }]
}]);
// 缺省图片
const defaultImage = ref('https://wuminghui.top:9000/travel/retouch_2025032816113042(1).png');
const sortedPosts = computed(() => posts.value.slice().sort((a,b) => Number(b.likes||0) - Number(a.likes||0)));
const leftPosts = computed(() => sortedPosts.value.filter((_, i) => i % 2 === 0));
const rightPosts = computed(() => sortedPosts.value.filter((_, i) => i % 2 === 1));
// 注释掉但保留展开/收起方法
// const toggleExpand = () => {
//   isExpanded.value = !isExpanded.value;
// };
// ---------------- methods ----------------
// 获取帖子列表（分页）
const fetchPosts = async () => {
  if (postLoading.value || !hasMore.value) return;
  postLoading.value = true;
  const params = {
    isAsc: true,
    order: 1,
    pageNo: postPageNo.value,
    pageSize: postPageSize.value
  };
  console.log('Posts API params:', params);
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/posts/page',
    method: 'GET',
    header: {
      'X-Access-Token': userStore?.token || '',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: params,
    success: (res) => {
      console.log('Posts API response:', res.data);
      if (res.statusCode === 200 && res.data && res.data.code === 200) {
        const list = (res.data && res.data.result && Array.isArray(res.data.result.list)) ? res.data.result.list : [];
        console.log('Posts API list length:', list.length);
        const filtered = list.filter(p => Array.isArray(p.images) && p.images.length > 0);
        const sorted = filtered.sort((a,b) => Number(b.likes||0) - Number(a.likes||0));
        const mapped = sorted.map(post => ({ ...post, liked: !!post.liked, collected: !!post.collected, routeCollected: false }));
        posts.value = posts.value.concat(mapped);
        // 全局按点赞数降序
        posts.value = posts.value.sort((a,b) => Number(b.likes||0) - Number(a.likes||0));
        hasMore.value = sorted.length >= postPageSize.value;
        postPageNo.value += 1;
        if (posts.value.length === 0 && postPageNo.value === 2) {
          const fallbackParams = { ...params, area: '日常活动' };
          console.log('Fallback fetch with area:', fallbackParams);
          uni.request({
            url: 'https://island.zhangshuiyi.com/island/posts/page',
            method: 'GET',
            header: {
              'X-Access-Token': userStore?.token || '',
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: fallbackParams,
            success: (res2) => {
              console.log('Fallback response:', res2.data);
              const list2 = (res2.data && res2.data.result && Array.isArray(res2.data.result.list)) ? res2.data.result.list : [];
              const filtered2 = list2.filter(p => Array.isArray(p.images) && p.images.length > 0);
              const sorted2 = filtered2.sort((a,b) => Number(b.likes||0) - Number(a.likes||0));
              const mapped2 = sorted2.map(post => ({ ...post, liked: !!post.liked, collected: !!post.collected, routeCollected: false }));
              posts.value = posts.value.concat(mapped2);
              posts.value = posts.value.sort((a,b) => Number(b.likes||0) - Number(a.likes||0));
              hasMore.value = sorted2.length >= postPageSize.value;
            },
            complete: () => { postLoading.value = false; }
          });
          return;
        }
      } else {
        uni.showToast({ title: '获取帖子失败', icon: 'none' });
        hasMore.value = false;
      }
      postLoading.value = false;
    },
    fail: (err) => {
      console.error('Posts API error:', err);
      postLoading.value = false;
      uni.showToast({ title: '网络错误', icon: 'none' });
    }
  });
};
const reloadPosts = async () => {
  hasMore.value = true;
  postPageNo.value = 1;
  posts.value = [];
  await fetchPosts();
};

// 页面跳转
const toPostDetail = (id) => {
  uni.navigateTo({ url: `/pages/post/postDetail?id=${id}` });
};

// 收藏/取消收藏（一键抄作业）
const collectProduct = async (item) => {
  const userId = userStore?.userInfo?.userId || userStore?.userInfo?.id;
  if (!userId) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }
  const dto = {
    operation: item.collected ? 0 : 1,
    postsId: String(item.id || ''),
    userId: String(userId)
  };
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/posts/collect',
    method: 'POST',
    header: {
      'X-Access-Token': userStore?.token || '',
      'Content-Type': 'application/json'
    },
    data: dto,
    success: (res) => {
      if (res.statusCode === 200 && res.data && res.data.success) {
        item.collected = !item.collected;
        uni.showToast({ title: item.collected ? '已收藏' : '已取消收藏', icon: 'success' });
      } else {
        uni.showToast({ title: res.data?.message || '收藏失败', icon: 'none' });
      }
    },
    fail: () => {
      uni.showToast({ title: '网络错误', icon: 'none' });
    }
  });
};


const toPage = (path) => {
    uni.navigateTo({ url: path });
};

// 其他保留方法


// 会员充值导航
const navigateToMembership = () => {
  uni.navigateTo({
    url: '/pages/membership/membership'
  });
};

// AI入口跳转
const navigateToChat = () => {
  uni.navigateTo({ url: '/pages/chat/chat' });
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
  .ai-entry-card {
    width: 92%;
    margin: 0 auto;
    margin-top: 80rpx;
    background: #6CA5FA;
    border-radius: 24rpx;
    box-shadow: $app-shadow;
    padding: 24rpx;
  }
  .ai-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #111827;
    margin-bottom: 20rpx;
  }
  .ai-input {
    display: flex;
    align-items: center;
    gap: 12rpx;
    background: #F3F4F6;
    border-radius: 16rpx;
    height: 72rpx;
    padding: 0 20rpx;
    margin-bottom: 20rpx;
  }
  .ai-input-placeholder {
    font-size: 26rpx;
    color: #9CA3AF;
  }
  .ai-tags {
    display: flex;
    gap: 16rpx;
    flex-wrap: wrap;
  }
  .ai-tag {
    background: #F9FAFB;
    color: #6B7280;
    border-radius: 9999rpx;
    padding: 10rpx 22rpx;
    font-size: 24rpx;
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

/* 瀑布流 */
.waterfall-wrapper { padding: 0 10rpx; }
.waterfall-alt { display:flex; gap: 20rpx; }
.column { flex: 1; display: flex; flex-direction: column; gap: 20rpx; }
.post-card { background: #fff; border-radius: 20rpx; overflow: hidden; box-shadow: $app-shadow; }
.animated { animation: fadeUp 320ms ease both; }
.post-img { width: 100%; height: auto; display: block; }
.post-info { padding: 16rpx; }
.post-title { font-size: $fs-base; font-weight: bold; color: #111827; line-height: 1.4; }
.post-actions { margin-top: 10rpx; display:flex; justify-content: space-between; align-items:center; }
.action-left { display:flex; align-items:center; gap: 8rpx; color:#666; font-size: $fs-small; }
.copy-btn { background: #e6f0ff; color: #3c78ff; border: none; border-radius: 28rpx; padding: 10rpx 18rpx; font-size: $fs-small; }
.copy-btn.active { background: #3c78ff; color: #fff; }

@keyframes fadeUp {
  0% { opacity: 0; transform: translateY(12rpx); }
  100% { opacity: 1; transform: translateY(0); }
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

</style>
 
