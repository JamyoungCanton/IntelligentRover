
<template>
  <view class="page">
    <view class="header">
      <view class="title-section">
        <text class="title">景点攻略</text>
        <view class="header-actions">
          <uni-icons type="heart" size="24" color="#FFFFFF" class="header-icon"></uni-icons>
          <uni-icons type="arrow-right" size="24" color="#FFFFFF" class="header-icon"></uni-icons>
        </view>
      </view>
      <view class="search-wrap">
        <uni-icons type="search" size="16" color="#999999" class="search-icon"></uni-icons>
        <input class="search-input" type="text" placeholder="搜索景点、攻略" placeholder-class="placeholder"/>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <scroll-view class="category-list" scroll-x show-scrollbar="false">
        <view class="category-scroll">
          <button class="category-item active">全部</button>
          <button class="category-item">热门</button>
          <button class="category-item">自然景观</button>
          <button class="category-item">沙滩浴场</button>
          <button class="category-item">观景台</button>
        </view>
      </scroll-view>

      <view class="filter-bar">
        <view class="filter-options">
          <view class="filter-item">
            <text>综合排序</text>
            <uni-icons type="bottom" size="12" color="#666666"></uni-icons>
          </view>
          <view class="filter-item">
            <text>筛选</text>
            <uni-icons type="filter" size="12" color="#666666"></uni-icons>
          </view>
        </view>
      </view>

      <view class="spot-grid">
        <view class="spot-item">
          <image src="https://ai-public.mastergo.com/ai/img_res/2569365eb54206887ac84251ef619889.jpg" mode="aspectFill"></image>
          <view class="spot-info">
            <text class="spot-name">东海仙岛</text>
            <view class="rating">
              <uni-rate value="4.8" size="10" readonly></uni-rate>
              <text class="rating-score">4.8</text>
            </view>
            <text class="spot-desc">东海仙岛风景秀丽，是著名的观光胜地</text>
            <view class="spot-footer">
              <view class="location">
                <uni-icons type="location" size="12" color="#999999"></uni-icons>
                <text class="location-text">万山区</text>
              </view>
              <text class="price">¥128起</text>
            </view>
          </view>
        </view>

        <view class="spot-item">
          <image src="https://ai-public.mastergo.com/ai/img_res/79fa0ec38e9040c0e012432637c1ff33.jpg" mode="aspectFill"></image>
          <view class="spot-info">
            <text class="spot-name">海上古寺</text>
            <view class="rating">
              <uni-rate value="4.2" size="10" readonly></uni-rate>
              <text class="rating-score">4.2</text>
            </view>
            <text class="spot-desc">千年古刹，历史文化底蕴深厚</text>
            <view class="spot-footer">
              <view class="location">
                <uni-icons type="location" size="12" color="#999999"></uni-icons>
                <text class="location-text">万山区</text>
              </view>
              <text class="price">¥68起</text>
            </view>
          </view>
        </view>

        <view class="spot-item">
          <image src="https://ai-public.mastergo.com/ai/img_res/5f716f44484058a18a02a9543021ed24.jpg" mode="aspectFill"></image>
          <view class="spot-info">
            <text class="spot-name">灯塔湾</text>
            <view class="rating">
              <uni-rate value="4.9" size="10" readonly></uni-rate>
              <text class="rating-score">4.9</text>
            </view>
            <text class="spot-desc">观赏日落的绝佳地点</text>
            <view class="spot-footer">
              <view class="location">
                <uni-icons type="location" size="12" color="#999999"></uni-icons>
                <text class="location-text">万山区</text>
              </view>
              <text class="price">¥88起</text>
            </view>
          </view>
        </view>

        <view class="spot-item">
          <image src="https://ai-public.mastergo.com/ai/img_res/aa8b6512a8e504500dd7b8cd0c0b2c53.jpg" mode="aspectFill"></image>
          <view class="spot-info">
            <text class="spot-name">珊瑚湾</text>
            <view class="rating">
              <uni-rate value="4.3" size="10" readonly></uni-rate>
              <text class="rating-score">4.3</text>
            </view>
            <text class="spot-desc">绝美的潜水胜地</text>
            <view class="spot-footer">
              <view class="location">
                <uni-icons type="location" size="12" color="#999999"></uni-icons>
                <text class="location-text">万山区</text>
              </view>
              <text class="price">¥168起</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

  
  </view>
</template>

<script  setup>
// import { ref } from 'vue'
</script>

<style>
page {
  height: 100%;
  background: #FFFFFF;
}

.page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header {
  background: #0066CC;
  padding: 20rpx 30rpx;
  flex-shrink: 0;
}

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.header-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-wrap {
  position: relative;
  margin-top: 10rpx;
}

.search-input {
  width: 77%;
  height: 72rpx;
  background: #FFFFFF;
  border-radius: 8rpx;
  padding: 0 80rpx;
  font-size: 28rpx;
  color: #333333;
}

.search-icon {
  position: absolute;
  left: 20rpx;
  top: 50%;
  transform: translateY(-50%);
}

.placeholder {
  color: #999999;
}

.content {
  flex: 1;
  overflow: auto;
}

.category-list {
  padding: 20rpx 30rpx;
  white-space: nowrap;
}

.category-scroll {
  display: inline-flex;
  gap: 15rpx;
}

.category-item {
  /* padding: 12rpx 30rpx; */
  background: #F5F5F5;
  border-radius: 8rpx;
  color: #666666;
  font-size: 28rpx;
  border: none;
}

.category-item.active {
  background: #0066CC;
  color: #FFFFFF;
}

.filter-bar {
  padding: 20rpx 30rpx;
}

.filter-options {
  display: flex;
  gap: 20rpx;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 20rpx;
  background: #F5F5F5;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666666;
}

.spot-grid {
  padding: 0 30rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.spot-item {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.spot-item image {
  width: 100%;
  height: 240rpx;
}

.spot-info {
  padding: 16rpx;
}

.spot-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.rating {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}

.rating-score {
  font-size: 24rpx;
  color: #999999;
  margin-left: 8rpx;
}

.spot-desc {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spot-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}

.location {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.location-text {
  font-size: 24rpx;
  color: #999999;
}

.price {
  font-size: 24rpx;
  color: #0066CC;
}


</style>

