<template>
  <view class="container" :style="`padding-top: ${statusBarHeight + 44}px;`">
    <!-- 自定义顶部导航栏 -->
    <view
      class="custom-nav"
      :style="`padding-top: ${statusBarHeight}px; height: ${statusBarHeight }px;`"
    >
      <view class="nav-left" @click="goBack">
        <uni-icons type="back" size="28" color="#333" />
      </view>
      <view class="nav-title">社区</view>
      <view class="nav-right"></view>
    </view>
    
    <!-- 轮播图（放在筛选栏上面） -->
    <view class="banner-section">
      <swiper class="banner-swiper" circular autoplay interval="3000" duration="500" indicator-dots indicator-color="rgba(255,255,255,0.4)" indicator-active-color="#ffffff">
        <swiper-item v-for="(item, index) in bannerList" :key="index">
          <image :src="item.imageUrl" mode="aspectFill" class="banner-image" />
          <view class="banner-title">
            <text>{{ item.title }}</text>
          </view>
        </swiper-item>
      </swiper>
    </view>
    
    <!-- 帖子分类区不再固定在顶部 -->
    <view class="postTypeSelect">
      <scroll-view
        class="type-scroll"
        scroll-x
        show-scrollbar="false"
        :scroll-into-view="scrollIntoViewId"
        scroll-with-animation
      >
        <view
          v-for="(type, index) in currentPostType === 'mine' ? mineTypeList : publicTypeList"
          :key="index"
          class="type-item"
          :class="{ active: activeType === type.value }"
          @click="selectType(type.value, index)"
          :id="'type-item-' + index"
        >
          {{ type.label }}
        </view>
      </scroll-view>
    </view>
    
    <!-- 帖子类型按钮 -->
    <view class="fixed-bottom-btns">
      <view class="post-type-buttons">
        <view 
          class="type-button" 
          :class="{ active: currentPostType === 'public' }" 
          @click="currentPostType === 'public' ? goToCreatePost() : switchPostType('public')"
        >
          <uni-icons type="paperplane" size="18" :color="currentPostType === 'public' ? '#fff' : '#666'"></uni-icons>
          <text>{{ currentPostType === 'public' ? '发布帖子' : '看帖子' }}</text>
        </view>
        <view 
          class="type-button" 
          :class="{ active: currentPostType === 'mine' }" 
          @click="switchPostType('mine')"
        >
          <uni-icons type="notification" size="18" :color="currentPostType === 'mine' ? '#fff' : '#666'"></uni-icons>
          <text>我的好友</text>
        </view>
      </view>
    </view>
    
    <view class="postContent">
      <!-- 看帖子tab：渲染帖子列表（带图片、标题、内容等） -->
      <template v-if="currentPostType === 'public'">
      <view class="postItem" 
        v-for="(item, index) in filteredPostList" 
        :key="index" 
        @click="navigateToPostDetail(item)"
      >
        <view class="postHeader">
          <image class="itemava"
              :src="item.userVO?.avatar || defaultAvatar"
            mode="aspectFill"
          />
          <view class="user-info">
              <text class="itemname">{{ item.userVO?.username }}</text>
              <text class="itemlv">lv3</text>
          </view>
            <view class="follow-button" @click.stop="followUser(item, $event)">
              <text :class="{'following': isFollowing(item)}">
                {{ isFollowing(item) ? '已关注' : '+ 关注' }}
              </text>
          </view>
        </view>
        <view class="postTitle">
            <text>{{ item.title }}</text>
        </view>
        <view class="postP">
          <text>{{ item.content }}</text>
        </view>
          <view class="postImage" v-if="item.images && item.images.length > 0">
          <image
            v-for="(img, imgIndex) in item.images" 
            :key="imgIndex"
            :src="img.url"
            mode="aspectFill"
            :style="getImageStyle(item.images.length, imgIndex)"
          />
        </view>
        <view class="item-bottom">
          <view class="item-bottom-left">
            <text class="left-data">{{ formatCreateTime(item.createTime) }} · {{ item.area }}</text>
          </view>
            <view class="item-bottom-right">
            <view class="right-data">
              <uni-icons type="heart" size="18" color="#999"></uni-icons>
              <text class="data-detail">{{ item.likes }}</text>
              <uni-icons type="star" size="18" color="#999"></uni-icons>
              <text class="data-detail">{{ item.collect }}</text>
              <uni-icons type="chat" size="18" color="#999"></uni-icons>
              <text class="data-detail">{{ item.comments }}</text>
            </view>
          </view>
        </view>
      </view>
        <view v-if="filteredPostList.length === 0" class="empty-state">
          <text>暂无相关内容</text>
        </view>
      </template>

      <!-- 我的好友tab：关注 -->
      <template v-if="currentPostType === 'mine' && activeType === 'follow'">
        <view class="fans-list-section">
          <view class="fans-header">
            共 <text class="fans-count">{{ focusTotal }}</text> 个关注
      </view>
          <view v-if="focusList.length === 0" class="empty-state">
            <text>暂无关注</text>
      </view>
          <view v-else>
            <view v-for="user in focusList" :key="user.id" class="fan-item">
              <image :src="user.avatar || defaultAvatar" class="fan-avatar" />
              <view class="fan-info">
                <text class="fan-name">{{ user.username }}</text>
                <text class="fan-desc">{{ (user.fans || 0) + '粉丝' }}</text>
              </view>
              <button class="follow-back-btn" @click="followBack(user)">已关注</button>
            </view>
            <view class="fans-footer">不能再往下滑了~</view>
          </view>
        </view>
      </template>

      <!-- 我的好友tab：粉丝 -->
      <template v-if="currentPostType === 'mine' && activeType === 'fans'">
        <view class="fans-list-section">
          <view class="fans-header">
            共 <text class="fans-count">{{ fansTotal }}</text> 个粉丝
          </view>
          <view v-if="fansList.length === 0" class="empty-state">
            <text>暂无粉丝</text>
          </view>
          <view v-else>
            <view v-for="fan in fansList" :key="fan.id" class="fan-item">
              <image :src="fan.avatar || defaultAvatar" class="fan-avatar" />
              <view class="fan-info">
                <text class="fan-name">{{ fan.username }}</text>
                <text class="fan-desc">{{ (fan.fans || 0) + '粉丝' }}</text>
              </view>
              <button class="follow-back-btn" @click="followBack(fan)">回关</button>
            </view>
            <view class="fans-footer">不能再往下滑了~</view>
          </view>
        </view>
      </template>
    </view>
    
    <Tabbar v-if="showTabbar" /> 
    <view style="height: 50px;"></view>
  </view>
