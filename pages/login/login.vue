<template>
  <view class="container">
    <view class="header">
      <image class="logo" src="/static/login/logo.jpg" mode="aspectFit"/>
      <text class="title">AI旅游行程管家</text>
    </view>

    <view class="login-form">
      <button class="wechat-btn" @tap="handleWechatLogin">
        <uni-icons type="weixin" size="24" color="#ffffff"/>
        <text class="btn-text">微信一键登录</text>
      </button>

      <view class="divider">
        <text class="divider-text">或</text>
      </view>

      <view class="phone-login">
        <view class="input-group">
          <uni-icons type="username" size="24" color="#999999"/>
          <input type="string" placeholder="请输入用户名" maxlength="11" v-model="formData.username"/>
          
        </view>
        <text v-if="errors.username" class="error-message">{{ errors.username }}</text>
        <view class="input-group">
          <uni-icons type="password" size="24" color="#999999"/>
          <input type="string" placeholder="请输入密码" maxlength="11" v-model="formData.password"/>
        </view>
        <text v-if="errors.password" class="error-message">{{ errors.password }}</text>


        <view class="verify-code">
          <view class="code-input-wrap">
            <view class="input-group">
              <uni-icons type="locked" size="24" color="#999999"/>
              <input type="number" placeholder="请输入验证码" maxlength="6" v-model="formData.verifyCode"/>
            </view>
            <image
              :src="codeImg"
              mode="scaleToFill"
              style="width: 170rpx;height: 80rpx; border-radius: 12rpx;"
            />
          </view>
        </view>
        <text v-if="errors.verifyCode" class="error-message">{{ errors.verifyCode }}</text>


        <button class="login-btn" @tap="handleLogin">登录</button>
      </view>

      <view class="actions">
        <text class="action-link" @tap="handleRegister">注册账号</text>
        <text class="action-link" @tap="handleForgetPassword">忘记密码</text>
      </view>

      <view class="guest-login">
        <button class="guest-btn" @tap="handleGuestLogin">
          <uni-icons type="person" size="20" color="#666666"/>
          <text class="btn-text">游客模式</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onMounted } from 'vue';
import { useUserStore } from '/store/modules/user.js';
const userStore = useUserStore();

// 时间戳
const key = ref(null);
// 验证码图片
const codeImg = ref(null);
// 表单数据
const formData = reactive({
  username: '',
  password: '',
  verifyCode: ''
});
// 错误信息
const errors = reactive({
  username: '',
  password: '',
  verifyCode: ''
});

onMounted(() => {
  handleCode();
});

// 获取验证码
const handleCode = async () => {
  key.value = new Date().getTime();
  uni.request({
    url: `http://47.106.243.134:7181/island/sys/randomImage/${key.value}`,
    method: 'GET',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: (res) => {
      // 处理返回的数据
      codeImg.value = res.data.result;
    },
    fail: (err) => {
      console.error('获取验证码失败:', err);
    }
  });
};

// 校验表单
const validateForm = () => {
  let isValid = true;

  // 校验用户名
  if (!formData.username) {
    errors.username = '用户名不能为空';
    isValid = false;
  } else if (formData.username.length < 5 || formData.username.length > 11) {
    errors.username = '用户名长度必须在5到11位之间';
    isValid = false;
  } else {
    errors.username = '';
  }

  // 校验密码
  if (!formData.password) {
    errors.password = '密码不能为空';
    isValid = false;
  } else if (formData.password.length < 6 || formData.password.length > 11) {
    errors.password = '密码长度必须在6到11位之间';
    isValid = false;
  } else {
    errors.password = '';
  }

  // 校验验证码
  if (!formData.verifyCode) {
    errors.verifyCode = '验证码不能为空';
    isValid = false;
  } else if (formData.verifyCode.length !== 4) {
    errors.verifyCode = '验证码必须为4位';
    isValid = false;
  } else {
    errors.verifyCode = '';
  }

  return isValid;
};

// 登录逻辑
const handleLogin = async () => {
  // 校验表单
  if (!validateForm()) {
    return; // 如果校验不通过，直接返回
  }

  // 发起登录请求
  uni.request({
    url: 'http://47.106.243.134:7181/island/sys/login',
    method: 'POST',
    data: {
      username: formData.username,
      password: formData.password,
      captcha: formData.verifyCode,
      checkKey: key.value
    },
    header: { 'Content-Type': 'application/json' },
    success: (res) => {
      if (res.data.success === false) {
        // 提示错误信息
        uni.showToast({
          title: res.data.message || '登录失败',
          icon: 'none',
          duration: 1500
        });
        handleCode(); // 重新获取验证码
      } else {
        // 把信息存储到pinia中
       
        userStore.updateUserInfo(res.data.result.userInfo)
        userStore.setToken(res.data.result.token)
        // 提示成功消息
        uni.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500
        });
        setTimeout(() => {
          uni.reLaunch ({
            url: '/pages/my/my' 
          });
        }, 1000);

        
      }
    },
    fail: (err) => {
      // 网络请求失败的处理
      uni.showToast({
        title: '网络请求失败，请稍后再试',
        icon: 'none'
      });
      console.error('请求失败:', err);
    }
  });
};


const handleForgetPassword = () => {
  // 忘记密码逻辑
};

const handleGuestLogin = () => {
  // 游客登录逻辑
};

</script>

<style>
page {
  height: 100%;
  background-color: #f9f9f9;
}

.container {
  min-height: 100%;
  padding: 60rpx 40rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.logo {
  width: 140rpx;
  height: 130rpx;
  margin-bottom: 30rpx;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #333333;
}

.login-form {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.divider {
  position: relative;
  text-align: center;
  margin: 60rpx 0;
}

.divider-text {
  background-color: #f8f8f8;
  padding: 0 30rpx;
  color: #999999;
  position: relative;
  z-index: 1;
  font-size: 14px;
}

.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e5e5e5;
  z-index: 0;
}

.input-group {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding: 20rpx 30rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  margin-top: 10rpx;
}

.input-group input {
  flex: 1;
  margin-left: 20rpx;
  font-size: 14px;
}

.verify-code .code-input-wrap {
  display: flex;
  gap: 20rpx;
}

.verify-code .input-group {
  flex: 1;
  margin-bottom: 0;
}

button {
  border: none;
  font-size: 14px;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 104rpx;
}

.wechat-btn {
  background-color: #07c160;
  color: #ffffff;
  width: 100%;
}

.code-btn {
  flex-shrink: 0;
  background-color: #f5f5f5;
  color: #333333;
  padding: 0 30rpx;
  white-space: nowrap;
}

.login-btn {
  background-color: #07c160;
  color: #ffffff;
  margin-top: 40rpx;
}

.btn-text {
  margin-left: 10rpx;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30rpx;
  padding: 0 20rpx;
}

.action-link {
  color: #666666;
  font-size: 14px;
}

.guest-login {
  margin-top: 80rpx;
}

.guest-btn {
  background-color: #f5f5f5;
  border: 1px solid #dddddd;
  color: #666666;
}

/* 校验错误 */
.error-message{
  color: red;
  font-size: 22rpx;
  margin-left: 50rpx;
}
</style>

