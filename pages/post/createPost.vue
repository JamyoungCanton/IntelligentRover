<template>
  <view class="container">
    <view class="floating-back" @click="goBack">
      <uni-icons type="arrow-left" size="20" color="#333"></uni-icons>
    </view>
    
    <view class="page-header">
      <text class="page-title">创建新帖子</text>
      <text class="page-subtitle">分享你的精彩旅行体验</text>
      <view class="progress-bar">
        <view class="progress-step" :class="{'complete': title.length > 0}">
          <view class="step-circle">1</view>
          <text class="step-name">输入标题</text>
        </view>
        <view class="progress-step" :class="{'complete': postType !== ''}">
          <view class="step-circle">2</view>
          <text class="step-name">选择板块</text>
        </view>
        <view class="progress-step" :class="{'complete': content.length > 0}">
          <view class="step-circle">3</view>
          <text class="step-name">编写内容</text>
        </view>
      </view>
    </view>
    
    <view class="post-form">
      <view class="post-title">
        <view class="form-label">
          <uni-icons type="paperplane" size="16" color="#0066CC"></uni-icons>
          <text>帖子标题</text>
          <text class="required">*</text>
        </view>
        <input class="post-title-input" type="text" placeholder="请输入标题..." v-model="title" />
      </view>
  
      <view class="section">
        <view class="form-label">
          <uni-icons type="grid" size="16" color="#0066CC"></uni-icons>
          <text>板块分区</text>
          <text class="required">*</text>
        </view>
        <view class="category-container">
          <view v-for="(category, index) in categories" :key="index" class="category-item"
            :class="{ 'category-active': postType === category }" @click="selectCategory(category)">
            {{ category }}
          </view>
        </view>
      </view>
  
      <view class="post-content">
        <view class="form-label">
          <uni-icons type="compose" size="16" color="#0066CC"></uni-icons>
          <text>帖子内容</text>
          <text class="required">*</text>
        </view>
        <textarea class="post-content-textarea" placeholder="分享你的旅游感受~" v-model="content" maxlength="1200"></textarea>
        <text class="content-counter">{{ content.length }}/1200</text>
      </view>
  
      <view class="post-image">
        <view class="form-label">
          <uni-icons type="image" size="16" color="#0066CC"></uni-icons>
          <text>上传图片</text>
          <text class="label-hint">(最多9张)</text>
        </view>
        <view class="image-container">
          <view v-for="(image, index) in uploadedFiles" :key="index" class="image-item">
            <image class="image-item-image" :src="image" mode="aspectFill"></image>
            <button class="delete-btn" @click="deleteImage(index)">x</button>
          </view>
          <view v-if="uploadedFiles.length < 9" class="add-image" @click="chooseImage">
            <text class="add-icon">+</text>
          </view>
        </view>
      </view>
    </view>

    <view class="submit-area">
      <button type="primary" class="post-button" @click="createPost">
        <uni-icons type="paperplane-filled" size="18" color="#fff" style="margin-right: 8px;"></uni-icons>
        发布帖子
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
const title = ref('');
const content = ref('');
const postType = ref('');
const uploadedFiles = ref([]);
const baseurl = 'https://island.zhangshuiyi.com';
const categories = ['日常活动', '旅游攻略', '旅游分享', '分享生活'];

const hasToken = () => {
  if (!userStore.token) {
    uni.showToast({
      title: '未登录,请先登录',
      icon: 'none',
      duration: 1500
    });
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    }, 500);
    return false;
  }
  return true;
};

const selectCategory = (category) => {
  postType.value = category;
};

const chooseImage = async () => {
  if (!hasToken()) return;

  try {
    const { tempFilePaths } = await uni.chooseImage({
      count: 9 - uploadedFiles.value.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera']
    });
    tempFilePaths.forEach((path) => {
      uploadImage(path);
    });
  } catch (err) {
    console.error('选择图片失败:', err);
    uni.showToast({
      title: '选择图片失败',
      icon: 'none'
    });
  }
};

