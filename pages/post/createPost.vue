<template>
  <view class="container">
    <view class="post-title">
      <input class="post-title-input" type="text" placeholder="请输入标题..." v-model="title" />
    </view>

    <view class="section">
      <p><text class="section-title">板块分区</text></p>
      <view class="category-container">
        <view v-for="(category, index) in categories" :key="index" class="category-item"
          :class="{ 'category-active': postType === category }" @click="selectCategory(category)">
          {{ category }}
        </view>
      </view>
    </view>



    <view class="post-content">
      <textarea class="post-content-textarea" placeholder="分享你的旅游感受~" v-model="content" maxlength="1200"></textarea>
    </view>

    <view class="post-image">
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

    <button type="primary" class="post-button" @click="createPost">发布</button>
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

<style scoped>
.container {
  padding: 20px;
  background-color: #f8f8f8;
  min-height: 100vh;
  box-sizing: border-box;
}

.post-title {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
}

.post-title-input {
  width: 100%;
  height: 40px;
  font-size: 16px;
  line-height: 40px;
}

.section {
  margin-bottom: 20px;
  padding: 10px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  padding-bottom: 10px;
}

.category-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  padding: 0 15px;
}

.category-item {
  padding: 8px 10px;
  border-radius: 20px;
  background-color: #fff;
  color: #666;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-active {
  background-color: #e6f3ff;
  color: #007aff;
  font-weight: bold;
}

.post-content {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
}

.post-content-textarea {
  width: 100%;
  min-height: 200px;
  font-size: 15px;
  line-height: 1.5;
}

.post-image {
  margin-bottom: 80px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
}

.image-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
}

.image-item-image {
  width: 100%;
  height: 100%;
  border-radius: 5px;
}

.delete-btn {
  position: absolute;
  width: 25%;
  height: 25px;
  line-height: 12px;
  top: 5px;
  right: 5px;
  padding: 5px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 12px;
}

.add-image {
  width: 100px;
  height: 100px;
  background-color: #f8f8f8;
  border: 2px dashed #ccc;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.add-icon {
  font-size: 40px;
  color: #999;
}

.post-button {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 500px;
  height: 48px;
  line-height: 48px;
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
}
</style>