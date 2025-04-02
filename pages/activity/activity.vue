<template>
  <view class="container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <uni-icons :type="data.icons.back" :size="data.iconSize"></uni-icons>
      </view>
      <text class="title">{{ data.title }}</text>
      <view class="share-btn">
        <uni-icons :type="data.icons.share" :size="data.iconSize"></uni-icons>
      </view>
    </view>
    
    <image :src="data.activityImage" class="activity-image"></image>
    
    <view class="activity-info">
      <text class="activity-name">{{ data.activityName }}</text>
      <view class="price-container">
        <text class="price">{{ data.price }}</text>
        <text class="price-unit">{{ data.priceUnit }}</text>
      </view>
      
      <view class="rating-container">
        <uni-icons 
          v-for="(star, index) in data.ratingStars" 
          :key="index" 
          :type="data.icons.star" 
          :size="data.iconSize" 
          :color="data.starColor"
        ></uni-icons>
        <text class="rating">{{ data.ratingText }}</text>
      </view>
      
      <view class="favorite" @click="toggleFavorite">
        <image :src="isFavorite ? data.icons.favoriteFilled : data.icons.favorite" class="favorite-icon"></image>
        <text :class="['favorite-text', isFavorite ? 'active' : '']">{{ data.favoriteText }}</text>
      </view>
    </view>
    
    <view class="activity-schedule">
      <text class="section-title">{{ data.sections.schedule }}</text>
      
      <view class="schedule-item" v-for="(schedule, index) in data.schedules" :key="index">
        <image :src="schedule.icon" class="schedule-icon"></image>
        <view class="schedule-content">
          <text class="time">{{ schedule.time }}</text>
          <text class="description">{{ schedule.description }}</text>
        </view>
      </view>
    </view>
    
    <view class="precautions">
      <text class="section-title">{{ data.sections.precautions }}</text>
      <view class="precaution-item" v-for="(precaution, index) in data.precautions" :key="index">
        <text class="precaution-text">{{ precaution }}</text>
      </view>
    </view>
    
    <view class="cost-explanation">
      <text class="section-title">{{ data.sections.cost }}</text>
      
      <view class="cost-section">
        <text class="cost-title">{{ data.costSections.included }}</text>
        <view class="cost-item" v-for="(included, index) in data.costs.included" :key="index">
          <text class="checkmark">{{ data.icons.checkmark }}</text>
          <text class="cost-text">{{ included }}</text>
        </view>
      </view>
      
      <view class="cost-section">
        <text class="cost-title">{{ data.costSections.notIncluded }}</text>
        <view class="cost-item" v-for="(notIncluded, index) in data.costs.notIncluded" :key="index">
          <uni-icons :type="data.icons.close" :size="data.iconSize" :color="data.closeColor"></uni-icons>
          <text class="cost-text">{{ notIncluded }}</text>
        </view>
      </view>
    </view>
    
    <view class="bottom-bar">
      <view class="price-info">
        <text class="price-label">{{ data.priceLabel }}</text>
        <view class="price-wrapper">
          <text class="price-value">{{ data.price }}</text>
          <text class="price-unit">{{ data.priceUnit }}</text>
        </view>
      </view>
      <button class="register-btn" @click="goToRegistration">
        <text class="register-text">{{ data.registerText }}</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
	  safeArea: { top: 0, bottom: 0 },
      isFavorite: false,
      data: {
        // 图标和图片路径
        icons: {
          back: 'back',
          share: 'share',
          star: 'star-filled',
          favorite: '/static/activity/heart.png',
          favoriteFilled: '/static/activity/heart_filled.png',
          checkmark: '√',
          close: 'close',
          time: '/static/activity/time.png',
          swim: '/static/activity/swim.png',
          food: '/static/activity/food.png'
        },
        // 图标大小
        iconSize: 24,
        // 活动图片
        activityImage: 'https://wlmtsys.com:9000/travel/diving.jpg',
        // 文本内容
        title: '深潜探索',
        activityName: '海底世界深潜体验',
        price: '¥368',
        priceUnit: '起/人',
        ratingText: '4.8 (1280人评价)',
        starColor: '#FFD700',
        favoriteText: '收藏',
        sections: {
          schedule: '活动流程',
          precautions: '注意事项',
          cost: '费用说明'
        },
        costSections: {
          included: '费用包含',
          notIncluded: '费用不含'
        },
        priceLabel: '起始价格',
        registerText: '立即报名',
        // 列表内容
        ratingStars: 5,
        schedules: [
          {
            time: '09:00 集合出发',
            description: '在指定地点集合，进行安全说明',
            icon: '/static/activity/time.png'
          },
          {
            time: '10:00 潜水培训',
            description: '专业教练指导潜水技巧和安全知识',
            icon: '/static/activity/swim.png'
          },
          {
            time: '12:00 午餐休息',
            description: '享用精致午餐，补充体力',
            icon: '/static/activity/food.png'
          }
        ],
        precautions: [
          '参与者需年满18周岁，请携带有效身份证件',
          '活动期间请听从教练指导，确保安全',
          '建议穿着轻便泳装，可自备防晒用品'
        ],
        costs: {
          included: [
            '专业潜水装备租赁',
            '专业教练一对一指导',
            '午餐及饮用水'
          ],
          notIncluded: [
            '往返交通费用',
            '个人消费项目'
          ]
        },
        // 颜色配置
        closeColor: '#FF6B6B'
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
        url: '/pages/activityRegistration/activityRegistration'
      });
    },
    toggleFavorite() {
      this.isFavorite = !this.isFavorite;
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

.title {
  font-size: 24px;
  font-weight: bold;
}

.activity-image {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.activity-info {
  background-color: #fff;
  padding: 20px;
  margin-top: 10px;
  position: relative;
}

.activity-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.price-container {
  display: flex;
  align-items: baseline;
  margin-bottom: 10px;
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

.rating-container {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.rating {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
}

.favorite {
  position: absolute;
  right: 20px;
  bottom: 70px;
  display: flex;
  flex-direction: column; /* 垂直排列 */
  align-items: center;
}

.favorite-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 5px;
}

.favorite-text {
  font-size: 12px;
  color: #666;
}

.favorite-text.active {
  color: red;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 20px 0 10px;
  padding-left: 10px;
  border-left: 4px solid #007AFF;
}

.schedule-item {
  display: flex;
  margin-bottom: 15px;
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.schedule-icon {
  width: 30px;
  height: 30px;
  margin-right: 10px;
}

.schedule-content {
  flex: 1;
}

.time {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.description {
  font-size: 14px;
  color: #666;
  margin-left: 0px;
  display: block;
}

.precautions {
  background-color: #fff;
  padding: 20px;
  margin-top: 10px;
}

.precaution-item {
  margin-bottom: 10px;
  padding-left: 20px;
  position: relative;
}

.precaution-item:before {
  content: "!";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background-color: #FF6B6B;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 12px;
}

.cost-explanation {
  background-color: #fff;
  padding: 20px;
  margin-top: 10px;
}

.cost-section {
  margin-bottom: 20px;
}

.cost-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  padding: 10px 0; /* 增加上下间距 */
  border-bottom: 1px solid #f0f0f0; /* 可选，用于分隔费用包含和费用不含 */
}

.cost-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.checkmark {
  color: #007AFF;
  font-size: 16px;
  margin-right: 10px;
}

.cost-text {
  font-size: 14px;
}

.bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #fff;
  margin-top: 20px;
  border-top: 1px solid #eee;
}

.price-info {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 14px;
  color: #666;
}

.price-wrapper {
  display: flex;
  align-items: baseline;
}

.price-value {
  font-size: 20px;
  color: #007AFF;
  font-weight: bold;
}

.price-unit {
  font-size: 14px;
  color: #666;
  margin-left: 5px;
}

.register-btn {
  background-color: #007AFF;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  font-size: 14px;
  border: none;
  margin-left: auto;
  margin-right: 10px;
}
</style>