</template>

<script setup>
import { ref,computed, onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';
import Tabbar from '../Tabbar/Tabbar.vue';
import { onShow } from '@dcloudio/uni-app';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'

const userStore = useUserStore();

const statusBarHeight = ref(0);

onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0;
});

// 看帖子页面的筛选条件
const publicTypeList = ref([
  { label: '全部', value: 'all' },
  { label: '日常活动', value: 'daily' },
  { label: '旅游攻略', value: 'strategy' },
  { label: '旅游分享', value: 'share' },
  { label: '分享生活', value: 'life' }
]);

// 我的信息页面的筛选条件
const mineTypeList = ref([
  { label: '关注', value: 'follow' },
  { label: '粉丝', value: 'fans' }
]);

const bannerList = ref([
  { 
    id: 1, 
    imageUrl: 'https://wuminghui.top:9000/travel/19.jpg',
    title: '岛屿风光'
  },
  { 
    id: 2, 
    imageUrl: 'https://wuminghui.top:9000/travel/20.webp',
    title: '海边日落'
  },
  { 
    id: 3, 
    imageUrl: 'https://wuminghui.top:9000/travel/32.jpg',
    title: '蓝天白云'
  }
]);

const currentPostType = ref('public');

const filteredPostList = computed(() => {
  if (activeType.value === 'all') {
    return postList.value;
  }
  
  // 看帖子筛选逻辑
  if (currentPostType.value === 'public') {
    if (activeType.value === 'daily') {
      return postList.value.filter(post => post.area === '日常活动');
    }
    if (activeType.value === 'strategy') {
      return postList.value.filter(post => post.area === '旅游攻略');
    }
    if (activeType.value === 'share') {
      return postList.value.filter(post => post.area === '旅游分享');
    }
    if (activeType.value === 'life') {
      return postList.value.filter(post => post.area === '分享生活');
    }
  } 
  // 我的信息筛选逻辑
  else if (currentPostType.value === 'mine') {
    if (activeType.value === 'follow') {
      return postList.value.filter(post => post.area === '关注');
    }
  }
  
  return postList.value;
});

