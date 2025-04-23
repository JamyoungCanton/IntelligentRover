<template>
    <view class="tab-block">
        <ul
            class='tab-list flex flex-center'
            :class="showMiddleButton === true ? 'tab-list-middle' : 'tab-list-default'"
        >
            <li
                v-for="(item, index) in tabList"
                :class="['list-item flex flex-column flex-middle', item.middleClass, { specialColor: activeIndex === index }]"
                @click="handlePush(item, index)"
                :key="index"
            >
                <view class="item-img-box">
                    <image
                        class="item-img"
                        :src="activeIndex === index ? item.selectedIconPath : item.iconPath"
                    />
                </view>
                <view class="item-text font-20 color-black">
                    {{item.text}}
                </view>
            </li>
        </ul>

     
    </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
// 引入 onShow 来处理页面返回时的高亮更新
import { onShow } from '@dcloudio/uni-app';


// --- 状态 ---
const activeIndex = ref(0); 
const showTabBar = ref(false); 
const showMiddleButton = ref(false);
const tabList = ref([
    {
        iconPath: '/static/index/底部-首页-未选.svg',
        selectedIconPath: '/static/index/底部-首页-选.svg',
        text: '首页',
        pagePath: '/pages/index/index',
        isTabPage: true, 
        middleClass: ''
    },
    {
        iconPath: '/static/index/底部-首页-未选.svg', 
        selectedIconPath: '/static/index/底部-首页-选.svg',
        text: '社交',
        pagePath: '/pages/ticketPoints/ticketPoints',
        isTabPage: true,
        middleClass: ''
    },
    {
        iconPath: '/static/index/LOGO.png',
        selectedIconPath: '/static/index/LOGO.png',
        text: '聊天',
        pagePath: '/pages/chat/chat',
        isTabPage: true, 
        middleClass: ''
    },
    {
        iconPath: '/static/index/底部-订单-未选.svg',
        selectedIconPath: '/static/index/底部-订单-选.svg',
        text: '订单',
        pagePath: '/pages/order/order',
        isTabPage: true, 
        middleClass: ''
    },
    {
        iconPath: '/static/index/底部-我的-未选.svg',
        selectedIconPath: '/static/index/底部-我的-选.svg',
        text: '我的',
        pagePath: '/pages/my/my',
        isTabPage: true, 
        middleClass: ''
    }
]);

// --- 方法 ---
const setTabBarLayout = () => {
    // 先重置所有 middleClass
    tabList.value.forEach(item => item.middleClass = '');
    let tabLength = tabList.value.length;
    if (tabLength % 2) { // 奇数个 Tab
        showMiddleButton.value = true;
        let middleIndex = Math.floor(tabLength / 2);
        if (tabList.value[middleIndex]) {
            tabList.value[middleIndex].middleClass = 'mid-button';
        }
    } else {
        showMiddleButton.value = false;
    }
};

const handlePush = (item, index) => {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const currentRoute = '/' + currentPage.route;

    console.log('Current Route:', currentRoute, 'Target Path:', item.pagePath);

    if (item.pagePath === currentRoute) {
        console.log("Already on this page.");
        return;
    }

    if (item.isTabPage) {
        console.log("Switching Tab to:", item.pagePath);
        uni.switchTab({
            url: item.pagePath,
            fail: (err) => {
                console.error("SwitchTab failed:", err);
            }
        });
    } else {
        console.log("Navigating to:", item.pagePath);
        uni.navigateTo({
            url: item.pagePath,
            fail: (err) => {
                console.error("NavigateTo failed:", err);
            }
        });
    }
};
const getSystemInfo = () => {
    uni.getSystemInfo({
        success: (res) => {
            if (res.safeArea && res.safeArea.top > 20) {
            }
        }
    });
};

// --- ：根据当前路由设置激活状态 ---
const setActiveTab = () => {
    const pages = getCurrentPages();
    if (!pages.length) {
        console.warn("Cannot get current pages.");
        activeIndex.value = 0; 
        return;
    }
    const currentPage = pages[pages.length - 1];
    const currentRoute = '/' + currentPage.route; 

    console.log("setActiveTab - Current Route:", currentRoute);

    const foundIndex = tabList.value.findIndex(item => item.pagePath === currentRoute);

    if (foundIndex !== -1) {
        activeIndex.value = foundIndex;
        console.log("setActiveTab - Found index:", foundIndex);
    } else {
        activeIndex.value = 0; 
        console.warn("setActiveTab - Route not found in tabList, defaulting to 0.");
    }
};

// --- 生命周期钩子 ---
onMounted(() => {
    console.log("TabBar Mounted");
    getSystemInfo();
    setTabBarLayout();
    setActiveTab(); 
});


onShow(() => {
    console.log("TabBar Show");
    setActiveTab();
});

</script>

<style lang="scss" scoped> 
.specialColor .item-text {
    color: rgb(229, 113, 1) !important; 
}
.color-black { 
    color: #333;
}

.flex { display: flex; flex-flow: row wrap; }
.flex-center { align-items: center; justify-content: center; & > * { margin: 0; } }
.flex-column { flex-direction: column; }
.flex-middle { align-items: center; }
.font-20 { font-size: 20rpx; }

.tab-block {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 999;
    width: 100vw;
    margin: 0;
    padding: 0;
    background-color: #FFFFFF; 
    box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.05);

    .tab-list {
        height: 100rpx; 
        padding-bottom: constant(safe-area-inset-bottom); 
        padding-bottom: env(safe-area-inset-bottom); 
        box-sizing: content-box; 
        margin: 0;
        padding-left: 0; 
        padding-right: 0; 
        padding-top: 0; 
        list-style: none; 
    }

    .tab-list-default {
        background-color: #FFFFFF;
    }

    .tab-list-middle {
        position: relative;
        background: url('https://res.paquapp.com/popmartvip/home/nav_bar_bg_2x.png') no-repeat center center;
        background-size: cover;
    }

    .list-item {
        flex: 1;
        position: relative; 
        height: 100%;
        padding-top: 10rpx; 
        box-sizing: border-box;

        .item-img-box {
            width: 44rpx;
            height: 42rpx;
            margin-bottom: 6rpx; 
            position: relative;
        }

        .item-img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .item-text {
            font-size: 20rpx;
            width: auto;
            text-align: center;
            line-height: 1.2; 
        }
    }

    .mid-button {
        // 中间按钮特殊样式
        .item-img-box {
            width: 96rpx;
            height: 96rpx;
            position: absolute;
            z-index: 1002;
            top: -40rpx; 
            left: 50%;
            transform: translateX(-50%);
            margin-bottom: 0;
            background-color: #fff;
            border-radius: 50%;
            box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
        }

        .item-img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
        }

        .item-text {
            font-size: 20rpx;
            position: absolute;
            bottom: 10rpx; 
            left: 50%;
            transform: translateX(-50%);
            z-index: 1002;
        }
    }

     /* 中间按钮激活时的文本颜色 */
    .mid-button.specialColor .item-text {
         color: rgb(229, 113, 1) !important;
    }


}
</style>
