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
      @scrolltoupper="onScrollToUpper" @scroll="onScroll" style="margin-top: 30px;">
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
                  :class="{ 'typing': msg.typing && idx === msg.content.length - 1 }" v-html="item.content">
                </view>
                <view v-else-if="item.type === 'Transport'" class="trip-item transport clickable-span"
                  @tap="handleItemClick(item)">
                  {{ item.content }}
                </view>
                <view v-else-if="item.type === 'Accommodation'" class="trip-item accommodation clickable-span"
                  @tap="handleItemClick(item)">
                  {{ item.content }}
                </view>
                <view v-else-if="item.type === 'Restaurant'" class="trip-item restaurant clickable-span"
                  @tap="handleItemClick(item)">
                  {{ item.content }}
                </view>
                <view v-else-if="item.type === 'Activity'" class="trip-item activity clickable-span"
                  @tap="handleItemClick(item)">
                  {{ item.content }}
                </view>
                <view v-else-if="item.type === 'Attraction'" class="trip-item attraction clickable-span"
                  @tap="handleItemClick(item)">
                  {{ item.content }}
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
              </block>

              <!-- 总金额显示 -->
              <view v-if="msg.totalAmount" class="total-amount">
                总金额: ¥{{ msg.totalAmount }}
              </view>

              <!-- 确认行程按钮 -->
              <view class="confirm-trip-button" @tap="confirmTrip(msg)">
                确认行程
              </view>
            </view>
          </view>
        </view>
      </block>
    </scroll-view>

    <!-- Input Area -->
    <view class="input-container" :style="{ paddingBottom: safeAreaBottom + 'px' }">
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
    // 确保marked是可用的
    const markdownParser = typeof marked === 'function' ? marked : (text) => text;

    // 配置marked选项
    if (typeof marked === 'object' && marked.setOptions) {
      marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        breaks: true,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: true
      });
    }
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
        icon: 'https://wlmtsys.com:9000/travel/fishing.jpg'
      },
      {
        id: 'snorkeling',
        name: '浮潜探索',
        icon: 'https://wlmtsys.com:9000/travel/snorkeling.jpg'
      },
      {
        id: 'family',
        name: '亲子娱乐',
        icon: 'https://wlmtsys.com:9000/travel/family.jpg'
      },
      {
        id: 'leisure',
        name: '休闲畅游',
        icon: 'https://wlmtsys.com:9000/travel/leisure.jpg'
      },
      {
        id: 'island',
        name: '海岛介绍',
        icon: 'https://wlmtsys.com:9000/travel/island.jpg'
      },
    ]);

    // Chat messages，这个一定，一定，不能删，删了发消息会报错
    const chatMessages = reactive([
    ]);

    // 处理可点击元素的点击事件
    const handleItemClick = (item) => {
      console.log(`点击了${item.type}: ${item.content}`);

      const pageMap = {
        Transport: '/pages/ticketBooking/ticketBooking',
        Accommodation: '/pages/hotelBooking/hotelBooking',
        Restaurant: '/pages/Orders/Orders',
        Activity: '/pages/activity/activity'
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


      // 模拟AI回复2
      AIAnswerThinking2(`我想了解${getCategoryName(categoryId)}的详细信息`)
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


      let fullContent = []

      if (inputMessage.value == "我要海钓") {
        fullContent = [
          {
            type: "text",
            id: "",
            content: "根据您的需求，我建议如下行程：✅"
          },
          {
            type: "text",
            id: "",
            content: "📝 行程概述："
          },
          {
            type: "text",
            id: "",
            content: "您的主要兴趣是海钓，因此我将为您设计一个以海钓为核心的万山岛旅游行程。以下是基于现有数据的推荐："
          },
          {
            type: "text",
            id: "",
            content: "🗺️ 行程安排："
          },
          {
            type: "text",
            id: "",
            content: "1. 抵达万山岛"
          },
          {
            type: "text",
            id: "",
            content: "   - 交通："
          },
          {
            type: "Transport",
            id: "1",
            content: "船"
          },
          {
            type: "text",
            id: "",
            content: " 或 "
          },
          {
            type: "Transport",
            id: "2",
            content: "船"
          },
          {
            type: "text",
            id: "",
            content: "   - 时间：根据船班时间安排"
          },
          {
            type: "text",
            id: "",
            content: "2. 海钓活动"
          },
          {
            type: "text",
            id: "",
            content: "   - 活动："
          },
          {
            type: "Activity",
            id: "1",
            content: "海钓"
          },
          {
            type: "text",
            id: "",
            content: "   - 时长：3-4小时"
          },
          {
            type: "text",
            id: "",
            content: "   - 难度：中等"
          },
          {
            type: "text",
            id: "",
            content: "   - 费用：800元"
          },
          {
            type: "text",
            id: "",
            content: "3. 住宿推荐"
          },
          {
            type: "text",
            id: "",
            content: "   - "
          },
          {
            type: "Accommodation",
            id: "3",
            content: "万山渔家乐"
          },
          {
            type: "text",
            id: "",
            content: " 或 "
          },
          {
            type: "Accommodation",
            id: "5",
            content: "万山岛海滨酒店"
          },
          {
            type: "text",
            id: "",
            content: "4. 餐饮推荐"
          },
          {
            type: "text",
            id: "",
            content: "   - "
          },
          {
            type: "Restaurant",
            id: "1",
            content: "海鲜大排档"
          },
          {
            type: "text",
            id: "",
            content: " 或 "
          },
          {
            type: "Restaurant",
            id: "4",
            content: "海鲜酒家"
          },
          {
            type: "text",
            id: "",
            content: "📊 数据审查："
          },
          {
            type: "text",
            id: "",
            content: "- 海钓活动信息："
          },
          {
            type: "Activity",
            id: "1",
            content: "海钓"
          },
          {
            type: "text",
            id: "",
            content: "，时长3-4小时，费用800元"
          },
          {
            type: "text",
            id: "",
            content: "- 住宿选择："
          },
          {
            type: "Accommodation",
            id: "3",
            content: "万山渔家乐"
          },
          {
            type: "text",
            id: "",
            content: " 或 "
          },
          {
            type: "Accommodation",
            id: "5",
            content: "万山岛海滨酒店"
          },
          {
            type: "text",
            id: "",
            content: "- 餐饮选择："
          },
          {
            type: "Restaurant",
            id: "1",
            content: "海鲜大排档"
          },
          {
            type: "text",
            id: "",
            content: " 或 "
          },
          {
            type: "Restaurant",
            id: "4",
            content: "海鲜酒家"
          },
          {
            type: "text",
            id: "",
            content: "❓ 注意事项："
          },
          {
            type: "text",
            id: "",
            content: "- 请提前确认船班时间，以便安排行程。"
          },
          {
            type: "text",
            id: "",
            content: "- 海钓活动需提前预约，建议联系当地旅行社或酒店安排。"
          },
          {
            type: "text",
            id: "",
            content: "💬 总结推荐："
          },
          {
            type: "text",
            id: "",
            content: "以上行程专注于您的海钓兴趣，同时提供了舒适的住宿和美味的餐饮选择。希望您在万山岛度过一个愉快的海钓之旅！"
          }
        ];
      } else {
        fullContent = [
          {
            type: "text",
            id: "",
            content: "我是万山岛旅游推荐官，擅长旅游方面的咨询，您有什么万山岛旅游问题请说"
          }
        ];
      }

      // 清空输入框并滚动到最新消息
      inputMessage.value = '';
      scrollToLatestMessage();



      // 模拟AI回复
      AIAnswerThinking(fullContent);
      // 调用接口
      // callAIInterface(chatMessages[chatMessages.length - 1].content);
    };


    // 在sendMessage中使用此方法会让ai回复一个正在思考中...
    const AIAnswerThinking = function (fullContent) {
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
            // let fullContent;

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


    const AIAnswerThinking2 = function (question) {
      console.log(question)
      let fullContent = [];
      if (question == "我想了解海钓体验的详细信息") {
        fullContent = [
          {
            type: "text",
            id: "",
            content: "据您的需求，我建议如下行程：✅"
          },
          {
            type: "text",
            id: "",
            content: "📝 根据您的需求，我为您设计了一份专注于海钓体验的万山岛旅游行程推荐。以下是详细安排："
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "🗺️ **行程概览**"
          },
          {
            type: "text",
            id: "",
            content: "本次行程以海钓为核心，结合万山岛的特色，为您提供一次难忘的体验。"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "⏰ **行程天数**"
          },
          {
            type: "text",
            id: "",
            content: "建议安排 **1-2天**，具体可根据您的停留时间调整。"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "Activity",
            id: "1",
            content: "海钓"
          },
          {
            type: "text",
            id: "",
            content: "🎣 **海钓体验**"
          },
          {
            type: "text",
            id: "",
            content: "- **时长**：3-4小时"
          },
          {
            type: "text",
            id: "",
            content: "- **难度**：中等"
          },
          {
            type: "text",
            id: "",
            content: "- **价格**：800元"
          },
          {
            type: "text",
            id: "",
            content: "- **亮点**：在万山岛周边海域体验专业海钓，享受与海洋亲密接触的乐趣。"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "Transport",
            id: "1",
            content: "船"
          },
          {
            type: "text",
            id: "",
            content: "🚤 **交通安排**"
          },
          {
            type: "text",
            id: "",
            content: "- **出发时间**：8:00、10:00、14:00"
          },
          {
            type: "text",
            id: "",
            content: "- **费用**：100元"
          },
          {
            type: "text",
            id: "",
            content: "- **建议**：选择适合您时间的班次前往万山岛。"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "Accommodation",
            id: "5",
            content: "万山岛海滨酒店"
          },
          {
            type: "text",
            id: "",
            content: "🏨 **住宿推荐**"
          },
          {
            type: "text",
            id: "",
            content: "- **房型**：标准间"
          },
          {
            type: "text",
            id: "",
            content: "- **价格**：450元/晚"
          },
          {
            type: "text",
            id: "",
            content: "- **评分**：4.1"
          },
          {
            type: "text",
            id: "",
            content: "- **亮点**：靠近海边，方便参与海钓活动。"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "Restaurant",
            id: "10",
            content: "岛上美食坊"
          },
          {
            type: "text",
            id: "",
            content: "🍽️ **餐饮推荐**"
          },
          {
            type: "text",
            id: "",
            content: "- **营业时间**：10:00-21:00"
          },
          {
            type: "text",
            id: "",
            content: "- **人均消费**：180元"
          },
          {
            type: "text",
            id: "",
            content: "- **亮点**：提供新鲜海鲜，适合海钓后享用。"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "❓ **注意事项**"
          },
          {
            type: "text",
            id: "",
            content: "- 海钓活动需提前预约，建议联系当地旅行社或酒店安排。"
          },
          {
            type: "text",
            id: "",
            content: "- 请根据天气情况准备防晒、防风装备。"
          },
          {
            type: "text",
            id: "",
            content: "- 若需延长停留时间，可考虑增加其他活动或景点游览。"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "💬 **总结**"
          },
          {
            type: "text",
            id: "",
            content: "本次行程以海钓为核心，结合交通、住宿和餐饮推荐，为您提供一次轻松愉快的万山岛之旅。如有其他需求，欢迎随时咨询！"
          },
          {
            type: "text",
            id: "",
            content: "✅ 祝您旅途愉快！"
          }
        ];
      } else if (question == "我想了解浮潜探索的详细信息") {
        fullContent = [
          {
            type: "text",
            id: "",
            content: "根据您的需求，我建议如下行程：✅"
          },
          {
            type: "text",
            id: "",
            content: "📝 行程概述："
          },
          {
            type: "text",
            id: "",
            content: "您对浮潜活动表现出浓厚兴趣，因此我将为您设计一个以浮潜为核心的万山岛探索行程。以下是基于现有数据的推荐："
          },
          {
            type: "text",
            id: "",
            content: "🗺️ 行程安排："
          },
          {
            type: "text",
            id: "",
            content: "Day 1:"
          },
          {
            type: "text",
            id: "",
            content: "⏰ 上午：抵达万山岛"
          },
          {
            type: "text",
            id: "",
            content: "🚗 交通：建议乘坐"
          },
          {
            type: "Transport",
            id: "1",
            content: "船"
          },
          {
            type: "text",
            id: "",
            content: "，从出发地前往万山岛，预计航程约2小时。"
          },
          {
            type: "text",
            id: "",
            content: "📍 活动：抵达后，前往"
          },
          {
            type: "Accommodation",
            id: "3",
            content: "万山渔家乐"
          },
          {
            type: "text",
            id: "",
            content: "办理入住，稍作休息。"
          },
          {
            type: "text",
            id: "",
            content: "🍽️ 午餐：在"
          },
          {
            type: "Restaurant",
            id: "1",
            content: "海鲜大排档"
          },
          {
            type: "text",
            id: "",
            content: "享用当地海鲜。"
          },
          {
            type: "text",
            id: "",
            content: "⏰ 下午：浮潜初体验"
          },
          {
            type: "text",
            id: "",
            content: "📍 活动：前往"
          },
          {
            type: "Activity",
            id: "2",
            content: "浮潜"
          },
          {
            type: "text",
            id: "",
            content: "，在专业教练的指导下，探索万山岛周边的海底世界，预计活动时间2-3小时。"
          },
          {
            type: "text",
            id: "",
            content: "🍽️ 晚餐：在"
          },
          {
            type: "Restaurant",
            id: "4",
            content: "海鲜酒家"
          },
          {
            type: "text",
            id: "",
            content: "品尝更多海鲜美食。"
          },
          {
            type: "text",
            id: "",
            content: "Day 2:"
          },
          {
            type: "text",
            id: "",
            content: "⏰ 上午：继续浮潜探索"
          },
          {
            type: "text",
            id: "",
            content: "📍 活动：再次体验"
          },
          {
            type: "Activity",
            id: "2",
            content: "浮潜"
          },
          {
            type: "text",
            id: "",
            content: "，深入探索不同的浮潜点，发现更多海洋生物。"
          },
          {
            type: "text",
            id: "",
            content: "🍽️ 午餐：在"
          },
          {
            type: "Restaurant",
            id: "10",
            content: "岛上美食坊"
          },
          {
            type: "text",
            id: "",
            content: "享用午餐。"
          },
          {
            type: "text",
            id: "",
            content: "⏰ 下午：自由活动"
          },
          {
            type: "text",
            id: "",
            content: "📍 活动：您可以选择在岛上自由活动，或者再次体验浮潜。"
          },
          {
            type: "text",
            id: "",
            content: "🍽️ 晚餐：在"
          },
          {
            type: "Restaurant",
            id: "2",
            content: "岛上咖啡馆"
          },
          {
            type: "text",
            id: "",
            content: "享用晚餐。"
          },
          {
            type: "text",
            id: "",
            content: "Day 3:"
          },
          {
            type: "text",
            id: "",
            content: "⏰ 上午：离开万山岛"
          },
          {
            type: "text",
            id: "",
            content: "🚗 交通：乘坐"
          },
          {
            type: "Transport",
            id: "2",
            content: "船"
          },
          {
            type: "text",
            id: "",
            content: "返回出发地，结束愉快的万山岛之旅。"
          },
          {
            type: "text",
            id: "",
            content: "💡 注意事项："
          },
          {
            type: "text",
            id: "",
            content: "1. 浮潜活动需要一定的体力和水性，请根据自身情况选择是否参与。"
          },
          {
            type: "text",
            id: "",
            content: "2. 建议提前预订浮潜活动和住宿，以确保行程顺利。"
          },
          {
            type: "text",
            id: "",
            content: "3. 请关注天气情况，合理安排行程。"
          },
          {
            type: "text",
            id: "",
            content: "🗣️ 总结："
          },
          {
            type: "text",
            id: "",
            content: "以上行程以浮潜为核心，结合了万山岛的特色美食和舒适住宿，为您打造一个难忘的海岛探索之旅。希望这份推荐能够满足您的需求，祝您旅途愉快！"
          }
        ];
      } else if (question == "我想了解亲子娱乐的详细信息") {
        fullContent = [
          {
            type: "text",
            id: "",
            content: "根据您的需求，我建议如下行程：✅"
          },
          {
            type: "text",
            id: "",
            content: "📝 行程概述："
          },
          {
            type: "text",
            id: "",
            content: "您计划与家人（带儿童）一起前往万山岛，主要关注亲子娱乐活动。以下是为您设计的详细行程，确保适合家庭出游，并包含丰富的亲子体验。"
          },
          {
            type: "text",
            id: "",
            content: "🗺️ 行程安排："
          },
          {
            type: "text",
            id: "",
            content: "📅 建议天数：3天2夜"
          },
          {
            type: "text",
            id: "",
            content: "📌 第一天："
          },
          {
            type: "text",
            id: "",
            content: "- 上午：从出发地乘船前往万山岛。"
          },
          {
            type: "Transport",
            id: "1",
            content: "船"
          },
          {
            type: "text",
            id: "",
            content: "- 中午：抵达后入住"
          },
          {
            type: "Accommodation",
            id: "3",
            content: "万山渔家乐"
          },
          {
            type: "text",
            id: "",
            content: "，享用午餐"
          },
          {
            type: "Restaurant",
            id: "1",
            content: "海鲜大排档"
          },
          {
            type: "text",
            id: "",
            content: "。"
          },
          {
            type: "text",
            id: "",
            content: "- 下午：前往"
          },
          {
            type: "Attraction",
            id: "2",
            content: "南沙湾"
          },
          {
            type: "text",
            id: "",
            content: "，享受沙滩浴场，适合儿童玩耍。"
          },
          {
            type: "text",
            id: "",
            content: "- 晚上：在"
          },
          {
            type: "Restaurant",
            id: "4",
            content: "海鲜酒家"
          },
          {
            type: "text",
            id: "",
            content: "享用晚餐。"
          },
          {
            type: "text",
            id: "",
            content: "📌 第二天："
          },
          {
            type: "text",
            id: "",
            content: "- 上午：参加"
          },
          {
            type: "Activity",
            id: "2",
            content: "浮潜"
          },
          {
            type: "text",
            id: "",
            content: "，适合亲子一起体验海洋生物。"
          },
          {
            type: "text",
            id: "",
            content: "- 中午：在"
          },
          {
            type: "Restaurant",
            id: "10",
            content: "岛上美食坊"
          },
          {
            type: "text",
            id: "",
            content: "享用午餐。"
          },
          {
            type: "text",
            id: "",
            content: "- 下午：前往"
          },
          {
            type: "Attraction",
            id: "10",
            content: "珊瑚礁区"
          },
          {
            type: "text",
            id: "",
            content: "，观赏美丽的珊瑚礁。"
          },
          {
            type: "text",
            id: "",
            content: "- 晚上：返回酒店休息，享用晚餐"
          },
          {
            type: "Restaurant",
            id: "7",
            content: "咖啡小屋"
          },
          {
            type: "text",
            id: "",
            content: "。"
          },
          {
            type: "text",
            id: "",
            content: "📌 第三天："
          },
          {
            type: "text",
            id: "",
            content: "- 上午：参加"
          },
          {
            type: "Activity",
            id: "3",
            content: "徒步"
          },
          {
            type: "text",
            id: "",
            content: "，探索岛屿的自然风光。"
          },
          {
            type: "text",
            id: "",
            content: "- 中午：在"
          },
          {
            type: "Restaurant",
            id: "2",
            content: "岛上咖啡馆"
          },
          {
            type: "text",
            id: "",
            content: "享用午餐。"
          },
          {
            type: "text",
            id: "",
            content: "- 下午：乘船返回出发地。"
          },
          {
            type: "Transport",
            id: "2",
            content: "船"
          },
          {
            type: "text",
            id: "",
            content: "🚗 交通建议："
          },
          {
            type: "text",
            id: "",
            content: "- 往返万山岛可选择"
          },
          {
            type: "Transport",
            id: "1",
            content: "船"
          },
          {
            type: "text",
            id: "",
            content: "或"
          },
          {
            type: "Transport",
            id: "2",
            content: "船"
          },
          {
            type: "text",
            id: "",
            content: "，具体时间根据您的出发地安排。"
          },
          {
            type: "text",
            id: "",
            content: "🏨 住宿建议："
          },
          {
            type: "text",
            id: "",
            content: "- 推荐入住"
          },
          {
            type: "Accommodation",
            id: "3",
            content: "万山渔家乐"
          },
          {
            type: "text",
            id: "",
            content: "，提供海景房，适合家庭入住。"
          },
          {
            type: "text",
            id: "",
            content: "🍽️ 餐饮建议："
          },
          {
            type: "text",
            id: "",
            content: "- 推荐尝试"
          },
          {
            type: "Restaurant",
            id: "1",
            content: "海鲜大排档"
          },
          {
            type: "text",
            id: "",
            content: "和"
          },
          {
            type: "Restaurant",
            id: "4",
            content: "海鲜酒家"
          },
          {
            type: "text",
            id: "",
            content: "，提供丰富的海鲜选择。"
          },
          {
            type: "text",
            id: "",
            content: "❓ 注意事项："
          },
          {
            type: "text",
            id: "",
            content: "- 请提前确认船票和住宿预订，确保行程顺利。"
          },
          {
            type: "text",
            id: "",
            content: "- 亲子活动如浮潜和徒步，请根据儿童年龄和体力情况选择适合的活动。"
          },
          {
            type: "text",
            id: "",
            content: "💬 总结："
          },
          {
            type: "text",
            id: "",
            content: "以上行程专为家庭设计，包含丰富的亲子娱乐活动，确保您和孩子们在万山岛度过一个愉快的假期。如有其他需求或问题，请随时联系我。"
          }
        ];
      } else if (question == "我想了解休闲畅游的详细信息") {
        fullContent = [
          {
            type: "text",
            id: "",
            content: "根据您的需求，我建议如下行程：✅"
          },
          {
            type: "text",
            id: "",
            content: "✅ 根据您的需求，我为您设计了一份万山岛休闲畅游的行程推荐。以下是详细信息："
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "🗺️ 行程概览"
          },
          {
            type: "text",
            id: "",
            content: "本次行程以放松和享受自然为主，适合休闲旅行者。以下是每日安排："
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "📅 第一天：抵达与探索"
          },
          {
            type: "text",
            id: "",
            content: "🕒 时间：全天"
          },
          {
            type: "text",
            id: "",
            content: "📍 地点：万山岛"
          },
          {
            type: "text",
            id: "",
            content: "🚗 交通：建议选择"
          },
          {
            type: "Transport",
            id: "1",
            content: "船"
          },
          {
            type: "text",
            id: "",
            content: "或"
          },
          {
            type: "Transport",
            id: "2",
            content: "船"
          },
          {
            type: "text",
            id: "",
            content: "前往万山岛。"
          },
          {
            type: "text",
            id: "",
            content: "🏨 住宿：推荐入住"
          },
          {
            type: "Accommodation",
            id: "3",
            content: "万山渔家乐"
          },
          {
            type: "text",
            id: "",
            content: "或"
          },
          {
            type: "Accommodation",
            id: "5",
            content: "万山岛海滨酒店"
          },
          {
            type: "text",
            id: "",
            content: "，享受舒适的海景房。"
          },
          {
            type: "text",
            id: "",
            content: "🍽️ 餐饮：晚餐可选择"
          },
          {
            type: "Restaurant",
            id: "1",
            content: "海鲜大排档"
          },
          {
            type: "text",
            id: "",
            content: "，品尝新鲜的海鲜。"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "📅 第二天：自然与活动"
          },
          {
            type: "text",
            id: "",
            content: "🕒 时间：全天"
          },
          {
            type: "text",
            id: "",
            content: "📍 地点：万山岛"
          },
          {
            type: "text",
            id: "",
            content: "🎯 活动："
          },
          {
            type: "text",
            id: "",
            content: "- 上午：体验"
          },
          {
            type: "Activity",
            id: "2",
            content: "浮潜"
          },
          {
            type: "text",
            id: "",
            content: "，探索海底世界。"
          },
          {
            type: "text",
            id: "",
            content: "- 下午：选择"
          },
          {
            type: "Activity",
            id: "3",
            content: "徒步"
          },
          {
            type: "text",
            id: "",
            content: "，感受岛上的自然风光。"
          },
          {
            type: "text",
            id: "",
            content: "🍽️ 餐饮：午餐可在"
          },
          {
            type: "Restaurant",
            id: "10",
            content: "岛上美食坊"
          },
          {
            type: "text",
            id: "",
            content: "享用，晚餐推荐"
          },
          {
            type: "Restaurant",
            id: "4",
            content: "海鲜酒家"
          },
          {
            type: "text",
            id: "",
            content: "。"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "📅 第三天：放松与返程"
          },
          {
            type: "text",
            id: "",
            content: "🕒 时间：上午"
          },
          {
            type: "text",
            id: "",
            content: "📍 地点：万山岛"
          },
          {
            type: "text",
            id: "",
            content: "🎯 活动："
          },
          {
            type: "text",
            id: "",
            content: "- 上午：在岛上悠闲散步，享受宁静的海岛时光。"
          },
          {
            type: "text",
            id: "",
            content: "🚗 交通：选择"
          },
          {
            type: "Transport",
            id: "1",
            content: "船"
          },
          {
            type: "text",
            id: "",
            content: "或"
          },
          {
            type: "Transport",
            id: "2",
            content: "船"
          },
          {
            type: "text",
            id: "",
            content: "返回。"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "📊 费用估算"
          },
          {
            type: "text",
            id: "",
            content: "- 交通：约200元/人（往返船票）。"
          },
          {
            type: "text",
            id: "",
            content: "- 住宿：约500-800元/晚（根据选择）。"
          },
          {
            type: "text",
            id: "",
            content: "- 餐饮：约200-250元/人/天。"
          },
          {
            type: "text",
            id: "",
            content: "- 活动：浮潜约300元/人，徒步免费。"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "❓ 注意事项"
          },
          {
            type: "text",
            id: "",
            content: "- 请提前确认船班时间，避免延误。"
          },
          {
            type: "text",
            id: "",
            content: "- 建议携带防晒用品和舒适的徒步鞋。"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "💬 总结"
          },
          {
            type: "text",
            id: "",
            content: "这份行程以休闲为主，结合自然探索和放松活动，适合希望在万山岛度过轻松假期的旅行者。如需进一步调整，请随时告知！"
          }
        ];
      } else if (question == "我想了解海岛介绍的详细信息") {
        fullContent = [
          {
            type: "text",
            id: "",
            content: "根据您的需求，我为您整理了关于万山岛的详细介绍：✅"
          },
          {
            type: "text",
            id: "",
            content: "📝 根据您的需求，我为您整理了关于万山岛的详细介绍，以下是基于现有数据库信息的内容："
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "🗺️ 万山岛简介"
          },
          {
            type: "text",
            id: "",
            content: "万山岛是珠海市万山群岛中的一座美丽岛屿，以其自然风光和丰富的海洋资源而闻名。以下是关于万山岛的具体信息："
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "📊 万山岛基本信息"
          },
          {
            type: "text",
            id: "",
            content: "- 岛屿名称：万山岛"
          },
          {
            type: "text",
            id: "",
            content: "- 岛屿ID：102"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "🏖️ 推荐景点"
          },
          {
            type: "text",
            id: "",
            content: "目前数据库中关于万山岛的景点信息暂未提供，但您可以期待以下类型的体验："
          },
          {
            type: "text",
            id: "",
            content: "- 自然景观：如海滩、礁石、森林等。"
          },
          {
            type: "text",
            id: "",
            content: "- 文化地标：如灯塔、渔村等。"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "🎣 推荐活动"
          },
          {
            type: "text",
            id: "",
            content: "万山岛适合以下活动（基于数据库中的通用活动推荐）："
          },
          {
            type: "text",
            id: "",
            content: "- "
          },
          {
            type: "Activity",
            id: "1",
            content: "海钓"
          },
          {
            type: "text",
            id: "",
            content: "：适合喜欢钓鱼的游客，价格约800元，时长3-4小时。"
          },
          {
            type: "text",
            id: "",
            content: "- "
          },
          {
            type: "Activity",
            id: "2",
            content: "浮潜"
          },
          {
            type: "text",
            id: "",
            content: "：适合探索海底世界，价格约300元，时长2-3小时。"
          },
          {
            type: "text",
            id: "",
            content: "- "
          },
          {
            type: "Activity",
            id: "3",
            content: "徒步"
          },
          {
            type: "text",
            id: "",
            content: "：适合欣赏自然风光，免费，时长4-8小时。"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "🏨 推荐住宿"
          },
          {
            type: "text",
            id: "",
            content: "以下是万山岛附近的住宿推荐："
          },
          {
            type: "text",
            id: "",
            content: "- "
          },
          {
            type: "Accommodation",
            id: "3",
            content: "万山渔家乐"
          },
          {
            type: "text",
            id: "",
            content: "：海景房，价格500元，评分4.2。"
          },
          {
            type: "text",
            id: "",
            content: "- "
          },
          {
            type: "Accommodation",
            id: "5",
            content: "万山岛海滨酒店"
          },
          {
            type: "text",
            id: "",
            content: "：标准间，价格450元，评分4.1。"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "🍽️ 推荐餐饮"
          },
          {
            type: "text",
            id: "",
            content: "以下是万山岛附近的餐饮推荐："
          },
          {
            type: "text",
            id: "",
            content: "- "
          },
          {
            type: "Restaurant",
            id: "1",
            content: "海鲜大排档"
          },
          {
            type: "text",
            id: "",
            content: "：价格约200元，营业时间11:00-21:00。"
          },
          {
            type: "text",
            id: "",
            content: "- "
          },
          {
            type: "Restaurant",
            id: "4",
            content: "海鲜酒家"
          },
          {
            type: "text",
            id: "",
            content: "：价格约250元，营业时间11:30-21:30。"
          },
          {
            type: "text",
            id: "",
            content: "- "
          },
          {
            type: "Restaurant",
            id: "10",
            content: "岛上美食坊"
          },
          {
            type: "text",
            id: "",
            content: "：价格约180元，营业时间10:00-21:00。"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "🚢 推荐交通"
          },
          {
            type: "text",
            id: "",
            content: "前往万山岛的交通方式主要为船，以下是推荐选项："
          },
          {
            type: "text",
            id: "",
            content: "- "
          },
          {
            type: "Transport",
            id: "1",
            content: "船"
          },
          {
            type: "text",
            id: "",
            content: "：价格100元，出发时间8:00、10:00、14:00。"
          },
          {
            type: "text",
            id: "",
            content: "- "
          },
          {
            type: "Transport",
            id: "2",
            content: "船"
          },
          {
            type: "text",
            id: "",
            content: "：价格100元，出发时间9:30、13:30。"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "❓ 注意事项"
          },
          {
            type: "text",
            id: "",
            content: "- 目前数据库中关于万山岛的景点信息较少，建议您进一步咨询当地旅游部门或导游以获取更多详细信息。"
          },
          {
            type: "text",
            id: "",
            content: "- 活动价格和交通时间可能因季节或天气变化而调整，请提前确认。"
          },
          {
            type: "text",
            id: "",
            content: "---"
          },
          {
            type: "text",
            id: "",
            content: "📢 如果您有更多具体需求（如预算、旅行日期、人数等），请告诉我，我可以为您进一步优化推荐！"
          }
        ];
      }

      AIAnswerThinking(fullContent)
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

/* 修改 .clickable-span 样式，确保不换行 */
.clickable-span {
  white-space: nowrap;
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

/* 新增样式 */
.total-amount {
  font-size: 18px;
  font-weight: bold;
  color: #4285f4;
  margin: 10px 0;
}

.confirm-trip-button {
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}
</style>