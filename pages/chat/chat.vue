<template>
  <view class="container">
    <!-- Header -->
    <view class="header">
      <view class="back-icon avatar ai-avatar" @tap="goBack">
        <image src="/static/chat/left.png"></image>
      </view>
      <view class="title">AI旅游助手</view>
      <view class="more-icon" @tap="showMore">
        <image src="/static/chat/more.png"></image>
      </view>
    </view>

    <!-- Chat Container -->
    <scroll-view 
      scroll-y 
      class="chat-container" 
      :scroll-top="scrollTop"
      scroll-with-animation
      :scroll-into-view="scrollIntoView"
    >
      <!-- AI Welcome Message -->
      <view class="message ai-message" id="msg-0">
        <view class="avatar ai-avatar">
          <image src="/static/chat/robot-avatar.png" mode="aspectFill"></image>
        </view>
        <view class="message-content">
          <text>欢迎使用AI旅游助手！我可以帮您规划完美的海岛之旅。您可以选择以下热门选项，或直接告诉我您的需求。</text>
          
          <!-- Category Options -->
          <view class="category-container">
            <view 
              v-for="(item, index) in categories" 
              :key="index" 
              class="category-item"
              @tap="() => selectCategory(item.id)"
            >
              <image :src="item.icon" mode="aspectFit"></image>
              <text>{{ item.name }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Chat Messages -->
      <block v-for="(msg, index) in chatMessages" :key="index">
        <!-- User Message -->
        <view v-if="msg.type === 'user'" class="message user-message" :id="`msg-${index+1}`">
          <view class="avatar user-avatar">
            <image src="/static/chat/user.png"></image>
          </view>
          <view class="message-content">
            <text>{{ msg.content }}</text>
          </view>
        </view>

        <!-- AI Response -->
        <view v-else class="message ai-message" :id="`msg-${index+1}`">
          <view class="avatar ai-avatar">
            <image src="/static/chat/robot-avatar.png" mode="aspectFill"></image>
          </view>
          <view class="message-content">
            <!-- If message has an image -->
            <image 
              v-if="msg.image" 
              class="response-image" 
              src="/static/chat/fashboat.png" 
              mode="widthFix"
            ></image>
            
            <!-- Text content -->
            <rich-text v-if="msg.content" class="message-content" :nodes="msg.content"></rich-text>
            
            <!-- Itinerary details -->
            <view v-if="msg.itinerary" class="itinerary-container">
              <view class="itinerary-title">{{ msg.itinerary.title }}</view>
              
              <view class="itinerary-section">
                <text class="section-title">行程安排:</text>
                
                <view 
                  v-for="(item, idx) in msg.itinerary.schedule" 
                  :key="idx" 
                  class="itinerary-item"
                >
                  <text class="time">{{ item.time }}:</text>
                  <rich-text class="detail" :nodes="formatItineraryText(item.detail)"></rich-text>
                </view>
              </view>
              
              <view v-if="msg.itinerary.recommendations" class="recommendations">
                <text class="section-title">推荐商家:</text>
                
                <view 
                  v-for="(rec, idx) in msg.itinerary.recommendations" 
                  :key="idx" 
                  class="recommendation-item"
                >
                  <text class="place">{{ rec.place }}:</text>
                  <text class="description">{{ rec.description }}</text>
                </view>
              </view>
              
              <view v-if="msg.itinerary.price" class="price-container">
                <view class="price-info">
                  <text class="price">¥ {{ msg.itinerary.price.amount }}</text>
                  <text class="price-details">{{ msg.itinerary.price.details }}</text>
                </view>
                <view v-if="msg.itinerary.price.discount" class="discount">
                  优惠·¥{{ msg.itinerary.price.discount }}元
                </view>
              </view>
              
              <button 
                v-if="msg.itinerary.price" 
                class="confirm-button" 
                @tap="navigatortopaymoent"
              >确认行程并购买</button>
            </view>
          </view>
        </view>
      </block>
    </scroll-view>

    <!-- Input Area -->
    <view class="input-container">
      <view class="add-icon" @tap="showAddOptions">
        <text class="iconfont">&#xe61f;</text>
      </view>
      <input 
        class="message-input" 
        type="text" 
        v-model="inputMessage" 
        placeholder="输入您的需求"
        @confirm="sendMessage"
      />
      <view class="send-icon" @tap="sendMessage">
        <text class="iconfont">&#xe616;</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue';

export default {
  setup() {
    // Reactive data
    const inputMessage = ref('');
    const scrollTop = ref(0);
    const scrollIntoView = ref('');
    
    // Category data with updated icons
    const categories = reactive([
      { 
        id: 'fishing', 
        name: '海钓体验', 
        icon: '/static/chat/fishing.jpg'
      },
      { 
        id: 'snorkeling', 
        name: '浮潜探索', 
        icon: '/static/chat/snorkeling.jpg'
      },
      { 
        id: 'family', 
        name: '亲子娱乐', 
        icon: '/static/chat/family.jpg'
      },
      { 
        id: 'leisure', 
        name: '休闲畅游', 
        icon: '/static/chat/leisure.jpg'
      },
      { 
        id: 'island', 
        name: '海岛介绍', 
        icon: '/static/chat/island.jpg'
      },
    ]);
    
    // Chat messages
    const chatMessages = reactive([
      {
        type: 'user',
        content: '我想了解海钓体验的详细行程'
      },
      {
        type: 'ai',
        image: true,
        itinerary: {
          title: '海钓体验行程安排',
          schedule: [
            { time: '上午', detail: '抵达海岛，前往<span class="highlight">海钓基地A</span>，享受专业海钓服务。' },
            { time: '中午', detail: '在<span class="highlight">海钓餐厅</span>享用海鲜午餐。' },
            { time: '下午', detail: '继续海钓，或参观<span class="highlight">海岛渔村</span>。' },
            { time: '晚上', detail: '返回<span class="highlight">海景酒店B</span>休息。' }
          ],
          recommendations: [
            { place: '海钓基地A', description: '提供专业设备租赁和导游服务。' },
            { place: '海钓餐厅', description: '特色海鲜套餐，价格区间: 200-300元/人。' },
            { place: '海景酒店B', description: '舒适海景房，价格: 500元/晚。' }
          ],
          price: {
            amount: '988',
            details: '含往返交通、住宿、活动费用',
            discount: '428'
          }
        }
      }
    ]);

    // Methods
    const selectCategory = (categoryId) => {
      console.log('Selected category:', categoryId);
      chatMessages.push({
        type: 'user',
        content: `我想了解${getCategoryName(categoryId)}的详细信息`
      });
      scrollToLatestMessage();
    };

    const getCategoryName = (categoryId) => {
      const category = categories.find(item => item.id === categoryId);
      return category ? category.name : '';
    };

    const sendMessage = () => {
      if (!inputMessage.value.trim()) return;
      chatMessages.push({
        type: 'user',
        content: inputMessage.value
      });
      inputMessage.value = '';
      scrollToLatestMessage();
      
      // 调用智能对话接口
      callAIInterface(chatMessages[chatMessages.length - 1].content);
    };

    const callAIInterface = (userQuery) => {
      const url = 'http://47.106.243.134:7181/island/front/ai/chat/chatMessage';
      const data = {
        conversation_id: '',
        inputs: {
          original_intention: 'unknown',
          recommended_plan: 'unknown'
        },
        query: userQuery,
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
            const aiResponse = res.data.result.answer;
            // 格式化返回的数据
            const formattedResponse = formatResponse(aiResponse);
            chatMessages.push({
              type: 'ai',
              content: formattedResponse
            });
            scrollToLatestMessage();
          } else {
            console.error('接口调用失败:', res);
            chatMessages.push({
              type: 'ai',
              content: '接口调用失败:很抱歉，我暂时无法回答您的问题，请稍后再试。'
            });
            scrollToLatestMessage();
          }
        },
        fail: (err) => {
          console.error('请求失败:', err);
          chatMessages.push({
            type: 'ai',
            content: '请求失败:很抱歉，我暂时无法回答您的问题，请稍后再试。'
          });
          scrollToLatestMessage();
        }
      });
    };

    const formatResponse = (responseText) => {
      // 在这里对接口返回的文本进行格式化处理
      // 例如，可以将文本中的换行符替换为<br>标签，以便在页面上正确显示
      let formattedText = responseText.replace(/\n/g, '<br>');
      
      // 进一步的格式化逻辑可以根据实际需求添加
      // 例如，添加HTML标签来美化文本，或者处理特定的关键词
      
      return formattedText;
    };

    const navigatortopaymoent = () => {
      uni.navigateTo({
        url: '/pages/payment/payment'
      });
    };

    const scrollToLatestMessage = () => {
      nextTick(() => {
        const lastIndex = chatMessages.length;
        scrollIntoView.value = `msg-${lastIndex}`;
      });
    };
    
    const formatItineraryText = (text) => {
      return text;
    };
    
    const goBack = () => {
      uni.navigateBack({
        delta: 1
      });
    };
    
    const showMore = () => {
      uni.showActionSheet({
        itemList: ['清空聊天记录', '设置', '关于'],
        success: (res) => {
          console.log('Selected option:', res.tapIndex);
        }
      });
    };
    
    const showAddOptions = () => {
      uni.showActionSheet({
        itemList: ['拍照', '从相册选择', '位置'],
        success: (res) => {
          console.log('Selected option:', res.tapIndex);
        }
      });
    };

    onMounted(() => {
      scrollToLatestMessage();
    });

    return {
      inputMessage,
      scrollTop,
      scrollIntoView,
      categories,
      chatMessages,
      selectCategory,
      getCategoryName,
      sendMessage,
      navigatortopaymoent,
      formatResponse,
      formatItineraryText,
      goBack,
      showMore,
      showAddOptions
    };
  }
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
  padding: 0 10px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  height: 44px;
  background-color: #4285f4;
  color: #ffffff;
  position: relative;
}

