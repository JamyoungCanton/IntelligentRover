<template>
  <view class="container" :key="globalUpdateKey">
    <!-- Header -->
    <view class="header">
      <view class="back-icon avatar ai-avatar" @tap="goBack"></view>
      <view class="title">AI旅游助手</view>
      <view class="more-icon avatar ai-avatar" @tap="showMore">
        <image src="/static/chat/more.png"></image>
      </view>
    </view>

    <!-- Chat Container -->
    <scroll-view scroll-y class="chat-container" :scroll-top="scrollTop" scroll-with-animation
      :scroll-into-view="scrollIntoView" :scroll-anchoring="true" enhanced :show-scrollbar="false"
      @scrolltoupper="onScrollToUpper" @scroll="onScroll">
      <!-- AI Welcome Message -->
      <view class="message ai-message" id="msg-0">
        <view class="avatar ai-avatar">
          <image src="/static/chat/robot-avatar.png" mode="aspectFill"></image>
        </view>
        <view class="message-content">
          <text>欢迎使用AI旅游助手！我可以帮您规划完美的海岛之旅。您可以选择以下热门选项，或直接告诉我您的需求。</text>

          <!-- Category Options -->
          <view class="category-container">
            <view v-for="(item, index) in categories" :key="index" class="category-item"
              @tap="() => selectCategory(item.id)">
              <image :src="item.icon" mode="aspectFit"></image>
              <text>{{ item.name }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Chat Messages -->
      <block v-for="(msg, index) in chatMessages" :key="index">
        <!-- User Message -->
        <view v-if="msg.type === 'user'" class="message user-message" :id="`msg-${index + 1}`">
          <view class="avatar user-avatar">
            <image src="/static/chat/user.png"></image>
          </view>
          <view class="message-content">
            <text>{{ msg.content }}</text>
          </view>
        </view>

        <!-- AI Response -->
        <view v-else class="message ai-message" :id="`msg-${index + 1}`" :key="`${msg.id || index}-${updateCounter}`">
          <view class="avatar ai-avatar">
            <image src="/static/chat/robot-avatar.png" mode="aspectFill"></image>
          </view>
          <view class="message-content">
            <!-- 思考中状态 -->
            <view v-if="msg.thinking" class="thinking-container">
              {{ msg.content }}
            </view>
            <!-- 结构化回复模板 -->
            <view v-else-if="Array.isArray(msg.content)" class="trip-container">
              <block v-for="(item, idx) in msg.content" :key="`${idx}-${updateCounter}`">
                <!-- 打字机效果的文本内容（带闪烁光标） -->
                <view v-if="item.type === 'text'" class="text-content"
                  :class="{ 'typing': msg.typing && idx === msg.content.length - 1 }">
                  {{ item.content }}
                </view>
                <view v-else-if="item.type === '行程概览'" class="trip-section">
                  <h3>{{ item.content.split('<br>')[0] }}</h3>
                  <p>{{ item.content.split('<br>')[1] }}</p>
                </view>
                <view v-else-if="item.type === '行程安排'" class="trip-section">
                  <h3>{{ item.content }}</h3>
                </view>
                <view v-else-if="item.type === '行程日'" class="trip-day">
                  <h4>{{ item.content }}</h4>
                </view>
                <view v-else-if="item.type === 'transport'" class="trip-item transport clickable-span"
                  @tap="handleItemClick(item)">
                  {{ item.content }}
                </view>
                <view v-else-if="item.type === 'accommodation'" class="trip-item accommodation clickable-span"
                  @tap="handleItemClick(item)">
                  {{ item.content }}
                </view>
                <view v-else-if="item.type === 'restaurant'" class="trip-item restaurant clickable-span"
                  @tap="handleItemClick(item)">
                  {{ item.content }}
                </view>
                <view v-else-if="item.type === 'activity'" class="trip-item activity clickable-span"
                  @tap="handleItemClick(item)">
                  {{ item.content }}
                </view>
                <view v-else-if="item.type === '推荐亮点'" class="trip-section">
                  <h3>{{ item.content }}</h3>
                </view>
                <view v-else-if="item.type === '注意事项'" class="trip-section">
                  <h3>{{ item.content }}</h3>
                </view>
                <view v-else-if="item.type === '总结'" class="trip-section">
                  <h3>{{ item.content.split('<br>')[0] }}</h3>
                  <p>{{ item.content.split('<br>')[1] }}</p>
                </view>
                <view v-else-if="item.type === '价格'" class="price-section">
                  <view class="price-info">
                    <view class="price">
                      <span class="price-symbol">¥</span>
                      <span class="price-value">{{ item.content.split(' ')[0].substring(1) }}</span>
                    </view>
                    <view class="price-details">{{ item.content.split(' ')[1] }}</view>
                  </view>
                </view>
                <view v-else-if="item.type === '优惠'" class="discount">
                  优惠: <span class="discount-value">{{ item.content.substring(3) }}</span>
                </view>
                <view v-else-if="item.type === '按钮'" class="ai-comfirm-button" @tap="confirmTrip">
                  {{ item.content }}
                </view>
                <hr v-else-if="item.type === 'divider'" class="divider">
              </block>
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
      <input class="message-input" type="text" v-model="inputMessage" placeholder="输入您的需求" @confirm="sendMessage" />
      <view class="send-icon avatar ai-avatar" @tap="sendMessage">
        <image src="/static/chat/send.png"></image>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, reactive, onMounted, nextTick, computed } from 'vue';
