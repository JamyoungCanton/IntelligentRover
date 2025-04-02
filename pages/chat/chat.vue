<template>
  <view class="container" :key="globalUpdateKey">
    <!-- Header -->
    <view class="header">
      <view class="back-icon avatar ai-avatar" @tap="goBack">

      </view>
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
            <!-- If message has an image -->
            <image v-if="msg.image" class="response-image" src="https://wlmtsys.com:9000/travel/fashboat.png" mode="widthFix"></image>

            <!-- ai回复框 -->
            <!-- 使用rich-text渲染动态HTML内容，添加点击事件 -->
            <!-- <rich-text v-if="msg.content" class="message-text custom-rich-text markdown-content" :nodes="msg.content"
              @tap="onCustomRichTextTap">
            </rich-text> -->
            <rich-text v-if="msg.content" class="message-text custom-rich-text markdown-content" :nodes="msg.content">
            </rich-text>


            <!-- Itinerary details -->
            <view v-if="msg.itinerary" class="itinerary-container">
              <view class="itinerary-title">{{ msg.itinerary.title }}</view>

              <!-- <view v-for="(item, idx) in msg.itinerary.schedule" :key="idx" class="itinerary-item">
                <text class="time">{{ item.time }}:</text>
                <rich-text class="detail custom-rich-text" :nodes="formatItineraryText(item.detail)"
                  @tap="onCustomRichTextTap"></rich-text>
              </view> -->

              <view v-if="msg.itinerary.recommendations" class="recommendations">
                <text class="section-title">推荐商家:</text>

                <view v-for="(rec, idx) in msg.itinerary.recommendations" :key="idx" class="recommendation-item">
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

              <button v-if="msg.itinerary.price" class="confirm-button" @tap="navigatortopaymoent">确认行程并购买</button>
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
      gfm: true, // 启用GitHub风格Markdown
      breaks: true, // 启用换行符转换
      pedantic: false,
      sanitize: false, // 不进行HTML标签转义
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


    // 处理markdown内容并转换为适合小程序的格式
    const processRawAnswers = (rawAnswers) => {
      if (!rawAnswers) return '';

      try {
        // 保存可点击的span标签，防止被markdown处理
        // const clickableSpans = [];
        // let tempRawAnswers = rawAnswers;

        // 提取并保存所有可点击span标签
        // const spanRegex = /<span class="clickable-span">(.*?)<\/span>/g;
        // let match;
        // let index = 0;

        // while ((match = spanRegex.exec(tempRawAnswers)) !== null) {
        //   const placeholder = `__CLICKABLE_SPAN_${index}__`;
        //   clickableSpans.push({
        //     placeholder: placeholder,
        //     original: match[0]
        //   });
        //   tempRawAnswers = tempRawAnswers.replace(match[0], placeholder);
        //   index++;
        // }

        // 使用marked解析markdown
        let htmlContent = marked(tempRawAnswers);
        let processedContent = htmlContent;

        // 处理其他常见HTML标签，将它们转换为适当的样式类
        // 处理标题标签
        processedContent = processedContent.replace(/<h1>(.*?)<\/h1>/g, '<view class="heading-1">$1</view>');
        processedContent = processedContent.replace(/<h2>(.*?)<\/h2>/g, '<view class="heading-2">$1</view>');
        processedContent = processedContent.replace(/<h3>(.*?)<\/h3>/g, '<view class="heading-3">$1</view>');

        // 处理段落和换行
        processedContent = processedContent.replace(/<p>(.*?)<\/p>/g, '<view class="paragraph">$1</view>');
        processedContent = processedContent.replace(/<br\s*\/?>/g, '<view class="line-break"></view>');

        // 处理列表
        processedContent = processedContent.replace(/<ul>([\s\S]*?)<\/ul>/g, '<view class="unordered-list">$1</view>');
        processedContent = processedContent.replace(/<ol>([\s\S]*?)<\/ol>/g, '<view class="ordered-list">$1</view>');
        processedContent = processedContent.replace(/<li>(.*?)<\/li>/g, '<view class="list-item">• $1</view>');

        // 处理强调和重点
        processedContent = processedContent.replace(/<strong>(.*?)<\/strong>/g, '<text class="bold">$1</text>');
        processedContent = processedContent.replace(/<b>(.*?)<\/b>/g, '<text class="bold">$1</text>');
        processedContent = processedContent.replace(/<em>(.*?)<\/em>/g, '<text class="italic">$1</text>');
        processedContent = processedContent.replace(/<i>(.*?)<\/i>/g, '<text class="italic">$1</text>');

        // 处理代码块和行内代码
        processedContent = processedContent.replace(/<pre>([\s\S]*?)<\/pre>/g, '<view class="code-block">$1</view>');
        processedContent = processedContent.replace(/<code>(.*?)<\/code>/g, '<text class="inline-code">$1</text>');

        // 处理引用
        processedContent = processedContent.replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, '<view class="blockquote">$1</view>');

        // 处理表格 (简化处理)
        processedContent = processedContent.replace(/<table>([\s\S]*?)<\/table>/g, '<view class="table">$1</view>');

        // 恢复可点击span标签
        // clickableSpans.forEach(span => {
        //   processedContent = processedContent.replace(span.placeholder, span.original);
        // });

        return processedContent;
      } catch (e) {
        console.error('HTML标签处理失败:', e);
        return rawAnswers; // 返回原始内容
      }
    };

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

    // 打字机效果函数
    const showTypingEffect = (content, aiMessage) => {
      if (!content) return;

      let currentIndex = 0;
      const fullText = content;
      const typingSpeed = 30; // 每个字符的显示速度（毫秒）

      // 清除之前可能存在的计时器
      if (aiMessage.typingTimer) {
        clearInterval(aiMessage.typingTimer);
      }

      // 初始化显示内容为空
      aiMessage.content = '';

      // 创建打字效果的计时器
      aiMessage.typingTimer = setInterval(() => {
        if (currentIndex < fullText.length) {
          // 添加下一个字符
          aiMessage.content = fullText.substring(0, currentIndex + 1);
          currentIndex++;

          // 更新视图
          globalUpdateKey.value = Date.now();
          updateCounter.value++;

          // 确保滚动到最新消息
          nextTick(() => {
            scrollToBottom();
          });
        } else {
          // 完成打字效果，清除计时器
          clearInterval(aiMessage.typingTimer);
          aiMessage.typingTimer = null;
        }
      }, typingSpeed);
    };

    // 用于标记消息是否完成
    const messageComplete = ref(false);

    // 处理可点击元素的点击事件
    const handleClickElement = (element) => {
      // 获取元素的类名、文本内容和动作
      const className = element.className || '';
      const text = element.textContent || '';
      const action = element.dataset ? element.dataset.action : '';

      console.log('点击了元素:', text, '类名:', className, '动作:', action);

      // 根据data-action属性和类名决定执行的操作
      if (className.includes('clickable-span')) {
        if (action === 'btnClick') {
          // 执行计数操作
          count.value++;
          list.value.push(count.value);
          // 显示提示
          uni.showToast({
            title: '点击成功，计数: ' + count.value,
            icon: 'none',
            duration: 1500
          });
          return;
        }

        // 原有的跳转逻辑
        if (text.includes('酒店') || text.includes('住宿') || text.includes('民宿') || text.includes('客栈')) {
          uni.navigateTo({
            url: '/pages/hotelBooking/hotelBooking',
            fail: (err) => {
              console.error('跳转失败:', err);
              uni.showToast({
                title: '页面跳转失败',
                icon: 'none'
              });
            }
          });
        } else if (text.includes('餐厅') || text.includes('餐饮') || text.includes('美食')) {
          uni.navigateTo({
            url: '/pages/foodRecommendation/foodRecommendation',
            fail: (err) => {
              console.error('跳转失败:', err);
              uni.showToast({
                title: '页面跳转失败',
                icon: 'none'
              });
            }
          });
        } else if (text.includes('景点') || text.includes('渔村') || text.includes('景区') || text.includes('旅游')) {
          uni.navigateTo({
            url: '/pages/attractionGuide/attractionGuide',
            fail: (err) => {
              console.error('跳转失败:', err);
              uni.showToast({
                title: '页面跳转失败',
                icon: 'none'
              });
            }
          });
        }
      }
    };

    // 处理消息内容点击事件
    const handleMessageTap = (event) => {
      // 获取点击的元素
      const target = event.target;
      console.log('点击了消息内容', target);

      // 检查是否点击了带有clickable-span类的元素
      if (target && target.className && target.className.includes('clickable-span')) {
        handleClickElement(target);
      }
    };

    // 处理rich-text的点击事件
    const onCustomRichTextTap = (event) => {
      console.log('Rich text tap event:', event);

      // 获取点击的元素
      const target = event.target;
      if (!target) {
        console.log('No target element found');
        return;
      }

      // 检查是否点击了带有clickable-span类的元素
      // if (target.className && target.className.includes('clickable-span')) {
      handleClickElement(target);
      // }
    };

    // 响应式数据
    const count = ref(0);
    const list = ref([]);

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

      // 检查用户是否已登录（有token）
      if (!token.value) {
        uni.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        // 延迟跳转到登录页面，给用户一些时间看到提示
        // 获取当前页面栈
        const pages = getCurrentPages();

        // 获取当前页面的实例
        const currentPage = pages[pages.length - 1];

        const getQueryString = (params) => {
          return Object.keys(params)
            .map(key => key + '=' + params[key])
            .join('&');
        };

        // 获取完整的 URL (包含查询参数)
        const currentUrl = '/' + currentPage.route + '?' + getQueryString(currentPage.options);
        console.log("currentUrl", currentUrl)
        // 保存到本地存储
        uni.setStorage({
          key: 'loginRedirectUrl',
          data: currentUrl
        });

        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/login/login'
          });
        }, 2000);
        return;
      }

      // 添加用户消息
      chatMessages.push({
        type: 'user',
        content: inputMessage.value
      });

      // 清空输入框并滚动到最新消息
      inputMessage.value = '';
      scrollToLatestMessage();

      // 调用智能对话接口
      // callAIInterface(chatMessages[chatMessages.length - 1].content);

      // 模拟AI回复
      AIAnswerThinking();
      // 模拟AI思考几秒钟
      setTimeout(() => {
        // AI回复的消息内容
        const lastMessage = chatMessages[chatMessages.length - 1];
        // 模拟AI回复的内容，这里仅为示例。实际应用中应从服务器获取或根据用户输入动态生成。
        let deadAnswer = "";
        deadAnswer = '<div class="trip-container"><p>据您的需求，我建议如下行程：✅</p><div class="trip-section"><h3>📝 行程概览</h3><p>📍 本次行程将围绕“海钓”这一核心活动展开，结合万山岛的特色景点和便利交通，为您打造一次难忘的海岛体验。</p></div><hr class="divider"><div class="trip-section"><h3>⏱️ 行程安排</h3><div class="trip-day"><h4>⏰ 第一天：抵达与准备</h4><ul><li><span class="transport clickable-span">🚢 1-船</span> 从出发地乘船前往万山岛，建议选择上午的班次（8:00或10:00）。</li><li><span class="accommodation clickable-span">🏠 2-万山渔家乐</span> 办理入住，稍作休息。</li><li><span class="restaurant clickable-span">🍽️ 3-碧海鱼排</span> 享用午餐，品尝新鲜海鲜。</li><li><span class="activity clickable-span">🎣 4-海钓</span> 下午开始海钓活动，体验3-4小时的海钓乐趣。</li><li><span class="accommodation clickable-span">🍽️ 5-万山渔家乐</span> 晚餐后返回酒店休息。</li></ul></div><div class="trip-day"><h4>⏰ 第二天：探索与返程</h4><ul><li><span class="restaurant clickable-span">🍽️ 6-岛上咖啡馆</span> 享用早餐。</li><li><span class="activity clickable-span">🎣 7-海钓</span> 上午继续海钓活动，享受海钓的乐趣。</li><li><span class="restaurant clickable-span">🍽️ 8-岛上美食坊</span> 午餐后稍作休息。</li><li><span class="transport clickable-span">🚢 9-船</span> 下午乘船返程，建议选择13:30的班次。</li></ul></div></div><hr class="divider"><div class="trip-section"><h3>📊 推荐亮点</h3><ul><li><span class="activity clickable-span">🎣 1-海钓</span> 海钓活动是本次行程的核心，适合中等难度的钓鱼爱好者，价格800元。</li><li><span class="accommodation clickable-span">🏠 2-万山渔家乐</span> 海景房住宿，价格500元，评分4.2，环境舒适。</li><li><span class="restaurant clickable-span">🍽️ 3-碧海鱼排</span> 提供新鲜海鲜，价格为200元。</li></ul></div><hr class="divider"><div class="trip-section"><h3>❓ 注意事项</h3><ul><li>海钓活动需提前预约，建议联系当地旅行社或酒店安排。</li><li>船票价格100元，建议提前购票以确保座位。</li></ul></div><hr class="divider"><div class="trip-section"><h3>✉️ 总结</h3><p>本次行程以海钓为核心，结合万山岛的特色餐饮和住宿，为您提供一次轻松愉快的海岛体验。如有其他需求或问题，欢迎随时联系！</p></div><hr class="divider"><div class="price-section"><div class="price-info"><div class="price"><span class="price-symbol">¥</span><span class="price-value">988</span></div><div class="price-details">含往返交通、住宿、活动费用</div></div><div class="discount">优惠: <span class="discount-value">¥428元</span></div></div><div class="ai-comfirm-button">确认行程</div></div>';
        // AI回复内容
        AIAnser(deadAnswer, lastMessage);
        // 为clickable-span和ai-comfirm-button添加交互行为
        // bindClickableElements();
      }, 2000);

    };

    // 在sendMessage中使用此方法会让ai回复一个正在思考中...
    const AIAnswerThinking = function () {
      // 创建一个空的AI消息
      const aiMessage = {
        type: 'ai',
        content: '正在思考中',  // 初始文本，不带点
        id: Date.now(),
        thinking: true,  // 标记是否为思考状态
        startTime: Date.now() // 记录开始时间
      };
      chatMessages.push(aiMessage);

      // 创建思考动画定时器
      let dotCount = 0;
      const THINKING_TIMEOUT = 30000; // 30秒超时
      const thinkingInterval = setInterval(() => {
        if (aiMessage.thinking) {  // 只在thinking为true时更新点
          // 检查是否超时
          if (Date.now() - aiMessage.startTime > THINKING_TIMEOUT) {
            clearInterval(thinkingInterval);  // 停止动画
            aiMessage.thinking = false;
            aiMessage.content = '抱歉，响应超时。请重新发送消息。';
            updateCounter.value++;

            // 显示超时提示
            uni.showToast({
              title: '响应超时，请重试',
              icon: 'none',
              duration: 2000
            });
            return;
          }

          dotCount = (dotCount + 1) % 4;  // 0到3循环
          aiMessage.content = '正在思考中' + '.'.repeat(dotCount);
          // 触发视图更新
          updateCounter.value++;
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


    // 思考完毕调用这个方法输出数据
    const AIAnser = function (content, aiMessage) {
      // 收到实际回答时，停止思考动画
      aiMessage.thinking = false;
      // 使用打字机效果显示答案
      showTypingEffect(content, aiMessage);

      // 使用nextTick确保DOM更新后再滚动
      nextTick(() => {
        scrollToBottom();
      });
    }

    // 为clickable-span和ai-comfirm-button添加交互行为
    function bindClickableElements() {
      // 为clickable-span添加点击事件
      document.querySelectorAll('.clickable-span').forEach(element => {
        element.addEventListener('click', function () {
          const id = this.getAttribute('data-id');
          const type = this.getAttribute('data-type');
          AINavigatorTo(id, type);
        });
      });

      // 为ai-comfirm-button添加点击事件
      const confirmButton = document.querySelector('.ai-comfirm-button');
      if (confirmButton) {
        confirmButton.addEventListener('click', function () {
          // 这里可以根据需要传递不同的参数
          AINavigatorTo('confirm', 'trip');
        });
      }
    }

    const AINavigatorTo = function (id, type) {
      console.log(`Navigating to: id=${id}, type=${type}`);
      // 实际应用中，这里可以实现页面跳转或其他交互行为
      // 例如: window.location.href = `/detail?id=${id}&type=${type}`;
    };



    // 负责处理用户消息并获取AI回复。它实现了与AI聊天服务器的通信，并处理流式响应数据。
    const callAIInterface = (userQuery, retryCount = 0) => {
      const MAX_RETRIES = 3; // 最大重试次数
      // const url = 'http://47.106.243.134:7181/island/front/ai/chat/chatMessage-stream';
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

      // 如果是重试请求，显示重试提示
      if (retryCount > 0) {
        uni.showToast({
          title: `第${retryCount}次重试连接...`,
          icon: 'none',
          duration: 2000
        });
      }

      // 打印token值进行调试
      console.log('Current token:', token.value);

      // 创建请求任务
      const requestTask = uni.request({
        url: url,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'X-Access-Token': token.value // 确保token已经被添加到请求头中
        },
        data: JSON.stringify(data),
        responseType: 'text', // 设置响应类型为文本
        enableChunked: true, // 启用分块传输模式
        timeout: 30000, // 设置30秒超时
        success: (res) => {
          console.log('请求成功:', res);
        },
        fail: (err) => {
          console.error('请求失败:', err);
          // 打印完整的错误信息
          console.error('错误详情:', JSON.stringify(err));

          // 更新最后添加的AI消息，显示错误信息
          const lastMessage = chatMessages[chatMessages.length - 1];
          let errorMessage = '';

          // 根据错误类型显示不同的提示
          if (err.errMsg && err.errMsg.includes('timeout')) {
            errorMessage = '请求超时，请重试';
          } else if (err.errMsg && err.errMsg.includes('ERR_INCOMPLETE_CHUNKED_ENCODING')) {
            errorMessage = '网络连接中断，请重新发送消息';
          } else {
            errorMessage = `请求失败: ${err.errMsg}. 请检查网络连接或重新登录。`;
          }

          // 如果是网络错误并且未超过最大重试次数，尝试重新连接
          if ((err.errMsg && err.errMsg.includes('ERR_INCOMPLETE_CHUNKED_ENCODING') ||
            err.errMsg && err.errMsg.includes('network error') ||
            err.errMsg && err.errMsg.includes('timeout')) &&
            retryCount < MAX_RETRIES) {

            const retryDelay = 1000 * (retryCount + 1); // 递增重试延迟

            uni.showToast({
              title: `连接中断，${retryCount + 1}秒后自动重试...`,
              icon: 'none',
              duration: retryDelay
            });

            setTimeout(() => {
              console.log(`第${retryCount + 1}次重试连接...`);
              callAIInterface(userQuery, retryCount + 1);
            }, retryDelay);

            return; // 不更新消息，等待重试
          }

          // 如果重试失败或其他错误，更新消息
          if (lastMessage.type === 'ai') {
            lastMessage.thinking = false; // 停止思考动画
            lastMessage.content = errorMessage;
          } else {
            chatMessages.push({
              type: 'ai',
              content: errorMessage,
              thinking: false
            });
          }

          // 显示错误提示
          uni.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 3000
          });

          // 更新UI
          globalUpdateKey.value = Date.now();
          updateCounter.value++;
        }
      });

      // 添加请求完成的处理
      requestTask.onComplete && requestTask.onComplete((res) => {
        console.log('请求完成:', res);
        // 如果消息未完成，添加提示
        if (!messageComplete.value) {
          const lastMessage = chatMessages[chatMessages.length - 1];
          if (lastMessage.type === 'ai') {
            lastMessage.content += '\n\n[消息可能未完整接收，请重新发送]';
          }
          scrollToLatestMessage();
        }
      });

      // 存储所有原始answer值
      const rawAnswers = [];

      // 创建一个空的AI消息
      const aiMessage = {
        type: 'ai',
        content: '正在思考中',  // 初始文本，不带点
        id: Date.now(),
        thinking: true,  // 标记是否为思考状态
        startTime: Date.now() // 记录开始时间
      };
      chatMessages.push(aiMessage);

      // 创建思考动画定时器
      let dotCount = 0;
      const THINKING_TIMEOUT = 30000; // 30秒超时
      const thinkingInterval = setInterval(() => {
        if (aiMessage.thinking) {  // 只在thinking为true时更新点
          // 检查是否超时
          if (Date.now() - aiMessage.startTime > THINKING_TIMEOUT) {
            clearInterval(thinkingInterval);  // 停止动画
            aiMessage.thinking = false;
            aiMessage.content = '抱歉，响应超时。请重新发送消息。';
            updateCounter.value++;

            // 显示超时提示
            uni.showToast({
              title: '响应超时，请重试',
              icon: 'none',
              duration: 2000
            });
            return;
          }

          dotCount = (dotCount + 1) % 4;  // 0到3循环
          aiMessage.content = '正在思考中' + '.'.repeat(dotCount);
          // 触发视图更新
          updateCounter.value++;
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

      // 用于存储完整的响应内容
      let fullResponse = '';

      // 监听分块数据到达事件
      let lastChunkTime = Date.now();
      const CHUNK_TIMEOUT = 30000; // 30秒超时

      const chunkTimeoutCheck = setInterval(() => {
        if (Date.now() - lastChunkTime > CHUNK_TIMEOUT) {
          console.log('数据块接收超时');
          clearInterval(chunkTimeoutCheck);
          requestTask.abort(); // 中断请求
        }
      }, 1000);

      requestTask.onChunkReceived((res) => {
        lastChunkTime = Date.now(); // 更新最后接收数据块的时间
        aiMessage.lastDataTime = Date.now(); // 更新最后数据接收时间
        try {
          // 将ArrayBuffer转换为文本
          const uint8Array = new Uint8Array(res.data);
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(uint8Array);
          console.log('收到的原始数据:', text); // 调试日志

          // 处理SSE格式数据
          if (text.startsWith('data:')) {
            // 提取data:后面的JSON字符串
            const jsonStr = text.substring(5).trim();
            console.log('提取的JSON字符串:', jsonStr); // 调试日志

            try {
              // 解析JSON数据
              const jsonData = JSON.parse(jsonStr);
              console.log('解析到的JSON数据:', jsonData);

              // 根据不同的event类型处理数据
              // 清除超时检查
              if (jsonData.event === 'workflow_finished' || jsonData.event === 'message_end') {
                clearInterval(chunkTimeoutCheck);
              }

              switch (jsonData.event) {
                case 'workflow_started':
                case 'node_started':
                case 'message':
                case 'node_finished':
                case 'workflow_finished':
                  // 所有这些事件类型都使用相同的处理流程
                  let answer = '';
                  if (jsonData.data && jsonData.data.outputs && jsonData.data.outputs.answer) {
                    // 从新的数据结构中获取answer
                    answer = jsonData.data.outputs.answer;
                  } else if (jsonData.answer !== undefined) {
                    // 保持原有的answer获取方式作为备选
                    answer = jsonData.answer;
                  }

                  if (answer) {
                    // 解码Unicode编码的answer并立即显示
                    const decodedAnswer = decodeUnicode(answer);
                    console.log(`事件[${jsonData.event}] 解码后的答案:`, decodedAnswer);

                    // 处理文本中的特定关键词，添加可点击样式
                    const processedAnswer = decodedAnswer.replace(
                      /(酒店|餐厅|景点|渔村)/g,
                      '<span class="clickable-span data-action="btnClick"">$1</span>'
                    );

                    // 其他事件正常累加到完整响应中
                    fullResponse += processedAnswer;

                    // 更新内容后绑定点击事件
                    bindClickEvents();

                    // 更新AI消息内容
                    const lastMessage = chatMessages[chatMessages.length - 1];
                    if (lastMessage && lastMessage.type === 'ai') {
                      // 收到实际回答时，停止思考动画
                      lastMessage.thinking = false;
                      // 使用打字机效果显示答案
                      showTypingEffect(decodedAnswer, lastMessage);

                      // 使用nextTick确保DOM更新后再滚动
                      nextTick(() => {
                        scrollToBottom();
                      });
                    }
                  } else {
                    console.log(`接收到事件 [${jsonData.event}]，但没有answer数据`);
                    // 如果收到事件但没有answer数据，至少更新AI消息，表明服务器有响应
                    const lastMessage = chatMessages[chatMessages.length - 1];
                    if (lastMessage && lastMessage.type === 'ai' && lastMessage.thinking) {
                      lastMessage.content = '正在处理您的请求...';
                      // 立即强制视图更新
                      globalUpdateKey.value = Date.now();
                      updateCounter.value++;
                    }
                  }

                  break;

                case 'message_end':
                  // 处理消息结束事件
                  messageComplete.value = true;
                  console.log('对话完成');

                  // 打印所有原始answer值
                  console.log('所有原始answer值:', rawAnswers);
                  console.log('所有原始answer值拼接:', rawAnswers.join(' '));

                  // 使用打字机效果显示完整响应
                  aiMessage.thinking = false;  // 确保停止思考动画

                  // 如果内容与当前显示不同，使用打字机效果
                  if (aiMessage.content !== fullResponse) {
                    showTypingEffect(fullResponse, aiMessage);
                  }

                  // 确保DOM更新后再滚动
                  nextTick(() => {
                    scrollToBottom();
                  });
                  break;

                default:
                  // 处理其他可能的event类型
                  console.log(`收到未处理的事件类型: ${jsonData.event}`, jsonData);
                  break;
              }
            } catch (jsonError) {
              // console.warn('JSON解析错误:', jsonError);
            }
          }
        } catch (e) {
          console.error('数据处理失败:', e);
          // 即使解析失败，也尝试显示一些原始数据，避免一直显示"正在思考中"
          const lastMessage = chatMessages[chatMessages.length - 1];
          if (lastMessage && lastMessage.type === 'ai' && lastMessage.thinking) {
            // 如果已经思考了超过10秒，显示错误提示
            if (Date.now() - lastMessage.startTime > 10000) {
              lastMessage.thinking = false;
              lastMessage.content = '抱歉，数据处理出现问题，请重试。';
              globalUpdateKey.value = Date.now();
              updateCounter.value++;
            }
          }
        }
      });
    };

    // 解码 Unicode 编码
    const decodeUnicode = (str) => {
      if (!str) return '';

      try {
        // 处理直接的Unicode编码
        if (typeof str === 'string') {
          // 使用正则表达式替换所有Unicode转义序列
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
      // 立即更新滚动位置，不等待nextTick
      const lastIndex = chatMessages.length;
      scrollIntoView.value = `msg-${lastIndex}`;
    };

    // 新增滚动到底部的函数
    const scrollToBottom = () => {
      // 如果用户禁用了自动滚动，则不执行滚动操作
      if (!enableAutoScroll.value) {
        // console.log('用户正在查看历史消息，暂停自动滚动');
        // 添加一个提示，让用户知道有新消息（可选）
        // uni.showToast({
        //   title: '收到新消息，滑动到底部查看',
        //   icon: 'none',
        //   duration: 2000
        // });
        return;
      }

      // 使用uni-app的选择器API获取scroll-view组件信息
      const query = uni.createSelectorQuery();
      query.select('.chat-container').boundingClientRect(data => {
        if (data) {
          // 获取scroll-view的高度
          const containerHeight = data.height;
          viewportHeight.value = containerHeight;

          // 再次使用选择器获取所有消息内容的总高度
          const messageQuery = uni.createSelectorQuery();
          messageQuery.selectAll('.message').boundingClientRect(messages => {
            if (messages && messages.length > 0) {
              // 计算所有消息的总高度
              const totalHeight = messages.reduce((sum, msg) => sum + msg.height, 0);
              contentHeight.value = totalHeight;

              // 设置scrollTop为消息总高度，确保滚动到底部
              scrollTop.value = totalHeight;

              // 同时更新scrollIntoView以确保最新消息可见
              const lastIndex = chatMessages.length;
              scrollIntoView.value = `msg-${lastIndex}`;

              // 更新最后的滚动位置
              lastScrollTop.value = totalHeight;
            }
          }).exec();
        }
      }).exec();
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
      // 在组件挂载后，使用setTimeout确保视图已经渲染
      setTimeout(() => {
        scrollToBottom();
      }, 100); // 给一个小延时确保内容已渲染

    });

    // 滚动相关的处理函数
    const onScrollToUpper = () => {
      console.log('到达顶部');
      // 这里可以添加加载历史消息的逻辑
    };

    // 检查是否滚动到底部的阈值（像素）(距离页面底部的距离，超过SCROLL_BOTTOM_THRESHOLD px则表示禁用自动滚落)
    const SCROLL_BOTTOM_THRESHOLD = 10;

    const onScroll = (e) => {
      const currentScrollTop = e.detail.scrollTop;

      // 获取当前滚动位置、内容高度和可视区域高度
      const query = uni.createSelectorQuery();
      query.select('.chat-container').boundingClientRect(data => {
        if (data) {
          viewportHeight.value = data.height;

          // 获取内容总高度
          const messageQuery = uni.createSelectorQuery();
          messageQuery.selectAll('.message').boundingClientRect(messages => {
            if (messages && messages.length > 0) {
              contentHeight.value = messages.reduce((sum, msg) => sum + msg.height, 0);

              // 计算是否接近底部
              const distanceFromBottom = contentHeight.value - (currentScrollTop + viewportHeight.value);
              // console.log('距离底部：', distanceFromBottom, '像素');

              // 如果用户滚动到接近底部，启用自动滚动
              if (distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD) {
                enableAutoScroll.value = true;
                // console.log('用户已滚动到底部，启用自动滚动');
              }
              // 如果用户正在查看历史消息（即不在底部），禁用自动滚动
              else {
                // 判断用户是否主动向上滚动（查看历史消息）
                // 注意：scrollTop增加表示用户在查看更早的消息（即上滑或鼠标滚轮向上）
                if (currentScrollTop > lastScrollTop.value) {
                  enableAutoScroll.value = false;
                  // console.log('用户正在查看历史消息，禁用自动滚动');
                }
              }
            }
          }).exec();
        }
      }).exec();

      // 更新最后的滚动位置
      lastScrollTop.value = currentScrollTop;
    };

    const handleSpanClick = (id, type) => {
      console.log(`Clicked span with id: ${id}, type: ${type}`);
      // 在这里添加您想要执行的操作
      // 例如，可以根据type来决定执行不同的操作
      switch (type) {
        case 'Transport':
          // 处理交通相关的点击
          uni.showToast({
            title: `查看交通信息: ${id}`,
            icon: 'none'
          });
          break;
        case 'Accommodation':
          // 处理住宿相关的点击
          uni.showToast({
            title: `查看住宿信息: ${id}`,
            icon: 'none'
          });
          break;
        case 'Restaurant':
          // 处理餐厅相关的点击
          uni.showToast({
            title: `查看餐厅信息: ${id}`,
            icon: 'none'
          });
          break;
        default:
          uni.showToast({
            title: `查看详情: ${id}`,
            icon: 'none'
          });
      }
    };


    return {
      inputMessage,
      scrollTop,
      scrollIntoView,
      enableAutoScroll,
      categories,
      chatMessages,
      updateCounter, // 导出更新计数器
      globalUpdateKey, // 导出全局更新键
      selectCategory,
      getCategoryName,
      sendMessage,
      navigatortopaymoent,
      formatItineraryText,
      processRawAnswers, // 导出处理原始答案的函数
      goBack,
      showMore,
      showAddOptions,
      scrollToBottom, // 导出滚动到底部的函数
      onScrollToUpper, // 滚动到顶部的处理函数
      onScroll, // 滚动事件处理函数
      handleSpanClick, // 处理span点击的函数
      onCustomRichTextTap, // 自定义富文本点击处理函数
      handleMessageTap, // 添加消息点击处理函数
      handleClickElement, // 添加元素点击处理函数
      count, // 导出计数器
      list, // 导出列表
      // navigateToPage, // 添加页面导航函数
      // addClickListeners, // 添加点击监听器函数
      decodeUnicode, // 导出Unicode解码函数
    };
  }
};
</script>

<style>
/* 新增按钮样式 */
.more-info-button {
  display: inline-block;
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.more-info-button:hover {
  background-color: #0056b3;
}

.more-info-button:active {
  background-color: #004494;
}

/* Markdown样式 */
.markdown-content {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
  word-wrap: break-word;
}

/* 标题样式 */
.markdown-content .heading-1 {
  font-size: 40rpx;
  font-weight: bold;
  margin: 30rpx 0 20rpx;
  padding-bottom: 10rpx;
  border-bottom: 2rpx solid #eee;
}

.markdown-content .heading-2 {
  font-size: 36rpx;
  font-weight: bold;
  margin: 25rpx 0 15rpx;
}

.markdown-content .heading-3 {
  font-size: 32rpx;
  font-weight: bold;
  margin: 20rpx 0 10rpx;
}

/* 段落样式 */
.markdown-content .paragraph {
  margin: 16rpx 0;
}

/* 列表样式 */
.markdown-content .unordered-list,
.markdown-content .ordered-list {
  margin: 16rpx 0;
  padding-left: 40rpx;
}

.markdown-content .list-item {
  margin: 8rpx 0;
}

/* 代码样式 */
.markdown-content .code-block {
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 20rpx;
  margin: 16rpx 0;
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 24rpx;
}

.markdown-content .inline-code {
  background-color: #f5f5f5;
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
  font-family: monospace;
  font-size: 24rpx;
}

/* 引用样式 */
.markdown-content .blockquote {
  border-left: 8rpx solid #ddd;
  padding: 16rpx 32rpx;
  margin: 16rpx 0;
  color: #666;
  background-color: #f9f9f9;
}

/* 表格样式 */
.markdown-content .table {
  width: 100%;
  margin: 16rpx 0;
  border-collapse: collapse;
}

.markdown-content .table view {
  border: 2rpx solid #ddd;
  padding: 16rpx;
}

/* 链接样式 */
.markdown-content a {
  color: #0366d6;
  text-decoration: none;
}

/* 图片样式 */
.markdown-content image {
  max-width: 100%;
  margin: 16rpx 0;
  border-radius: 8rpx;
}

/* 分割线样式 */
.markdown-content .line-break {
  height: 2rpx;
  background-color: #eee;
  margin: 24rpx 0;
}

/* 强调样式 */
.markdown-content .bold {
  font-weight: bold;
}

.markdown-content .italic {
  font-style: italic;
}

/* 添加消息文本样式 */
.message-text {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.5;
}

/* 自定义富文本容器样式 */
.custom-rich-text {
  position: relative;
  width: 100%;
}

/* 添加可点击span的样式 */
.clickable-span {
  display: inline-block;
  color: #4285f4;
  text-decoration: underline;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  background-color: rgba(66, 133, 244, 0.1);
  margin: 0 2px;
}

.clickable-span:active {
  opacity: 0.7;
  background-color: rgba(66, 133, 244, 0.2);
  transform: translateY(1px);
}

/* 已移除酒店相关样式 */

/* HTML标签转换后的样式 */
.heading-1 {
  font-size: 20px;
  font-weight: bold;
  margin: 16px 0 8px 0;
}

.heading-2 {
  font-size: 18px;
  font-weight: bold;
  margin: 14px 0 7px 0;
}

.heading-3 {
  font-size: 16px;
  font-weight: bold;
  margin: 12px 0 6px 0;
}

.paragraph {
  margin-bottom: 8px;
}

.line-break {
  height: 8px;
}

.unordered-list,
.ordered-list {
  margin: 8px 0;
  padding-left: 16px;
}

.list-item {
  margin-bottom: 4px;
  display: flex;
}

.bold {
  font-weight: bold;
}

.italic {
  font-style: italic;
}

.code-block {
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  margin: 8px 0;
  overflow-x: auto;
}

.inline-code {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.blockquote {
  border-left: 4px solid #ddd;
  padding-left: 12px;
  color: #666;
  margin: 8px 0;
}

.table {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0;
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

/* Base styles */
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
  padding: 0 10px;
}

/* Header styles */
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
  color: #ffffff;
}

/* Chat container styles */
.chat-container {
  flex: 1;
  overflow-y: auto;
}

/* Avatar styles */
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
  padding-left: 1px;
}

.user-avatar {
  background-color: #4CAF50;
}

.user-avatar image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Message styles */
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

.add-icon,
.send-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4285f4;
}


/* -------------------------------------------------------------------------------------------- */
.trip-container {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  /* background-color: #f9f9f9; */
  border-radius: 10px;
  /* box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); */
}

.trip-section {
  margin-bottom: 30px;
}

h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.4em;
}

h4 {
  color: #3498db;
  margin-bottom: 10px;
  font-size: 1.2em;
}

.divider {
  border: none;
  border-top: 2px dashed #bdc3c7;
  margin: 20px 0;
}

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 10px;
}

