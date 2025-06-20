<template>
  <view class="profile-edit-page">
    <view class="avatar-section">
      <view class="avatar-wrapper">
        <image class="avatar-img" :src="avatar" />
        <view v-if="isEdit" class="avatar-upload-btn" @click="chooseAvatar">
          <uni-icons type="camera" size="28" color="#ffffff" />
        </view>
      </view>
    </view>
    <view class="form-section">
      <view class="form-item">
        <text class="label">昵称</text>
        <!-- 根据 isEdit 动态绑定类名 -->
        <input 
          class="input" 
          :class="{ 'editable-border': isEdit }"
          v-model="nickname" 
          :disabled="!isEdit" 
          placeholder="请输入昵称" 
        />
      </view>
      <view class="form-item">
        <text class="label">个性签名</text>
        <!-- 根据 isEdit 控制是否可编辑 -->
        <input 
          class="input" 
          :class="{ 'editable-border': isEdit }"
          v-model="departids" 
          :disabled="!isEdit" 
          placeholder="请输入个性签名" 
          maxlength="10" 
        />
        <view class="signature-count">{{ departids.length }}/10</view>
      </view>
      <view class="form-item">
        <text class="label">出生日期</text>
        <picker mode="date" :disabled="!isEdit" :value="birthday" :end="today" @change="onBirthdayChange">
          <view class="picker-value" :class="{ 'editable-border': isEdit }">{{ birthday || '请选择出生日期' }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">手机号</text>
        <!-- 根据 isEdit 控制是否可编辑 -->
        <input 
          class="input" 
          :class="{ 'editable-border': isEdit }"
          v-model="phone" 
          :disabled="!isEdit" 
          placeholder="请输入手机号" 
          maxlength="11" 
          type="text" 
        />
      </view>
      <view class="form-item">
        <text class="label">邮箱</text>
        <!-- 根据 isEdit 控制是否可编辑 -->
        <input 
          class="input" 
          :class="{ 'editable-border': isEdit }"
          v-model="email" 
          :disabled="!isEdit" 
          placeholder="请输入邮箱" 
        />
      </view>
      <view class="form-item">
        <text class="label">真实姓名</text>
        <!-- 根据 isEdit 控制是否可编辑 -->
        <input 
          class="input" 
          :class="{ 'editable-border': isEdit }"
          v-model="realname" 
          :disabled="!isEdit" 
          placeholder="请输入真实姓名" 
        />
      </view>
    </view>
    <!-- 编辑和保存按钮放在页面底部 -->
    <view class="edit-save-container bottom-btn-container">
      <text v-if="isEdit" class="nav-save" @click="saveProfile">保存</text>
      <text v-else class="nav-save" @click="toggleEdit">编辑</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const isEdit = ref(false) // 初始为非编辑状态

const avatar = ref('')
const nickname = ref('')
const birthday = ref('')
const age = ref('')
const phone = ref('')
const email = ref('')
const departids = ref('')
const realname = ref('')

const today = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
})
const navBarStyle = computed(() => {
  const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0
  return `margin-top:${statusBarHeight}px;`
})

