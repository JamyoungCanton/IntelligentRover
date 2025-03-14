<template>
  <view class="container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="back" size="24"></uni-icons>
      </view>
      <text class="title">{{ texts.title }}</text>
    </view>
    
    <image :src="assets.banner" class="banner"></image>
    
    <view class="registration-form">
      <view class="form-item">
        <input v-model="formData.name" :placeholder="texts.namePlaceholder" class="input" />
      </view>
      
      <view class="form-item">
        <input v-model="formData.phone" :placeholder="texts.phonePlaceholder" class="input" />
      </view>
      
      <view class="form-item">
        <view class="verification-container">
          <input v-model="formData.code" :placeholder="texts.codePlaceholder" class="input verification-input" />
          <button class="verification-btn" @click="sendCode">{{ texts.getCodeBtn }}</button>
        </view>
      </view>
      
      <view class="form-item">
        <input v-model="formData.idCard" :placeholder="texts.idCardPlaceholder" class="input" />
      </view>
      
      <view class="form-item">
        <text class="label">{{ texts.selectTravelers }}</text>
        <view class="counter">
          <button :class="['counter-btn', 'minus', { 'disabled': formData.people === 1 }]" @click="decreasePeople" :style="{ color: formData.people === 1 ? '#AAAAAA' : '#007AFF' }">-</button>
          <text class="counter-value">{{ formData.people }}</text>
          <button class="counter-btn plus" @click="increasePeople">+</button>
        </view>
        <text class="price-display">{{ texts.pricePerPerson }} × {{ formData.people }}人</text>
      </view>
      
      <view class="form-item">
        <text class="label">{{ texts.selectPaymentMethod }}</text>
        <view class="payment-options">
          <view class="payment-option" @click="selectPayment('wechat')">
            <image :src="assets.wechatIcon" class="payment-icon"></image>
            <text class="payment-text">{{ texts.wechatPayment }}</text>
            <radio :checked="formData.payment === 'wechat'" class="radio"></radio>
          </view>
          <view class="payment-option" @click="selectPayment('alipay')">
            <image :src="assets.alipayIcon" class="payment-icon"></image>
            <text class="payment-text">{{ texts.alipayPayment }}</text>
            <radio :checked="formData.payment === 'alipay'" class="radio"></radio>
          </view>
        </view>
      </view>
      
      <view class="total-section">
        <view class="total-container">
          <view class="total-left">
            <text class="total-label">{{ texts.total }}</text>
            <text class="total-value">¥{{ totalAmount }}</text>
          </view>
          <button class="pay-btn" @click="submitForm">{{ texts.payNowBtn }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 图片资源路径
      assets: {
        banner: '/static/route/beach2.jpg',
        wechatIcon: '/static/route/wechat.png',
        alipayIcon: '/static/route/alipay.png'
      },
      // 文本内容
      texts: {
        title: '浪漫双岛游报名',
        namePlaceholder: '请输入姓名',
        phonePlaceholder: '请输入手机号',
        codePlaceholder: '请输入验证码',
        idCardPlaceholder: '请输入身份证号',
        getCodeBtn: '获取验证码',
        selectTravelers: '选择出行人数',
        pricePerPerson: '¥3999/人',
        selectPaymentMethod: '选择支付方式',
        wechatPayment: '微信支付',
        alipayPayment: '支付宝',
        total: '总计',
        payNowBtn: '立即支付'
      },
      // 表单数据
      formData: {
        name: '',
        phone: '',
        code: '',
        idCard: '',
        people: 2,
        payment: 'wechat'
      }
    };
  },
  computed: {
    totalAmount() {
      return 3999 * this.formData.people;
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    sendCode() {
      uni.showToast({
        title: '验证码已发送',
        icon: 'none'
      });
    },
    decreasePeople() {
      if (this.formData.people > 1) {
        this.formData.people--;
      }
    },
    increasePeople() {
      this.formData.people++;
    },
    selectPayment(paymentMethod) {
      this.formData.payment = paymentMethod;
    },
    submitForm() {
      if (!this.formData.name || !this.formData.phone || !this.formData.code || !this.formData.idCard) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
        return;
      }
      
      uni.showToast({
        title: '报名成功',
        icon: 'success',
        duration: 1500
      });
      
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/routeRegistrationSuccess/routeRegistrationSuccess'
        });
      }, 1500);
    }
  }
};
</script>

<style scoped>
.container {
  background-color: #f7f7f7;
  padding: 0 20px;
}

.header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 20px 0;
  background-color: #fff;
}

.back-btn {
  margin-right: 10px;
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.banner {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.registration-form {
  background-color: #fff;
  padding: 20px;
  margin-top: 10px;
}

.form-item {
  margin-bottom: 20px;
}

.input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.verification-container {
  display: flex;
}

.verification-input {
  flex: 1;
  margin-right: 10px;
}

.verification-btn {
  background-color: #007AFF;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  font-size: 14px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.counter {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 5px;
  overflow: hidden;
}

.counter-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7f7f7;
  font-size: 20px;
  border: none;
  border-radius: 50%;
  color: #007AFF;
}

.counter-btn.disabled {
  color: #AAAAAA;
  cursor: not-allowed;
}

.minus {
  margin-right: 10px;
}

.plus {
  margin-left: 10px;
}

.counter-value {
  flex: 1;
  text-align: center;
  font-size: 16px;
}

.price-display {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.payment-options {
  margin-top: 10px;
}

.payment-option {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.payment-icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.payment-text {
  font-size: 14px;
  margin-right: auto;
}

.radio {
  transform: scale(0.7);
}

.total-section {
  margin-top: 30px;
}

.total-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.total-left {
  display: flex;
  flex-direction: column;
}

.total-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.total-value {
  font-size: 18px;
  font-weight: bold;
  color: #007AFF;
}

.pay-btn {
  background-color: #007AFF;
  color: white;
  border-radius: 5px;
  font-size: 16px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0;
}
</style>