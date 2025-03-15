<template>
  <view class="container">
    <!-- Header -->
    <view class="header">
      <view class="back-icon avatar ai-avatar" @tap="goBack">
        <image src="/static/chat/left.png" ></image>
      </view>
      <view class="title">AI旅游助手</view>
      <view class="more-icon avatar ai-avatar" @tap="showMore">
        <image src="/static/chat/more.png" ></image>
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
            <text v-if="msg.content">{{ msg.content }}</text>
            
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
      <view class="add-icon avatar ai-avatar" @tap="showAddOptions" style="background-color: #f5f5f5;">
        <image src="/static/chat/add.png"></image>
      </view>
      <input 
        class="message-input" 
        type="text" 
        v-model="inputMessage" 
        placeholder="输入您的需求"
        @confirm="sendMessage"
      />
      <view class="send-icon avatar ai-avatar" @tap="sendMessage">
        <image src="/static/chat/send.png"></image>
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

    // Methods remain the same
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
      setTimeout(() => {
        chatMessages.push({
          type: 'ai',
          content: '我已收到您的需求，正在为您准备相关信息，请稍候。'
        });
        scrollToLatestMessage();
      }, 1000);
      scrollToLatestMessage();
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


.back-icon, .more-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 12px;
  font-weight: 500;
}

/* Chat container styles */
.chat-container {
  flex: 1;
  overflow-y: auto;
}


.avatar {
  width: 40px; /* Increased from 32px */
  height: 40px; /* Increased from 32px */
  border-radius: 4px; /* Changed from 50% to make it square */
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
  padding-left: 1px;
}

.user-avatar {
  background-color: #4CAF50; /* Green color for logo background */
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

/* Response image */
.response-image {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 12px;
}

/* Itinerary styles */
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

/* Recommendations styles */
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

/* Price styles */
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

/* Button styles */
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

/* Input area styles */
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
  background-color: #4285f4;
  border-radius: 50px;
}

.add-icon .iconfont, .send-icon .iconfont {
  font-size: 24px;
  color: #4285f4;
}