.back-icon, .more-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 18px;
  font-weight: 500;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.ai-avatar {
  background-color: #4285f4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-avatar image {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.user-avatar {
  background-color: #4CAF50;
}

.user-avatar image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.category-item {
  width: 18%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
}

.response-image {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 12px;
}

.itinerary-container {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
}

.itinerary-title {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333333;
}

.itinerary-section {
  margin-bottom: 16px;
}

.section-title {
  font-weight: bold;
  display: block;
  margin-bottom: 12px;
  color: #333333;
}

.itinerary-item {
  margin-bottom: 10px;
  display: flex;
}

.time {
  font-weight: bold;
  margin-right: 8px;
  width: 45px;
  flex-shrink: 0;
  color: #333333;
}

.detail {
  flex: 1;
  color: #666666;
}

.highlight {
  color: #4285f4;
}

.recommendations {
  margin-bottom: 16px;
}

.recommendation-item {
  margin-bottom: 10px;
}

.place {
  font-weight: bold;
  color: #333333;
}

.description {
  color: #666666;
  margin-top: 4px;
  display: block;
}

.price-container {
  margin-top: 16px;
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid #eeeeee;
}

.price-info {
  display: flex;
  align-items: baseline;
}

.price {
  font-size: 24px;
  font-weight: bold;
  color: #4285f4;
}

