<template>
  <view class="container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="back" size="24"></uni-icons>
      </view>
      <text class="title">{{ texts.title }}</text>
    </view>
    
    <image :src="assets.banner" class="banner"></image>
    
    <view class="route-info">
      <text class="route-name">{{ texts.routeName }}</text>
      <text class="route-desc">{{ texts.routeDesc }}</text>
      <view class="price-container">
        <text class="price">{{ priceInfo.price }}</text>
        <text class="price-unit">{{ priceInfo.priceUnit }}</text>
      </view>
      <view class="features">
        <text class="feature" v-for="(feature, index) in features" :key="index">{{ feature }}</text>
      </view>
      
      <view class="route-details">
        <view class="section schedule-section">
          <text class="section-title">{{ texts.scheduleTitle }}</text>
          <view class="schedule-wrapper">
            <view class="schedule-content">
              <view class="schedule-item" v-for="(day, index) in schedule" :key="index">
                <text class="day">{{ day.dayName }}</text>
                <view class="schedule-list">
                  <text class="schedule" v-for="(activity, idx) in day.activities" :key="idx">{{ activity }}</text>
                </view>
              </view>
            </view>
            <view class="schedule-line"></view>
          </view>
        </view>
        
        <view class="section">
          <text class="section-title">{{ texts.costTitle }}</text>
          <view class="cost-section">
            <text class="cost-title">{{ texts.costIncluded }}</text>
            <view class="cost-list">
              <text class="cost-item" v-for="(item, index) in costs.included" :key="index">{{ item }}</text>
            </view>
          </view>
          <view class="cost-section">
            <text class="cost-title">{{ texts.costExcluded }}</text>
            <view class="cost-list">
              <text class="cost-item" v-for="(item, index) in costs.excluded" :key="index">{{ item }}</text>
            </view>
          </view>
        </view>
        
        <view class="section">
          <text class="section-title">{{ texts.notesTitle }}</text>
          <view class="notes-list">
            <text class="note-item" v-for="(note, index) in notes" :key="index">{{ note }}</text>
          </view>
        </view>
      </view>
      
      <view class="action-buttons">
        <view class="total-price">
          <text class="total-label">{{ priceInfo.totalLabel }}</text>
          <text class="total-value">{{ priceInfo.totalValue }}</text>
        </view>
        <view class="register-btn" @click="goToRegistration">
          <text class="register-text">{{ texts.registerText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
	  safeArea: { top: 0, bottom: 0 },
      // 文本内容
      texts: {
        title: '浪漫双岛游',
        routeName: '浪漫双岛游',
        routeDesc: '东澳岛-外伶仃岛 2日游',
        scheduleTitle: '行程安排',
        costTitle: '费用说明',
        costIncluded: '费用包含',
        costExcluded: '费用不含',
        notesTitle: '注意事项',
        registerText: '立即预订'
      },
      // 价格信息
      priceInfo: {
        price: '¥688',
        priceUnit: '起/人',
        totalLabel: '起价',
        totalValue: '¥688'
      },
      // 特色
      features: ['含住宿', '含餐饮', '含门票'],
      // 行程安排
      schedule: [
        {
          dayName: '第一天：东澳岛',
          activities: [
            '08:00 乘坐"万山号"摆渡车前往"碧海渔排"',
            '09:00 海钓活动，享受自助烹饪服务',
            '14:00 返回酒店休息'
          ]
        },
        {
          dayName: '第二天：外伶仃岛',
          activities: [
            '08:00 浮潜活动',
            '12:00 海鲜午餐',
            '14:00 返程'
          ]
        }
      ],
      // 费用说明
      costs: {
        included: ['• 往返交通费用', '• 住宿费用（标准双人间）', '• 行程中标明的用餐', '• 景点门票'],
        excluded: ['• 个人消费', '• 行程外项目']
      },
      // 注意事项
      notes: ['• 请携带有效身份证件', '• 建议携带防晒用品', '• 请遵守导游安排', '• 注意安全，听从工作人员指挥'],
      // 图片资源路径
      assets: {
        banner: 'https://wlmtsys.com:9000/travel/beach.jpg'
      }
    };
  },
  onLoad(){
	  this.getSafeAreaInfo();
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    goToRegistration() {
      uni.navigateTo({
        url: '/pages/routeRegistration/routeRegistration'
      });
    },
	getSafeAreaInfo() {
      const systemInfo = uni.getSystemInfoSync();
      this.safeArea = systemInfo.safeArea || { top: 0, bottom: 0 };
    }
  }
};
</script>

<style scoped>
.container {
  background-color: #f7f7f7;
  padding: 0 20px;
  padding-top: v-bind('safeArea.top + "px"');
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  background-color: #fff;
}

.back-btn {
  margin-right: 20px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  flex: 1;
}

.banner {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.route-info {
  background-color: #fff;
  padding: 20px;
  margin-top: 10px;
}

.route-name {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
}

.route-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  display: block;
}

.price-container {
  display: flex;
  align-items: baseline;
  margin-bottom: 20px;
}

.price {
  font-size: 24px;
  color: #007AFF;
  font-weight: bold;
}

.price-unit {
  font-size: 14px;
  color: #666;
  margin-left: 5px;
}

.features {
  display: flex;
  margin-bottom: 20px;
}

.feature {
  background-color: #e6f2ff;
  padding: 5px 10px;
  margin: 0 5px;
  border-radius: 5px;
  font-size: 14px;
  color: #007AFF;
}

.section {
  margin-bottom: 20px;
  padding-top: 15px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  padding-left: 0px;
  display: block;
}

/* 行程安排的样式 */
.schedule-section {
  position: relative;
}

.schedule-wrapper {
  display: flex;
  position: relative;
}

.schedule-content {
  flex: 1;
}

.schedule-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #007AFF;
  margin-left: 0px;
}

.schedule-item {
  margin-bottom: 15px;
  margin-left: 20px;
}

.day {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.schedule-list {
  margin-left: 30px;
}

.schedule {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
  display: block;
}

.cost-section {
  margin-bottom: 15px;
}

.cost-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  margin-left: 20px;
  display: block;
}

.cost-list,
.notes-list {
  margin-left: 30px;
}

.cost-item,
.note-item {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
  display: block;
}

.action-buttons {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-price {
  display: flex;
  align-items: center;
}

.total-label {
  font-size: 14px;
  color: #666;
  margin-right: 10px;
}

.total-value {
  font-size: 18px;
  font-weight: bold;
  color: #007AFF;
}

.register-btn {
  background-color: #007AFF;
  padding: 10px 20px;
  border-radius: 5px;
}

.register-text {
  color: white;
  font-size: 16px;
}
</style>