const uploadImage = (path) => {
  return new Promise((resolve, reject) => {
    const token = userStore.token;

    if (!token) {
      uni.showToast({
        title: '未获取到认证信息，请重新登录',
        icon: 'none'
      });
      reject('未获取到认证信息');
      return;
    }

    uni.uploadFile({
      url: `${baseurl}/island/posts/uploadImage`,
      filePath: path,
      name: 'file',
      header: {
        'X-Access-Token': userStore.token
      },
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data);
            if (data.success) {
              const imageUrl = data.result;
              uploadedFiles.value.push(imageUrl);
              resolve(imageUrl);
            } else {
              uni.showToast({
                title: data.message || '图片上传失败',
                icon: 'none'
              });
              reject(data.message);
            }
          } catch (e) {
            console.error('解析响应数据失败:', e);
            uni.showToast({
              title: '图片上传失败',
              icon: 'none'
            });
            reject(e);
          }
        } else {
          uni.showToast({
            title: `上传失败，状态码: ${res.statusCode}`,
            icon: 'none'
          });
          reject(res.statusCode);
        }
      },
      fail: (err) => {
        console.error('图片上传失败:', err);
        uni.showToast({
          title: '图片上传失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

const deleteImage = (index) => {
  uploadedFiles.value.splice(index, 1);
};



const goBack = () => {
  uni.navigateBack();
};

const createPost = () => {
  if (!hasToken()) return;

  if (!title.value.trim()) {
    uni.showToast({
      title: '请输入标题',
      icon: 'none'
    });
    return;
  }
  if (!postType.value.trim()) {
    uni.showToast({
      title: '请选择板块分区',
      icon: 'none'
    });
    return;
  }
  if (!content.value.trim()) {
    uni.showToast({
      title: '请输入内容',
      icon: 'none'
    });
    return;
  }

  const postDto = {
    area: postType.value,
    content: content.value,
    images: uploadedFiles.value,
    title: title.value,
    postId: userStore.userInfo.id,
    repliedCommentId: ""
  };

  console.log(postDto)

  uni.request({
    url: `${baseurl}/island/posts/createPost`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token || ''
    },
    data: postDto,
    success: (res) => {
      console.log("创建帖子成功，响应数据:", res.data);
      // 跳转到帖子页面
      uni.switchTab({
        url: '/pages/ticketPoints/ticketPoints'
      });
    },
    fail: (err) => {
      // 在控制台打印错误信息
      console.error('创建帖子失败:', err);

      uni.showToast({
        title: '网络错误，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  })

}
</script>

<style lang="scss" scoped>
.container {
  padding: 0;
  background-color: #f8f8f8;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 220px;
    background: linear-gradient(120deg, #73c8ff, #4a86e8, #0066CC);
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 220px;
    background-image: url('https://wlmtsys.com:9000/travel/20.webp');
    background-size: cover;
    background-position: center;
    opacity: 0.25;
    z-index: 0;
    mix-blend-mode: overlay;
  }
}

.floating-back {
  position: absolute;
  left: 20px;
  top: 40px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 10;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  
  &:active {
    transform: scale(0.95);
    background-color: rgba(245, 245, 245, 0.9);
  }
}

.page-header {
  margin-bottom: 25px;
  position: relative;
  z-index: 1;
  padding-left: 15px;
  padding-top: 55px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
  background: linear-gradient(to right, #fff, #e0e0ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  display: block;
  margin-bottom: 20px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.progress-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
  padding: 0 10px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 12px;
    left: 25px;
    right: 25px;
    height: 2px;
    background-color: rgba(255, 255, 255, 0.3);
    z-index: -1;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 33%;
  
  .step-circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 8px;
    border: 2px solid rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(2px);
  }
  
  .step-name {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
  
  &.complete {
    .step-circle {
      background: linear-gradient(135deg, #0080ff, #0066CC);
      color: #fff;
      border-color: rgba(255, 255, 255, 0.8);
      box-shadow: 0 2px 10px rgba(0, 102, 204, 0.4);
    }
    
    .step-name {
      color: #fff;
      font-weight: 500;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
  }
}

.post-form {
  background-color: #fff;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
}

.form-label {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 500;
  color: #444;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
  
  text {
    margin-left: 6px;
    white-space: nowrap;
  }
  
  .required {
    color: #ff3b30;
    margin-left: 4px;
  }
  
  .label-hint {
    font-size: 12px;
    color: #999;
    font-weight: normal;
    margin-left: 5px;
    white-space: nowrap;
  }
}

.post-title {
  margin-bottom: 20px;
  padding: 0;
  position: relative;
  z-index: 1;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
}

.post-title-input {
  width: 100%;
  height: 45px;
  font-size: 16px;
  line-height: 45px;
  color: #333;
  padding: 0 15px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
  box-sizing: border-box;
  max-width: 100%;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:focus {
    outline: none;
    border-color: #0066CC;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
  
  &::placeholder {
    color: #aaa;
    transition: opacity 0.3s ease;
  }
  
  &:focus::placeholder {
    opacity: 0.5;
  }
}

.section {
  margin-bottom: 20px;
  padding: 0;
  position: relative;
  z-index: 1;
}

.category-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin: 5px 0 15px;
  padding: 0 5px;
  width: 100%;
  box-sizing: border-box;
}

.category-item {
  padding: 9px 8px;
  border-radius: 20px;
  background-color: #f9f9f9;
  color: #666;
  font-size: 13px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  box-sizing: border-box;
  white-space: nowrap;
  
  &:active {
    transform: scale(0.95);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.5), transparent);
    transform: translateX(-100%);
    transition: 0.5s;
  }
  
  &:active::after {
    transform: translateX(100%);
  }
}

.category-active {
  background: linear-gradient(to right, #0080ff, #0066CC);
  color: #fff;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(0, 102, 204, 0.25);
  border: none;
  transform: translateY(-1px);
  z-index: 2;
}

.post-content {
  margin-bottom: 20px;
  padding: 0;
  position: relative;
  z-index: 1;
}

.post-content-textarea {
  width: 100%;
  min-height: 200px;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  padding: 15px;
  border: none;
  resize: none;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-sizing: border-box;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  
  &:focus {
    outline: none;
    background-color: #fff;
    box-shadow: inset 0 0 0 1px #d0e0ff;
  }
  
  &::placeholder {
    color: #aaa;
    transition: opacity 0.3s ease;
  }
  
  &:focus::placeholder {
    opacity: 0.5;
  }
}

.content-counter {
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 8px;
  display: block;
  padding-right: 10px;
}

.post-image {
  margin-bottom: 20px;
  padding: 0;
  position: relative;
  z-index: 1;
}

.image-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 10px;
  border: 1px dashed #e0e0e0;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
  }
}

.image-item-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  &:hover {
    transform: scale(1.05);
  }
}

.delete-btn {
  position: absolute;
  width: 26px;
  height: 26px;
  line-height: 22px;
  top: 5px;
  right: 5px;
  padding: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  
  &:hover {
    background-color: rgba(255, 0, 0, 0.7);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.9);
  }
}

.add-image {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #f8f8f8, #f0f0f0);
  border: 2px dashed #ccc;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #f0f0f0, #e8e8e8);
    border-color: #0080ff;
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 128, 255, 0.15);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.add-icon {
  font-size: 40px;
  color: #999;
  transition: all 0.3s ease;
  
  .add-image:hover & {
    color: #0080ff;
  }
}

.submit-area {
  padding: 15px 20px 30px;
  display: flex;
  justify-content: center;
  position: relative;
  margin-top: 10px;
}

.post-button {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0080ff, #0066CC);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 102, 204, 0.3);
  transition: all 0.3s ease;
  overflow: hidden;
  z-index: 10;
  letter-spacing: 1px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transform: translateX(-100%);
    transition: 0.6s;
  }
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
  }
  
  &:hover::before {
    transform: translateX(100%);
  }
}
</style>