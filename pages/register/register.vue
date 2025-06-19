<template>
  <view class="container">
    <view class="header">
      <image class="logo" src="https://wuminghui.top:9000/wlmtsys/2025/06/06/9a536b36999b400a893584686bfc9107.png" mode="aspectFit"></image>
      <text class="title">海岛智游侠</text>
    </view>

    <view class="register-form">
      <!-- 用户名 -->
      <view class="input-group">
        <uni-icons type="username" size="24" color="#999999"></uni-icons>
        <input type="text" placeholder="请输入用户名" maxlength="11" v-model="formData.username" @blur="validateUsername" />
      </view>
      <text v-if="errors.username" class="error-message">{{ errors.username }}</text>

      <view class="input-group">
        <uni-icons type="password" size="24" color="#999999" />

        <input
          :type="passwordVisible ? 'text' : 'password'"
          placeholder="请输入密码"
          maxlength="16"
          v-model="formData.password"
          :class="{ 'password-input': !passwordVisible && formData.password }"
          @blur="validatePassword"
        />
        <uni-icons
          :type="passwordVisible ? 'eye' : 'eye-slash'"
          size="24"
          color="#999999"
          @tap="togglePasswordVisibility"
          class="toggle-password-icon"
        />
      </view>
      <text v-if="errors.password" class="error-message">{{ errors.password }}</text>

      <!-- 图形验证码 -->
      <view class="verify-code">
        <view class="code-input-wrap">
          <view class="input-group">
            <uni-icons type="locked" size="24" color="#999999"></uni-icons>
            <input type="text" placeholder="请输入图形验证码" maxlength="4" v-model="formData.verifyCode" @blur="validateVerifyCode" />
          </view>
          <image
            :src="codeImg"
            mode="scaleToFill"
            style="width: 170rpx;height: 80rpx;margin-top: 20rpx; border-radius: 12rpx;"
            @tap="handleChangeCode"
          ></image>
        </view>
      </view>
      <text v-if="errors.verifyCode" class="error-message">{{ errors.verifyCode }}</text>

      <!-- 手机号 -->
      <view class="input-group">
        <uni-icons type="phone" size="24" color="#999999"></uni-icons>
        <input type="number" placeholder="请输入手机号" maxlength="11" v-model="formData.phone" @blur="validatePhone" />
      </view>
      <text v-if="errors.phone" class="error-message">{{ errors.phone }}</text>

      <!-- 手机验证码 -->
      <view class="verify-code">
        <view class="code-input-wrap">
          <view class="input-group">
            <uni-icons type="locked" size="24" color="#999999"></uni-icons>
            <input type="text" placeholder="请输入手机验证码" maxlength="6" v-model="formData.phoneCode" @blur="validatePhoneCode" />
          </view>
          <button class="code-btn" @tap="handleSendPhoneCode" :disabled="countdown > 0">{{ phoneCodeBtnText }}</button>
        </view>
      </view>
      <text v-if="errors.phoneCode" class="error-message">{{ errors.phoneCode }}</text>

      <button class="register-btn" @tap="handleRegister">注册</button>
    </view>

    <view class="actions">
      <text class="action-link" @tap="handleLogin">已有账号，去登录</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onMounted } from 'vue';

// 时间戳
const key = ref(null);
// 验证码图片
const codeImg = ref(null);
// 表单数据
const formData = reactive({
  username: '',
  password: '',
  verifyCode: '',
  phone: '',
  phoneCode: ''
});
// 错误信息
const errors = reactive({
  username: '',
  password: '',
  verifyCode: '',
  phone: '',
  phoneCode: ''
});
// 密码可见性
const passwordVisible = ref(false);
// 手机验证码按钮文本
const phoneCodeBtnText = ref('发送验证码');
// 倒计时秒数
const countdown = ref(0);
// 倒计时定时器
const timer = ref(null);

onMounted(() => {
  handleCode();
});

// 获取验证码
const handleCode = async () => {
  key.value = new Date().getTime();
  uni.request({
    url: `https://island.zhangshuiyi.com/island/sys/randomImage/${key.value}`,
    method: 'GET',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: (res) => {
      codeImg.value = res.data.result;
    },
    fail: (err) => {
      console.error('获取验证码失败:', err);
    }
  });
};

// 切换图形验证码
const handleChangeCode = () => {
  handleCode();
};

// 切换密码可见性
const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

