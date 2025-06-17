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
        <input v-model="formData.idCard" :placeholder="texts.idCardPlaceholder" class="input" />
      </view>

      <view class="form-item">
        <text class="label">{{ texts.selectTravelers }}</text>
        <view class="counter">
          <button :class="['counter-btn', 'minus', { 'disabled': formData.people === 1 }]" @click="decreasePeople"
            :style="{ color: formData.people === 1 ? '#AAAAAA' : '#007AFF' }">-</button>
          <text class="counter-value">{{ formData.people }}</text>
          <button class="counter-btn plus" @click="increasePeople">+</button>
        </view>
        <text class="price-display">{{ texts.pricePerPerson }} × {{ formData.people }}人</text>
      </view>

      <!-- 注释掉支付方式选择部分 -->
      <!-- <view class="form-item">
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
      </view> -->


      <view class="total-section">
        <view class="total-container">
          <view class="total-left">
            <text class="total-label">{{ texts.total }}</text>
            <text class="total-value">¥{{ totalAmount }}</text>
          </view>
          <button class="pay-btn" @click="submitForm">
            {{ texts.payNowBtn }} ¥{{ totalAmount }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useUserStore } from '@/store/modules/user';

export default {
  data() {
    return {
      safeArea: { top: 0, bottom: 0 },
      // 图片资源路径
      assets: {
        banner: 'https://wuminghui.top:9000/travel/beach.jpg',
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
        pricePerPerson: '¥688/人',
        selectPaymentMethod: '选择支付方式',
        wechatPayment: '微信支付',
        alipayPayment: '支付宝',
        total: '总计',
        payNowBtn: '立即报名'
      },
      // 表单数据
      formData: {
        name: '',
        phone: '',
        idCard: '',
        people: 2,
        payment: 'wechat',
        travelStartDate: '',
        productId: '',
        travelEndDate: ''
      },
      isCreating: false
    };
  },
  onLoad(options) {
    this.getSafeAreaInfo();
    if (options.productId) {
      this.formData.productId = options.productId;
      console.log('报名页收到的productId:', this.formData.productId);
    }
    // 接收并设置日期参数
    if (options.travelDate) {
      const selectedDate = options.travelDate;
      this.formData.travelStartDate = selectedDate + ' 08:00:00';
      this.formData.travelEndDate = selectedDate + ' 15:00:00';
      console.log('从route页面接收到的日期:', selectedDate);
      console.log('设置后的开始时间:', this.formData.travelStartDate);
      console.log('设置后的结束时间:', this.formData.travelEndDate);
    }
  },
  computed: {
    totalAmount() {
      return 688 * this.formData.people;
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    getSafeAreaInfo() {
      const systemInfo = uni.getSystemInfoSync();
      this.safeArea = systemInfo.safeArea || { top: 0, bottom: 0 };
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
    async submitForm() {
      if (this.isCreating) {
        return;
      }
      this.isCreating = true;
      
      // 检查必填字段
      if (!this.formData.productId) {
        uni.showToast({ title: '商品ID不能为空', icon: 'none' });
        this.isCreating = false;
        return;
      }
      
      // 姓名校验
      if (!/^[一-龥a-zA-Z]{2,10}$/.test(this.formData.name)) {
        uni.showToast({ title: '姓名需为2-10位中英文', icon: 'none' });
        this.isCreating = false;
        return;
      }
      // 手机号校验
      if (!/^1[3-9]\d{9}$/.test(this.formData.phone)) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
        this.isCreating = false;
        return;
      }
      // 身份证号校验
      if (!/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(this.formData.idCard)) {
        uni.showToast({ title: '请输入正确的身份证号', icon: 'none' });
        this.isCreating = false;
        return;
      }
      if (!this.formData.name || !this.formData.phone || !this.formData.idCard) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
        this.isCreating = false;
        return;
      }
      if (!this.formData.travelStartDate) {
        uni.showToast({
          title: '行程日期未设置',
          icon: 'none'
        });
        this.isCreating = false;
        return;
      }

      // 获取用户信息和token
      const userStore = useUserStore();
      const token = userStore.token;
      
      console.log('下单前token:', token);
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/login/login'
          });
        }, 2000);
        this.isCreating = false;
        return;
      }

      // 构建订单数据
      const orderData = {
        contract: {
          contractName: this.formData.name,
          contractPhone: this.formData.phone
        },
        items: [
          {
            bookInfo: {
              date: this.formData.travelStartDate,
              fullname: this.formData.name,
              idCardNo: this.formData.idCard,
              idCardType: 'ID_CARD',
              schedule: this.formData.travelStartDate
            },
            productId: this.formData.productId,
            productType: 'FeaturedRoute',
            quantity: this.formData.people
          }
        ],
        travelStartDate: this.formData.travelStartDate,
        travelEndDate: this.formData.travelEndDate
      };

      console.log('即将发送的订单数据:', JSON.stringify(orderData, null, 2));
      console.log('请求头:', {
        'Content-Type': 'application/json',
        'X-Access-Token': token
      });

      uni.showLoading({ title: '正在创建订单...' });
      uni.request({
        url: 'https://island.zhangshuiyi.com/island/front/order/createOrder',
        method: 'POST',
        data: orderData,
        header: {
          'Content-Type': 'application/json',
          'X-Access-Token': token
        },
        success: (res) => {
          console.log('创建订单响应:', res);
          uni.hideLoading();
          this.isCreating = false;
          
          if (res.statusCode === 401) {
            uni.showToast({ 
              title: '登录信息过期，请重新登录', 
              icon: 'none',
              duration: 2000
            });
            setTimeout(() => {
              uni.navigateTo({
                url: '/pages/login/login'
              });
            }, 2000);
            return;
          }
          
          if (res.data && res.data.code === 200 && res.data.result && res.data.result.orderSn) {
            const orderSn = res.data.result.orderSn;
            uni.showToast({
              title: '订单创建成功',
              icon: 'success',
              duration: 1500
            });
            setTimeout(() => {
              uni.navigateTo({
                url: `/pages/routeRegistrationSuccess/routeRegistrationSuccess?orderSn=${orderSn}&phone=${this.formData.phone}`
              });
            }, 1500);
          } else {
            console.error('创建订单失败:', res.data);
            uni.showToast({ 
              title: res.data.message || '订单创建失败', 
              icon: 'none' 
            });
          }
        },
        fail: (err) => {
          console.error('创建订单请求失败:', err);
          uni.hideLoading();
          this.isCreating = false;
          uni.showToast({ title: '订单创建失败，请稍后重试', icon: 'none' });
        }
      });
    },
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
  padding-bottom: 100px;
  /* 为底部固定区域留出空间 */
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
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 15px 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
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
  /* 钱的颜色 */
  color: #007AFF;
  color: rgb(255, 105, 5);
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

.date-picker {
  margin: 10px 0;
}
.picker-value {
  display: inline-block;
  margin-left: 10px;
  color: #007aff;
}
</style>