<template>
  <view class="container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="back" size="24"></uni-icons>
      </view>
      <text class="title">行程详情</text>
      <view class="notification">
        <uni-icons type="notification" size="24"></uni-icons>
      </view>
    </view>
    
    <view class="date-tabs">
      <view class="tab-item" v-for="(date, index) in dates" :key="index">
        <view class="day-name">{{ date.name }}</view>
        <view class="day-date">{{ date.date }}</view>
      </view>
    </view>
    
    <view class="schedule-container">
      <view class="schedule-item" v-for="(item, index) in currentItinerary.details" :key="index">
        <view class="time-circle">
          <view class="circle" :class="{ 'completed': index < currentStep }"></view>
        </view>
        <view class="time-label">{{ item.time }}</view>
        <view class="schedule-content">
          <view class="schedule-title">{{ item.title }}</view>
          <view class="schedule-location">
            <uni-icons type="location" size="16" color="#666"></uni-icons>
            <text>{{ item.location }}</text>
          </view>
          <view class="schedule-description" v-if="item.description">
            {{ item.description }}
          </view>
          <view class="notification-icon">
            <uni-icons type="notification" size="20" color="#1989fa"></uni-icons>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>

import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';

function getImagePath(imageName) {
   return `/static/itinerary/${imageName}`;
 }

export default {
  components: {
    uniIcons
  },
  data() {
    return {
      currentItinerary: {},
      dates: [
        { name: '周一', date: '12/11' },
        { name: '周二', date: '12/12' },
        { name: '周三', date: '12/13' },
        { name: '周四', date: '12/14' },
        { name: '周五', date: '12/15' }
      ],
      currentStep: 1 // 当前进行到哪一步
    };
  },
  onLoad(options) {
    const id = parseInt(options.id);
    this.loadItineraryById(id);
  },
  methods: {
    loadItineraryById(id) {
      // 在实际项目中，这里应该从后端API获取数据
      // 这里我们使用模拟数据
      const mockData = {
        id: 2,
        title: "碧海鱼排",
        date: "2024.01.18",
        details: [
          { time: "08:00", title: "乘坐'万山号'摆渡车前往'碧海渔排'", location: "万山海景酒店门口", description: "" },
          { time: "09:00", title: "在'碧海渔排'进行海钓活动", location: "碧海渔排", description: "享受自助烹饪服务" },
          { time: "14:00", title: "在'碧海渔排'享用午餐", location: "碧海渔排餐厅", description: "" },
          { time: "15:00", title: "乘坐'万山号'摆渡车返回酒店", location: "万山海景酒店", description: "" },
          { time: "16:30", title: "金沙滩海滩漫步", location: "金沙滩海滩", description: "" },
          { time: "18:00", title: "海景餐吧晚餐", location: "海景餐吧", description: "观看夕阳下的海边美景" }
        ]
      };
      
      this.currentItinerary = mockData;
    },
    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style scoped>
.container {
  padding: 0 20px;
  background-color: #f7f7f7;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.title {
  font-size: 24px;
  font-weight: bold;
}

.back-btn {
  margin-right: 20px;
}

.date-tabs {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.tab-item {
  text-align: center;
}

.day-name {
  font-size: 16px;
  font-weight: bold;
}

.day-date {
  font-size: 14px;
  color: #666;
}

.schedule-container {
  margin-bottom: 60px;
}

.schedule-item {
  display: flex;
  margin-bottom: 20px;
  position: relative;
}

.schedule-item::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 20px;
  height: 100%;
  width: 1px;
  background-color: #ddd;
}

.schedule-item:first-child::before {
  top: 10px;
  bottom: 10px;
}

.schedule-item:last-child::before {
  top: 10px;
  bottom: 10px;
}

.time-circle {
  position: relative;
  width: 30px;
  height: 30px;
  margin-right: 15px;
}

.circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #ddd;
  position: absolute;
  top: 5px;
  left: 5px;
}

.circle.completed {
  background-color: #1989fa;
}

.time-label {
  position: absolute;
  top: -30px;
  left: 0;
  color: #1989fa;
  font-size: 16px;
}

.schedule-content {
  flex: 1;
  background-color: #fff;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
}

.schedule-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.schedule-location {
  display: flex;
  align-items: center;
  color: #666;
  margin-bottom: 10px;
}

.schedule-location uni-icons {
  margin-right: 5px;
}

.schedule-description {
  color: #666;
  font-size: 14px;
}

.notification-icon {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>