// 校验用户名
const validateUsername = () => {
  if (!formData.username) {
    errors.username = '用户名不能为空';
  } else if (formData.username.length < 3 || formData.username.length > 11) {
    errors.username = '用户名长度必须在3到11位之间';
  } else {
    errors.username = '';
  }
};

// 校验密码
const validatePassword = () => {
  if (!formData.password) {
    errors.password = '密码不能为空';
  } else if (formData.password.length < 5 || formData.password.length > 16) {
    errors.password = '密码长度必须在5到16位之间';
  } else {
    errors.password = '';
  }
};

// 校验图形验证码
const validateVerifyCode = () => {
  if (!formData.verifyCode) {
    errors.verifyCode = '图形验证码不能为空';
  } else if (formData.verifyCode.length !== 4) {
    errors.verifyCode = '图形验证码必须为4位';
  } else {
    errors.verifyCode = '';
  }
};

// 校验手机号
const validatePhone = () => {
  if (!formData.phone) {
    errors.phone = '手机号不能为空';
  } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
    errors.phone = '请输入正确的手机号';
  } else {
    errors.phone = '';
  }
};

// 校验手机验证码
const validatePhoneCode = () => {
  if (!formData.phoneCode) {
    errors.phoneCode = '手机验证码不能为空';
  } else if (formData.phoneCode.length !== 6) {
    errors.phoneCode = '手机验证码必须为6位';
  } else {
    errors.phoneCode = '';
  }
};

// 发送手机验证码
const handleSendPhoneCode = async () => {
  // 校验手机号和图形验证码
  validatePhone();
  validateVerifyCode();
  if (errors.phone || errors.verifyCode) {
    return;
  }

  // 发送验证码请求
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/sys/sms',
    method: 'POST',
    data: {
      mobile: formData.phone,
      smsmode: '1',
      captcha: formData.verifyCode,
      checkKey: key.value
    },
    header: {
      'Content-Type': 'application/json'
    },
    success: (res) => {
      if (res.data.success === true) {
        uni.showToast({
          title: '验证码已发送',
          icon: 'none',
          duration: 1500
        });
        // 开始倒计时
        countdown.value = 60;
        phoneCodeBtnText.value = `${countdown.value}s后重试`;
        timer.value = setInterval(() => {
          countdown.value--;
          phoneCodeBtnText.value = `${countdown.value}s后重试`;
          if (countdown.value === 0) {
            clearInterval(timer.value);
            phoneCodeBtnText.value = '发送验证码';
          }
        }, 1000);
      } else {
        uni.showToast({
          title: res.data.message || '发送失败',
          icon: 'none',
          duration: 1500
        });
      }
    },
    fail: (err) => {
      console.error('发送验证码失败:', err);
      uni.showToast({
        title: '发送失败，请重试',
        icon: 'none',
        duration: 1500
      });
    }
  });
};

// 注册逻辑
const handleRegister = async () => {
  let isValid = true;

  validateUsername();
  validatePassword();
  validateVerifyCode();
  validatePhone();

  if (errors.username || errors.password || errors.verifyCode || errors.phone) {
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  // 发送注册接口
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/sys/user/register',
    method: 'POST',
    data: {
      username: formData.username,
      password: formData.password,
      phone: formData.phone,
      smscode: '123456' // 使用固定验证码值
    },
    header: { 'Content-Type': 'application/json' },
    success: (res) => {
      console.log(res.data);
      if (res.data.success === true) {
        uni.showToast({
          title: res.data.message,
          icon: 'success',
          duration: 1500
        });
        handleLogin()
      } else {
        uni.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 1500
        });
      }
    },
    
  });
};

// 跳转到登录页面
const handleLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login'
  });
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

.register-form {
  flex: 1;
  display: flex;
  flex-direction: column;
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

.code-btn {
  flex-shrink: 0;
  background-color: #f5f5f5;
  color: #333333;
  padding: 0 30rpx;
  white-space: nowrap;
}

.register-btn {
  background-color: #07c160;
  color: #ffffff;
  margin-top: 40rpx;
  width: 80%;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 30rpx;
  padding: 0 20rpx;
}

.action-link {
  color: #666666;
  font-size: 14px;
}

/* 校验错误 */
.error-message {
  color: red;
  font-size: 22rpx;
  margin-left: 50rpx;
}

.password-input {
  -webkit-text-security: disc !important;
}
</style>