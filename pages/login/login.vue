<template>
  <view class="container">
    <view class="header">
      <image class="logo" src="https://wlmtsys.com:9000/travel/logo.png" mode="aspectFit" />
      <text class="title">海岛智游侠</text>
    </view>

    <view class="login-form">
      <button class="wechat-btn" @click="handleWechatLogin">
        <uni-icons type="weixin" size="24" color="#ffffff" />
        <text class="btn-text">微信一键登录</text>
      </button>

      <view class="divider">
        <text class="divider-text">或</text>
      </view>

      <view class="phone-login">
        <view class="input-group">
          <uni-icons type="username" size="24" color="#999999" />
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

        <view class="verify-code">
          <view class="code-input-wrap">
            <view class="input-group">
              <uni-icons type="locked" size="24" color="#999999" />
              <input type="text" placeholder="请输入验证码" maxlength="4" v-model="formData.verifyCode" @blur="validateVerifyCode" />
            </view>
            <image
              :src="codeImg"
              mode="scaleToFill"
              @tap="handleChangeCode"
              style="width: 190rpx;height: 90rpx; margin-top: 20rpx;"
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
          <uni-icons type="person" size="20" color="#666666" />
          <text class="btn-text">游客模式</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
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
// 密码可见性
const passwordVisible = ref(false);

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

// 校验验证码
const validateVerifyCode = () => {
  if (!formData.verifyCode) {
    errors.verifyCode = '验证码不能为空';
  } else if (formData.verifyCode.length !== 4) {
    errors.verifyCode = '验证码必须为4位';
  } else {
    errors.verifyCode = '';
  }
};

// 登录逻辑
const handleLogin = async () => {
  validateUsername();
  validatePassword();
  validateVerifyCode();

  if (errors.username || errors.password || errors.verifyCode) {
    return;
  }

  uni.request({
    url: 'https://island.zhangshuiyi.com/island/sys/login',
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
        uni.showToast({
          title: res.data.message || '登录失败',
          icon: 'none',
          duration: 1500
        });
        handleCode();
      } else {
        userStore.updateUserInfo(res.data.result.userInfo);
        userStore.setToken(res.data.result.token);
        uni.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500
        });
        // 获取存储的目标页面路径
        uni.getStorage({
          key: 'loginRedirectUrl',
          success: (res) => {
            const redirectUrl = res.data;
            if (redirectUrl) {
              // 修正参数名
              uni.reLaunch({
                url: redirectUrl
              });
              uni.removeStorage({ key: 'loginRedirectUrl' });
            } else {
              // 没有需要跳转的 URL，跳转到首页或其他默认页面 
              uni.reLaunch({ url: '/pages/index/index' });
            }
          },
          fail: (err) => {
            // 发生错误时跳转到首页或其他默认页面
            uni.reLaunch({ url: '/pages/index/index' });
          }
        });
      }
    },
    fail: (err) => {
      uni.showToast({
        title: '网络请求失败，请稍后再试',
        icon: 'none'
      });
      console.error('请求失败:', err);
    }
  });
};

const handleRegister = () => {
  uni.navigateTo({
    url: '/pages/register/register'
  });
};

const handleForgetPassword = () => {
  // 忘记密码逻辑
};

const handleGuestLogin = () => {
  // 游客登录逻辑
};

// 注册
const handleWechatLogin = () => {
  console.log(1);
  
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/sys/wxLogin',
    header:{'Content-Type':'application/json'},
    method:'POST',
    data:{code:'wx200ca5910f255867'},
    success:(success)=>{
      console.log(success);
    },
  })
}
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
.error-message {
  color: red;
  font-size: 22rpx;
  margin-left: 50rpx;
}

.password-input {
  -webkit-text-security: disc !important;
}
</style>