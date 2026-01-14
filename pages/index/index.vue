<template>
  <view class="index-container">
    <!-- 背景图 -->
    <image class="bg-image" src="https://gitee.com/luo-shaominggitee/island_image/raw/2ade706a602ac493cb52d36999ec5e68f6ca0514/index/pexels-pixabay-221471.jpg" mode="aspectFill"></image>
    
    <!-- 顶部导航栏 -->
    <view class="custom-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <view class="location-wrapper" @click="showLocationPicker = true">
           <view class="location-title-row">
             <text class="location-text-en">ZHUHAI</text>
             <view class="location-main">
               <text class="location-text-zh">{{ currentLocation }}</text>
               <uv-icon name="arrow-down" size="14" color="#fff" style="margin-left: 4rpx;"></uv-icon>
             </view>
           </view>
        </view>
        <!-- 右侧留白或功能区 -->
        <view class="header-right"></view>
      </view>
    </view>
    
    <!-- 地区选择器 -->
    <uv-picker 
      ref="locationPicker" 
      :show="showLocationPicker" 
      :columns="locationColumns"
      :zIndex="99999"
      @confirm="onLocationConfirm"
      @cancel="showLocationPicker = false"
      @close="showLocationPicker = false"
    ></uv-picker>

    <!-- 搜索横幅 -->
    <view class="search-banner-area">
       <view class="search-pill" @click="navigateToChat">
          <view class="search-left">
            <uv-icon name="chat" size="20" color="#3c9cff"></uv-icon>
            <text class="search-text">旅游景点 酒店 美食，AI为您提供攻略推荐</text>
          </view>
          <view class="search-arrow-circle">
            <uv-icon name="arrow-right" size="12" color="#fff"></uv-icon>
          </view>
       </view>
    </view>

    <!-- 主要内容区 (白色圆角背景) -->
    <view class="main-content">
      <!-- 图标导航 -->
      <view class="icon-nav-wrapper">
        <view v-for="item in navButtonList" :key="item.name" class="icon-item" @click="toPage(item.path)">
          <view class="icon-btn-circle">
            <image :src="item.icon" class="icon-img"></image>
          </view>
          <text class="icon-text">{{ item.name }}</text>
        </view>
      </view>

      <!-- 分类Tab栏 -->
      <uv-sticky offset-top="0">
        <view class="tab-bar-wrapper">
          <view class="tab-scroll-view">
             <view class="tab-list">
                <view 
                  v-for="(tab, index) in tabList" 
                  :key="index" 
                  class="tab-item" 
                  :class="{ active: currentTab === index }"
                  @click="changeTab(index)"
                >
                  <text class="tab-text">{{ tab }}</text>
                  <view v-if="currentTab === index" class="active-indicator"></view>
                </view>
             </view>
          </view>
          <view class="filter-btn">
            <image src="https://gitee.com/luo-shaominggitee/island_image/raw/main/img/New_version/筛选.png" style="width: 32rpx; height: 32rpx;" mode="aspectFit"></image>
            <text>筛选</text>
          </view>
        </view>
      </uv-sticky>

      <!-- 帖子瀑布流 -->
      <view class="waterfall-wrapper">
        <view v-if="!postLoading" class="waterfall-alt">
          <view class="column">
            <view class="post-card animated" v-for="(item, idx) in leftPosts" :key="'L' + item.id" :style="{ animationDelay: `${idx * 60}ms` }" @click="toPostDetail(item.id)">
              <view class="image-wrapper">
                 <image class="post-img" :src="(item.images && item.images[0] && item.images[0].url) ? item.images[0].url : defaultImage" mode="widthFix" />
                 <view class="duration-badge">2天一夜</view>
                 <!-- AI Badge Top Left (Randomly show for demo) -->
                 <view v-if="idx % 3 === 0" class="ai-badge-top">AI推荐</view>
                 <!-- Play Icon (Randomly show for demo) -->
                 <view v-if="idx % 4 === 0" class="play-icon">
                    <uv-icon name="play-right-fill" size="24" color="#fff"></uv-icon>
                 </view>
              </view>
              <view class="post-info">
                <text class="post-title">
                   <text v-if="idx % 5 === 0" class="ai-badge-inline">精选作品</text>
                   {{ item.title || '无标题' }}
                </text>
                
                <view class="author-info">
                   <uv-avatar :src="item.userVO?.avatar || item.userAvatar" size="16"></uv-avatar>
                   <text class="author-name">{{ item.userVO?.realname || item.userName || '用户' }}</text>
                </view>

                <view class="post-actions">
                  <view class="like-count">
                     <uv-icon name="thumb-up" size="14" color="#999"></uv-icon>
                     <text>{{ item.likes || 4652 }}</text>
                  </view>
                  <button class="copy-btn" @click.stop="toPostDetail(item.id)">
                     <text>一键抄作业</text>
                  </button>
                </view>

              </view>
            </view>
          </view>
          <view class="column">
            <view class="post-card animated" v-for="(item, idx) in rightPosts" :key="'R' + item.id" :style="{ animationDelay: `${idx * 60}ms` }" @click="toPostDetail(item.id)">
              <view class="image-wrapper">
                <image class="post-img" :src="(item.images && item.images[0] && item.images[0].url) ? item.images[0].url : defaultImage" mode="widthFix" />
                <view class="duration-badge">2天一夜</view>
                <!-- AI Badge Top Left (Randomly show for demo) -->
                 <view v-if="idx % 3 === 1" class="ai-badge-top">AI推荐</view>
              </view>
              <view class="post-info">
                <text class="post-title">
                   <text v-if="idx % 5 === 2" class="ai-badge-inline">精选作品</text>
                   {{ item.title || '无标题' }}
                </text>
                
                <view class="author-info">
                   <uv-avatar :src="item.userVO?.avatar || item.userAvatar" size="16"></uv-avatar>
                   <text class="author-name">{{ item.userVO?.realname || item.userName || '用户' }}</text>
                </view>

                <view class="post-actions">
                  <view class="like-count">
                     <uv-icon name="thumb-up" size="14" color="#999"></uv-icon>
                     <text>{{ item.likes || 4652 }}</text>
                  </view>
                  <button class="copy-btn" @click.stop="toPostDetail(item.id)">
                     <text>一键抄作业</text>
                  </button>
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
  name: '景点查询',
  icon: 'https://gitee.com/luo-shaominggitee/island_image/raw/main/index/beach.png',
  path: '/pages/attractionGuide/attractionGuide'
}, {
  name: '收藏中心',
  icon: 'https://gitee.com/luo-shaominggitee/island_image/raw/main/index/more.png',
  path: '/pages/productCollect/productCollect'
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

  // 地区选择
  const showLocationPicker = ref(false);
  const currentLocation = ref('珠海');
  const locationColumns = reactive([
    ['珠海', '广州', '扬州', '上海', '香港', '厦门']
  ]);
  const onLocationConfirm = (e) => {
    currentLocation.value = e.value[0];
    showLocationPicker.value = false;
  };

  // Tab列表
  const tabList = ref(['旅游攻略', '景点安利', '酒店推荐', '美食分享']);
  const currentTab = ref(0);
  const changeTab = (index) => {
    currentTab.value = index;
    // 这里可以添加筛选逻辑，例如重新加载帖子
  };

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
        const mapped = sorted.map(post => ({ ...post, liked: !!post.liked }));
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
              const mapped2 = sorted2.map(post => ({ ...post, liked: !!post.liked }));
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

// 移除收藏相关功能


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
  min-height: 100vh;
  background-color: #f5f6f7;

  /* 背景图 */
  .bg-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 750rpx; // 覆盖上半部分
    z-index: 0;
  }

  /* 自定义头部 */
  .custom-header {
    position: relative;
    z-index: 1000;
    
    .header-content {
      height: auto;
      min-height: 44px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding: 0 30rpx;
    }

    .location-wrapper {
      margin-top: 10rpx;
      margin-bottom: 20rpx;

      .location-title-row {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }

      .location-text-en {
         font-size: 20rpx;
         color: rgba(255,255,255,0.8);
         font-weight: bold;
         letter-spacing: 2rpx;
         margin-bottom: 2rpx;
      }

      .location-main {
        display: flex;
        align-items: center;
      }
      
      .location-text-zh {
        font-size: 40rpx;
        color: #fff;
        font-weight: bold;
        margin-right: 8rpx;
      }
    }
  }

  /* 搜索横幅区域 */
  .search-banner-area {
    position: relative;
    z-index: 10;
    padding: 0 30rpx;
    margin-top: 20rpx;
    margin-bottom: 40rpx;

    .search-pill {
      background: #fff;
      border-radius: 40rpx;
      padding: 16rpx 20rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
      
      .search-left {
        display: flex;
        align-items: center;
        gap: 16rpx;
        flex: 1;
      }

      .search-text {
        font-size: 26rpx;
        color: #333;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .search-arrow-circle {
        width: 48rpx;
        height: 48rpx;
        background: #3c9cff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  /* 主要内容区 */
  .main-content {
    position: relative;
    z-index: 20;
    background: #f5f6f7;
    border-radius: 40rpx 40rpx 0 0;
    margin-top: 20rpx; /* Adjusted margin since banner is now part of header flow visually or needs space */
    padding-bottom: 120rpx; // 底部导航栏高度
    min-height: 50vh;
    overflow: hidden;

    /* 图标导航 */
    .icon-nav-wrapper {
      background: #fff;
      padding: 40rpx 20rpx;
      display: flex;
      justify-content: space-between;
      border-radius: 40rpx 40rpx 0 0;
      margin-bottom: 20rpx;

      .icon-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
      }

      .icon-btn-circle {
        width: 100rpx;
        height: 100rpx;
        background: #fff; /* Changed to white or light gray as per image description "white rounded square" */
        border-radius: 24rpx; /* Rounded square */
        box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05); /* Slight shadow */
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16rpx;
        
        .icon-img {
          width: 56rpx;
          height: 56rpx;
        }
      }

      .icon-text {
        font-size: 26rpx;
        color: #666;
      }
    }

    /* Tab栏 */
    .tab-bar-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20rpx 30rpx;
      background: #f5f6f7; 
      
      .tab-scroll-view {
         flex: 1;
         overflow-x: auto;
         white-space: nowrap;
         margin-right: 20rpx;
         
         /* Hide scrollbar */
         &::-webkit-scrollbar {
           display: none;
         }
      }

      .tab-list {
        display: flex;
        align-items: center;
        /* Use fixed spacing instead of space-between to match prototype */
        gap: 40rpx;
        justify-content: flex-start;
      }

      .tab-item {
        position: relative;
        padding-bottom: 10rpx;
        flex-shrink: 0; 
        padding: 0 5rpx;
        
        .tab-text {
          font-size: 30rpx; /* Restored size */
          color: #333; /* Darker gray by default */
          white-space: nowrap; 
          transition: all 0.3s;
          font-weight: 500;
        }

        &.active {
          .tab-text {
            color: #000; /* Black for active */
            font-weight: bold;
            font-size: 32rpx; 
          }
        }

        .active-indicator {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40rpx;
          height: 6rpx;
          background: #3c9cff;
          border-radius: 3rpx;
        }
      }

      .filter-btn {
        display: flex;
        align-items: center;
        gap: 8rpx;
        font-size: 28rpx;
        color: #666;
        padding-left: 0; /* Remove padding */
        border-left: none; /* Remove border */
        flex-shrink: 0;
        margin-left: auto; /* Push to the right */
      }
    }
  }
}