const activeType = ref('like');
const scrollIntoViewId = ref('');

const selectType = (typeValue, index) => {
  activeType.value = typeValue;
  scrollIntoViewId.value = 'type-item-' + index;
  if (currentPostType.value === 'mine') {
    if (typeValue === 'fans') {
      getFansList();
    } else if (typeValue === 'follow') {
      getFocusList();
    }
  }
};

const getImageStyle = (imageCount, index) => {
  if (imageCount === 1) {
    return { width: '100%', height: '200px' }; // 单张图片全宽显示
  } else if (imageCount === 2) {
    return { width: '48%', height: '200px' }; // 两张图片并排显示
  } else if (imageCount === 3) {
    return { width: '32%', height: '120px' }; // 三张图片并排显示
  } else if (imageCount === 4) {
    return { width: '48%', height: '160px' }; // 四张图片并排显示
  } else {
    return { width: '32%', height: '120px' }; // 其他情况默认显示三张图片并排
  }
};

// 去掉 createTime 中的秒
const formatCreateTime = (time) => {
  if (!time) return '';
  return time.slice(0, 16);
};

// 计算时间间隔并返回描述
const getTimeAgo = (time) => {
  const now = new Date();
  const postTime = new Date(time);
  const diff = now - postTime;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else {
    return '刚刚';
  }
};

const goToCreatePost = () => {
  uni.navigateTo({
    url: '/pages/post/createPost'
  });
};

const navigateToPostDetail = (post) => {
  if (currentPostType.value === 'mine') {
    // 处理通知点击
    if (post.postId) {
      // 如果通知包含帖子ID，则导航到对应的帖子
      uni.navigateTo({
        url: `/pages/post/postDetail?id=${post.postId}`
      });
    } else {
      // 否则只是显示通知内容
      uni.showToast({
        title: '查看通知',
        icon: 'none'
      });
    }
  } else {
    // 常规帖子点击
    console.log('点击了帖子', post.id);
    uni.navigateTo({
      url: `/pages/post/postDetail?id=${post.id}`
    });
  }
};

const switchPostType = (type) => {
  currentPostType.value = type;
  if (type === 'mine') {
    activeType.value = mineTypeList.value[0].value; // 'follow'
    getFocusList();
  } else {
    activeType.value = 'all';
    getPostLst();
  }
};


onShow(() => {
  // 根据当前选择的类型获取对应的帖子
  if (currentPostType.value === 'public') {
    getPostLst();
  } else {
    getUserNotifications();
  }
});

const postList = ref([]);
// 用户通知信息列表
const notificationList = ref([]);

