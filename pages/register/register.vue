<template>
  <view class="container">
    <view class="header">
      <image class="logo" src="/static/login/logo.jpg" mode="aspectFit"></image>
      <text class="title">AI旅游行程管家</text>
    </view>
    
    <view class="register-form">
      <!-- 用户名 -->
      <view class="input-group">
        <uni-icons type="username" size="24" color="#999999"></uni-icons>
        <input type="text" placeholder="请输入用户名" maxlength="11" v-model="formData.username"/>
      </view>

      <!-- 密码 -->
      <view class="input-group">
        <uni-icons type="password" size="24" color="#999999"></uni-icons>
        <input type="password" placeholder="请输入密码" maxlength="11" v-model="formData.password"/>
      </view>

      <!-- 图形验证码 -->
      <view class="verify-code">
        <view class="code-input-wrap">
          <view class="input-group">
            <uni-icons type="locked" size="24" color="#999999"></uni-icons>
            <input type="number" placeholder="请输入图形验证码" maxlength="4" v-model="formData.verifyCode"/>
          </view>
          <image
            :src="codeImg"
            mode="scaleToFill"
            style="width: 170rpx;height: 80rpx;margin-top: 20rpx; border-radius: 12rpx;"
            @tap="handleChangeCode"
          ></image>
        </view>
      </view>

      <!-- 手机号 -->
      <view class="input-group">
        <uni-icons type="phone" size="24" color="#999999"></uni-icons>
        <input type="number" placeholder="请输入手机号" maxlength="11" v-model="formData.phone"/>
      </view>

      <!-- 手机验证码 -->
      <view class="verify-code">
        <view class="code-input-wrap">
          <view class="input-group">
            <uni-icons type="locked" size="24" color="#999999"></uni-icons>
            <input type="number" placeholder="请输入手机验证码" maxlength="6" v-model="formData.phoneCode"/>
          </view>
          <button class="code-btn" @tap="handleSendPhoneCode">{{ phoneCodeBtnText }}</button>
        </view>
      </view>

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
  phone: '',
  verifyCode: '',
  phoneCode: ''
});
// 是否显示手机验证码输入框
const isShowPhoneCode = ref(false);
// 手机验证码按钮文本
const phoneCodeBtnText = ref('发送验证码');
// 倒计时标识数
const timer = ref(null);
// 倒计时秒数
const countdown = ref(60);

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

// 切换图形验证码
const handleChangeCode = () => {
  handleCode();
};

// 发送手机验证码
const handleSendPhoneCode = async () => {
  // 校验手机号和图形验证码是否为空
  if (!formData.phone ) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none'
    });
    return;
  }
  else if (!formData.verifyCode) {
    uni.showToast({
      title: '请输入图形验证码',
      icon: 'none'
    });
    return;
  }
  // 发送手机验证码逻辑
  phoneCodeBtnText.value = `${countdown.value}s后重试`;
  timer.value = setInterval(() => {
    countdown.value--;
    phoneCodeBtnText.value = `${countdown.value}s后重试`;
    if (countdown.value === 0) {
      clearInterval(timer.value);
      phoneCodeBtnText.value = '发送验证码';
      countdown.value = 60;
    }
  }, 1000);
};

// 注册逻辑
const handleRegister = async () => {
  // 校验用户名是否为空
  if (!formData.username) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none'
    });
    return;
  }
  // 校验密码是否为空
  if (!formData.password) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    });
    return;
  }
  // 校验图形验证码是否为空
  if (!formData.verifyCode) {
    uni.showToast({
      title: '请输入图形验证码',
      icon: 'none'
    });
    return;
  }
  // 校验手机号是否为空
  if (!formData.phone) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none'
    });
    return;
  }
  // 校验手机验证码是否为空
  if (!formData.phoneCode) {
    uni.showToast({
      title: '请输入手机验证码',
      icon: 'none'
    });
    return;
  }

  // 在这里添加实际的注册请求逻辑
  uni.showToast({
    title: '注册成功',
    icon: 'success'
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
</style>