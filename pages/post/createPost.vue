<template>
  <view class="container">
    <view class="postTitle">
      <input type="text" placeholder="请输入标题..." v-model="title" />
    </view>
    <view class="section">
      <text class="section-title">板块分区</text>
      <view class="example-body box">
        <text v-if="postType && postType.trim()">{{ postType }}</text>
				<button class="button"  type="message" @click="toggle('center')"><text class="button-text">选择</text></button>
      </view>
    </view>
    <!-- 分区的弹窗 -->
   
			
    <!-- 弹出内容 -->
    <uni-popup ref="popupRef" style="width: 80%;" background-color="#fff" @change="change">
      <view class="popup-content">
        <button class="popup-btn" @click="selectOption('日常活动')">日常活动</button>
        <button class="popup-btn" @click="selectOption('旅游攻略')">旅游攻略</button>
        <button class="popup-btn" @click="selectOption('旅游分享')">旅游分享</button>
        <button class="popup-btn" @click="selectOption('分享生活')">分享生活</button>
      </view>
  </uni-popup>

    <view class="postContent">
      <textarea placeholder="分享你的旅游感受~" v-model="content" maxlength="1200"></textarea>
    </view>
    <view class="postImage">
      <view class="example-body">
        <uni-file-picker @change="handleFileUpload" limit="9" title="最多选择9张图片"></uni-file-picker>
      </view>
    </view>
    <button type="primary" class="postButton">发布</button>
  </view>
</template>

<script>
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const title = ref('');
    const content = ref('');
    const type = ref('center');
    const popupRef = ref(null);
    const postType = ref('');
    
    const handleFileUpload = (event) => {
      console.log(event.detail);
    };

    const change = (e) => {
      console.log('当前模式：' + e.type + ',状态：' + e.show);
    };
    const selectOption = (option) => {
      type.value = option.value;
      console.log('选择了:', option);
      postType.value = option;
      // 这里可以添加选择后的处理逻辑
      popupRef.value?.close(); // 选择后关闭弹窗
    };

    const toggle = (popupType) => {
      type.value = popupType;
      popupRef.value?.open(popupType);
    };

    return {
      title,
      content,
      type,
      popupRef,
      handleFileUpload,
      toggle,
      change,
      selectOption
    };
  
  }
});
</script>


<style lang="scss">
.page{
  background-color: #f8f8f8;
  height: 100vh;
}
.container {
  display: flex;
	flex-direction: column;
  padding:20px;
  background-color: #f8f8f8;
  position: relative;
  height: 0vh;
}

.postTitle {
  margin-bottom: 10px;
  padding: 10px;
  border: solid 1px #ccc;
  margin: auto;
  border-radius: 10px;
  width: 80%;
  background-color: #ffff;
  margin-bottom: 20px;
  height: 40px;
}

.section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  border: solid 1px #ccc;
  margin: auto;
  border-radius: 10px;
  width: 80%;
  height: 40px;
  margin-bottom: 20px;
  background-color: #fff;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
}

.section-subtitle {
  font-size: 14px;
  color: #666;
}
.popup-content {
  padding: 20px;
  
  background-color: #fff;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 15px;
  width: 80%;
}

.popup-btn {
  padding: 12px;
  color: black;
  border: none;
  border-radius: 5px;
  font-size: 16px;
}

.postContent {
  margin-bottom: 10px;
  padding: 10px;
  border: solid 1px #ccc;
  margin: auto;
  border-radius: 10px;
  width: 80%;
  background-color: #fff;
  margin-bottom: 20px;
}

.postImage {
  margin-bottom: 10px;
  padding: 10px;
  border: solid 1px #ccc;
  margin: auto;
  border-radius: 10px;
  width: 80%;
  background-color: #fff;
  height: 200px;
}

.example-body {
  padding: 10px;
}
.postButton {
  position: fixed; /* 固定定位 */
  bottom: 20px; /* 距离底部20px */
  left: 50%; /* 水平居中 */
  transform: translateX(-50%); /* 精确居中 */
  width: 80%;
  padding: 10px;
  background-color: #007aff; /* 添加背景色 */
  color: white; /* 文字颜色 */
  border: none;
  border-radius: 10px;



}
</style>