<template>
  <view class="feedback-page">
    <!-- 问题类型 -->
    <view class="form-group">
      <text class="label">问题类型</text>
      <picker :range="typeOptions" :value="typeIndex" @change="onTypeChange" class="picker">
        <view class="picker-inner">
          <text :class="{'placeholder': typeIndex === -1}">
            {{ typeIndex === -1 ? '请选择问题类型' : typeOptions[typeIndex] }}
          </text>
          <uni-icons type="bottom" size="18" color="#bbb" />
        </view>
      </picker>
    </view>

    <!-- 问题描述 -->
    <view class="form-group">
      <text class="label">问题描述</text>
      <textarea
        v-model="desc"
        class="textarea"
        placeholder="请详细描述您遇到的问题或建议…"
        maxlength="300"
        auto-height
        :placeholder-style="'color:#bbb;'"
      />
    </view>

    <!-- 联系方式 -->
    <view class="form-group">
      <text class="label">联系方式</text>
      <input
        v-model="contact"
        class="input"
        placeholder="请留下您的手机号或邮箱"
        maxlength="50"
        :placeholder-style="'color:#bbb;'"
      />
    </view>

    <!-- 上传图片或视频 -->
    <view class="form-group">
      <text class="label">上传图片或视频（选填）</text>
      <view class="upload-list">
        <view
          v-for="(item, idx) in files"
          :key="idx"
          class="upload-thumb"
        >
          <image :src="item" mode="aspectFill" />
          <view class="close-btn" @click="removeFile(idx)">
            <uni-icons type="closeempty" size="20" color="#fff" />
          </view>
        </view>
        <view
          v-if="files.length < 3"
          class="upload-thumb upload-btn"
          @click="chooseFile"
        >
          <uni-icons type="camera" size="36" color="#bbb" />
          <text class="upload-text">点击上传</text>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <button class="submit-btn" type="primary" @click="submit">提交反馈</button>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const typeOptions = ['功能异常', '产品建议', '内容问题', '其他'];
const typeIndex = ref(-1);
const desc = ref('');
const contact = ref('');
const files = ref([]);

const chooseFile = () => {
  uni.chooseImage({
    count: 3 - files.value.length,
    success: (res) => {
      files.value = files.value.concat(res.tempFilePaths);
    }
  });
};
const removeFile = (idx) => {
  files.value.splice(idx, 1);
};
const submit = () => {
  if (typeIndex.value === -1) {
    uni.showToast({ title: '请选择问题类型', icon: 'none' });
    return;
  }
  if (!desc.value.trim()) {
    uni.showToast({ title: '请填写问题描述', icon: 'none' });
    return;
  }
  uni.showToast({ title: '反馈已提交', icon: 'success' });
};
const goHistory = () => {
  uni.navigateTo({ url: '/pages/my/feedbackHistory' });
};
const onTypeChange = (e) => {
  typeIndex.value = e.detail.value;
};
</script>

<style scoped>
.feedback-page {
  background: #fff;
  min-height: 100vh;
  padding: 48rpx 32rpx 40rpx 32rpx;
  box-sizing: border-box;
  max-width: 100vw;
  overflow-x: hidden;
}
.form-group {
  margin-bottom: 44rpx;
  max-width: 100%;
}
.label {
  display: block;
  font-size: 30rpx;
  color: #222;
  margin-bottom: 18rpx;
  font-weight: 600;
}
.picker,
.textarea,
.input {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
.picker {
  background: #f6f7fa;
  border-radius: 18rpx;
  height: 90rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.01);
}
.picker-inner {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28rpx;
  font-size: 28rpx;
  color: #222;
  box-sizing: border-box;
}
.placeholder {
  color: #bbb;
}
.textarea {
  min-height: 140rpx;
  background: #f6f7fa;
  border-radius: 18rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: #222;
  border: none;
  resize: none;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.01);
}
.input {
  height: 90rpx;
  background: #f6f7fa;
  border-radius: 18rpx;
  padding: 0 28rpx;
  font-size: 28rpx;
  color: #222;
  border: none;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.01);
}
.upload-list {
  display: flex;
  gap: 24rpx;
  flex-wrap: wrap;
  max-width: 100%;
}
.upload-thumb {
  width: 150rpx;
  height: 150rpx;
  background: #f6f7fa;
  border-radius: 16rpx;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
  box-sizing: border-box;
}
.upload-thumb image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.upload-btn {
  flex-direction: column;
  justify-content: center;
}
.upload-text {
  font-size: 24rpx;
  color: #bbb;
  margin-top: 10rpx;
}
.close-btn {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  background: rgba(0,0,0,0.4);
  border-radius: 50%;
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.submit-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(90deg, #1677ff 0%, #50a7ff 100%);
  color: #fff;
  font-size: 32rpx;
  border-radius: 24rpx;
  margin-top: 32rpx;
  margin-bottom: 20rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  box-shadow: 0 4rpx 16rpx rgba(22,119,255,0.08);
}
.history-link {
  text-align: center;
  color: #1677ff;
  font-size: 28rpx;
  margin-top: 12rpx;
  font-weight: 500;
  letter-spacing: 1rpx;
}
</style>