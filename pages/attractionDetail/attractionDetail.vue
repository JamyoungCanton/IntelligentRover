<template>
  <view class="container">
    <view class="header">
      <img src="http://island.zhangshuiyi.com/static_file/attractions/4灯塔.jpg" alt="">
      <view class="title-name">
        <text class="title">东澳岛</text>
        <view class="rating">
          <uni-rate :value="4.5" size="16" readonly></uni-rate>
          <text>4.5</text>
        </view>
      </view>
    </view>
    <view class="content">
      <view class="section">
        <text class="section-title">景点介绍</text>
        <text class="section-content">东澳岛是中国的一个重要旅游目的地，由多个岛屿组成，是中国旅游的重要区域之一。东澳岛风景优美，是中国旅游的重要区域之一。</text>
      </view>
      <view class="location">
        <!-- 位置图标 -->
        <uni-icons
          type="location"
          color="blue"
          size="24"
        />
        <view class="locationDetail">
          <text class="location-title">交通路线</text>
          <text class="location-content">距离市中心多少公里</text>
        </view>
      </view>
      <view class="location">
        <uni-icons
          type="color"
          color=""
          size="24"
        />
        <view class="locationDetail">
          <text class="location-title">开放时间</text>
          <text class="location-content">每天9:00-18:00</text>
          <text class="location-content">全年开放</text>
        </view>
      </view>
      <view class="location">
          <!-- 票的图标 -->
          <uni-icons
            type="color"
            color=""
            size="24"
          />
          <view class="locationDetail">
            <text class="location-title">门票价格</text>
            <text class="location-content">￥68</text>
          </view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  const id = ref(0);
  onLoad((options) => {
    id.value = options.id;
    console.log(id.value);
    
  })
  onMounted(() => {
    
  })

</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #fff;
}
.header {
  width: 100%;
  height: 230px;
  background-color: #fff;
  position: relative;
  overflow: hidden;
}
.header img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.title-name {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
.title {
  font-size: 24px;
  margin-bottom: 10px;
}
.rating {
  font-size: 14px;

}
.rating uni-rate {
  margin-left: 50px;
}
.content {
  padding: 0px 20px;
  background-color: #fff;
  border-radius: 10px;
}
.section {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
}
.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: start;

}
.section-content {
  /* // 首行缩进两个字符 */
  text-indent: 2em; 
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  text-align: justify;
}
.location {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-direction: row;
  border-bottom: 1px solid #ccc;
  margin-bottom: 10px;
}

.locationDetail {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
}
.locatuon uni-icons {
  margin-right: 10px;
  color: #007AFF;
  font-size: 24px;
}

.location-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}
.location-content {
  font-size: 14px;
  color: #333;
  margin-top: 5px;
}
.openTime {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-direction: row;
  border-bottom: 1px solid #ccc;
  margin-bottom: 10px;
}


</style>