import { useUserStore } from '@/store';
import { marked } from 'marked';

export default {
  setup() {
    // 配置marked选项
    marked.setOptions({
      renderer: new marked.Renderer(),
      gfm: true,
      breaks: true,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: true
    });
    // 引入 store
    const userStore = useUserStore();
    const token = computed(() => userStore.token);

    // 全局强制更新键
    const globalUpdateKey = ref(0);
    // 强制更新计数器
    const updateCounter = ref(0);
    // Reactive data
    const inputMessage = ref('');
    const scrollTop = ref(0);
    const scrollIntoView = ref('');
    // 是否允许自动滚动（当用户向上滚动查看历史消息时禁用）
    const enableAutoScroll = ref(true);
    // 记录最后一次的滚动位置
    const lastScrollTop = ref(0);
    // 记录内容的总高度
    const contentHeight = ref(0);
    // 记录可视区域的高度
    const viewportHeight = ref(0);

    // Category data
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

    // Chat messages，这个一定，一定，不能删，删了发消息会报错
    const chatMessages = reactive([
    ]);

    // 打字机效果函数
    const showTypingEffect = (content, aiMessage) => {
      if (!content) return;

      let currentIndex = 0;
      const fullText = content;
      const typingSpeed = 30;

      if (aiMessage.typingTimer) {
        clearInterval(aiMessage.typingTimer);
      }

      aiMessage.content = '';

      aiMessage.typingTimer = setInterval(() => {
        if (currentIndex < fullText.length) {
          aiMessage.content = fullText.substring(0, currentIndex + 1);
          currentIndex++;

          globalUpdateKey.value = Date.now();
          updateCounter.value++;

          nextTick(() => {
            scrollToBottom();
          });
        } else {
          clearInterval(aiMessage.typingTimer);
          aiMessage.typingTimer = null;
        }
      }, typingSpeed);
    };

    // 处理可点击元素的点击事件
    const handleItemClick = (item) => {
      console.log(`点击了${item.type}: ${item.content}`);

      const pageMap = {
        transport: '/pages/ticketBooking/ticketBooking',
        accommodation: '/pages/hotelBooking/hotelBooking',
        restaurant: '/pages/Orders/Orders',
        activity: '/pages/activity/activity'
      };

      const pagePath = pageMap[item.type];

      if (pagePath) {
        uni.navigateTo({
          url: pagePath
        });
      } else {
        uni.showToast({
          title: '功能尚未实现',
          icon: 'none'
        });
      }
    };

    // 确认行程并跳转到支付页面
    const confirmTrip = () => {
      console.log('行程已确认！');
      uni.navigateTo({
        url: '/pages/payment/payment'
      });
    };

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

      if (!token.value) {
        uni.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });

        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/login/login'
          });
        }, 2000);
        return;
      }

      chatMessages.push({
        type: 'user',
        content: inputMessage.value
      });

      inputMessage.value = '';
      scrollToLatestMessage();

      // callAIInterface(chatMessages[chatMessages.length - 1].content);

      // 模拟AI回复
      AIAnswerThinking();
    };


    // 在sendMessage中使用此方法会让ai回复一个正在思考中...
    const AIAnswerThinking = function () {
      // 创建一个空的AI消息
      const aiMessage = {
        type: 'ai',
        content: '正在思考中...',  // 初始文本，带点
        id: Date.now(),
        thinking: true,  // 标记是否为思考状态
        startTime: Date.now() // 记录开始时间
      };
      chatMessages.push(aiMessage);

      // 创建思考动画定时器
      let dotCount = 0;
      const THINKING_TIMEOUT = 3000; // 3秒后显示回复
      const thinkingInterval = setInterval(() => {
        if (aiMessage.thinking) {  // 只在thinking为true时更新点
          // 检查是否到达模拟回复时间
          if (Date.now() - aiMessage.startTime > THINKING_TIMEOUT) {
            clearInterval(thinkingInterval);  // 停止动画
            aiMessage.thinking = false;

            // 准备AI回复的完整内容
            let fullContent = [
              {
                type: "text",
                id: "",
                content: "据您的需求，我建议如下行程：✅"
              },
              {
                type: "行程概览",
                id: "",
                content: '📝 行程概览<br>📍 本次行程将围绕"海钓"这一核心活动展开，结合万山岛的特色景点和便利交通，为您打造一次难忘的海岛体验。'
              },
              {
                type: "divider",
                id: "",
                content: ""
              },
              {
                type: "行程安排",
                id: "",
                content: "⏱️ 行程安排"
              },
              {
                type: "行程日",
                id: "day1",
                content: "⏰ 第一天：抵达与准备"
              },
              {
                type: "transport",
                id: "1",
                content: "🚢 1-船 从出发地乘船前往万山岛，建议选择上午的班次（8:00或10:00）。"
              },
              {
                type: "accommodation",
                id: "2",
                content: "🏠 2-万山渔家乐 办理入住，稍作休息。"
              },
              {
                type: "restaurant",
                id: "3",
                content: "🍽️ 3-碧海鱼排 享用午餐，品尝新鲜海鲜。"
              },
              {
                type: "activity",
                id: "4",
                content: "🎣 4-海钓 下午开始海钓活动，体验3-4小时的海钓乐趣。"
              },
              {
                type: "accommodation",
                id: "5",
                content: "🏠 5-万山渔家乐 晚餐后返回酒店休息。"
              },
              {
                type: "行程日",
                id: "day2",
                content: "⏰ 第二天：探索与返程"
              },
              {
                type: "restaurant",
                id: "6",
                content: "🍽️ 6-岛上咖啡馆 享用早餐。"
              },
              {
                type: "activity",
                id: "7",
                content: "🎣 7-海钓 上午继续海钓活动，享受海钓的乐趣。"
              },
              {
                type: "restaurant",
                id: "8",
                content: "🍽️ 8-岛上美食坊 午餐后稍作休息。"
              },
              {
                type: "transport",
                id: "9",
                content: "🚢 9-船 下午乘船返程，建议选择13:30的班次。"
              },
              {
                type: "divider",
                id: "",
                content: ""
              },
              {
                type: "推荐亮点",
                id: "",
                content: "📊 推荐亮点"
              },
              {
                type: "activity",
                id: "10",
                content: "🎣 1-海钓 海钓活动是本次行程的核心，适合中等难度的钓鱼爱好者，价格800元。"
              },
              {
                type: "accommodation",
                id: "11",
                content: "🏠 2-万山渔家乐 海景房住宿，价格500元，评分4.2，环境舒适。"
              },
              {
                type: "restaurant",
                id: "12",
                content: "🍽️ 3-碧海鱼排 提供新鲜海鲜，价格为200元。"
              },
              {
                type: "divider",
                id: "",
                content: ""
              },
              {
                type: "注意事项",
                id: "",
                content: "❓ 注意事项"
              },
              {
                type: "text",
                id: "",
                content: "海钓活动需提前预约，建议联系当地旅行社或酒店安排。"
              },
              {
                type: "text",
                id: "",
                content: "船票价格100元，建议提前购票以确保座位。"
              },
              {
                type: "divider",
                id: "",
                content: ""
              },
              {
                type: "总结",
                id: "",
                content: "✉️ 总结<br>本次行程以海钓为核心，结合万山岛的特色餐饮和住宿，为您提供一次轻松愉快的海岛体验。如有其他需求或问题，欢迎随时联系！"
              },
              {
                type: "divider",
                id: "",
                content: ""
              },
              {
                type: "价格",
                id: "",
                content: "¥988 含往返交通、住宿、活动费用"
              },
              {
                type: "优惠",
                id: "",
                content: "优惠: ¥428元"
              },
              {
                type: "按钮",
                id: "",
                content: "确认行程"
              }
            ];

            // 初始化空的内容数组，准备逐字填充
            aiMessage.content = [];
            aiMessage.typing = true; // 标记正在打字中

            // 开始打字机效果
            typewriterEffect(aiMessage, fullContent);
          } else {
            dotCount = (dotCount + 1) % 4;  // 0到3循环
            aiMessage.content = '正在思考中' + '.'.repeat(dotCount);
            // 触发视图更新
            updateCounter.value++;
          }
        } else {
          clearInterval(thinkingInterval);  // 停止动画
        }
      }, 500);  // 每500毫秒更新一次

      // 立即触发视图更新
      globalUpdateKey.value = Date.now();
      updateCounter.value++;

      // 确保消息框立即可见
      nextTick(() => {
        scrollToBottom();
      });
    }



    // 实现打字机效果的函数
    const typewriterEffect = (message, fullContent, index = 0, charIndex = 0, delay = 30) => {
      // 如果已经完成所有段落，结束递归
      if (index >= fullContent.length) {
        return;
      }

      const currentItem = fullContent[index];
      const fullText = currentItem.content;

      // 如果是新段落，初始化为空字符串
      if (charIndex === 0) {
        if (!message.content[index]) {
          message.content[index] = {
            type: currentItem.type,
            id: currentItem.id || "",
            content: ""
          };
        }
      }

      // 如果当前段落还没打完
      if (charIndex < fullText.length) {
        // 添加下一个字符
        message.content[index].content = fullText.substring(0, charIndex + 1);
        updateCounter.value++;

        // 安排下一个字符
        setTimeout(() => {
          typewriterEffect(message, fullContent, index, charIndex + 1, delay);
        }, delay);
      } else {
        // 当前段落打完，移到下一段
        setTimeout(() => {
          typewriterEffect(message, fullContent, index + 1, 0, delay);
        }, delay * 10); // 段落之间停顿更长
      }

      // 确保滚动到最新消息
      scrollToBottom();
    };


















    const callAIInterface = (userQuery, retryCount = 0) => {
      const MAX_RETRIES = 3;
      const url = 'http://island.zhangshuiyi.com/island/front/ai/chat/chatMessage-stream';
      const data = {
        conversation_id: '',
        inputs: {
          original_intention: '',
          recommended_plan: ''
        },
        query: userQuery,
        webMode: ''
      };

      if (retryCount > 0) {
        uni.showToast({
          title: `第${retryCount}次重试连接...`,
          icon: 'none',
          duration: 2000
        });
      }

      console.log('Current token:', token.value);

      const requestTask = uni.request({
        url: url,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'X-Access-Token': token.value
        },
        data: JSON.stringify(data),
        responseType: 'text',
        enableChunked: true,
        timeout: 30000,
        success: (res) => {
          console.log('请求成功:', res);
        },
        fail: (err) => {
          console.error('请求失败:', err);

          if (err.errMsg && err.errMsg.includes('timeout')) {
            const lastMessage = chatMessages[chatMessages.length - 1];
            if (lastMessage.type === 'ai') {
              lastMessage.thinking = false;
              lastMessage.content = '请求超时，请重试';
            } else {
              chatMessages.push({
                type: 'ai',
                content: '请求超时，请重试',
                thinking: false
              });
            }

            uni.showToast({
              title: '请求超时，请重试',
              icon: 'none',
              duration: 3000
            });

            globalUpdateKey.value = Date.now();
            updateCounter.value++;
          }
        }
      });

      requestTask.onChunkReceived((res) => {
        try {
          const uint8Array = new Uint8Array(res.data);
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(uint8Array);
          console.log('收到的原始数据:', text);

          if (text.startsWith('data:')) {
            const jsonStr = text.substring(5).trim();
            try {
              const jsonData = JSON.parse(jsonStr);
              console.log('解析到的JSON数据:', jsonData);

              if (jsonData.event === 'message') {
                let answer = '';
                if (jsonData.data && jsonData.data.outputs && jsonData.data.outputs.answer) {
                  answer = jsonData.data.outputs.answer;
                } else if (jsonData.answer !== undefined) {
                  answer = jsonData.answer;
                }

                if (answer) {
                  const decodedAnswer = decodeUnicode(answer);
                  console.log(`事件[${jsonData.event}] 解码后的答案:`, decodedAnswer);

                  const aiMessage = {
                    type: 'ai',
                    content: [
                      // 这里可以根据需要解析并生成结构化的回复
                      {
                        type: "text",
                        id: "",
                        content: decodedAnswer
                      }
                    ]
                  };
                  chatMessages.push(aiMessage);
                  scrollToLatestMessage();
                }
              }
            } catch (jsonError) {
              console.warn('JSON解析错误:', jsonError);
            }
          }
        } catch (e) {
          console.error('数据处理失败:', e);
        }
      });
    };

    const decodeUnicode = (str) => {
      if (!str) return '';

      try {
        if (typeof str === 'string') {
          return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16))
          );
        }
        return str;
      } catch (e) {
        console.error('Unicode 解码失败:', e);
        return str;
      }
    };

    const navigatortopaymoent = () => {
      uni.navigateTo({
        url: '/pages/payment/payment'
      });
    };

    const scrollToLatestMessage = () => {
      const lastIndex = chatMessages.length;
      scrollIntoView.value = `msg-${lastIndex}`;
    };

    const scrollToBottom = () => {
      if (!enableAutoScroll.value) {
        return;
      }

      const query = uni.createSelectorQuery();
      query.select('.chat-container').boundingClientRect(data => {
        if (data) {
          viewportHeight.value = data.height;

          const messageQuery = uni.createSelectorQuery();
          messageQuery.selectAll('.message').boundingClientRect(messages => {
            if (messages && messages.length > 0) {
              contentHeight.value = messages.reduce((sum, msg) => sum + msg.height, 0);

              scrollTop.value = contentHeight.value;
              lastScrollTop.value = contentHeight.value;
            }
          }).exec();
        }
      }).exec();
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
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    });

    const onScrollToUpper = () => {
      console.log('到达顶部');
    };

    const SCROLL_BOTTOM_THRESHOLD = 10;

    const onScroll = (e) => {
      const currentScrollTop = e.detail.scrollTop;

      const query = uni.createSelectorQuery();
      query.select('.chat-container').boundingClientRect(data => {
        if (data) {
          viewportHeight.value = data.height;

          const messageQuery = uni.createSelectorQuery();
          messageQuery.selectAll('.message').boundingClientRect(messages => {
            if (messages && messages.length > 0) {
              contentHeight.value = messages.reduce((sum, msg) => sum + msg.height, 0);

              const distanceFromBottom = contentHeight.value - (currentScrollTop + viewportHeight.value);
              if (distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD) {
                enableAutoScroll.value = true;
              } else {
                if (currentScrollTop > lastScrollTop.value) {
                  enableAutoScroll.value = false;
                }
              }
            }
          }).exec();
        }
      }).exec();

      lastScrollTop.value = currentScrollTop;
    };

    return {
      inputMessage,
      scrollTop,
      scrollIntoView,
      enableAutoScroll,
      categories,
      chatMessages,
      updateCounter,
      globalUpdateKey,
      selectCategory,
      getCategoryName,
      sendMessage,
      navigatortopaymoent,
      scrollToBottom,
      onScrollToUpper,
      onScroll,
      handleItemClick,
      confirmTrip,
      goBack,
      showMore,
      showAddOptions,
      decodeUnicode
    };
  }
};
</script>

