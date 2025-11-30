<template>
    <view class="tab-block">
        <ul
            class='tab-list flex flex-center tab-list-default'
        >
            <li
                v-for="(item, index) in tabList"
                :class="['list-item flex flex-column flex-middle', { specialColor: activeIndex === index }]"
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
const tabList = ref([
    {
        iconPath: '/static/index/底部-首页-未选.svg',
        selectedIconPath: '/static/index/底部-首页-选.svg',
        text: '首页',
        pagePath: '/pages/index/index',
        isTabPage: true
    },
    {
        iconPath: '/static/index/社区.svg', 
        selectedIconPath: '/static/index/首页-社区互动.svg',
        text: '社交',
        pagePath: '/pages/ticketPoints/ticketPoints',
        isTabPage: true
    },
    {
        iconPath: '/static/index/底部-订单-未选.svg',
        selectedIconPath: '/static/index/底部-订单-选.svg',
        text: '订单',
        pagePath: '/pages/order/order',
        isTabPage: true
    },
    {
        iconPath: '/static/index/底部-我的-未选.svg',
        selectedIconPath: '/static/index/底部-我的-选.svg',
        text: '我的',
        pagePath: '/pages/my/my',
        isTabPage: true
    }
]);

// --- 方法 ---

const tabBarPages = [
    '/pages/index/index',
    '/pages/order/order',
    '/pages/my/my'
];

const handlePush = (item, index) => {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const currentRoute = '/' + currentPage.route;

    if (item.pagePath === currentRoute) {
        return;
    }

    if (tabBarPages.includes(item.pagePath)) {
        uni.switchTab({
            url: item.pagePath,
            fail: (err) => {
                console.error("SwitchTab failed:", err);
            }
        });
    } else {
        uni.reLaunch({
            url: item.pagePath,
            fail: (err) => {
                console.error("reLaunch failed:", err);
            }
        });
    }
};
// 已移除 getSystemInfo，不再需要

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
    setActiveTab(); 
});


onShow(() => {
    console.log("TabBar Show");
    setActiveTab();
});

</script>

<style lang="scss" scoped> 
.specialColor .item-text {
    color: rgb(38, 88, 162) !important; 
}
.color-black { 
    color: #333;
}

.flex { display: flex; flex-flow: row wrap; }
.flex-center {
    align-items: center;
    justify-content: center;
    margin: 0px;
}


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



}
</style>