/* Font icons */
@font-face {
  font-family: "iconfont";
   font-display: swap;
  src: url('data:application/x-font-woff2;charset=utf-8;base64,d09GMgABAAAAAAk...') format('woff2');
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Add these styles to your existing CSS */

/* Avatar base64 images */
.user-avatar {
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC/klEQVRYR+2WTUhUURTH/+e+N6ZmamVqRR+GhFSWRBQtJnUxRR8LF5G0qE0QSQVR0CJoEUwQBEEFtQiCaB0V0aooKoI+oE1QUaGVqKWNjR8zOuP7uHHnzfNNM3nfyI3mwqzevfec87v/c+69h7DKF61y/1gD+N8KrK1AqDxsB8kwiPwA+QhkHiQZYGQA5AIYB1QnGHYwO0DkAMlxgNLAyL0on88EwZEgGQWRBFAKjNFrEX/yfQAIVoR9gHoIUBDAEsB6EHkBHAXoDoBbAH0FcwYgN0BugK8A/BjgFEg4QOQEcwpQQyAEAfEBmALzN4B/AuIHcwGgHwC/A9RHEFkAcgEwQJwB8yUwPwbEBaJtYL4NUApQGkAJMEcBfgXwOBh7ALEBPArmZyDKB8QBUAGg3gB4AOYNAH0D82swXwVoAEQOgIIgioHIB2Y/iC6DOQtQDIQ4mN+CyA6iAkDtBtRukDgAEQBzGsxvALUVzM8BtQvEHpDwgTkBUBcgPCDKB/MIQJUg0QDmHhDtBfgioCYB6gQoD8xZgBIgqgLzGEDlALWAxAUwPwJRPzjbCxYHQRQBcwpEHSB2AhwBqBGgKjC/A9FVMJUDFAYoF8xZQI0C4gHEDfA4QI0AdYH5KYjOgbkYEDsgHgBJEDUDHAKoBcwDILoE5jIQOUDiAXgYoHaA2sD8HETnwVwCCBsgXoDHAGoHqB3Mb0DUDeYSEOUAUgDwIEAdAHWC+S2ILoC5GEQukHgAHgKoE6BuML8DUQ+YiwDKAUk+wAMAdQHUDeb3IOoFcyEgTpB4AB4EqAugHjB/BNFFMB8AkQskHoDvA3QcoB4wfwJRH5gLAHGAxA3wXYBOANQL5s8g6gdzPiAOQNwA3wHoJEAnwfwFRANgzgfEDogb4NsAnQLoFJi/gmgQzPsAsQPiBvgWQKcBOg3mbyAaAnMeIDaQuAG+CdAZgM6C+TuIhsG8FxAbIG6AbwB0DqBzYP4BojtgzgXEBogL4OsAnQfoApgzIBoB816AbCDx/AYnOl1BcQIXEwAAAABJRU5ErkJggg==');
  background-size: cover;
  background-position: center;
}

.ai-avatar {
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC30lEQVRYR+2WS0hUURjH/+fMnTt3xsrUysyHkT2oKKmHFUVR0aooaVGLFlFBtChaVLRpEdGiKGjTokWUVItWQREFQdQiCgqiInoQGfYwK8fxzsy9c+89J+6dO3Pvg5Fq0YVz4Nxzvv/v+/7n8R3CKhe5yv1jA+B/K7ChQNhXsQsgJ0A2gEQAEgAjDaAYQDaA4wDVgOAAswUkVpDYQBwHKAXmBECRq+F8JghOBMkQiASgZDDGr4b9ifcBEPCVewB1H6AggEWA9SDyADgK0G2AegD6AmYHQC6AXAB/BPgjwEmQsIPICeYkoIZBCALiAzAJ5q8A/wDED+Y8gL4D/A5QH0BkAcgFwABxBsyXwPwIEBeItoH5FkApQGkAJcAcBfgVwGNg7AHEBvAomJ+BKB8QB0AFgHoD4D6YNwD0DcyvwXwVoAEQOQAKgigGIh+Y/SC6DOYsQDEQ4mB+CyI7iAoAtRtQu0HiAEQAzGkwvwHUVjA/B9QukNhB4gNzAlAXIDwgygfzCECVINEA5h4Q7QX4IqAmAeoEKA/MWYASIKoCcwygcoBaQOICmB+B6Ac42wsWB0EUAXMKRHUgdgIcAagRoCoAvwPRVTCVAxQGKBfMWUCNAuIBxA3wOECNAHWB+SmIzoG5GBA7IB4ASRA1AxwCqAXMAyC6BOYyENlB4gF4GKB2gNrA/BxE58FcAggbIF6AxwBqB6gdzG9A1A3mEhA5QOIB+CFA2wHqBPNbEF0AczGIXCDxADwEUCdA3WB+B6IeMBcBlAPmfIAHAOoCqBvM70HUC+ZCQJwg8QA8CFAXQPfA/BFEF8F8AEQukHgAvg/QcYB6wPwJRH1gLgDEARIPwHcBOgHQfTB/BlE/mPMBcQDiBvgOQCcBug/mLyAaAHM+IHZA3ADfBugUQA/A/BVEQ2DOA8QGEjfAtwA6DdBDMH8D0TCY9wJiA8QN8E2AzgD0CMzfQTQC5r2A2ABxAXwdoPMAPQZzBkQjYN4LkA0knj8BJ0hdQbF7rgAAAABJRU5ErkJggg==');
  background-size: 22px;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #4285f4;
}

/* Message alignment fixes */
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

/* Category styles */
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

/* Header styles update */
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
  color: #ffffff;
}

.title {
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
}

/* Input area update */
.input-container {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #ffffff;
  border-top: 1px solid #eeeeee;
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

.add-icon, .send-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4285f4;
}
</style>