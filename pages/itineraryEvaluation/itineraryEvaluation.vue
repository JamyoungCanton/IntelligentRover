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
        <view class="voice-input">
          <image 
            class="voice-icon" 
            :src="getImagePath(isVoiceInputActive ? icons.voiceActive : icons.voiceInactive)" 
            @click="toggleVoiceInput"
          ></image>
        </view>
      </view>
      
      <view class="photo-upload">
        <view class="upload-area">
          <view class="upload-btn" @click="openPhotoLibrary">
            <image :src="getImagePath(icons.camera)"></image>
          </view>
          <text class="photo-limit">{{ texts.photoLimit }}</text>
        </view>
        <view class="photo-preview-container">
          <view class="photo-preview" v-for="(photo, index) in uploadedPhotos" :key="index">
            <image :src="photo.url"></image>
            <view class="delete-photo" @click="deletePhoto(index)">
              <image :src="getImagePath(icons.close)"></image>
            </view>
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
      uploadedPhotos: [],
      isVoiceInputActive: false,
      selectedSatisfaction: null,
      productId: '',
      type: 'itinerary'
    };
  },
  onLoad(options) {
	this.getSafeAreaInfo();
    this.productId = options.productId || '';
    this.type = options.type || 'itinerary';
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
    toggleVoiceInput() {
      this.isVoiceInputActive = !this.isVoiceInputActive;
      uni.showToast({
        title: this.isVoiceInputActive ? '语音输入已开启' : '语音输入已关闭',
        icon: 'none'
      });
    },
    deletePhoto(index) {
      uni.showModal({
        title: '提示',
        content: '确定要删除这张图片吗？',
        success: (res) => {
          if (res.confirm) {
            this.uploadedPhotos.splice(index, 1);
          }
        }
      });
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
      if (!this.selectedSatisfaction) {
        uni.showToast({ title: '请选择整体满意度', icon: 'none' });
        return;
      }
      if (!this.feedbackText.trim()) {
        uni.showToast({ title: '请输入详细反馈', icon: 'none' });
        return;
      }

      // 获取用户信息
      const userStore = useUserStore();
      const userInfo = userStore.userInfo || {};

      // 获取商品/订单ID和类型（建议通过路由参数或页面传参传递）
      const productId = this.$route?.params?.productId || ''; // 或其它方式获取
      const type = this.$route?.params?.type || 'itinerary'; // 建议根据业务传递

      // 拼接评分内容
      const ratings = this.ratingItems.map(item => `${item.name}:${item.ratings}`).join('，');
      // 拼接图片url
      const photoUrls = this.uploadedPhotos.map(photo => photo.url).join(',');

      // 组装评论内容
      let commentContent = `满意度：${this.satisfactionOptions.find(opt => opt.value === this.selectedSatisfaction)?.label || ''}\n`;
      commentContent += `评分：${ratings}\n`;
      commentContent += `反馈：${this.feedbackText}`;
      if (photoUrls) {
        commentContent += `\n图片：${photoUrls}`;
      }

      const dto = {
        avatar: userInfo.avatar || '',
        comment: commentContent,
        productId: productId,
        type: type,
        userId: userInfo.id || '',
        username: userInfo.username || userInfo.realname || ''
      };

      uni.showModal({
        title: '确认提交',
        content: '您确定要提交反馈吗？',
        success: (res) => {
          if (res.confirm) {
            uni.request({
              url: 'https://island.zhangshuiyi.com/island/il-user-comments/save',
              method: 'POST',
              header: {
                'Content-Type': 'application/json',
                'X-Access-Token': userStore.token
              },
              data: { dto },
              success: (res) => {
                if ((res.data.code === 0 || res.data.code === 200) && res.data.success) {
                  uni.showToast({
                    title: '提交成功',
                    icon: 'success'
                  });
                  this.resetForm();
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
          }
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
    uploadImage(filePath) {
      const userStore = useUserStore();
      const token = userStore.token;

      if (!token) {
        uni.showToast({
          title: '未获取到认证信息，请重新登录',
          icon: 'none'
        });
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/login/login'
          });
        }, 500);
        return;
      }

      uni.uploadFile({
        url: 'https://island.zhangshuiyi.com/island/posts/uploadImage',
        filePath: filePath,
        name: 'file',
        header: {
          'X-Access-Token': token
        },
        success: (res) => {
          if (res.statusCode === 200) {
            try {
              const data = JSON.parse(res.data);
              if ((data.code === 0 || data.code === 200) && data.success && data.result && data.result.url) {
                this.uploadedPhotos.push({ url: data.result.url });
                uni.showToast({
                  title: '上传成功',
                  icon: 'success'
                });
              } else if (data.code === 401) {
                uni.showModal({
                  title: '登录失效',
                  content: '您的登录已过期，请重新登录',
                  showCancel: false,
                  confirmText: '去登录',
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      uni.navigateTo({ url: '/pages/login/login' });
                    }
                  }
                });
              } else {
                uni.showToast({
                  title: data.message || '图片上传失败',
                  icon: 'none'
                });
              }
            } catch (e) {
              console.error('解析响应数据失败:', e);
              uni.showToast({
                title: '图片上传失败',
                icon: 'none'
              });
            }
          } else {
            uni.showToast({
              title: `上传失败，状态码: ${res.statusCode}`,
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('图片上传失败:', err);
          uni.showToast({
            title: '图片上传失败',
            icon: 'none'
          });
        }
      });
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
.photo-upload {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 调整为左对齐 */
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 调整为左对齐 */
  margin-bottom: 10px;
}

.upload-btn {
  margin-bottom: 10px;
  cursor: pointer;
}

.upload-btn image {
  width: 80px; /* 调整照相机图标大小 */
  height: 80px; /* 调整照相机图标大小 */
}

.photo-limit {
  font-size: 12px;
  color: #999;
  text-align: left; /* 调整为左对齐 */
}

.photo-preview-container {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
}

.photo-preview {
  position: relative;
  margin: 0 10px 10px 0;
  width: 60px;
  height: 60px;
  border-radius: 5px;
  overflow: hidden;
}

.photo-preview image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-photo {
  position: absolute;
  top: 0;
  right: 0;
  background-color: rgba(255, 0, 0, 0.7);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-photo image {
  width: 12px;
  height: 12px;
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