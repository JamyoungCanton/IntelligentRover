<template>
  <view class="profile-edit-page">
    <view class="nav-bar" :style="navBarStyle">
      <uni-icons type="close" size="28" color="#333" @click="goBack" />
      <text class="nav-save" v-if="isEdit" @click="saveProfile">保存</text>
    </view>
    <view class="avatar-section">
      <view class="avatar-wrapper">
        <image class="avatar-img" :src="avatar" />
        <view v-if="isEdit" class="avatar-upload-btn" @click="chooseAvatar">
          <uni-icons type="camera" size="28" color="#fff" />
        </view>
      </view>
    </view>
    <view class="form-section">
      <view class="form-item">
        <text class="label">昵称</text>
        <input class="input" v-model="nickname" disabled placeholder="昵称不可修改" />
      </view>
      <view class="form-item">
        <text class="label">个性签名</text>
        <input class="input" v-model="openid" :disabled="!isEdit" placeholder="请输入个性签名" maxlength="10" />
        <view class="signature-count">{{ openid.length }}/10</view>
      </view>
      <view class="form-item">
        <text class="label">性别</text>
        <picker :disabled="!isEdit" :range="['男','女','保密']" :value="gender" @change="onGenderChange">
          <view class="picker-value">{{ genderText }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">出生日期</text>
        <picker mode="date" :disabled="!isEdit" :value="birthday" :end="today" @change="onBirthdayChange">
          <view class="picker-value">{{ birthday || '请选择出生日期' }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">手机号</text>
        <input class="input" v-model="phone" :disabled="!isEdit" placeholder="请输入手机号" maxlength="11" type="text" />
      </view>
      <view class="form-item">
        <text class="label">邮箱</text>
        <input class="input" v-model="email" :disabled="!isEdit" placeholder="请输入邮箱" />
      </view>
      <view class="form-item">
        <text class="label">真实姓名</text>
        <input class="input" v-model="realname" :disabled="!isEdit" placeholder="请输入真实姓名" />
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'
const userStore = useUserStore()
const isEdit = ref(true)
const avatar = ref('')
const nickname = ref('')
const gender = ref(0)
const birthday = ref('')
const age = ref('')
const phone = ref('')
const email = ref('')
const openid = ref('')
const realname = ref('')
const genderText = computed(() => ['男','女','保密'][gender.value])
const today = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
})
const navBarStyle = computed(() => {
  const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0
  return `margin-top:${statusBarHeight}px;`
})
onLoad(async (options) => {
  isEdit.value = options.mode === 'edit'
  await fetchUserInfoFromServer();
  const info = userStore.userInfo
  
  // 处理头像URL
  avatar.value = info.avatar 
    ? (info.avatar.startsWith('http') 
      ? info.avatar 
      : `https://wuminghui.top:9000/${info.avatar.replace(/^\/+/, '')}`)
    : '';
    
  nickname.value = info.username || ''
  gender.value = info.gender || 0
  birthday.value = info.birthday || ''
  phone.value = info.phone || ''
  email.value = info.email || ''
  openid.value = info.openid || ''
  realname.value = info.realname || ''
  if (birthday.value) {
    age.value = calcAge(birthday.value)
  }

  if (!userStore.token) {
    const token = uni.getStorageSync('token');
    if (token) userStore.setToken(token);
  }
})
watch(birthday, (val) => {
  if (val) age.value = calcAge(val)
})
function calcAge(birth) {
  if (!birth) return ''
  const birthYear = parseInt(birth.split('-')[0])
  const nowYear = new Date().getFullYear()
  return nowYear - birthYear
}
function goBack() {
  uni.navigateBack()
}
function chooseAvatar() {
  if (!isEdit.value) return
  uni.chooseImage({
    count: 1,
    success: (res) => {
      uploadAvatar(res.tempFilePaths[0])
    }
  })
}
function uploadAvatar(filePath) {
  console.log('上传头像时token:', userStore.token)
  uni.uploadFile({
    url: 'https://island.zhangshuiyi.com/island/posts/uploadImage',
    filePath: filePath,
    name: 'file',
    header: {
      'X-Access-Token': userStore.token
    },
    success: (uploadFileRes) => {
      try {
        const data = JSON.parse(uploadFileRes.data)
        console.log('上传头像响应:', data)
        if (data.success && data.result) {
          const imageUrl = data.result.startsWith('http') 
            ? data.result 
            : `https://wuminghui.top:9000/${data.result.replace(/^\/+/, '')}`;
            
          avatar.value = imageUrl;
          
          userStore.userInfo.avatar = imageUrl;
          
          uni.showToast({ 
            title: '上传成功', 
            icon: 'success' 
          });
        } else {
          console.error('上传头像失败:', data.message)
          uni.showToast({ 
            title: data.message || '上传失败', 
            icon: 'none' 
          });
        }
      } catch (e) {
        console.error('解析上传响应失败:', e)
        uni.showToast({ 
          title: '上传失败', 
          icon: 'none' 
        });
      }
    },
    fail: (err) => {
      console.error('上传头像请求失败:', err)
      uni.showToast({ 
        title: '上传失败', 
        icon: 'none' 
      });
    }
  });
}
function saveProfile() {
  // 手机号校验
  const phoneStr = String(phone.value).replace(/\s/g, '');
  if (!phoneStr) {
    uni.showToast({ title: '请输入手机号', icon: 'none' });
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(phoneStr)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' });
    return;
  }
  const sysUser = {
    avatar: avatar.value,
    birthday: birthday.value,
    email: email.value,
    phone: phoneStr,
    realname: realname.value,
    sex: Number(gender.value),
    openid: openid.value || null
  };
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/sys/user/update',
    method: 'PUT',
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token
    },
    data: sysUser,
    success: (res) => {
      if (res.data && res.data.success) {
        // 保存成功后，强制重新查一次用户信息
        fetchUserInfoFromServer().then(() => {
          uni.showToast({ title: '保存成功', icon: 'success' });
          isEdit.value = false;
        });
      } else {
        uni.showToast({ title: res.data.message || '保存失败', icon: 'none' });
      }
    },
    fail: () => {
      uni.showToast({ title: '网络错误', icon: 'none' });
    }
  });
}
function onGenderChange(e) {
  gender.value = e.detail.value
}
function onBirthdayChange(e) {
  birthday.value = e.detail.value
}
async function fetchUserInfoFromServer() {
  // 伪代码，按你实际接口写
  const res = await uni.request({
    url: `https://island.zhangshuiyi.com/island/sys/user/select/${userStore.userInfo.id}`,
    method: 'GET',
    header: {
      'X-Access-Token': userStore.token
    }
  });
  if (res.data && res.data.success) {
    userStore.userInfo = res.data.result;
  }
}
</script>

