<template>
  <view class="container">
    <view class="content">
      <view class="currentLanguage">
        <text class="currentLanguageTitle">当前语言</text>
        <text class="currentLanguageText">简体中文</text>
      </view>
      <view class="selectLanguage">
        <view class="select-language-left">
          <text class="cityLanguage">简体中文</text>
          <text class="ChineseLanguage">Simplified Chinese</text>
        </view>
        <view class="Checkedicon">
          <uni-icons type="checkmarkempty" color="blue" size="35"  />
        </view>
      </view>
      <view class="selectLanguage">
        <view class="select-language-left">
          <text class="cityLanguage">繁體中文</text>
          <text class="ChineseLanguage">Traditional Chinese</text>
        </view>
        <!-- <view class="Checkedicon">
         <uni-icons type="checkmarkempty" color="blue" size="35"  />
        </view> -->
      </view>
      <view class="selectLanguage">
        <view class="select-language-left">
          <text class="cityLanguage">English</text>
          <text class="ChineseLanguage">英文</text>
        </view>
        <!-- <view class="Checkedicon">
         <uni-icons type="checkmarkempty" color="blue" size="35"  />
        </view> -->
      </view>
      <view class="selectLanguage">
        <view class="select-language-left">
          <text class="cityLanguage">日本語</text>
          <text class="ChineseLanguage">日语</text>
        </view>
        <!-- <view class="Checkedicon">
         <uni-icons type="checkmarkempty" color="blue" size="35"  />
        </view> -->
      </view>
      <view class="selectLanguage">
        <view class="select-language-left">
          <text class="cityLanguage">한국어</text>
          <text class="ChineseLanguage">韩语</text>
        </view>
        <!-- <view class="Checkedicon">
         <uni-icons type="checkmarkempty" color="blue" size="35"  />
        </view> -->
      </view>
      <view class="selectLanguage">
        <view class="select-language-left">
          <text class="cityLanguage">Русский</text>
          <text class="ChineseLanguage">俄语</text>
        </view>
        <!-- <view class="Checkedicon">
         <uni-icons type="checkmarkempty" color="blue" size="35"  />
        </view> -->
      </view>
      <view class="selectLanguage">
        <view class="select-language-left">
          <text class="cityLanguage">Español</text>
        <text class="ChineseLanguage">西班牙语</text>
        </view>
        <!-- <view class="Checkedicon">
         <uni-icons type="checkmarkempty" color="blue" size="35"  />
        </view> -->
      </view>
      <view class="selectLanguage">
        <view class="select-language-left">
          <text class="cityLanguage">Français</text>
        <text class="ChineseLanguage">法语</text>
        </view>
        <!-- <view class="Checkedicon">
         <uni-icons type="checkmarkempty" color="blue" size="35"  />
        </view> -->
      </view>
    </view>
    <button type="primary" >返回首页</button>
  </view>
</template>

<script setup>
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
.content {
    
  width: 100%;
  height: 100%;
  background-color: #fff;
  padding: 30rpx;
  box-sizing: border-box;
}
.currentLanguage {
  margin-top: rpx;
  padding: 10rpx;
  width: 100%;
  height: 80rpx;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  border-bottom: 1rpx solid #e5e5e5;
  
}
.currentLanguageTitle {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 7rpx;
}
.currentLanguageText {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}
.selectLanguage {
  width: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx;
  border-bottom: 1rpx solid #e5e5e5;
}
.select-language-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 70%;
  height: 100%;
}
.cityLanguage {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 7rpx;
}
.ChineseLanguage {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 7rpx;
  opacity: 0.9;
}
.Checkedicon {
  margin-right: 38rpx;
}

button {
  width: 100%;
  margin-top: 80rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 10rpx;
  width: 80%;
  font-size: 32rpx;
}



 
</style>