<template>
  <view class="container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <uni-icons :type="icons.back" size="24"></uni-icons>
      </view>
      <text class="title">{{ title }}</text>
    </view>
    
    <image :src="registrationImage" class="registration-image"></image>
    
    <view class="registration-info">
      <text class="activity-name">{{ activityName }}</text>
      <view class="info-item">
        <uni-icons :type="icons.calendar" size="16" color="#666"></uni-icons>
        <text class="info-text">{{ activityTime }}</text>
      </view>
      <view class="info-item">
        <uni-icons :type="icons.location" size="16" color="#666"></uni-icons>
        <text class="info-text">{{ activityLocation }}</text>
      </view>
      <view class="info-item">
        <text class="price">{{ price }}</text>
        <text class="price-unit">{{ priceUnit }}</text>
      </view>
    </view>
    
    <view class="form-section">
      <text class="section-title">{{ sections.form }}</text>
      
      <view class="form-item">
        <text class="label">{{ labels.name }}</text>
        <input v-model="form.name" class="input" :placeholder="placeholders.name" />
      </view>
      
      <view class="form-item">
        <text class="label">{{ labels.phone }}</text>
        <input v-model="form.phone" class="input" :placeholder="placeholders.phone" />
      </view>
      
      <view class="form-item">
        <text class="label">{{ labels.participants }}</text>
        <view class="counter">
          <button 
            @click="decreaseParticipants" 
            class="counter-btn minus"
            :disabled="form.participants === 1"
            :class="{ 'disabled': form.participants === 1 }"
          >
            {{ buttons.minus }}
          </button>
          <text class="counter-value">{{ form.participants }}</text>
          <button @click="increaseParticipants" class="counter-btn plus">
            {{ buttons.plus }}
          </button>
        </view>
      </view>
    </view>
    
    <view class="cost-details">
      <text class="section-title">{{ sections.cost }}</text>
      
      <view class="cost-item">
        <text class="cost-name">{{ costNames.activity }}</text>
        <text class="cost-value">¥{{ activityCost }} × {{ form.participants }}人</text>
      </view>
      
      <view class="cost-item">
        <text class="cost-name">{{ costNames.insurance }}</text>
        <text class="cost-value">¥{{ insuranceCost }} × {{ form.participants }}人</text>
      </view>
    </view>
    
    <view class="agreement">
      <checkbox class="checkbox" :checked="agreed" @click="toggleAgreement"></checkbox>
      <text class="agreement-text">{{ agreements.text }}</text>
    </view>
    
    <button class="submit-btn" @click="submitRegistration" :disabled="!agreed">
      {{ buttons.submit }}
    </button>
  </view>
</template>

<script>
export default {
  data() {
    return {
	  safeArea: { top: 0, bottom: 0 },
      // 图标和图片路径
      icons: {
        back: 'back',
        calendar: 'calendar',
        location: 'location'
      },
      // 活动图片
      registrationImage: 'https://wlmtsys.com:9000/travel/diving2.jpg',
      // 表单数据
      form: {
        name: '',
        phone: '',
        participants: 1
      },
      // 是否同意协议
      agreed: false,
      // 页面标题
      title: '活动报名',
      // 活动信息
      activityName: '深海潜水体验',
      activityTime: '2024年3月15日 09:00-12:00',
      activityLocation: '万山群岛 东澳岛潜水基地',
      // 价格信息
      price: '¥399',
      priceUnit: '/人',
      // 按钮文本
      buttons: {
        minus: '-',
        plus: '+',
        submit: '立即报名'
      },
      // 表单标签和占位符
      labels: {
        name: '姓名',
        phone: '手机号码',
        participants: '参与人数'
      },
      placeholders: {
        name: '请输入真实姓名',
        phone: '请输入手机号码'
      },
      // 协议文本
      agreements: {
        text: '我已阅读并同意《活动协议》和《免责声明》'
      },
      // 费用名称
      costNames: {
        activity: '活动费用',
        insurance: '保险费用'
      },
      // 分段标题
      sections: {
        form: '报名信息',
        cost: '费用明细'
      }
    };
  },
  onLoad(){
	  this.getSafeAreaInfo();
  },
  computed: {
    // 活动费用
    activityCost() {
      return 399 * this.form.participants;
    },
    // 保险费用
    insuranceCost() {
      return 50 * this.form.participants;
    }
  },
  methods: {
    goBack() {
      // 返回上一页
      uni.navigateBack();
    },
    decreaseParticipants() {
      if (this.form.participants > 1) {
        this.form.participants--;
      }
    },
	getSafeAreaInfo() {
	    const systemInfo = uni.getSystemInfoSync();
	    this.safeArea = systemInfo.safeArea || { top: 0, bottom: 0 };
	},
    increaseParticipants() {
      this.form.participants++;
    },
    toggleAgreement() {
      this.agreed = !this.agreed;
    },
    submitRegistration() {
      if (!this.form.name) {
        uni.showToast({
          title: '请输入姓名',
          icon: 'none'
        });
        return;
      }
      
      if (!this.form.phone) {
        uni.showToast({
          title: '请输入手机号码',
          icon: 'none'
        });
        return;
      }
      
      if (!this.agreed) {
        uni.showToast({
          title: '请阅读并同意协议',
          icon: 'none'
        });
        return;
      }
      
      uni.showToast({
        title: '报名成功',
        icon: 'success'
      });
      
      // 这里可以添加提交表单数据的逻辑
      console.log('报名信息:', this.form);
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
  padding: 10px 0;
  background-color: #007AFF;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-align: center;
  flex: 1;
}

.back-btn {
  margin-right: auto;
}

.registration-image {
  width: calc(100% - 40px); /* 使图片宽度比顶部蓝色框窄一些 */
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  margin: 0 auto; /* 居中显示 */
  display: block;
}

.registration-info {
  background-color: #fff;
  padding: 20px;
  margin-top: 10px;
}

.activity-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.info-text {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
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

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 20px 0 10px;
  padding-left: 10px;
  border-left: 4px solid #007AFF;
}

.form-item {
  background-color: #fff;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
}

.label {
  font-size: 16px;
  margin-bottom: 8px;
}

.input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
}

.counter {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.counter-btn {
  background-color: #007AFF;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.counter-btn.minus {
  margin-left: 0;
}

.counter-btn.disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.counter-value {
  font-size: 16px;
  text-align: center;
  flex: 1;
}

.cost-details {
  background-color: #fff;
  padding: 20px;
  margin-top: 10px;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.cost-name {
  font-size: 14px;
  color: #666;
}

.cost-value {
  font-size: 14px;
  font-weight: bold;
}

.agreement {
  display: flex;
  align-items: center;
  margin: 20px 0;
}

.agreement-text {
  font-size: 12px;
  color: #666;
}

.submit-btn {
  width: 100%;
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 15px;
  font-size: 16px;
  margin-top: 10px;
}
</style>