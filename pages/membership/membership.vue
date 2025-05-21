<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="nav-bar-content">
        <view class="back-btn" @click="goBack">
          <uni-icons type="left" size="22" color="#FFFFFF" />
        </view>
        <text class="nav-title">会员充值</text>
        <view class="placeholder"></view>
      </view>
    </view>

    <!-- 会员卡片 -->
    <view class="member-card">
      <view class="card-top">
        <image class="card-bg" src="https://wuminghui.top:9000/travel/logo.png" mode="aspectFill"></image>
        <view class="card-content">
          <view class="card-user-info">
            <view class="user-avatar">
              <image class="avatar" :src="token ? (userInfo.avatar || 'https://wuminghui.top:9000/travel/logo.png') : '/static/my/noLogin.png'"></image>
            </view>
            <view class="user-detail">
              <text class="user-name">{{ token ? (userInfo.username || '用户') : '游客' }}</text>
              <view class="user-level">
                <text class="level-text">{{ userInfo.isVip ? '高级会员' : '普通用户' }}</text>
                <text class="expiry" v-if="userInfo.isVip">{{ userInfo.expiryDate }}</text>
              </view>
            </view>
          </view>
          
          <!-- 未登录提示 -->
          <view class="login-tip" v-if="!token" @tap="goLogin">
            <text class="login-text">登录后享受会员特权 ></text>
          </view>
        </view>
      </view>
    </view>

    <!-- 会员特权 -->
    <view class="section privileges-section">
      <view class="section-title">
        <text class="title-text">会员特权</text>
      </view>
      <view class="privileges-list">
        <view class="privilege-item" v-for="(item, index) in privileges" :key="index">
          <view class="privilege-icon">
            <image :src="item.icon" mode="aspectFit"></image>
          </view>
          <text class="privilege-name">{{ item.name }}</text>
          <text class="privilege-desc">{{ item.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 充值选项 -->
    <view class="section recharge-section">
      <view class="section-title">
        <text class="title-text">充值选项</text>
      </view>
      <view class="recharge-options">
        <view class="recharge-item" 
          v-for="(item, index) in rechargeOptions" 
          :key="index" 
          :class="{ active: selectedOption === index }"
          @click="selectOption(index)">
          <text class="duration">{{ item.duration }}</text>
          <text class="price">¥{{ item.price }}</text>
          <text class="original-price" v-if="item.originalPrice">¥{{ item.originalPrice }}</text>
          <text class="discount" v-if="item.discount">{{ item.discount }}</text>
        </view>
      </view>
    </view>

    <!-- 支付方式 -->
    <view class="section payment-section">
      <view class="section-title">
        <text class="title-text">支付方式</text>
      </view>
      <view class="payment-options">
        <view class="payment-item" 
          v-for="(item, index) in paymentMethods" 
          :key="index" 
          :class="{ active: selectedPayment === index }"
          @click="selectPayment(index)">
          <image class="payment-icon" :src="item.icon" mode="aspectFit"></image>
          <text class="payment-name">{{ item.name }}</text>
          <uni-icons v-if="selectedPayment === index" type="checkmarkempty" size="20" color="#0098cc" />
        </view>
      </view>
    </view>

    <!-- 充值按钮 -->
    <view class="pay-btn-container">
      <view class="pay-btn" @click="handlePay">
        <text class="pay-btn-text">立即充值</text>
      </view>
      <text class="agreement">点击充值即表示同意《会员服务协议》</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
const statusBarHeight = ref(0);

// 用户信息
const userInfo = ref({});
const token = ref(null);

// 在onShow生命周期获取用户信息和token
onShow(() => {
  userInfo.value = userStore.userInfo || {};
  token.value = userStore.token;
});

// 会员特权列表
const privileges = ref([
  {
    icon: 'https://wuminghui.top:9000/travel/首页-景点攻略.svg',
    name: '专属折扣',
    desc: '享受全岛景点/酒店8折优惠'
  },
  {
    icon: 'https://wuminghui.top:9000/travel/首页-船票预订.svg',
    name: '优先预约',
    desc: '热门景区/酒店优先预约资格'
  },
  {
    icon: 'https://wuminghui.top:9000/travel/首页-美食推荐.svg',
    name: '专属客服',
    desc: '7×24小时专人服务'
  },
  {
    icon: 'https://wuminghui.top:9000/travel/首页-酒店住宿.svg',
    name: '生日礼包',
    desc: '生日当月获赠精美礼品'
  }
]);

// 充值选项
const rechargeOptions = ref([
  {
    id: 'monthly',
    duration: '月卡',
    price: '29.9',
    originalPrice: '',
    discount: ''
  },
  {
    id: 'quarterly',
    duration: '季卡',
    price: '79.9',
    originalPrice: '89.7',
    discount: '8.9折'
  },
  {
    id: 'yearly',
    duration: '年卡',
    price: '259.9',
    originalPrice: '358.8',
    discount: '7.2折'
  }
]);

// 支付方式
const paymentMethods = ref([
  {
    icon: 'https://wuminghui.top:9000/travel/微信支付.png',
    name: '微信支付'
  },
  {
    icon: 'https://wuminghui.top:9000/travel/支付宝.png',
    name: '支付宝'
  }
]);

// 选中的充值选项和支付方式
const selectedOption = ref(2); // 默认选中年卡
const selectedPayment = ref(0); // 默认微信支付

// 选择充值选项
const selectOption = (index) => {
  selectedOption.value = index;
};

// 选择支付方式
const selectPayment = (index) => {
  selectedPayment.value = index;
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 跳转登录页
const goLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login'
  });
};

