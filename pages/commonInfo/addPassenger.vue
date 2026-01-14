<template>
  <view class="container">
    <view class="form-section">
      <view class="section-title">姓名</view>
      <view class="form-item">
        <text class="label">中文姓名</text>
        <input class="input" v-model="formData.name" placeholder="请输入中文姓名" />
      </view>
    </view>

    <view class="form-section">
      <view class="section-title">证件信息</view>
      <view class="form-item">
        <text class="label">证件号码</text>
        <input class="input" v-model="formData.idCard" type="idcard" placeholder="请输入您的身份证号" />
      </view>
    </view>

    <view class="form-section">
      <view class="section-title">其他信息</view>
      <view class="form-item">
        <text class="label">手机号码</text>
        <input class="input" v-model="formData.phone" type="number" placeholder="请输入您的手机号" />
      </view>
      <view class="form-item switch-item">
        <text class="label" style="color: #333;">设为本人</text>
        <switch :checked="formData.isSelf" color="#3c9cff" @change="onSwitchChange" style="transform:scale(0.8)"/>
      </view>
    </view>

    <view class="footer-bar">
      <button class="btn delete-btn" @click="handleDelete" v-if="isEdit">删除</button>
      <button class="btn save-btn" @click="handleSave" :style="{ width: isEdit ? '45%' : '90%' }">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const isEdit = ref(false);
const formData = reactive({
  id: '',
  name: '',
  idCard: '',
  phone: '',
  isSelf: false
});

onLoad((options) => {
  if (options.id) {
    isEdit.value = true;
    // Load data
    const stored = uni.getStorageSync('common_passengers');
    if (stored) {
      const list = JSON.parse(stored);
      const item = list.find(p => p.id === options.id);
      if (item) {
        Object.assign(formData, item);
      }
    }
  } else {
      // New ID
      formData.id = Date.now().toString();
  }
});

const onSwitchChange = (e) => {
  formData.isSelf = e.detail.value;
};

const handleSave = () => {
  if (!formData.name) {
    uni.showToast({ title: '请输入姓名', icon: 'none' });
    return;
  }
  if (!formData.idCard) {
    uni.showToast({ title: '请输入身份证号', icon: 'none' });
    return;
  }
  if (!formData.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' });
    return;
  }

  let list = [];
  const stored = uni.getStorageSync('common_passengers');
  if (stored) {
    list = JSON.parse(stored);
  }

  if (isEdit.value) {
    const index = list.findIndex(p => p.id === formData.id);
    if (index !== -1) {
      list[index] = { ...formData };
    }
  } else {
    list.push({ ...formData });
  }
  
  // If set as self, unset others? Usually only one self.
  if (formData.isSelf) {
      list.forEach(p => {
          if (p.id !== formData.id) p.isSelf = false;
      });
  }

  uni.setStorageSync('common_passengers', JSON.stringify(list));
  
  uni.showToast({ title: '保存成功', icon: 'success' });
  setTimeout(() => {
    uni.navigateBack();
  }, 1000);
};

const handleDelete = () => {
  uni.showModal({
      title: '提示',
      content: '确定要删除该旅客吗？',
      success: function (res) {
          if (res.confirm) {
              let list = [];
              const stored = uni.getStorageSync('common_passengers');
              if (stored) {
                list = JSON.parse(stored);
                const newList = list.filter(p => p.id !== formData.id);
                uni.setStorageSync('common_passengers', JSON.stringify(newList));
                uni.showToast({ title: '删除成功', icon: 'success' });
                setTimeout(() => {
                    uni.navigateBack();
                }, 1000);
              }
          }
      }
  });
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #F8F8F8;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.form-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.form-item {
  margin-bottom: 20rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .label {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 10rpx;
    display: block;
  }

  .input {
    height: 80rpx;
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 12rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    color: #333;
  }
}

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10rpx;
  
  .label {
      margin-bottom: 0;
  }
}

.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx 40rpx;
  display: flex;
  justify-content: space-between; /* Adjusted for variable width buttons */
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);

  .btn {
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    border-radius: 44rpx;
    font-size: 32rpx;
    border: none;
    
    &::after {
      border: none;
    }
  }

  .delete-btn {
    background-color: #f5f5f5;
    color: #333;
    width: 45%;
  }

  .save-btn {
    background-color: #3c9cff;
    color: #fff;
    // Width handled by inline style
  }
}
</style>