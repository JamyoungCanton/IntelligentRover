<template>
  <view class="container">
    <view class="input-area">
      <input
        class="input-box"
        type="text"
        v-model="inputText"
        placeholder="请输入测试内容"
      />
      <button class="send-button" @click="sendRequest">发送</button>
    </view>
    <view class="result-area">
      <text class="result-text">结果：</text>
      <text class="result-content">{{ result }}</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      inputText: '',
      result: ''
    };
  },
  methods: {
    sendRequest() {
      if (!this.inputText.trim()) {
        this.result = '请输入内容再发送';
        return;
      }
      const url = 'http://47.106.243.134:7181/island/front/ai/chat/chatMessage';
      const data = {
        conversation_id: '',
        inputs: {
          original_intention: 'unknown',
          recommended_plan: 'unknown'
        },
        query: this.inputText,
        user: 'abc-123'
      };

      uni.request({
        url: url,
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(data),
        success: (res) => {
          if (res.data.success) {
            this.result = `成功：${JSON.stringify(res.data.result.answer)}`;
          } else {
            this.result = `失败：${res.data.message}`;
          }
        },
        fail: (err) => {
          this.result = `请求失败：${err.errMsg}`;
        }
      });
    }
  }
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f5f5f5;
}

.input-area {
  display: flex;
  margin-bottom: 20px;
}

.input-box {
  flex: 1;
  height: 40px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 14px;
}

.send-button {
  margin-left: 10px;
  padding: 0 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.result-area {
  background-color: white;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.result-text {
  font-weight: bold;
  margin-bottom: 10px;
  display: block;
}

.result-content {
  word-wrap: break-word;
  color: #333;
}
</style>