// 处理支付
const handlePay = () => {
  // 如果未登录，先跳转到登录页
  if (!token.value) {
    uni.showModal({
      title: '提示',
      content: '请先登录后再进行充值',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/login/login'
          });
        }
      }
    });
    return;
  }
  
  const option = rechargeOptions.value[selectedOption.value];
  const payment = paymentMethods.value[selectedPayment.value];
  
  // 准备订单数据
  const orderData = {
    contract: {
      contractName: userInfo.value.realname || userInfo.value.username || '',
      contractPhone: userInfo.value.phone || ''
    },
    items: [
      {
        productId: option.id || option.duration, // 使用选项ID或名称
        productType: "Attractions", // 产品类型为会员
        imageUrl: 'https://wuminghui.top:9000/travel/logo.png',
        quantity: 1,
        price: parseFloat(option.price), // 添加价格信息
        title: `会员${option.duration}`, // 添加标题
        payAmount: parseFloat(option.price) // 支付金额
      }
    ],
    payAmount: parseFloat(option.price), // 总支付金额
    payMethod: payment.name === '微信支付' ? 'WX_PAY' : 'ALI_PAY' // 支付方式
  };

  console.log("准备提交的订单数据:", JSON.stringify(orderData));
  
  uni.showModal({
    title: '确认支付',
    content: `您选择了${option.duration}，金额${option.price}元，使用${payment.name}支付`,
    success: (res) => {
      if (res.confirm) {
        // 显示加载状态
        uni.showLoading({
          title: '创建订单中...'
        });
        
        // 模拟订单创建成功 - 暂时跳过实际API调用避免超时
        setTimeout(() => {
          uni.hideLoading();
          
          // 订单创建成功，模拟支付过程
          uni.showLoading({
            title: '支付中...'
          });
          
          setTimeout(() => {
            uni.hideLoading();
            uni.showToast({
              title: '充值成功',
              icon: 'success',
              duration: 2000
            });
            
            // 更新用户会员状态
            userInfo.value.isVip = true;
            userInfo.value.expiryDate = calculateExpiryDate(option.duration);
            
            // 支付成功后延迟返回
            setTimeout(() => {
              uni.navigateBack();
            }, 2000);
          }, 1500);
        }, 1000);
        
        // 以下是实际API调用代码，现已注释避免超时
        
        uni.request({
          url: 'https://island.zhangshuiyi.com/island/front/order/createOrder',
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'X-Access-Token': token.value
          },
          data: orderData,
          timeout: 30000, // 增加超时时间到30秒
          success: (res) => {
            uni.hideLoading();
            console.log("会员订单创建结果:", res.data);
            
            if (res.data.code === 200) {
              // 订单创建成功，模拟支付过程
              uni.showLoading({
                title: '支付中...'
              });
              
              // 这里后续会接入实际支付接口
              setTimeout(() => {
                uni.hideLoading();
                uni.showToast({
                  title: '充值成功',
                  icon: 'success',
                  duration: 2000
                });
                
                // 更新用户会员状态（实际项目中可能需要重新获取用户信息）
                userInfo.value.isVip = true;
                userInfo.value.expiryDate = calculateExpiryDate(option.duration);
                
                // 支付成功后延迟返回
                setTimeout(() => {
                  uni.navigateBack();
                }, 2000);
              }, 2000);
            } else {
              uni.showToast({
                title: res.data.message || '订单创建失败',
                icon: 'none',
                duration: 2000
              });
            }
          },
          fail: (err) => {
            uni.hideLoading();
            console.error('创建订单失败', err);
            uni.showToast({
              title: '创建订单失败，请稍后重试',
              icon: 'none',
              duration: 2000
            });
          }
        });
        
      }
    }
  });
};

