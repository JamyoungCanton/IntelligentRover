<template>
  <view class="container">
    <view class="content">
      <view class="current-language-block">
        <text class="current-language-title">当前语言</text>
        <text class="current-language-value">{{ languageList[selectedIndex].label }}</text>
      </view>
      <view class="language-list">
        <view
          v-for="(item, idx) in languageList"
          :key="item.value"
          class="language-item"
          :class="{ active: idx === selectedIndex }"
          @click="selectLanguage(idx)"
        >
          <view class="language-info">
            <text class="lang-main">{{ item.label }}</text>
            <text class="lang-sub">{{ item.subLabel }}</text>
          </view>
          <uni-icons
            v-if="idx === selectedIndex"
            type="checkmarkempty"
            color="#1677ff"
            size="32"
          />
        </view>
      </view>
    </view>
    <button class="back-btn" type="primary" @click="goHome">返回首页</button>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const languageList = [
  { label: '简体中文', subLabel: 'Simplified Chinese', value: 'zh-CN' },
  { label: '繁體中文', subLabel: 'Traditional Chinese', value: 'zh-TW' },
  { label: 'English', subLabel: '英文', value: 'en' },
  { label: '日本語', subLabel: '日语', value: 'ja' },
  { label: '한국어', subLabel: '韩语', value: 'ko' },
  { label: 'Русский', subLabel: '俄语', value: 'ru' },
  { label: 'Español', subLabel: '西班牙语', value: 'es' },
  { label: 'Français', subLabel: '法语', value: 'fr' }
];
const selectedIndex = ref(0); // 默认选中第一个

const selectLanguage = (idx) => {
  selectedIndex.value = idx;
  // 这里可以加上切换语言的逻辑
};

const goHome = () => {
  uni.switchTab({ url: '/pages/index/index' });
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  padding-bottom: 40rpx;
}
.content {
  width: 100%;
  padding: 40rpx 0 0 0;
  box-sizing: border-box;
}
.current-language-block {
  padding: 0 40rpx 32rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 10rpx;
}
.current-language-title {
  font-size: 26rpx;
  color: #888;
}
.current-language-value {
  display: block;
  font-size: 32rpx;
  color: #222;
  font-weight: bold;
  margin-top: 8rpx;
}
.language-list {
  width: 100%;
  margin-top: 10rpx;
}
.language-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40rpx;
  height: 90rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background 0.2s;
}
.language-item:last-child {
  border-bottom: none;
}
.language-item.active {
  background: #f0f6ff;
}
.language-info {
  display: flex;
  flex-direction: column;
}
.lang-main {
  font-size: 30rpx;
  color: #222;
  font-weight: 600;
}
.lang-sub {
  font-size: 24rpx;
  color: #888;
  margin-top: 2rpx;
}
.back-btn {
  width: 80%;
  margin: 40rpx auto 0 auto;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 600;
  background: linear-gradient(90deg, #1677ff 0%, #50a7ff 100%);
  color: #fff;
  height: 90rpx;
  letter-spacing: 2rpx;
  box-shadow: 0 4rpx 16rpx rgba(22,119,255,0.08);
  border: none;
}
</style>