onLoad(async (options) => {
  if (!userStore.token || !uni.getStorageSync('token')) {
    uni.reLaunch({ url: '/pages/login/login' });
    return;
  }
  await fetchUserInfoFromServer()
  const info = userStore.userInfo

  // 处理头像URL
  avatar.value = info.avatar 
    ? (info.avatar.startsWith('http') 
      ? info.avatar 
      : `https://wuminghui.top:9000/${info.avatar.replace(/^\/+/, '')}`)
    : '';
    
  nickname.value = info.username || ''
  birthday.value = info.birthday || ''
  phone.value = info.phone || ''
  email.value = info.email || ''
  departids.value = info.departids || info.departIds || ''
  realname.value = info.realname || ''
  if (birthday.value) {
    age.value = calcAge(birthday.value)
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

  // 检查用户名是否发生变化
  const originalUsername = userStore.userInfo.username
  const hasUsernameChanged = nickname.value !== originalUsername

  // 构造要提交的数据
  const sysUserIdvo = {
    avatar: avatar.value,
    birthday: birthday.value,
    email: email.value,
    phone: phoneStr,
    realname: realname.value,
    departids: departids.value,
    username: nickname.value
  };

  // 只保留有值的字段（去除空字符串、null、undefined）
  const dataToSend = {};
  Object.keys(sysUserIdvo).forEach(key => {
    if (sysUserIdvo[key] !== '' && sysUserIdvo[key] !== null && sysUserIdvo[key] !== undefined) {
      dataToSend[key] = sysUserIdvo[key];
    }
  });

  uni.request({
    url: 'https://island.zhangshuiyi.com/island/sys/user/update',
    method: 'PUT',
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token
    },
    data: dataToSend,
    success: (res) => {
      if (res.data && res.data.success) {
        if (hasUsernameChanged) {
          // 用户名变更，自动退出登录
          uni.request({
            url: 'https://island.zhangshuiyi.com/island/sys/logout',
            method: 'PUT',
            header: {
              'Content-Type': 'application/json',
              'X-Access-Token': userStore.token
            },
            success: () => {
              userStore.setToken('');
              uni.removeStorageSync('token');
              uni.showToast({ title: '用户名已修改，请重新登录', icon: 'none' });
              setTimeout(() => {
                uni.reLaunch({ url: '/pages/login/login' });
              }, 1200);
            }
          });
        } else {
          // 重新拉取用户信息
          fetchUserInfoFromServer().then(() => {
            uni.showToast({ title: '保存成功', icon: 'success' });
            isEdit.value = false;
          });
        }
      } else {
        uni.showToast({ title: res.data.message || '保存失败', icon: 'none' });
      }
    },
    fail: () => {
      uni.showToast({ title: '网络错误', icon: 'none' });
    }
  });
}

// 切换编辑状态的方法
function toggleEdit() {
  isEdit.value = !isEdit.value
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
  background: #f5f6fa;
  min-height: 100vh;
  padding-bottom: 100rpx; /* 为底部按钮留出空间 */
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}

.avatar-wrapper {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.avatar-img {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  border: 6rpx solid #ffffff;
  object-fit: cover;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.avatar-upload-btn {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 60rpx;
  height: 60rpx;
  background: #007AFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 122, 255, 0.3);
}

.form-section {
  margin: 0 40rpx;
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  padding: 20rpx 30rpx;
}

.form-item {
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #f0f0f0;
  padding: 32rpx 0;
  font-size: 30rpx;
}

.form-item:last-child {
  border-bottom: none;
}

.label {
  color: #666666;
  width: 160rpx;
  flex-shrink: 0;
}

.input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 30rpx;
  color: #333333;
}

.picker-value {
  color: #333333;
  font-size: 30rpx;
}

.signature-count {
  color: #999999;
  font-size: 24rpx;
  margin-left: 12rpx;
}

.edit-save-container {
  display: flex;
  justify-content: center; /* 按钮居中显示 */
  align-items: center;
  margin-top: 50px;
}

.bottom-btn-container {
  left: 0;
  right: 0;
}

.nav-save {
  color: #007AFF;
  font-size: 36rpx;
  width: 70%;
  text-align: center;
  font-weight: 500;
  padding: 20rpx 80rpx;
  background-color: #ffffff;
  border-radius: 50rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

/* 非编辑状态下输入框样式 */
.non-editable-input {
  color: #999999; /* 文字颜色变灰 */
  background-color: #f5f5f5; /* 背景颜色变浅 */
}

/* 编辑状态下蓝色边框样式 */
.editable-border {
  border: 1rpx solid #007AFF; 
  border-radius: 8rpx; 
  padding: 10rpx; /* 适当添加内边距，让内容和边框有间距 */
}
</style>