// 关注用户
const followUser = (post, event) => {
  if (event) event.stopPropagation();
  
  const focusId = String(post.userVO?.id || post.userVO?.userId);
  if (!focusId) {
    uni.showToast({ title: '用户ID无效，无法关注', icon: 'none' });
    return;
  }
  if (focusId === String(userStore.userInfo.id)) {
    uni.showToast({ title: '不能关注自己', icon: 'none' });
    return;
  }
  if (isFollowing(post)) {
    uni.showToast({ title: '已关注', icon: 'none' });
    return;
  }

  uni.request({
    url: 'https://island.zhangshuiyi.com/island/sys/user/focus',
    method: 'POST',
    header: {
      'X-Access-Token': userStore.token,
      'Content-Type': 'application/json'
    },
    data: {
      focusId,
      operation: 1
    },
    success: (res) => {
      if (res.data.success) {
        uni.showToast({ title: '已关注', icon: 'none' });
        getFocusList(); // 关注成功后重新拉取关注列表，刷新 focusIdSet
      } else {
        uni.showToast({ title: res.data.message || '操作失败', icon: 'none' });
      }
    },
    fail: () => {
      uni.showToast({ title: '网络请求失败', icon: 'none' });
    }
  });
};
// 获取帖子信息
const getPostLst = () => {
  uni.request({
      url: 'https://island.zhangshuiyi.com/island/posts/page',
      method: 'GET',
      header:{
        'X-Access-Token': userStore.token,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data:{
        isAsc: true,
        order:1,
        pageNo: 1,
        pageSize: 50
      },
      success: (res) => {
      console.log('获取到的帖子数据：', res.data);
        if(res.data.code === 401){
          uni.showToast({
            title: '请先登录',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        else if (res.statusCode === 200) {
        postList.value = res.data.result.list.map(post => ({
              ...post,
          isFollowing: false
        }));
        // 关键：拉取关注列表，保证按钮状态正确
        getFocusList();
        } else {
          uni.showToast({
            title: '获取帖子信息失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络请求出错',
          icon: 'none'
        });
      }
  })
}

// 获取用户关注状态
const getFollowingStatus = () => {
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/user/following',
    method: 'GET',
    header: {
      'X-Access-Token': userStore.token,
      'Content-Type': 'application/json'
    },
    success: (res) => {
      if (res.statusCode === 200 && res.data.code === 200) {
        const followingList = res.data.result || [];
        postList.value.forEach(post => {
          if (post.userVO && post.userVO.userId) {
            post.isFollowing = followingList.some(item => item.userId === post.userVO.userId);
          }
        });
      }
    }
  });
}  


// 处理收藏/取消收藏
const handleCollect = (postId, isCollect) => {
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/posts/collect',
    method: 'POST',
    header: {
      'X-Access-Token': userStore.token,
      'Content-Type': 'application/json'
    },
    data: {
      operation: isCollect ? 1 : 0,
      postsId: postId,
      userId: userStore.userInfo.userId
    },
    success: (res) => {
      if (res.statusCode === 200 && res.data.code === 200) {
        uni.showToast({
          title: isCollect ? '收藏成功' : '取消收藏成功',
          icon: 'success'
        });
        // 刷新收藏列表
        getUserCollectedPosts();
      } else {
        uni.showToast({
          title: isCollect ? '收藏失败' : '取消收藏失败',
          icon: 'none'
        });
      }
    },
    fail: (err) => {
      console.error('收藏操作请求出错:', err);
      uni.showToast({
        title: '网络错误',
        icon: 'none'
      });
    }
  });
};

const getUserCollectedPosts = () => {
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/posts/page',
    method: 'GET',
    header: {
      'X-Access-Token': userStore.token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: {
      userId: userStore.userInfo.userId,
      pageNo: 1,
      pageSize: 50
    },
    success: (res) => {
      if (res.statusCode === 200 && res.data.code === 200) {
        // 只保留已收藏的帖子
        const collectedPosts = (res.data.result.list || []).filter(post => post.collected);
        postList.value = collectedPosts.map(post => ({
          id: post.id,
          title: post.title,
          content: post.content,
          createTime: post.createTime,
          area: '收藏',
          userVO: {
            username: post.userVO?.username || '未知用户',
            userId: post.userId
          },
          images: post.images || [],
          likes: post.likes || 0,
          focus: post.focus || 0,
          comments: post.comments || 0
        }));
      } else {
        uni.showToast({
          title: '获取收藏失败',
          icon: 'none'
        });
      }
    },
    fail: (err) => {
      console.error('收藏请求出错:', err);
      uni.showToast({
        title: '网络错误',
        icon: 'none'
      });
    }
  });
};

function goBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.switchTab({
      url: '/pages/index/index'
    });
  }
}

const fansList = ref([]);
const fansTotal = ref(0);

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
      } else {
        fansList.value = [];
        fansTotal.value = 0;
        uni.showToast({
          title: '获取粉丝失败',
          icon: 'none'
        });
      }
    },
    fail: () => {
      fansList.value = [];
      fansTotal.value = 0;
      uni.showToast({
        title: '网络错误',
        icon: 'none'
      });
    }
  });
};

const focusList = ref([]);
const focusIdSet = ref(new Set());

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
        updatePostFollowingStatus();
      }
    }
  });
};

const defaultAvatar = 'https://static-typical-avatar-url.png';

const isFollowing = (post) => {
  const authorId = String(post.userVO?.id || post.userVO?.userId);
  return focusIdSet.value.has(authorId);
};

// 拉取关注列表后，更新帖子作者的 isFollowing 状态
const updatePostFollowingStatus = () => {
  focusIdSet.value = new Set(focusList.value.map(user => String(user.id)));
  postList.value.forEach(post => {
    const authorId = String(post.userVO?.id || post.userVO?.userId);
    post.isFollowing = focusIdSet.value.has(authorId);
  });
};
  
</script>

<style lang="scss">
/* 顶部轮播图样式 */
.banner-section {
  width: 100%;
  height: 200px;
  position: relative;
  margin-top: 30px;
}

.banner-swiper {
  width: 100%;
  height: 100%;
}