.price-details {
  font-size: 12px;
  color: #999999;
  margin-left: 8px;
}

.discount {
  color: #ff6b6b;
  font-size: 14px;
  margin-top: 6px;
}

.confirm-button {
  background-color: #4285f4;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 12px;
  font-size: 16px;
  width: 100%;
  margin-top: 12px;
}

.confirm-button:active {
  opacity: 0.9;
}

.input-container {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #ffffff;
  border-top: 1px solid #eeeeee;
}

.add-icon, .send-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon .iconfont, .send-icon .iconfont {
  font-size: 24px;
  color: #4285f4;
}

.message {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.ai-message {
  align-self: flex-start;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  margin: 0 12px;
  padding: 12px;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  line-height: 1.5;
}

.user-message .message-content {
  background-color: #4285f4;
  color: #ffffff;
}

.category-container {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  margin-top: 16px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 5px;
  width: 100%;
  overflow-x: auto;
}

.category-item {
  width: 18%;
  max-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 2px;
  margin-bottom: 8px;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  padding: 5px;
  background-color: #f9f9f9;
  font-size: 12px;
}

.category-item:active {
  transform: scale(0.98);
}

.category-item image {
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
}

.category-item text {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  text-align: center;
  line-height: 1.4;
}

.message-input {
  flex: 1;
  height: 36px;
  background-color: #f5f5f5;
  border-radius: 18px;
  padding: 0 16px;
  margin: 0 10px;
  font-size: 14px;
}

/* 海钓指南样式 */
.fishing-guide {
  margin-top: 20px;
  padding: 0 10px;
}

.guide-intro {
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 20px;
}

.divider {
  height: 2px;
  background-color: #4285f4;
  margin: 20px 0;
}

.section-title {
  font-size: 20px;
  color: #4285f4;
  margin-bottom: 15px;
}

.guide-section {
  margin-bottom: 20px;
}

.guide-item {
  margin-bottom: 15px;
}

.item-title {
  font-size: 16px;
  font-weight: bold;
  color: #000;
  margin-bottom: 5px;
}

.item-content {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 8px;
}

.guide-conclusion {
  font-size: 16px;
  line-height: 1.5;
  margin-top: 20px;
  font-weight: bold;
}
</style>