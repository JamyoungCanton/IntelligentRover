<template>
  <view class="change-password-page">
    <view class="card">
      <view class="title">修改登录密码</view>
      <input class="input" v-model="oldPwd" placeholder="请输入原密码" password />
      <input class="input" v-model="newPwd" placeholder="请输入新密码" password />
      <button class="submit-btn" @click="submit">提交</button>
    </view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/modules/user'
const userStore = useUserStore()
const oldPwd = ref('')
const newPwd = ref('')
const submit = async () => {
  if (!oldPwd.value || !newPwd.value) {
    uni.showToast({ title: '请填写完整', icon: 'none' })
    return
  }
  if (newPwd.value.length < 6) {
    uni.showToast({ title: '新密码至少6位', icon: 'none' })
    return
  }
  // 调用后端接口
  const res = await uni.request({
    url: '你的后端修改密码接口',
    method: 'POST',
    data: { oldPwd: oldPwd.value, newPwd: newPwd.value },
    header: { 'X-Access-Token': userStore.token }
  })
  if (res.data.success) {
    uni.showToast({ title: '修改成功，请重新登录', icon: 'success' })
    setTimeout(() => {
      userStore.token = ''
      uni.reLaunch({ url: '/pages/login/login' })
    }, 1000)
  } else {
    uni.showToast({ title: res.data.message || '修改失败', icon: 'none' })
  }
}
</script>

<style scoped>
.change-password-page {
  min-height: 100vh;
  background: #f6f7fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.card {
  background: #fff;
  border-radius: 18rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
  padding: 48rpx 36rpx 36rpx 36rpx;
  width: 90vw;
  max-width: 500rpx;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
  margin-bottom: 40rpx;
  text-align: center;
}
.input {
  height: 90rpx;
  border-radius: 12rpx;
  border: 1rpx solid #e0e0e0;
  margin-bottom: 32rpx;
  padding: 0 28rpx;
  font-size: 28rpx;
  color: #222;
  background: #f8fafd;
}
.submit-btn {
  height: 90rpx;
  border-radius: 12rpx;
  background: linear-gradient(90deg, #1677ff 0%, #50a7ff 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  box-shadow: 0 4rpx 16rpx rgba(22,119,255,0.08);
  border: none;
  margin-top: 12rpx;
}
</style>
