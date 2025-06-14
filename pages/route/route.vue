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

      <view class="booking-section">
        <view class="section-title">
          <uni-icons type="calendar" size="20" color="#007AFF"></uni-icons>
          <text>选择出发日期</text>
        </view>
        
        <view class="date-picker-wrapper">
          <picker 
            mode="date" 
            :value="playDate" 
            :start="todayStr" 
            @change="onPlayDateChange"
          >
            <view class="date-picker-content" :class="{ 'unselected': !playDate }">
              <view class="date-left">
                <text class="date-label">出发日期</text>
                <text class="date-value">{{ playDate || '请选择' }}</text>
              </view>
              <view class="date-right">
                <uni-icons type="right" size="16" color="#999"></uni-icons>
              </view>
            </view>
          </picker>
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
        banner: 'https://wuminghui.top:9000/travel/beach.jpg'
      },
      productId: '10001',
      playDate: '',
      todayStr: (() => {
        const today = new Date();
        const pad = n => n < 10 ? '0' + n : n;
        return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
      })(),
      featuredRoutes: [
        {
          id: '10001',
          name: '浪漫双岛游',
          description: '东澳岛-外伶仃岛2日游，体验海岛风情。',
          price: 688.00,
          features: '含住宿,含餐饮,含门票',
          duration_days: 2,
          suitable_crowd: '情侣、家庭、朋友',
          notes: '请携带有效身份证件,建议携带防晒用品,请遵守导游安排,注意安全，听从工作人员指挥',
          image_url: 'https://wuminghui.top:9000/travel/beach.jpg'
        }
      ]
    };
  },
  onLoad(options) {
    this.getSafeAreaInfo();
    if (options.productId) {
      this.productId = options.productId;
      console.log('route页面收到的productId:', this.productId);
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    goToRegistration() {
      if (!this.playDate) {
        uni.showToast({ title: '请选择出发日期', icon: 'none' });
        return;
      }
      // 这里直接创建订单
      this.createOrder();
    },
    getSafeAreaInfo() {
      const systemInfo = uni.getSystemInfoSync();
      this.safeArea = systemInfo.safeArea || { top: 0, bottom: 0 };
    },
    onPlayDateChange(e) {
      this.playDate = e.detail.value;
      uni.showToast({
        title: '日期选择成功',
        icon: 'success',
        duration: 1500
      });
    },
    createOrder() {
      // 假设你有 userStore.userInfo
      const userInfo = getApp().globalData.userInfo || {};
      const orderData = {
        contract: {
          contractName: userInfo.realname || userInfo.username || '',
          contractPhone: userInfo.phone || ''
        },
        items: [
          {
            bookInfo: {
              date: this.playDate,
              fullname: userInfo.realname || userInfo.username || '',
              idCardNo: userInfo.idCardNo || '',
              idCardType: 'ID_CARD',
              schedule: this.playDate
            },
            productId: this.productId,
            productType: "FeaturedRoute",
            quantity: 1
          }
        ],
        travelStartDate: this.playDate,
        travelEndDate: this.playDate
      };

      uni.request({
        url: 'https://island.zhangshuiyi.com/island/front/order/createOrder',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'X-Access-Token': uni.getStorageSync('token')
        },
        data: orderData,
        success: (res) => {
          if (res.data.code === 200) {
            uni.showToast({
              title: '订单创建成功',
              icon: 'success',
              duration: 1500
            });
            // 跳转到订单详情页
            const orderSn = res.data.result.orderSn;
            const priceNumber = this.priceInfo.price.replace(/[¥￥]/g, '');
            uni.navigateTo({
              url: `/pages/comfirmAttractionOrder/confirmAttrationOrder?orderSn=${orderSn}&routeName=${encodeURIComponent(this.texts.routeName)}&price=${priceNumber}&playDate=${this.playDate}&image_url=${encodeURIComponent(this.assets.banner)}`
            });
          } else {
            uni.showToast({
              title: res.data.message || '订单创建失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          uni.showToast({
            title: '创建订单失败，请稍后重试',
            icon: 'none'
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  background-color: #f7f7f7;
  padding: 0 20px;
  padding-top: v-bind('safeArea.top + "px"');
  padding-bottom: 130px;
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
  /* 钱的颜色 */
  color: #007AFF;
  color: rgb(255, 105, 5);
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
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: #fff;
  padding: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2rpx 8rpx rgba(0,0,0,0.05);
  z-index: 100;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.total-price {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.total-label {
  font-size: 28rpx;
  color: #666;
}

.total-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #ff5722;
  line-height: 1;
}

.register-btn {
  background: linear-gradient(90deg, #007AFF 0%, #0056b3 100%);
  padding: 20rpx 48rpx;
  border-radius: 44rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.2);
  transition: all 0.3s ease;
  height: 88rpx;
}

.register-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 122, 255, 0.1);
}

.register-text {
  color: white;
  font-size: 32rpx;
  font-weight: bold;
}

.booking-section {
  background: #fff;
  border-radius: 16rpx;
  margin: 24rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.date-picker-wrapper {
  background: #f8fafc;
  border-radius: 12rpx;
  overflow: hidden;
}

.date-picker-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border: 1.5px solid #e0e0e0;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.date-picker-content.unselected {
  background: #f5f5f5;
  border-color: #eee;
}

.date-left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.date-label {
  font-size: 24rpx;
  color: #666;
}

.date-value {
  font-size: 32rpx;
  color: #007AFF;
  font-weight: 500;
}

.date-picker-content.unselected .date-value {
  color: #999;
}

.date-right {
  display: flex;
  align-items: center;
}

.date-picker-content:active {
  animation: dateSelect 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .booking-section {
    background: #1a1a1a;
  }
  
  .section-title {
    color: #fff;
  }
  
  .date-picker-content {
    background: #2a2a2a;
    border-color: #333;
  }
  
  .date-picker-content.unselected {
    background: #2a2a2a;
    border-color: #333;
  }
  
  .date-label {
    color: #999;
  }
  
  .date-value {
    color: #007AFF;
  }
  
  .date-picker-content.unselected .date-value {
    color: #666;
  }
  
  .action-buttons {
    background-color: #1a1a1a;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
  }
  
  .total-value {
    color: #ff5722;
  }
  
  .total-label {
    color: #999;
  }
}

@keyframes dateSelect {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1);
  }
}
</style>