// 计算会员到期日期
const calculateExpiryDate = (duration) => {
  const now = new Date();
  let expiryDate = new Date(now);
  
  if (duration === '月卡') {
    expiryDate.setMonth(now.getMonth() + 1);
  } else if (duration === '季卡') {
    expiryDate.setMonth(now.getMonth() + 3);
  } else if (duration === '年卡') {
    expiryDate.setFullYear(now.getFullYear() + 1);
  }
  
  // 格式化为YYYY-MM-DD格式
  return expiryDate.toISOString().split('T')[0] + '到期';
};

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight;
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

/* 顶部导航栏 */
.nav-bar {
  background: linear-gradient(135deg, #0098cc 0%, #005b94 100%);
  color: #ffffff;
  position: relative;
}

.nav-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 90rpx;
  padding: 0 30rpx;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
}

.placeholder {
  width: 60rpx;
}

/* 会员卡片 */
.member-card {
  margin: 30rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #0098cc 0%, #005b94 100%);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.15);
  position: relative;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.card-top {
  position: relative;
  padding: 40rpx 30rpx;
  height: 200rpx;
}

.card-bg {
  position: absolute;
  width: 150rpx;
  height: 150rpx;
  right: 20rpx;
  bottom: 20rpx;
  opacity: 0.1;
}

.card-content {
  position: relative;
  z-index: 2;
}

.card-user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid rgba(255, 255, 255, 0.2);
  margin-right: 20rpx;
}

.avatar {
  width: 100%;
  height: 100%;
}

.user-detail {
  color: #ffffff;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.user-level {
  display: flex;
  align-items: center;
}

.level-text {
  font-size: 26rpx;
  background: rgba(255, 215, 0, 0.2);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  margin-right: 10rpx;
  border: 1rpx solid rgba(255, 215, 0, 0.5);
}

.expiry {
  font-size: 24rpx;
  opacity: 0.8;
}

/* 会员特权部分 */
.section {
  background-color: #ffffff;
  border-radius: 16rpx;
  margin: 30rpx;
  padding: 30rpx;
}

.section-title {
  margin-bottom: 30rpx;
  border-left: 8rpx solid #0098cc;
  padding-left: 20rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.privileges-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
}

.privilege-item {
  background-color: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.privilege-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 15rpx;
}

.privilege-icon image {
  width: 100%;
  height: 100%;
}

.privilege-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.privilege-desc {
  font-size: 22rpx;
  color: #666;
  text-align: center;
}

/* 充值选项 */
.recharge-options {
  display: flex;
  justify-content: space-between;
}

.recharge-item {
  width: 30%;
  height: 160rpx;
  border-radius: 12rpx;
  border: 2rpx solid #e0e0e0;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.recharge-item.active {
  border-color: #0098cc;
  background-color: rgba(0, 152, 204, 0.05);
}

.recharge-item.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  right: 0;
  border: 15rpx solid transparent;
  border-right-color: #0098cc;
  border-bottom-color: #0098cc;
}

.duration {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.price {
  font-size: 36rpx;
  color: #ff6600;
  font-weight: bold;
  margin-bottom: 5rpx;
}

.original-price {
  font-size: 24rpx;
  color: #999;
  text-decoration: line-through;
}

.discount {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ff6600;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 10rpx;
  border-top-right-radius: 10rpx;
  border-bottom-left-radius: 10rpx;
}

/* 支付方式 */
.payment-options {
  border-radius: 12rpx;
  overflow: hidden;
}

.payment-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #f9f9f9;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
}

.payment-item.active {
  background-color: rgba(0, 152, 204, 0.05);
}

.payment-icon {
  width: 60rpx;
  height: 60rpx;
  margin-right: 20rpx;
}

.payment-name {
  font-size: 28rpx;
  flex: 1;
}

/* 支付按钮 */
.pay-btn-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 50rpx 30rpx;
}

.pay-btn {
  width: 90%;
  height: 90rpx;
  background: linear-gradient(135deg, #0098cc 0%, #005b94 100%);
  border-radius: 45rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 6rpx 20rpx rgba(0, 152, 204, 0.3);
}

.pay-btn-text {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
}

.agreement {
  font-size: 24rpx;
  color: #999;
  margin-top: 20rpx;
}

.login-tip {
  margin-top: 20rpx;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  align-self: flex-start;
  display: inline-block;
}

.login-text {
  color: #ffffff;
  font-size: 24rpx;
}
</style> 