/* 瀑布流 */
.waterfall-wrapper { padding: 0 6rpx; }
.waterfall-alt { display:flex; gap: 10rpx; padding: 0; }
.column { flex: 1; display: flex; flex-direction: column; gap: 10rpx; }

.post-card { 
  background: #fff; 
  border-radius: 20rpx; 
  overflow: hidden; 
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03);
  position: relative;
  
  .image-wrapper {
    position: relative;
    
    .post-img { 
      width: 100%; 
      height: auto; 
      display: block; 
    }
    
    .duration-badge {
      position: absolute;
      bottom: 12rpx;
      right: 12rpx;
      background: rgba(0,0,0,0.6);
      color: #fff;
      font-size: 20rpx;
      padding: 4rpx 12rpx;
      border-radius: 10rpx;
    }

    /* 播放图标 */
    .play-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.3);
      border-radius: 50%;
      padding: 10rpx;
    }
    
    /* AI推荐标签 - 样式1 (右上角标签) */
    .ai-badge-top {
      position: absolute;
      top: 12rpx;
      left: 12rpx;
      background: #3c9cff;
      color: #fff;
      font-size: 20rpx;
      padding: 4rpx 12rpx;
      border-radius: 8rpx;
      z-index: 2;
    }
  }

  .post-info { 
    padding: 20rpx; 
    
    .post-title { 
      font-size: 28rpx; 
      font-weight: bold; 
      color: #111827; 
      line-height: 1.5;
      margin-bottom: 16rpx;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }

    /* AI Badge Inline style */
    .ai-badge-inline {
       display: inline-block;
       background: #3c9cff;
       color: #fff;
       font-size: 20rpx;
       padding: 2rpx 8rpx;
       border-radius: 6rpx;
       margin-right: 8rpx;
       vertical-align: middle;
    }

    .author-info {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;
      
      .author-name {
        font-size: 22rpx;
        color: #999;
        margin-left: 10rpx;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .post-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .like-count {
        display: flex;
        align-items: center;
        gap: 6rpx;
        font-size: 22rpx;
        color: #999;
      }
      
      .copy-btn {
        width: auto; /* Auto width */
        min-width: 140rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8rpx;
        background: #3c9cff; /* Blue background */
        color: #fff; /* White text */
        border: none;
        border-radius: 30rpx;
        padding: 10rpx 20rpx;
        font-size: 24rpx;
        line-height: 1.5;
        margin: 0;
        
        &.active {
          background: #cccccc; /* Disabled/Active state color */
          color: #fff;
        }
        
        &::after { border: none; }
      }
    }
  }
}

.animated { animation: fadeUp 320ms ease both; }
@keyframes fadeUp {
  0% { opacity: 0; transform: translateY(12rpx); }
  100% { opacity: 1; transform: translateY(0); }
}

.blank { height: 40rpx; }
</style>
 