/* 标签样式 */
.transport {
  background-color: #3498db;
  color: white;
  padding: 3px 8px;
  border-radius: 15px;
  margin-right: 5px;
}

.accommodation {
  background-color: #2ecc71;
  color: white;
  padding: 3px 8px;
  border-radius: 15px;
  margin-right: 5px;
}

.restaurant {
  background-color: #e67e22;
  color: white;
  padding: 3px 8px;
  border-radius: 15px;
  margin-right: 5px;
}

.activity {
  background-color: #9b59b6;
  color: white;
  padding: 3px 8px;
  border-radius: 15px;
  margin-right: 5px;
}

/* 按钮样式 */
.confirm-button {
  background-color: #3498db;
  /* 蓝色背景 */
  color: white;
  /* 白色字体 */
  border: none;
  padding: 12px 0;
  width: 100%;
  /* 宽度与父级相同 */
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.confirm-button:hover {
  background-color: #2980b9;
  /* 鼠标悬停时的背景色 */
}

.ai-comfirm-button {
  /* 基本样式 */
  background-color: #1e88e5;
  /* 蓝色背景 */
  color: white;
  /* 白色文字 */
  text-align: center;
  /* 文字水平居中 */
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  /* 高度占满父级 */
  width: 100%;
  /* 宽度占满父级 */
  border: none;
  /* 无边框 */
  border-radius: 5px;
  /* 圆角 */
  font-size: 16px;
  /* 字体大小 */
  font-weight: bold;
  /* 加粗字体 */
  cursor: pointer;
  /* 鼠标悬停时显示手型 */
  transition: background-color 0.3s, transform 0.2s;
  /* 过渡效果 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  /* 阴影效果 */
}

/* 悬停效果 */
.ai-comfirm-button:hover {
  background-color: #1565c0;
  /* 深蓝色 */
  transform: translateY(-2px);
  /* 稍微上移 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  /* 更明显的阴影 */
}

/* 点击效果 */
.ai-comfirm-button:active {
  background-color: #0d47a1;
  /* 更深的蓝色 */
  transform: translateY(1px);
  /* 稍微下移 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  /* 较弱的阴影 */
}

/* 确保按钮在父级容器中居中 */
.trip-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* -------------------------------------------------------------------------------------------- */
</style>