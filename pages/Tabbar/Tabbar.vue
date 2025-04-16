<template>
    <view>
        <view class="tabbar">
            <view
                v-for="(item, index) in tabList"
                :key="index"
                @click="switchTab(item.url, index)"
                :class="activeTab === index? 'tab-active' : ''"
            >
                <view class="plus" v-if="index == 2">
                    <uni-icons type="chat" size="28" color="#fff"></uni-icons>
                </view>
                <view v-else class="tab">
                    <uni-icons
                        :type="item.icon"
                        size="30"
                        :color="activeTab === index? themeColor : '#999'"
                    ></uni-icons>
                    <view :class="activeTab === index? 'tab-active' : ''">{{ item.name }}</view>
                </view>
            </view>
        </view>
        <!-- 弹出层 -->
        <view class="popup-mask" v-if="showPopup" @click="showPopup = false">
            <view class="popup-content" @click.stop>
                <view class="popup-wrapper">
                <view class="popup-button" @click="toCreatePost">
                    <uni-icons type="file-text" size="24" :color="themeColor"></uni-icons>
                    <view class="popup-text">
                    <view class="popup-title">发布帖子</view>
                    <view class="popup-desc">分享你的桌游故事和精彩瞬间</view>
                    </view>
                </view>
                <view class="popup-button" @click="toCreateActivity">
                    <uni-icons type="account" size="24" :color="themeColor"></uni-icons>
                    <view class="popup-text">
                    <view class="popup-title">发布活动</view>
                    <view class="popup-desc">组织桌游聚会，创造难忘时刻</view>
                    </view>
                </view>
                </view>
            </view>
            </view>
        <u-gap height="100"></u-gap>
    </view>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
    active: {
        type: Number,
        default: 0 // 默认高亮第一个 tab
    }
});

const activeTab = ref(props.active); // 绑定当前激活的 tab 索引

const tabList = ref([
    {
        name: '首页',
        url: '/pages/index/index',
        icon: 'home',
        active: false
    },
    {
        name: '行程',
        url: '/pages/itinerary/itinerary',
        icon: 'list',
        active: false
    },
    {
        name: '',
        url: '/pages/chat/chat',
        icon: 'chatbubble',
        active: false
    },
    {
        name: '订单',
        url: '/pages/order/order',
        icon: 'cart',
        active: false
    },
    {
        name: '我的',
        url: '/pages/my/my',
        icon: 'person',
        active: false
    }
]);

const themeColor = '#007aff'; // 高亮颜色设置为蓝色

// 监听 props.active 的变化
watch(() => props.active, (newVal) => {
    activeTab.value = newVal;
});

const showPopup = ref(false) // 控制弹窗显示

const switchTab = (url, index) => {
  if (index === 1) { // 行程是第二个tab项(index=1)
    showPopup.value = true
  } else {
    const prevActiveTab = activeTab.value;
    activeTab.value = index;
    nextTick(() => {
      uni.switchTab({ url })
    })
  }
}



const toCreatePost = () => {
  uni.navigateTo({ url: '/pages/post/createPost' })
  showPopup.value = false
}

const toCreateActivity = () => {
  uni.navigateTo({ url: '/pages/post/createActivity' })
  showPopup.value = false
}
</script>

<style scoped>
.tabbar {
    background-color: #f3f4fa;
    width: 100%;
    height: 100rpx;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 100;
    padding-bottom: env(safe-area-inset-bottom);
    padding: 15rpx 0;
    display: flex;
    justify-content: space-around;
    z-index: 999;
}

.tab {
    display: flex;
    flex-direction: column;
    font-size: 24rpx;
    align-items: center;
    width: 80rpx;
}

.tab-active {
    color: #007aff; /* 直接使用颜色值 */
}

.plus {
    width: 80rpx;
    height: 80rpx;
    background-color: #f17700;
    border-radius: 30rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto 25rpx;
}

.plus:active {
    background-color: #0056b3; /* 可以自定义按下后的颜色 */
}

.popup-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 20rpx;
    padding-top: 50rpx;
}

.popup-button {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    border-radius: 25rpx;
    padding: 20rpx 40rpx;
    background-color: #fff;
    box-shadow: 0 3px 9px #eee;
    transition: all 0.1s;
}

.popup-button:active {
    background-color: #eee;
}

.popup-button image {
    width: 48rpx;
    height: 48rpx;
}

.popup-text {
    margin-left: 20rpx;
}

.popup-title {
    font-size: 28rpx;
    font-weight: bold;
}

.popup-desc {
    font-size: 24rpx;
    color: #999;
}
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1000;
}

.popup-content {
  width: 100%;
  background-color: #fff;
  border-radius: 16rpx 16rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
  animation: popup-show 0.3s ease;
}

@keyframes popup-show {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>