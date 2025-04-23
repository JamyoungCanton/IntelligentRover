<template>
    <view class="tab-block">
        <ul
            class='tab-list flex flex-center'
            :class="showMiddleButton === true?'tab-list-middle':'tab-list-default'"
        >
            <li
                v-for="(item, index) in tabList"
                :class="'list-item flex flex-column flex-middle ' + item.middleClass"
                @click="handlePush(item, index)"
                :key="index"
            >
                <view class="item-img-box">
                    <image
                        class="item-img"
                        :src="tabIndex == index ? item.selectedIconPath : item.iconPath"
                    />
                </view>
                <view class="item-text font-20 color-black"
                    :class="{ specialColor: tabIndex == index}"
                >
                    {{item.text}}
                </view>
            </li>
        </ul>

        <!-- 兼容iPhonex下面的小黑条 -->
        <view class="tab-bar" v-show="showTabBar === true"></view>
    </view>
</template>

<script setup>
import { ref, onMounted, computed, defineEmits } from 'vue';

const props = defineProps({
    tabIndex: { // 当前选中的tab项
        type: Number,
        default: 0
    }
});

const emits = defineEmits(['update:tabIndex']);

const tabList = ref([
    {
        iconPath: '/static/index/底部-首页-未选.svg',
        selectedIconPath: '/static/index/底部-首页-选.svg',
        text: '首页',
        pagePath: '/pages/index/index',
        middleClass: ''
    },
    {
        iconPath: '/static/index/底部-首页-未选.svg',
        selectedIconPath: '/static/index/底部-首页-选.svg',
        text: '社交',
        pagePath: '/pages/ticketPoints/ticketPoints',
        middleClass: ''
    },
    {
        iconPath: '/static/index/LOGO.png',
        selectedIconPath: '/static/index/LOGO.png',
        text: '聊天',
        pagePath: '/pages/chat/chat',
        middleClass: ''
    },
    {
        iconPath: '/static/index/底部-订单-未选.svg',
        selectedIconPath: '/static/index/底部-订单-选.svg',
        text: '订单',
        pagePath: '/pages/order/order',
        middleClass: ''
    },
    {
        iconPath: '/static/index/底部-我的-未选.svg',
        selectedIconPath: '/static/index/底部-我的-选.svg',
        text: '我的',
        pagePath: '/pages/my/my',
        middleClass: ''
    }
]);

const showTabBar = ref(false);
const showMiddleButton = ref(false);

const getHeight = computed(() => {
    return Number(props.height);
});

const setTabBar = () => {
    let tabLength = tabList.value.length;
    if (tabLength % 2) {
        showMiddleButton.value = true;
        // 向上取整
        let middleIndex = Math.floor(tabLength / 2);
        // 给中间的添加mid-button
        tabList.value[middleIndex].middleClass = 'mid-button';
    }
};

const handlePush = (item, index) => {
    uni.switchTab({
        url: item.pagePath
    });
    emits('update:tabIndex', index);
};

const getSystemInfo = () => {
    // 获取系统信息
    uni.getSystemInfo({
        success: (res) => {
            // X及以上的异形屏top为44，非异形屏为20
            if (res.safeArea.top > 20) {
                showTabBar.value = true;
            }
        }
    });
};

onMounted(() => {
    getSystemInfo();
    setTabBar();
});
</script>

<style lang="scss">
.specialColor{
    color: rgb(229, 113, 1);
}
.flex {
    display: flex;
    flex-flow: row wrap;
}

.flex-center {
    align-items: center;
    justify-content: center;
    & > * {
        margin: 0;
    }
}

.flex-column {
    flex-direction: column;
}

.flex-middle {
    align-items: center;
}
.font-20 {
    font-size: 20rpx;
}
.tab-block {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 999;
    background-size: contain;
    width: 100vw;
    margin: 0;
    padding: 0;
    .tab-list{
        height:100rpx;
    }
    .tab-list-default{
        background-color: #FFFFFF;
        border-top: 1px #dddddd solid;
        margin: 0;
        padding: 0;
    }
    .tab-list-middle {
        position: relative;
        background: url('https://res.paquapp.com/popmartvip/home/nav_bar_bg_2x.png') no-repeat center center;
        background-size: cover;
        margin: 0;
        padding: 0;
    }
    .list-item {
        flex: 1;
        .item-img-box {
            width: 44rpx;
            height: 42rpx;
            margin-bottom: 9rpx;
            position: relative;
            overflow: hidden;
        }

        .item-img {
            width: 44rpx;
            height: 42rpx;
            object-fit: contain;
        }
        .item-text {
            font-size: 20rpx;
            width: auto;
            text-align: center;
        }
    }

    .mid-button {
        position: relative;

        .item-img-box {
            width: 106rpx;
            height: 106rpx;
            margin-bottom: 9rpx;
            position: absolute;
            z-index: 1002;
            top: -104rpx;
        }

        .item-img {
            width: 106rpx;
            height: 106rpx;
            background-color: #fff;
            border-radius: 50%;
        }

        .item-text {
            font-size: 20rpx;
            position: absolute;
            z-index: 1002;
            bottom: -40rpx;
        }
    }

    .tab-bar {
        height: 30rpx;
        background-color: #FFFFFF;
    }
}
</style>    