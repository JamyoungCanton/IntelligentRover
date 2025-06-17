<template>
  <view class="container" >
    <view class="header">
      <view class="back-btn" @click="goBack">
        <uni-icons :type="icons.back" :size="iconsSize"></uni-icons>
      </view>
      <text class="title">{{ texts.title }}</text>
    </view>
    
    <view class="evaluation-section">
      <text class="section-title">{{ texts.overallSatisfaction }}</text>
      <view class="satisfaction-options-container">
        <view 
          class="option-item" 
          v-for="option in satisfactionOptions" 
          :key="option.value"
          @click="selectSatisfaction(option.value)"
        >
          <view class="option-wrapper">
            <view class="option-icon">
              <image :src="getImagePath(option.icon)"></image>
            </view>
            <text class="option-label">{{ option.label }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="evaluation-section">
      <text class="section-title">{{ texts.itineraryRating }}</text>
      <view class="rating-items-container">
        <view class="rating-item" v-for="item in ratingItems" :key="item.name">
          <text class="rating-label">{{ item.name }}</text>
          <view class="star-rating">
            <view 
              class="star-item" 
              v-for="n in 5" 
              :key="n"
              @click="rate(item.name, n)"
            >
              <image :src="getImagePath(item.ratings >= n ? icons.starFilled : icons.starEmpty)"></image>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <view class="evaluation-section">
      <text class="section-title">{{ texts.detailedFeedback }}</text>
      <view class="feedback-container">
        <textarea 
          class="feedback-textarea" 
          :placeholder="texts.feedbackPlaceholder"
          v-model="feedbackText"
          maxlength="500"
        />
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
    
    <view class="submit-button">
      <button class="submit-btn" @click="submitFeedback">{{ texts.submitButton }}</button>
    </view>
  </view>
</template>

<script>
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import { useUserStore } from '@/store/modules/user.js';
import { useCommentStore } from '@/store/modules/comment';

function getImagePath(imageName) {
  return `/static/itinerary/${imageName}`;
}


export default {
  components: {
    uniIcons
  },
  data() {
    return {
	  safeArea: { top: 0, bottom: 0 },
      // 文本内容
      texts: {
        title: '行程满意度评价',
        overallSatisfaction: '整体满意度',
        itineraryRating: '行程评分',
        detailedFeedback: '详细反馈',
        feedbackPlaceholder: '请详细描述您的行程体验，帮助我们提供更好的服务...',
        photoLimit: '最多上传9张图片，支持 jpg、png 格式',
        submitButton: '提交反馈'
      },
      // 图标和图片资源
      icons: {
        back: 'back',
        notification: 'notification',
        location: 'location',
        starFilled: 'star.png',
        starEmpty: 'no-star.png',
        voiceActive: 'voice-active.png',
        voiceInactive: 'voice-inactive.png',
        camera: 'camera.png',
        close: 'close.png'
      },
      // 图标大小和颜色
      iconsSize: 24,
      iconsSizeSmall: 16,
      iconsColor: '#666',
      // 满意度选项
      satisfactionOptions: [
        { value: 4, label: '非常满意', icon: 'very-satisfied.png' },
        { value: 3, label: '满意', icon: 'satisfied.png' },
        { value: 2, label: '一般', icon: 'general.png' },
        { value: 1, label: '不满意', icon: 'dissatisfied.png' }
      ],
      // 评分项目
      ratingItems: [
        { name: '行程安排', ratings: 4 },
        { name: '导游服务', ratings: 5 },
        { name: '餐饮体验', ratings: 3 }
      ],
      // 反馈内容
      feedbackText: '',
      uploadedFiles: [],
      isVoiceInputActive: false,
      selectedSatisfaction: null,
      productId: '',
      type: 'itinerary'
    };
  },
  onLoad(options) {
	this.getSafeAreaInfo();
    this.productId = options.productId || '';
    this.type = options.type || '';
    console.log('onLoad 获取到的 productId:', this.productId, 'type:', this.type);
  },
  onMounted() {
    const commentStore = useCommentStore();
    const type = commentStore.pendingComment.type;
    const productId = commentStore.pendingComment.productId;
    console.log('store 待评价商品类型:', type, 'productId:', productId);
    // 用于提交评论
  },
  methods: {
    getImagePath(imageName) {
      return getImagePath(imageName);
    },
    selectSatisfaction(value) {
      this.selectedSatisfaction = value;
    },
    rate(itemName, score) {
      this.ratingItems.find(item => item.name === itemName).ratings = score;
    },
    deletePhoto(index) {
      this.uploadedPhotos.splice(index, 1);
    },
    openPhotoLibrary() {
      if (this.uploadedPhotos.length >= 9) {
        uni.showToast({ title: '最多上传9张图片', icon: 'none' });
        return;
      }
      uni.chooseImage({
        count: 9 - this.uploadedPhotos.length,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (chooseImageRes) => {
          chooseImageRes.tempFilePaths.forEach(filePath => {
            this.uploadImage(filePath);
          });
        }
      });
    },
    submitFeedback() {
      if (!this.feedbackText.trim()) {
        uni.showToast({ title: '请输入详细反馈', icon: 'none' });
        return;
      }
      const userStore = useUserStore();
      const userInfo = userStore.userInfo || {};
      // 只保留非空图片
      const validFiles = this.uploadedFiles.filter(img => !!img && img.trim() !== '');
      // 没有图片时 url 传空字符串，否则用逗号拼接
      const url = validFiles.length > 0 ? validFiles.join(',') : '';
      const commentData = {
        id: Date.now().toString(),
        avatar: userInfo.avatar || "",
        comment: this.feedbackText,
        productId: this.productId,
        type: this.type,
        userId: userInfo.id,
        username: userInfo.realname || userInfo.username
      };
      if (url) commentData.url = url; // 只有有图片时才传 url 字段
      console.log('提交评论参数:', commentData);

      uni.request({
        url: 'https://island.zhangshuiyi.com/island/il-user-comments/save',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'X-Access-Token': userStore.token
        },
        data: commentData,
        success: (res) => {
          if ((res.data.code === 0 || res.data.code === 200) && res.data.success) {
            uni.showToast({
              title: '提交成功',
              icon: 'success'
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 800);
          } else {
            uni.showToast({
              title: res.data.message || '提交失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          });
        }
      });
    },
    resetForm() {
      this.selectedSatisfaction = null;
      this.ratingItems.forEach(item => item.ratings = 0);
      this.feedbackText = '';
      this.uploadedPhotos = [];
      this.isVoiceInputActive = false;
    },
    goBack() {
      uni.navigateBack();
    },
	getSafeAreaInfo() {
	    const systemInfo = uni.getSystemInfoSync();
	    this.safeArea = systemInfo.safeArea || { top: 0, bottom: 0 };
	},
    chooseImage() {
      if (!this.hasToken()) return;

      uni.chooseImage({
        count: 9 - this.uploadedFiles.length,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          console.log('选择的图片路径:', res.tempFilePaths);
          res.tempFilePaths.forEach((path) => {
            this.uploadImage(path);
          });
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    },
    uploadImage(path) {
      console.log('开始上传图片:', path);
      return new Promise((resolve, reject) => {
      const userStore = useUserStore();
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
        url: 'https://island.zhangshuiyi.com/island/posts/uploadImage',
        filePath: path,
        name: 'file',
        header: {
            'X-Access-Token': userStore.token
        },
        success: (res) => {
            console.log('图片上传响应:', res);
          if (res.statusCode === 200) {
            try {
              const data = JSON.parse(res.data);
                console.log('解析后的响应数据:', data);
                if (data.success) {
                  const imageUrl = data.result;
                  console.log('上传成功，图片URL:', imageUrl);
                  this.uploadedFiles.push(imageUrl);
                  resolve(imageUrl);
              } else {
                  console.error('上传失败:', data.message);
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
              console.error('上传失败，状态码:', res.statusCode);
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
    },
    deleteImage(index) {
      this.uploadedFiles.splice(index, 1);
    },
    hasToken() {
      const userStore = useUserStore();
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
    }
  }
};
</script>

<style scoped>
.container {
  padding: 0 20px;
  background-color: #f7f7f7;
  min-height: 100vh;
  padding-top: v-bind('safeArea.top + "px"');
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.evaluation-section {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
}

/* 整体满意度样式 */
.satisfaction-options-container {
  display: flex;
  justify-content: space-between;
  margin: 0 -10px; /* 调整左右外边距，使选项居中并有间隔 */
}

.option-item {
  flex: 1;
  margin: 0 10px; /* 左右间隔 */
  margin-top: 10px;
}

.option-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background-color: #fff;
  cursor: pointer;
}

.option-icon image {
  width: 20px; /* 调整图片大小 */
  height: 20px; /* 调整图片大小 */
  margin-bottom: 8px;
}

.option-label {
  font-size: 10px; /* 调整字体大小 */
  white-space: nowrap; /* 防止换行 */
}

/* 行程评分样式 */
.rating-items-container {
  margin-top: 10px;
}

.rating-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 10px;
}

.rating-label {
  font-size: 16px;
  padding: 0 10px;
}

.star-rating {
  display: flex;
  align-items: center;
  margin-left: auto; /* 调整星星和右侧框的间隔 */
  margin-right: 10px; /* 与右侧线留出10px的距离 */
}

.star-item {
  margin-left: 5px;
  width: 15px; /* 调整星星大小 */
  height: 15px; /* 调整星星大小 */
}

.star-item image {
  width: 100%;
  height: 100%;
}

/* 详细反馈样式 */
.feedback-container {
  position: relative;
  top: 10px;
}

.feedback-textarea {
  width: 100%;
  height: 120px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 10px;
  font-size: 14px;
  margin-bottom: 10px;
}

.voice-input {
  position: absolute;
  right: 10px;
  bottom: 10px;
}

.voice-icon {
  width: 30px;
  height: 30px;
  cursor: pointer;
}

/* 图片上传样式 */
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
  padding: 15px 0;
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
}
.image-item-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
}
.delete-btn {
  position: absolute;
  width: 26px;
  height: 26px;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.add-image {
  width: 100px;
  height: 100px;
  background: #f8f8f8;
  border: 2px dashed #ccc;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.add-icon {
  font-size: 40px;
  color: #999;
}

.submit-button {
  margin-top: 20px;
}

.submit-btn {
  width: 100%;
  height: 48px;
  background-color: #1989fa;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 18px;
}
</style>