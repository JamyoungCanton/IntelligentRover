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
            <image v-if="msg.image" class="response-image" src="/static/chat/fashboat.png" mode="widthFix"></image>

            <!-- Text content - 使用rich-text来正确渲染HTML内容 -->
            <rich-text v-if="msg.content" class="message-text" :nodes="msg.content"></rich-text>

            <!-- Itinerary details -->
            <view v-if="msg.itinerary" class="itinerary-container">
              <view class="itinerary-title">{{ msg.itinerary.title }}</view>

              <view class="itinerary-section">
                <text class="section-title">行程安排:</text>

                <view v-for="(item, idx) in msg.itinerary.schedule" :key="idx" class="itinerary-item">
                  <text class="time">{{ item.time }}:</text>
                  <rich-text class="detail" :nodes="formatItineraryText(item.detail)"></rich-text>
                </view>
              </view>

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
import axios from 'axios';
import { useUserStore } from '@/store';

export default {
  setup() {
    // 引入 store
    const userStore = useUserStore();
    const token = computed(() => userStore.token);

    // 创建 Axios 实例
    const instance = axios.create({
      baseURL: 'http://47.106.243.134:7181/island',
      timeout: 5000,
    });

    // 请求拦截器
    instance.interceptors.request.use(
      (config) => {
        // 在请求发送之前可以修改配置
        if (token.value) {
          config.headers['X-Access-Token'] = token.value;
        }
        return config;
      },
      (error) => {
        // 处理请求错误
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    instance.interceptors.response.use(
      (response) => {
        if (response.data.code === 401) {
          // 未登录，存储目标页面路径
          uni.setStorageSync('redirectUrl', window.location.href);
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/login/login'
            });
          }, 1500);
          return Promise.reject(response);
        }
        return response.data;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

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

    // 处理HTML标签，转换为对应的样式效果
    const processHtmlTags = (content) => {
      if (!content) return '';

      try {
        let processedContent = content;

        // 处理关键字"酒店"，添加样式和跳转功能
        processedContent = processedContent.replace(/酒店/g, '<text class="hotel-link" @tap="navigateToHotel">酒店</text>');

        // 处理常见HTML标签，将它们转换为适当的样式类

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

        // 处理span标签，添加点击事件
        processedContent = processedContent.replace(/<span\s+@click="func\('(\d+)',\s*'([^']*)'\)">(.*?)<\/span>/g, (match, id, type, content) => {
          return `<text class="clickable-span" @tap="handleSpanClick('${id}', '${type}')">${content}</text>`;
        });

        // 移除可能剩余的HTML标签
        processedContent = processedContent.replace(/<\/?[^>]+(>|$)/g, '');

        return processedContent;
      } catch (e) {
        console.error('HTML标签处理失败:', e);
        return content;
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

    // 用于累积分块数据
    const chunkBuffer = ref('');
    // 用于标记消息是否完成
    const messageComplete = ref(false);

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
      callAIInterface(chatMessages[chatMessages.length - 1].content);
    };

    const callAIInterface = (userQuery) => {
      const url = 'http://47.106.243.134:7181/island/front/ai/chat/chatMessage-stream';
      const data = {
        conversation_id: '',
        inputs: {
          original_intention: 'unknown',
          recommended_plan: 'unknown'
        },
        query: userQuery,
        user: 'abc-123'
      };

      // 不预先添加AI消息，等收到实际响应再添加

      // 创建请求任务
      const requestTask = uni.request({
        url: url,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'X-Access-Token': token.value
        },
        data: JSON.stringify(data),
        responseType: 'text', // 设置响应类型为文本
        enableChunked: true, // 启用分块传输模式
        success: (res) => {
          console.log('请求成功:', res);
        },
        fail: (err) => {
          console.error('请求失败:', err);
          // 更新最后添加的AI消息，显示错误信息
          const lastMessage = chatMessages[chatMessages.length - 1];
          if (lastMessage.type === 'ai') {
            lastMessage.content = '请求失败1:很抱歉，我暂时无法回答您的问题，请稍后再试。';
          } else {
            chatMessages.push({
              type: 'ai',
              content: '请求失败2:很抱歉，我暂时无法回答您的问题，请稍后再试。'
            });
          }
          scrollToLatestMessage();
        }
      });

      // 在发送请求前先添加一个空的AI消息框
      const aiMessageIndex = chatMessages.length;
      const initialMessage = {
        type: 'ai',
        content: '', // 初始为空内容
        id: Date.now() // 添加唯一ID
      };
      chatMessages.push(initialMessage);

      // 初始化时增加更新计数
      updateCounter.value++;

      // 存储所有原始answer值
      const rawAnswers = [];

      // 监听分块数据到达事件
      requestTask.onChunkReceived((res) => {
        try {
          // 将ArrayBuffer转换为文本
          const uint8Array = new Uint8Array(res.data);
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(uint8Array);
          // console.log('收到的原始数据:', text); // 调试日志

          // 处理SSE格式数据
          if (text.startsWith('data:')) {
            // 提取data:后面的JSON字符串
            const jsonStr = text.substring(5).trim();
            // console.log('提取的JSON字符串:', jsonStr); // 调试日志

            try {
              // 解析JSON数据
              const jsonData = JSON.parse(jsonStr);
              // console.log('解析到的JSON数据:', jsonData);

              // 处理消息事件
              if (jsonData.event === 'message' && jsonData.answer !== undefined) {
                // 保存原始answer值
                rawAnswers.push(jsonData.answer);

                // 解码Unicode编码的answer
                const decodedAnswer = decodeUnicode(jsonData.answer);
                // console.log('解码后的答案:', decodedAnswer);

                // 使用最简单直接的方式更新内容
                if (aiMessageIndex < chatMessages.length) {
                  // 获取当前消息引用
                  const currentMessage = chatMessages[aiMessageIndex];

                  // 处理HTML标签，转换为对应的样式
                  const processedAnswer = processHtmlTags(decodedAnswer);

                  // 直接赋值 - Vue 3的响应式系统会检测到这个变化
                  if (!currentMessage.content) {
                    currentMessage.content = processedAnswer;
                  } else {
                    // 完全替换内容以触发响应式更新
                    const newContent = currentMessage.content + processedAnswer;
                    currentMessage.content = newContent;
                  }

                  // 强制视图立即更新
                  globalUpdateKey.value = Date.now();

                  // 使用setTimeout确保在下一个事件循环中执行滚动
                  setTimeout(() => {
                    scrollToBottom();
                  }, 0);
                }
              }
              // 处理消息结束事件
              else if (jsonData.event === 'node_finished') {
                messageComplete.value = true;
                console.log('对话完成');

                // 打印所有原始answer值
                console.log('所有原始answer值:', rawAnswers);
                console.log('所有原始answer值拼接:', rawAnswers.join(' '));

                // 再次强制更新
                updateCounter.value++;
              }
            } catch (jsonError) {
              // console.warn('JSON解析错误:', jsonError);
            }
          }
        } catch (e) {
          // console.error('数据处理失败:', e);
        }
      });
      let text = '';
      try {
        // 将ArrayBuffer转换为Uint8Array
        const uint8Array = new Uint8Array(data);
        // 将二进制数据转换为字符串
        text = String.fromCharCode.apply(null, uint8Array);
        // 处理特殊字符编码
        text = decodeURIComponent(escape(text));
      } catch (e) {
        // console.error('数据解码失败:', e);
      }
      return text;
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
        // console.error('Unicode 解码失败:', e);
        return str;
      }
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

    // 打字机效果
    const showTypingEffect = (content) => {
      const aiMessage = {
        type: 'ai',
        content: ''
      };
      chatMessages.push(aiMessage);

      let charIndex = 0;
      const interval = setInterval(() => {
        if (charIndex < content.length) {
          aiMessage.content += content[charIndex];
          charIndex++;
          scrollToLatestMessage();
        } else {
          clearInterval(interval);
        }
      }, 100); // 每100毫秒显示一个字符
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

    const navigateToHotel = () => {
      uni.navigateTo({
        url: '/pages/hotelBooking/hotelBooking'
      });
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
      formatResponse,
      formatItineraryText,
      processHtmlTags, // 导出HTML标签处理函数
      goBack,
      showMore,
      showAddOptions,
      scrollToBottom, // 导出滚动到底部的函数
      onScrollToUpper, // 滚动到顶部的处理函数
      onScroll, // 滚动事件处理函数
      handleSpanClick, // 处理span点击的函数
      navigateToHotel // 导出酒店页面跳转函数
    };
  }
};
</script>

<style>
/* 添加消息文本样式 */
.message-text {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.5;
}

/* 添加可点击span的样式 */
.clickable-span {
  color: #4285f4;
  text-decoration: underline;
  cursor: pointer;
}

.clickable-span:active {
  opacity: 0.7;
}

/* 酒店链接样式 */
.hotel-link {
  color: #4285f4;
  text-decoration: underline;
  cursor: pointer;
}

.hotel-link:active {
  opacity: 0.7;
}

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
</style>