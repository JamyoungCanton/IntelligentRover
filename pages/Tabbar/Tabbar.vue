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
                    <uni-icons type="plus" size="24" color="#fff"></uni-icons>
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
        icon: 'robot',
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

const switchTab = (url, index) => {
    const prevActiveTab = activeTab.value; // 保存之前的激活状态
    activeTab.value = index; // 更新当前激活的 tab 索引
    nextTick(() => {
        uni.switchTab({
            url,
            success: () => {
                // 可以在这里添加跳转成功后的操作
            },
            fail: (err) => {
                console.error('页面跳转失败:', err);
                // 如果跳转失败，恢复原来的 activeTab
                activeTab.value = prevActiveTab;
            }
        });
    });
};
</script>

<style scoped>
.tabbar {
    background-color: #fff;
    width: 750rpx;
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
</style>