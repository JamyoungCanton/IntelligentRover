<template>
  <view class="container">
    <view class="postTitle">
      <input type="text" placeholder="请输入标题..." v-model="title" />
    </view>
    <view class="section">
      <text class="section-title">板块分区</text>
      <text class="section-subtitle">日常交流</text>
    </view>
    <!-- 分区的弹窗 -->
    <button class="button" type="primary" @click="toggle('center')"><text class="button-text">居中</text></button>

    <view class="postContent">
      <textarea placeholder="分享你的旅游感受~" v-model="content" maxlength="1200"></textarea>
    </view>
    <view class="postImage">
      <view class="example-body">
        <uni-file-picker @change="handleFileUpload" limit="9" title="最多选择9张图片"></uni-file-picker>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const title = ref('');
    const content = ref('');
    const type = ref('center'); // 新增：控制弹出层类型
    
    const handleFileUpload = (event: any) => {
      console.log(event.detail);
    };

    // 新增：弹出层控制方法
    const toggle = (popupType: string) => {
      type.value = popupType;
      (this as any).$refs.popup.open(popupType);
    };

    return {
      title,
      content,
      type,
      handleFileUpload,
      toggle
    };
  }
});
</script>

<style lang="scss">
.container {
  display: flex;
	flex-direction: column;
  padding:20px;
}

.postTitle {
  margin-bottom: 10px;
  padding: 10px;
  border: solid 1px #ccc;
  margin: auto;
  border-radius: 10px;
  width: 80%;
  background-color: #f5f5f5;
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
}

.section-title {
  font-size: 16px;
  font-weight: bold;
}

.section-subtitle {
  font-size: 14px;
  color: #666;
}

.postContent {
  margin-bottom: 10px;
  padding: 10px;
  border: solid 1px #ccc;
  margin: auto;
  border-radius: 10px;
  width: 80%;
  background-color: #f5f5f5;
  margin-bottom: 20px;
}

.postImage {
  margin-bottom: 10px;
  padding: 10px;
  border: solid 1px #ccc;
  margin: auto;
  border-radius: 10px;
  width: 80%;
  background-color: #f5f5f5;
  height: 200px;
}

.example-body {
  padding: 10px;
}
</style>