.banner-image {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.banner-title {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 20px;
  color: white;
  font-size: 20px;
  font-weight: 600;
  border-radius: 0;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  
  text {
    text-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
}

/* 帖子类型按钮样式 */
.post-type-buttons {
  display: flex;
  justify-content: space-between;
  padding: 12px 15px;
  background-color: #fff;
  border-radius: 14px 14px 0 0;
  box-shadow: none;
  margin: 0;
  border: none;
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
  
  &::before {
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
  
  &:hover::before {
    transform: translateX(100%);
  }
  
  text {
    margin-left: 8px;
    font-size: 15px;
    font-weight: 500;
    position: relative;
    z-index: 2;
  }
  
  &.active {
    background: linear-gradient(135deg, #0080ff, #0066CC);
    color: #fff;
    box-shadow: 0 4px 10px rgba(0, 102, 204, 0.25);
    transform: translateY(-2px);
    border: none;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.container{
  background-color: #f8f8f8;
  min-height: 100vh;
  padding-bottom: 100px;
}

.postTypeSelect {
  /* 取消 sticky/fixed 和 margin-top，恢复普通流式布局 */
  position: static;
  margin-top: 0;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border-radius: 12px 12px 0 0;
  padding: 8px 0;
}

.type-scroll {
  white-space: nowrap;
  padding: 5px 0;
  margin-left: 15px;
  scroll-behavior: smooth;
}

.type-item {
  display: inline-block;
  padding: 8px 20px;
  margin-right: 15px;
  border-radius: 20px;
  background-color: #f5f7fa;
  color: #666;
  font-size: 14px;
  font-weight: 400;
  transition: all 0.3s, transform 0.2s;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 3px;
    background: #0066CC;
    transition: all 0.3s ease;
    transform: translateX(-50%);
    opacity: 0;
    border-radius: 3px;
  }
  
  &.active {
    background-color: #E6F0FF;
    color: #0066CC;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(0, 102, 204, 0.15);
    
    &::after {
      width: 50%;
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(1px);
  }
}

.postContent {
  padding-top: 10px;
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.postItem {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  width: 92%;
  margin-bottom: 20px;
  background-color: #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.03);
  
  /* 卡片光影效果 */
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    //background: linear-gradient(to right, #0080ff, #0066CC, #66b3ff);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::after {
    opacity: 1;
  }
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  }
}

.postHeader{
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 15px;
}

.itemava{
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  border: solid 2px #f0f0f0;
  object-fit: cover;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(1.05);
    border-color: #d0e0ff;
  }
}

.itemname{
  margin-right: 12px;
  font-weight: 500;
  color: #333;
}

.itemlv{
  padding: 3px 10px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(245, 124, 0, 0.3);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255,255,255,0.3), transparent);
    opacity: 0.5;
  }
}

.postTitle{
  margin: 0 15px 8px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  letter-spacing: 0.3px;
  
  text {
    background: linear-gradient(to right, #333, #555);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
}

.postP {
  text-indent: 2em;
  font-size: 15px;
  padding: 0 15px 12px;
  color: #4f4f4f;
  line-height: 1.6;
  letter-spacing: 0.3px;
  
  text {
    display: block;
    white-space: pre-line;
  }
}

.postImage{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 15px;
  width: 100%;
  box-sizing: border-box;
}

.postImage image{
  border-radius: 8px;
  margin-bottom: 10px;
  object-fit: cover;
  transition: opacity 0.2s;
  
  &:active {
    opacity: 0.9;
  }
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

.floating-plus-button {
  display: none;
}

.user-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.follow-button {
  padding: 5px 12px;
  background: linear-gradient(to bottom, #f0f7ff, #e0eeff);
  border-radius: 15px;
  border: 1px solid #d0e0ff;
  box-shadow: 0 2px 4px rgba(0, 102, 204, 0.1);
  transition: all 0.2s ease;
  
  text {
    font-size: 13px;
    color: #0066CC;
    font-weight: 500;
    
    &.following {
      color: #666;
    }
  }
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 1px 2px rgba(0, 102, 204, 0.1);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 100px;
  color: #999;
  font-size: 16px;
  
  &::before {
    content: '📭';
    font-size: 48px;
    margin-bottom: 15px;
    opacity: 0.7;
  }
  
  text {
    background-color: rgba(255,255,255,0.7);
    padding: 10px 20px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
}

/* 通知消息卡片样式 */
.notification-item {
  background-color: #f9f9f9;
  border-left: 3px solid #0066CC;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    right: -15px;
    top: -15px;
    width: 40px;
    height: 40px;
    background-color: #0066CC;
    opacity: 0.1;
    border-radius: 50%;
  }
  
  .postTitle {
    color: #0066CC;
  }
  
  .notification-type {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    background: linear-gradient(to right, #E6F0FF, #d0e5ff);
    color: #0066CC;
    font-size: 12px;
    margin-left: 10px;
    box-shadow: 0 2px 4px rgba(0, 102, 204, 0.15);
    font-weight: 500;
  }
}

.fixed-bottom-btns {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1002;
  background: #fff;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.06);
  padding-bottom: env(safe-area-inset-bottom); /* 适配iPhone底部安全区 */
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
  /* 高度和padding-top由内联style动态设置 */
}

.nav-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.nav-right {
  width: 60rpx;
}

.fan-item {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #f5f5f5;
  width: 100%;
  box-sizing: border-box;
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

.fans-list-section {
  background: #fff;
  border-radius: 0;
  margin: 0;
  padding: 0 0 10px 0;
  width: 100%;
}

.fans-header {
  font-size: 15px;
  color: #333;
  padding: 16px 20px 8px 20px;
  font-weight: 500;
}

.fans-count {
  color: #007aff;
  font-weight: bold;
}

.fans-footer {
  text-align: center;
  color: #bbb;
  font-size: 14px;
  padding: 18px 0 6px 0;
}
</style>