<style scoped>
.profile-edit-page {
  background: #fff;
  min-height: 100vh;
  padding-bottom: 40rpx;
}
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100rpx;
  padding: 0 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  box-sizing: border-box;
  margin-top: 80px !important;
}
.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #222;
}
.nav-save {
  color: #1677ff;
  font-size: 30rpx;
  font-weight: 500;
}
.avatar-section {
  display: flex;
  justify-content: center;
  margin-top: 40rpx;
  margin-bottom: 20rpx;
}
.avatar-wrapper {
  position: relative;
  width: 160rpx;
  height: 160rpx;
}
.avatar-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 4rpx solid #f0f0f0;
  object-fit: cover;
}
.avatar-upload-btn {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 48rpx;
  height: 48rpx;
  background: #1677ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(22,119,255,0.15);
}
.form-section {
  margin: 0 40rpx;
}
.form-item {
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #f0f0f0;
  padding: 32rpx 0;
  font-size: 30rpx;
}
.label {
  color: #888;
  width: 140rpx;
  flex-shrink: 0;
}
.input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 30rpx;
  color: #222;
}
.readonly {
  color: #bbb;
  font-size: 30rpx;
}
.picker-value {
  color: #222;
  font-size: 30rpx;
}
.textarea {
  width: 100%;
  min-height: 80rpx;
  border: none;
  background: transparent;
  font-size: 30rpx;
  color: #222;
  resize: none;
}
.textarea-count {
  text-align: right;
  color: #bbb;
  font-size: 24rpx;
  margin-top: 4rpx;
}
.signature-count {
  color: #bbb;
  font-size: 24rpx;
  margin-left: 12rpx;
}
</style>