<style>
/* 保留原有的样式 */
.markdown-content {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
  word-wrap: break-word;
}

.heading-1 {
  font-size: 40rpx;
  font-weight: bold;
  margin: 30rpx 0 20rpx;
  padding-bottom: 10rpx;
  border-bottom: 2rpx solid #eee;
}

.heading-2 {
  font-size: 36rpx;
  font-weight: bold;
  margin: 25rpx 0 15rpx;
}

.heading-3 {
  font-size: 32rpx;
  font-weight: bold;
  margin: 20rpx 0 10rpx;
}

.paragraph {
  margin: 16rpx 0;
}

.unordered-list,
.ordered-list {
  margin: 16rpx 0;
  padding-left: 40rpx;
}

.list-item {
  margin: 8rpx 0;
}

.code-block {
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 20rpx;
  margin: 16rpx 0;
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 24rpx;
}

.inline-code {
  background-color: #f5f5f5;
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
  font-family: monospace;
  font-size: 24rpx;
}

.blockquote {
  border-left: 8rpx solid #ddd;
  padding: 16rpx 32rpx;
  margin: 16rpx 0;
  color: #666;
  background-color: #f9f9f9;
}

.table {
  width: 100%;
  margin: 16rpx 0;
  border-collapse: collapse;
}

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

.back-icon,
.more-icon {
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

.add-icon,
.send-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon .iconfont,
.send-icon .iconfont {
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
  line-height: 2;
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

.back-icon,
.more-icon {
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

.add-icon,
.send-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4285f4;
}

/* test.txt中的样式 */
.trip-container {
  padding: 20px;
}

.text-content {
  margin-bottom: 10px;
}

.trip-section {
  margin-bottom: 20px;
}

.trip-day {
  margin-bottom: 15px;
}

.trip-item {
  margin-bottom: 10px;
  padding: 5px 0;
}

.transport,
.accommodation,
.restaurant,
.activity {
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
}

.transport {
  background-color: #e0f7fa;
}

.accommodation {
  background-color: #fff8e1;
}

.restaurant {
  background-color: #f3e5f5;
}

.activity {
  background-color: #e8f5e9;
}

.clickable-span {
  display: inline-block;
}

.divider {
  border: none;
  border-top: 1px solid #ddd;
  margin: 20px 0;
}

.price-section {
  margin: 20px 0;
}

.price {
  font-size: 24px;
  font-weight: bold;
}

.discount {
  color: #e53935;
  font-weight: bold;
}

.ai-comfirm-button {
  display: inline-block;
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
}
</style>