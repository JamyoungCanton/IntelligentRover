<template>
  <view class="ai-container">
    <!-- 缺省页面 -->
    <view v-if="chatMessageList.length == 0" class="ai-nochat-wrapper">
      <!-- 标题 -->
      <view class="ai-nochat-header">
        <image src="/static/chat/ai.png" mode="widthFix"></image>
        <view class="ai-nochat-header-title">智游侠</view>
        <view class="ai-nochat-header-desc">
          懂旅游的AI助手，为您提供个性化旅游建议
        </view>
      </view>
      <!-- 快捷提示词 -->
      <view class="tips-wrapper">
        <view class="tips-item" v-for="item in tipList" :key="item.title" @click="handleTipsClick(item.title)">
          <image :src="item.icon" mode="scaleToFill"></image>
          <view class="tips-item-text">
            <view class="tips-item-text-title">{{ item.title }}</view>
            <view class="tips-item-text-content">{{ item.content }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 聊天内容滚动区域 -->
    <view v-if="chatMessageList.length > 0" class="chat-list-wrapper">
      <template v-for="(msg, index) in chatMessageList" :key="index">
        <view v-if="msg.type === 'user'" class="user-message">
          <div class="message-content">{{ msg.content }}</div>
        </view>

        <view v-else class="ai-message">
          <div class="typing-content" :class="{ typing: isTyping && index === chatMessageList.length - 1 }">
            <template v-if="msg.content && msg.content.length > 0">
              <div class="ai-response-content">
                <template v-for="(item, i) in msg.content" :key="i">
                  <span v-if="item.type === 'text'" v-html="item.content" class="message-text"></span>
                  <template
                    v-else-if="['Activity', 'Attraction', 'Transport', 'Accommodation', 'Restaurant'].includes(item.type)">
                    <span class="clickable-item" @click="handleItemClick(item)" style="display: inline;">
                      {{ item.content || item.type }}
                    </span>
                  </template>
                  <template v-else-if="item.type === 'ask'">
                    <div style="margin: 8px 0;">
                      <span class="clickable-item" @click="handleAskClick(item)" style="display: inline-block;">
                        {{ item.content }}
                      </span>
                    </div>
                  </template>
                  <span v-else v-html="item.content" class="message-text"></span>
                </template>
              </div>
            </template>

            <template v-else-if="msg.thinking">
              <div class="thinking-animation">
                <span class="time">({{ Math.floor((Date.now() - msg.startTime) / 1000) }}s)</span>
                正在思考中<span class="dots">{{ dots }}</span>
              </div>
            </template>
            <span v-else v-html="msg.content"></span>
          </div>

          <!-- 行程优化组件 -->
          <view class="trip-optimizer" v-if="msg.type === 'ai' && msg.showOptimizer">
            <view class="optimizer-header">
              <text class="optimizer-title">优化行程</text>
              <text class="optimizer-subtitle">您可以调整行程景点和行程偏好，对其进行优化</text>
            </view>

            <view class="optimizer-section">
              <text class="section-title">行程偏好设置</text>

              <view class="option-group">
                <text class="option-label">出行天数</text>
                <view class="option-buttons">
                  <button v-for="day in [1, 2, 3, 4]" :key="day" :class="['day-btn', { active: selectedDays === day }]"
                    @click="selectedDays = day">
                    {{ day }}天
                  </button>
                </view>
              </view>

              <view class="option-group">
                <text class="option-label">同行人员</text>
                <view class="option-buttons">
                  <button v-for="person in ['6岁以下儿童', '6岁-12岁儿童', '65岁以上老人']" :key="person"
                    :class="['person-btn', { active: selectedPerson === person }]"
                    @click="selectedPerson = selectedPerson === person ? '' : person">
                    {{ person }}
                  </button>
                </view>
              </view>

              <view class="option-group">
                <text class="option-label">行程偏好</text>
                <view class="preference-tags">
                  <button v-for="tag in preferenceTags" :key="tag" :class="['tag-btn', { active: selectedTag === tag }]"
                    @click="selectedTag = selectedTag === tag ? '' : tag">
                    {{ tag }}
                  </button>
                </view>
              </view>

              <view class="optimizer-actions">
                <!-- <button class="confirm-btn" @click="confirmTrip">确认行程并购买</button> -->
                <button class="optimize-btn" @click="optimizeTrip">优化行程规划</button>
                <button>一键下单</button>
              </view>
            </view>

            <view class="action-buttons">
              <button class="action-btn" @click="likeMessage">
                <span class="icon like-icon">👍</span>
                <text>点赞</text>
              </button>
              <button class="action-btn" @click="dislikeMessage">
                <span class="icon dislike-icon">👎</span>
                <text>踩</text>
              </button>
            </view>
          </view>
        </view>
      </template>
    </view>


    <!-- 底部输入栏 -->
    <view class="input-wrapper">
      <uv-textarea v-model="message" placeholder="请输入旅游目的地或旅游问题" :maxlength="1000" autoHeight></uv-textarea>
      <view class="input-btn-wrapper">
        <uv-button icon="mic" size="mini" shape="circle" class="send-button"></uv-button>
        <uv-button icon="arrow-upward" iconColor="#fff" type="primary" size="mini" shape="circle" class="send-button"
          @click="sendMessage"></uv-button>
      </view>
    </view>

    <!-- <div class="bottom">
      <div class="voiceMessage">
        <img class="voice-icon" src="/static/chat/ai图标-语音输入.svg" alt="语音输入">
        <div class="input-container">
          <input type="text" placeholder="2请输入旅游目的地或旅游问题1" v-model="message" />
          <img class="send-icon" @click="sendMessage" src="/static/chat/ai图标-发送.svg" alt="发送">
        </div>
      </div>
    </div> -->

    <Tabbar />
  </view>
</template>

<script setup>
// ------------------ import ------------------
import Tabbar from '../Tabbar/Tabbar.vue';
import { ref, reactive, nextTick, onMounted, watch } from 'vue';
import { useUserStore } from '@/store/modules/user';
import { StreamRequest } from '../../utils/request.js';

// ------------------- data -------------------
// 快捷提示词列表
const tipList = reactive([{
  icon: '/static/chat/ai图标-海钓体验.svg',
  title: '海岛体验',
  content: '海岛度假、水上运动、美食之旅'
}, {
  icon: '/static/chat/ai图标-浮潜探索.svg',
  title: '浮潜探索',
  content: '海洋生物、珊瑚礁、潜水技巧'
}, {
  icon: '/static/chat/ai图标-亲子娱乐.svg',
  title: '亲子娱乐',
  content: '亲子活动、儿童乐园、亲子酒店'
}, {
  icon: '/static/chat/ai图标-休闲畅游.svg',
  title: '休闲畅游',
  content: '海滩漫步、日落观景、沙滩排球'
}, {
  icon: '/static/chat/ai图标-海岛介绍.svg',
  title: '海岛介绍',
  content: '海岛介绍、历史文化、旅游攻略'
}])

// 固定回复内容
const FIXED_REPLY = "请告诉我，我可以进一步帮你调整。";

// 存储所有AI回复的历史数据
const aiHistory = ref([]);

const headerCenterFunction = [
  { icon: '/static/chat/ai图标-海钓体验.svg', text: '海岛体验' },
  { icon: '/static/chat/ai图标-浮潜探索.svg', text: '浮潜探索' },
  { icon: '/static/chat/ai图标-亲子娱乐.svg', text: '亲子旅游' },
  { icon: '/static/chat/ai图标-休闲畅游.svg', text: '休闲畅游' },
  { icon: '/static/chat/ai图标-海岛介绍.svg', text: '海岛介绍' }
];

const message = ref('');
let chatMessageList = reactive([]);
const responseData = ref([]);
const isTyping = ref(false);
const dots = ref('');
const selectedDays = ref(1);
const selectedPerson = ref('');
const selectedTag = ref('');
const preferenceTags = ref([
  '山水风光', '名族风情', '历史文化',
  '诗酒文化', '文旅活动', '户外极限',
  '科学探索', '疗愈精心', '夜游出行'
]);



const confirmTrip = () => {
  uni.showToast({
    title: '行程确认成功',
    icon: 'success'
  });
};

const optimizeTrip = () => {
  // 构建优化请求内容
  let optimizationRequest = '优化上述行程';

  // 添加出行天数
  if (selectedDays.value) {
    optimizationRequest += `，出行天数为${selectedDays.value}天`;
  }

  // 添加同行人员
  if (selectedPerson.value) {
    optimizationRequest += `，同行人员有${selectedPerson.value}`;
  }

  // 添加行程偏好
  if (selectedTag.value) {
    optimizationRequest += `，行程偏好为${selectedTag.value}`;
  }

  // 显示加载状态
  uni.showToast({
    title: '正在优化行程...',
    icon: 'loading'
  });

  // 自动填充并发送优化请求
  message.value = optimizationRequest;
  sendMessage();

  // 重置选择状态
  selectedDays.value = 1;
  selectedPerson.value = '';
  selectedTag.value = '';
};

const likeMessage = () => {
  uni.showToast({ title: '已点赞', icon: 'success' });
};

const dislikeMessage = () => {
  uni.showToast({ title: '已踩', icon: 'success' });
};
let currentIndex = 0;
const userStore = useUserStore();
const messageInput = ref(null);


// 滚动到底部函数
const scrollToBottom = () => {
  nextTick(() => {
    const query = uni.createSelectorQuery();
    query.select('.scroll-container').boundingClientRect(data => {
      if (data) {
        uni.pageScrollTo({
          scrollTop: data.height,
          duration: 300
        });
      }
    }).exec();
  });
};


// 发送消息
const sendMessage = async () => {
  if (!message.value.trim()) return;

  // 添加用户消息
  chatMessageList.push({ type: 'user', content: message.value });
  const userInput = message.value;
  message.value = ''; // 清空输入框

  // 添加AI消息（初始为空）
  const newAiMessage = {
    type: 'ai',
    content: [],
    id: Date.now(),
    startTime: Date.now(), // 记录开始时间
    thinking: true, // 显示思考动画
    typing: true,
    showOptimizer: false, // 初始不显示优化组件
    isCurrent: true // 标记为当前消息
  };
  chatMessageList.push(newAiMessage);

  // 清空当前响应数据，确保新消息从初始状态开始
  responseData.value = [];

  // 启动思考动画
  startThinkingAnimation();

  // 发送AI请求
  await sendAiRequest(userInput);
};

// 发送ai请求
// const sendAiRequest = async (userInput) => {
//   try {
//     const token = userStore.token;
//     console.group('📡 发送AI请求');
//     console.log('🔑 Token:', token);
//     console.log('📩 用户输入:', userInput);

//     const requestData = {
//       conversation_id: '',
//       inputs: {
//         original_intention: '',
//         recommended_plan: ''
//       },
//       query: userInput,
//       webMode: 'MAPP-小程序'
//     };

//     console.log('📦 请求数据:', JSON.stringify(requestData, null, 2));
//     console.groupEnd();

//     // 显示思考动画
//     isTyping.value = true;

//     let response;
//     let retryCount = 0;
//     const maxRetries = 3; // 最大重试次数调整为3次
//     const timeout = 300000; // 5分钟超时(300000毫秒)

//     while (retryCount <= maxRetries) {
//       try {
//         response = await Promise.race([
//           uni.request({
//             url: 'https://island.zhangshuiyi.com/island/front/ai/chat/chatMessage-stream-flux',
//             method: 'POST',
//             data: requestData,
//             header: {
//               'X-Access-Token': token,
//               'Content-Type': 'application/json',
//               'Accept': 'text/event-stream'
//             },
//             timeout: timeout
//           }),
//           new Promise((_, reject) =>
//             setTimeout(() => reject(new Error('请求超时')), timeout)
//           )
//         ]);
//         break; // 请求成功，退出重试循环
//       } catch (error) {
//         retryCount++;
//         if (retryCount > maxRetries) {
//           throw error;
//         }
//         console.warn(`请求失败，第${retryCount}次重试...`, error);
//         await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒后重试
//       }
//     }

//     console.group('?? 收到API响应');
//     console.log('🛡️ 状态码:', response.statusCode);
//     console.log('📊 响应头:', response.header);

//     // 详细打印响应数据
//     console.groupCollapsed('🔍 响应数据详情');
//     console.log('📝 原始数据:', response.data);
//     console.log('📌 数据类型:', typeof response.data);

//     // 解析SSE格式数据
//     if (typeof response.data === 'string') {
//       const chunks = response.data.split('data:').filter(chunk => chunk.trim());
//       console.log('📦 数据块数量:', chunks.length);
//       chunks.forEach((chunk, index) => {
//         console.groupCollapsed(`📌 数据块 ${index + 1}`);
//         try {
//           const jsonData = JSON.parse(chunk.trim());
//           console.log('✅ 解析成功:', jsonData);
//           if (jsonData.event) console.log('🏷️ 事件类型:', jsonData.event);
//           if (jsonData.data) console.log('📊 事件数据:', jsonData.data);
//         } catch (e) {
//           console.log('❌ 解析失败:', chunk.trim());
//         }
//         console.groupEnd();
//       });
//     }
//     console.groupEnd(); // 结束响应数据详情
//     console.groupEnd(); // 结束API响应组

//     if (response.data && response.statusCode === 200) {
//       // 处理响应数据
//       const processedContent = processResponseData(response);
//       console.log("处理后的内容:", processedContent);

//       // 存入历史记录
//       aiHistory.value.push(processedContent);

//       // 更新最后一条消息的状态和内容
//       const lastIndex = chatMessageList.length - 1;
//       if (lastIndex >= 0) {
//         chatMessageList[lastIndex] = {
//           ...chatMessageList[lastIndex],
//           content: processedContent,
//           typing: false,
//           showOptimizer: false, // 初始不显示优化组件
//           optimizerData: {
//             selectedDays: 1,
//             selectedPerson: '',
//             selectedTag: ''
//           },
//           isCurrent: false // 标记为已完成
//         };
//       }

//       // 模拟打字机效果完成后显示优化组件
//       setTimeout(() => {
//         chatMessageList[lastIndex].showOptimizer = true;
//       }, 1000); // 延迟1秒显示优化组件
//     } else {
//       // 确保只更新当前消息的错误状态
//       const currentMsgId = chatMessageList[chatMessageList.length - 1]?.id;
//       if (currentMsgId && chatMessageList[chatMessageList.length - 1].id === currentMsgId) {
//         chatMessageList[chatMessageList.length - 1].content = [{
//           type: 'text',
//           content: '抱歉，请求出错了，请稍后再试。'
//         }];
//       }
//       console.error('请求失败:', response.statusCode, response.data);
//     }
//   } catch (error) {
//     console.error('AI请求出错:', error);
//     const lastIndex = chatMessageList.length - 1;
//     if (lastIndex >= 0) {
//       chatMessageList[lastIndex] = {
//         ...chatMessageList[lastIndex],
//         content: [{
//           type: 'text',
//           content: '抱歉，发生了错误，请稍后再试。'
//         }],
//         typing: false,
//         thinking: false
//       };
//     }
//   } finally {
//     // 结束打字动画和思考动画
//     isTyping.value = false;
//     const lastIndex = chatMessageList.length - 1;
//     if (lastIndex >= 0) {
//       chatMessageList[lastIndex].thinking = false;
//       chatMessageList[lastIndex].typing = false;
//     }

//     // 滚动到底部
//     scrollToBottom();
//   }
// };

const finalChunk = ref("");

const handleGetBuffer = (e) => {
  try {
    let chunk = JSON.parse(e);
    let title = chunk.data?.title;
    // console.log("节点标题:", title);
    console.log("数据块--->", chunk);
    // 工作流结束
    if (chunk.event == "workflow_finished") {

      console.log("直接返回!!!!!!!!!!!!!!!!!!!!!!!!!", chunk.data.outputs.answer);
      finalChunk.value = chunk.data.outputs.answer;
      const processedContent = processResponseData(chunk.data.outputs.answer);
      console.log("处理后的内容:", processedContent);
      if (chatMessageList.length > 0) {
        // startTypingEffect(processedContent, 0, 0);
        chatMessageList[lastIndex] = {
          ...chatMessageList[lastIndex],
          content: processedContent,
          typing: false,
          showOptimizer: false, // 初始不显示优化组件
          optimizerData: {
            selectedDays: 1,
            selectedPerson: '',
            selectedTag: ''
          },
          isCurrent: false // 标记为已完成
        };
      }
    }
  } catch (error) {
    console.error(error);
  }
};

// 打字机效果
const startTypingEffect = (processedContent, rowIndex, charIndex) => {
  const lastIndex = chatMessageList.length - 1;
  const lastStreamMessage = JSON.parse(JSON.stringify(processedContent[rowIndex])); // 深拷贝处理后内容
  lastStreamMessage.content = lastStreamMessage.content.slice(0, charIndex + 1);
  console.log('lastStreamMessage.content', lastStreamMessage.content);

  const streamContent = [...processedContent.slice(0, rowIndex), lastStreamMessage];
  if (rowIndex <= processedContent.length - 1) {
    chatMessageList[lastIndex] = {
      ...chatMessageList[lastIndex],
      content: streamContent,
      typing: false,
      showOptimizer: false, // 初始不显示优化组件
      optimizerData: {
        selectedDays: 1,
        selectedPerson: '',
        selectedTag: ''
      },
      isCurrent: false // 标记为已完成
    };

    scrollToBottom();
    setTimeout(() => {
      console.log('rowIndex:', rowIndex);
      console.log('charIndex:', charIndex);

      if (charIndex < processedContent[rowIndex].content.length - 1) {
        startTypingEffect(processedContent, rowIndex, charIndex + 1)
      } else {
        startTypingEffect(processedContent, rowIndex + 1, 0)
      }
    }, 30);
  } else {
    chatMessageList[lastIndex] = {
      ...chatMessageList[lastIndex],
      showOptimizer: true, // 初始不显示优化组件
      isCurrent: true // 标记为已完成
    }
  }
};


/**
 * 处理响应数据，提取workflow_finished事件的answer字段
 * @param {Object} response - API响应对象
 * @returns {Array} 结构化消息数组
 */
const processResponseData = (answer) => {
  try {
    // 解析answer字段
    const parsedData = JSON.parse(answer);

    // 计算思考时间(秒)
    const lastIndex = chatMessageList.length - 1;

    // 处理markdown格式内容
    const processedData = parsedData.map(item => {
      if (item.type === 'text') {
        // 简单markdown处理
        let content = item.content
          .replace(/^####\s+(.*)$/gm, '<h4 class="markdown-title markdown-h4">$1</h4>') // 处理####标题
          .replace(/^###\s+(.*)$/gm, '<h3 class="markdown-title markdown-h3">$1</h3>') // 处理###标题
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 加粗
          .replace(/\*(.*?)\*/g, '<em>$1</em>') // 斜体
          .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>') // 链接
          .replace(/<ask>(.*?)<\/ask>/g, '<span class="ask-tag" @click="handleAskTagClick(\'$1\')">$1</span>') // 保留ask标签并添加点击事件
          .replace(/^(-{3,}|-)$/gm, '<div class="divider"></div>') // 将单独的---或-转换为分隔线
          .replace(/\n/g, '<br>'); // 换行

        // 保留特殊标签内容
        content = content.replace(/<(script|style)(.*?)>(.*?)<\/\1>/gis, (match, tag, attrs, inner) => {
          return `<${tag}${attrs}>${inner}</${tag}>`;
        });

        return {
          ...item,
          content
        };
      }
      return item;
    });

    // 处理ask类型的内容
    const askRegex = /\{"type":"ask".*?\}/g;
    const finalProcessedData = [...processedData];

    // 遍历处理后的数据，查找并处理ask内容
    processedData.forEach(item => {
      if (item.type === 'text' && item.content) {
        const askMatches = item.content.match(askRegex);
        if (askMatches) {
          // 从原内容中删除ask内容
          item.content = item.content.replace(askRegex, '');

          // 将ask内容解析后添加到结果中
          askMatches.forEach(match => {
            try {
              // 去除所有换行符和<br>标签
              const cleanedMatch = match.replace(/[\n\r]+/g, '').replace(/<br\s*\/?>/gi, '');
              const askObj = JSON.parse(cleanedMatch);
              finalProcessedData.push({
                ...askObj,
                type: 'ask' // 确保类型正确
              });
            } catch (e) {
              console.error('解析ask内容失败:', e);
            }
          });
        }
      }
    });

    return finalProcessedData;
  } catch (error) {
    console.error('处理响应数据出错:', error);
    return [{
      type: 'text',
      content: `处理响应数据时出错: ${error.message}`
    }];
  }
}

const sendAiRequest = async (userInput) => {
  const requestData = {
    conversation_id: '',
    inputs: {
      original_intention: '',
      recommended_plan: ''
    },
    query: userInput,
    webMode: 'MAPP-小程序'
  };

  const res = await StreamRequest(`/front/ai/chat/chatMessage-stream-flux`, requestData, 'POST', handleGetBuffer);
  console.log("结束！！！！！", res);

}


/**
 * 处理响应数据，提取workflow_finished事件的answer字段
 * @param {Object} response - API响应对象
 * @returns {Array} 结构化消息数组
 */
// function processResponseData(response) {
//   try {
//     // 解析SSE格式数据
//     const chunks = typeof response.data === 'string' ?
//       response.data.split('data:').filter(chunk => chunk.trim()) : [];

//     // 查找workflow_finished事件
//     const workflowEvent = chunks.find(chunk => {
//       try {
//         const data = JSON.parse(chunk.trim());
//         return data.event === 'workflow_finished';
//       } catch (e) {
//         return false;
//       }
//     });

//     if (!workflowEvent) {
//       throw new Error('未找到workflow_finished事件');
//     }

//     const eventData = JSON.parse(workflowEvent.trim());
//     const answer = eventData.data?.outputs?.answer;

//     if (!answer) {
//       throw new Error('answer字段不存在');
//     }

//     // 解析answer字段
//     const parsedData = JSON.parse(answer);

//     // 计算思考时间(秒)
//     const lastIndex = chatMessageList.length - 1;
//     const thinkTime = lastIndex >= 0
//       ? Math.floor((Date.now() - chatMessageList[lastIndex].startTime) / 1000)
//       : 0;

//     // 处理markdown格式内容
//     const processedData = parsedData.map(item => {
//       if (item.type === 'text') {
//         // 简单markdown处理
//         let content = item.content
//           .replace(/^####\s+(.*)$/gm, '<h4 class="markdown-title markdown-h4">$1</h4>') // 处理####标题
//           .replace(/^###\s+(.*)$/gm, '<h3 class="markdown-title markdown-h3">$1</h3>') // 处理###标题
//           .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 加粗
//           .replace(/\*(.*?)\*/g, '<em>$1</em>') // 斜体
//           .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>') // 链接
//           .replace(/<ask>(.*?)<\/ask>/g, '<span class="ask-tag" @click="handleAskTagClick(\'$1\')">$1</span>') // 保留ask标签并添加点击事件
//           .replace(/^(-{3,}|-)$/gm, '<div class="divider"></div>') // 将单独的---或-转换为分隔线
//           .replace(/\n/g, '<br>'); // 换行

//         // 保留特殊标签内容
//         content = content.replace(/<(script|style)(.*?)>(.*?)<\/\1>/gis, (match, tag, attrs, inner) => {
//           return `<${tag}${attrs}>${inner}</${tag}>`;
//         });

//         return {
//           ...item,
//           content
//         };
//       }
//       return item;
//     });

//     // 将思考时间添加到回复开头
//     if (processedData.length > 0 && processedData[0].type === 'text') {
//       processedData[0].content = `已思考${thinkTime}s<br>${processedData[0].content}`;
//     } else {
//       processedData.unshift({
//         type: 'text',
//         content: `已思考${thinkTime}s`
//       });
//     }

//     // 处理ask类型的内容
//     const askRegex = /\{"type":"ask".*?\}/g;
//     const finalProcessedData = [...processedData];

//     // 遍历处理后的数据，查找并处理ask内容
//     processedData.forEach(item => {
//       if (item.type === 'text' && item.content) {
//         const askMatches = item.content.match(askRegex);
//         if (askMatches) {
//           // 从原内容中删除ask内容
//           item.content = item.content.replace(askRegex, '');

//           // 将ask内容解析后添加到结果中
//           askMatches.forEach(match => {
//             try {
//               // 去除所有换行符和<br>标签
//               const cleanedMatch = match.replace(/[\n\r]+/g, '').replace(/<br\s*\/?>/gi, '');
//               const askObj = JSON.parse(cleanedMatch);
//               finalProcessedData.push({
//                 ...askObj,
//                 type: 'ask' // 确保类型正确
//               });
//             } catch (e) {
//               console.error('解析ask内容失败:', e);
//             }
//           });
//         }
//       }
//     });

//     return finalProcessedData;
//   } catch (error) {
//     console.error('处理响应数据出错:', error);
//     return [{
//       type: 'text',
//       content: `处理响应数据时出错: ${error.message}`
//     }];
//   }
// }


// 思考动画效果
const startThinkingAnimation = () => {
  let count = 0;
  let seconds = 0;
  const startTime = Date.now();

  const animation = setInterval(() => {
    count = (count + 1) % 4;
    seconds = Math.floor((Date.now() - startTime) / 1000);
    dots.value = '.'.repeat(count);

    // 如果思考状态结束，清除动画
    const lastIndex = chatMessageList.length - 1;
    if (lastIndex >= 0 && !chatMessageList[lastIndex].thinking) {
      clearInterval(animation);
    }
  }, 500);
};

const handleTipsClick = (text) => {
  console.log(`功能按钮点击: ${text}`);
  // 为特定按钮设置消息内容并发送
  if (['海岛体验', '浮潜探索', '亲子旅游', '休闲畅游', '海岛介绍'].includes(text)) {
    message.value = text; // 填充输入框
    sendMessage(); // 发送消息
  }
};

const handleItemClick = (item) => {
  console.log(`跳转到类型: ${item.type}, ID: ${item.id}`);
  switch (item.type) {
    case 'Transport':  // 交通
      uni.navigateTo({ url: `/pages/transportationGuide/transportationGuide?id=${item.id}` });
      break;
    case 'Accommodation':  // 住宿
      uni.navigateTo({ url: `/pages/hotelDetail/hotelDetail?id=${item.id}` });
      break;
    case 'Activity':  // 活动
      uni.navigateTo({ url: `/pages/activity/activity?id=${item.id}` });
      break;
    case 'Attraction':  // 景点
      uni.navigateTo({ url: `/pages/attractionDetail/attractionDetail?id=${item.id}` });
      break;
    case 'Restaurant':  // 餐饮
      uni.navigateTo({ url: `/pages/foodDetails/foodDetails?id=${item.id}` });
      break;
    default:
      console.warn('未知的类型:', item.type);
  }
};

const handleAskClick = (askObj) => {
  console.log('点击了ask选项:', askObj);
  // 这里可以添加更多处理逻辑，比如发送对应的问题
  message.value = askObj.content;
  sendMessage();
};


// 打字机效果
// const startTypingEffect = () => {
//   isTyping.value = true;
//   currentIndex = 0;
//   const replyContent = FIXED_REPLY.split(''); // 拆分成字符数组
//   const lastMessageIndex = chatMessageList.length - 1;

//   // 逐个字符显示
//   const timer = setInterval(() => {
//     if (currentIndex < replyContent.length) {
//       // 更新最后一条消息的内容
//       chatMessageList[lastMessageIndex].content = replyContent.slice(0, currentIndex + 1).join('').replace(/\n/g, '<br>');
//       currentIndex++;
//       // 每次更新内容后滚动到底部
//       scrollToBottom();
//     } else {
//       isTyping.value = false;
//       clearInterval(timer);
//       // 完成打字后显示优化组件并滚动
//       const lastIndex = chatMessageList.length - 1;
//       if (lastIndex >= 0) {
//         chatMessageList[lastIndex].showOptimizer = true;
//       }
//       scrollToBottom();
//     }
//   }, 50); // 控制打字速度（50ms/字符）
// };

// 监听消息列表变化
watch(chatMessageList, () => {
  scrollToBottom();
}, { deep: true });

onMounted(() => {
  // 初始化时不显示多余空白
  chatMessageList = [];
});

</script>

<style lang="scss">
page {
  background-color: #f8f8f8;
}
.ai-container {
  width: 100%;
  height: 100%;
}

// 缺省页
.ai-nochat-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 50px;

  // 缺省页头部
  .ai-nochat-header {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 150rpx;

    image {
      width: 200rpx;
      height: 200rpx;
    }

    // 缺省页标题
    .ai-nochat-header-title {
      display: flex;
      align-items: center;
      font-size: $fs-huge;
      font-weight: bold;
      color: #333;
    }

    // 缺省页slogan
    .ai-nochat-header-desc {
      font-size: $fs-base;
      color: #666;
      margin-top: 10rpx;
    }
  }

  // 快捷提示词
  .tips-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20rpx;

    // 提示词标题
    .tips-item {
      display: flex;
      align-items: center;
      gap: 20rpx;
      background-color: #fff;
      box-shadow: $app-shadow;
      border-radius: 25rpx;
      width: 550rpx;
      padding: 20rpx;

      image {
        width: 80rpx;
        height: 80rpx;
      }

      // 文字部分
      &-text {
        display: flex;
        flex-direction: column;

        // 标题
        &-title {
          font-size: $fs-large;
          font-weight: bold;
          color: #333;
        }

        // 内容
        &-content {
          font-size: $fs-base;
          color: #666;
        }
      }

      &:active {
        background-color: #fcfcfc;
      }
    }
  }
}

.input-wrapper {
  position: fixed;
  bottom: 180rpx;
  left: 0;
  right: 0;
  padding: 20rpx;
  padding-top: 10rpx;
  background-color: #fff;
  box-shadow: 0 -3px 9px #eee;
  border-radius: 50rpx;
  z-index: 10;
  width: 650rpx;
  min-height: 100rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  overflow: hidden;

  .uv-textarea {
    width: calc(100% - 20rpx);
    min-height: 1rem;
    max-height: 600rpx;
    overflow-y: scroll;
    background-color: #f5f5f5;
    padding: 20rpx 40rpx;
    border: none;
    font-size: $fs-small;
    color: #333;

    textarea {
      text-align: justify;
    }
  }

  :deep(.uv-border) {
    border: none !important;
    border-width: 0;
    border-color: transparent;
  }

  .input-btn-wrapper {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .uv-button-wrapper {
      .uv-button--mini {
        width: 75rpx !important;
        min-width: 75rpx !important;
        height: 50rpx;

        .uv-icon {
          margin-left: 4rpx;
        }
      }
    }
  }
}

.chat-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  margin-top: 150rpx;
  padding: 25rpx;
  font-size: $fs-base;
  color: #333;

  .user-message {
    width: max-content;
    max-width: 550rpx;
    margin-left: auto;
    background-color: #fff;
    padding: 20rpx 40rpx;
    padding-right: 20rpx;
    border-radius: 50rpx;
    border-top-right-radius: 0;
    box-shadow: $app-shadow;
  }
}
</style>








<style lang="scss">
/* 行程优化组件样式 */
// .trip-optimizer {
//   background-color: #fff;
//   border-radius: 12px;
//   margin: 10px 0 0 0;
//   padding: 15px;
//   border: 1px solid rgba(0, 0, 0, 0.05);
//   width: 85%;
//   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
// }

// .optimizer-header {
//   margin-bottom: 15px;
// }

// .optimizer-title {
//   font-size: 18px;
//   font-weight: bold;
//   display: block;
//   margin-bottom: 5px;
// }

// .optimizer-subtitle {
//   font-size: 14px;
//   color: #888;
// }

// .section-title {
//   font-size: 16px;
//   font-weight: bold;
//   margin: 15px 0 10px;
//   display: block;
// }

// .option-group {
//   margin-bottom: 15px;
// }

// .option-label {
//   font-size: 14px;
//   color: #666;
//   margin-bottom: 8px;
//   display: block;
// }

// .option-buttons,
// .preference-tags {
//   display: flex;
//   flex-wrap: wrap;
//   gap: 8px;
// }

// .day-btn,
// .person-btn,
// .tag-btn {
//   background-color: #f5f5f5;
//   border: 1px solid #eee;
//   border-radius: 15px;
//   padding: 6px 12px;
//   font-size: 13px;
//   color: #333;
// }

// .day-btn.active,
// .person-btn.active,
// .tag-btn.active {
//   background-color: #e5f5ff;
//   color: #4285f4;
//   border-color: #4285f4;
//   box-shadow: 0 2px 4px rgba(66, 133, 244, 0.2);
//   transform: translateY(-1px);
// }

// .day-btn,
// .person-btn,
// .tag-btn {
//   transition: all 0.2s ease;
//   cursor: pointer;
// }

// .day-btn:active,
// .person-btn:active,
// .tag-btn:active {
//   transform: translateY(1px);
// }

// .optimizer-actions {
//   margin-top: 20px;
//   display: flex;
//   flex-direction: column;
//   gap: 10px;
// }

// .confirm-btn {
//   background-color: #ff4d4f;
//   color: white;
//   border: none;
//   border-radius: 20px;
//   padding: 12px;
//   font-size: 15px;
//   font-weight: bold;
//   width: 100%;
//   margin-bottom: 10px;
//   box-shadow: 0 2px 4px rgba(255, 77, 79, 0.2);
// }

// .optimize-btn {
//   background-color: white;
//   color: #4285f4;
//   border: 1px solid #4285f4;
//   border-radius: 20px;
//   padding: 12px;
//   font-size: 15px;
//   width: 100%;
//   margin-bottom: 15px;
// }

// .action-buttons {
//   display: flex;
//   justify-content: space-around;
//   margin-top: 20px;
//   padding-top: 15px;
//   border-top: 1px solid #eee;
// }

// .action-btn {
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   background: none;
//   border: none;
//   color: #666;
//   font-size: 12px;
//   padding: 8px;
//   border-radius: 50%;
//   transition: background-color 0.2s;
// }

// .action-btn:hover {
//   background-color: #f5f5f5;
// }

// .icon {
//   font-size: 24px;
//   margin-bottom: 5px;
//   display: block;
// }

// .like-icon {
//   color: #4CAF50;
// }

// .dislike-icon {
//   color: #F44336;
// }


// /* 新增样式 */
// .ai-response-content {
//   word-wrap: break-word;
// }

// .clickable-item,
// .clickable-ask {
//   color: #4285f4;
//   text-decoration: underline;
//   text-decoration-color: #4285f4;
//   cursor: pointer;
//   margin: 0 2px;
//   padding-bottom: 1px;
//   border-bottom: 1px solid #4285f4;
// }

// .message-text {
//   display: block;
//   margin: 5px 0;
//   white-space: pre-wrap;
//   word-break: break-word;
//   width: 100%;
// }

// /* Markdown标题样式 */
// .markdown-title {
//   color: #333;
//   line-height: 1.5;
//   font-weight: 600;
// }

// .markdown-h4 {
//   font-size: 16px;
//   margin: 15px 0 8px;
//   padding-bottom: 4px;
//   border-bottom: 1px solid #f0f0f0;
// }

// .markdown-h3 {
//   font-size: 18px;
//   margin: 20px 0 12px;
//   padding-bottom: 6px;
//   border-bottom: 2px solid #f0f0f0;
// }

// /* 深色模式适配 */
// .dark .markdown-title {
//   color: #eee;
// }

// .dark .markdown-h4,
// .dark .markdown-h3 {
//   border-bottom-color: #444;
// }

// /* 分隔线样式 */
// .divider {
//   height: 1px;
//   background-color: #e0e0e0;
//   margin: 12px 0;
//   width: 100%;
//   border: none;
// }

// .container {
//   min-height: 100vh;
//   background-color: rgba(241, 252, 254);
//   display: flex;
//   flex-direction: column;
//   position: relative;
// }

// .header {
//   padding: 20px;
//   background-color: rgba(241, 252, 254);
//   z-index: 10;
// }

// .header-top {
//   display: flex;
//   align-items: center;
//   gap: 10px;
//   margin-bottom: 15px;
// }

// .header-top image {
//   width: 100px;
//   height: 15px;
//   transform: scaleX(-1);
//   transition: all 0.3s ease;
// }

// .app-title {
//   font-size: 20px;
//   font-weight: bold;
//   color: #333;
// }

// .header-center {
//   background-color: #fff;
//   border-radius: 15px;
//   padding: 15px;
//   font-size: 14px;
//   margin-bottom: 15px;
// }

// .header-center-text {
//   margin-bottom: 12px;
// }

// .header-center-function {
//   display: flex;
//   align-items: center;
//   flex-direction: row;
//   justify-content: space-between;
//   padding: 10px;
//   width: 100%;
// }

// .function-item {
//   display: flex;
//   align-items: center;
//   flex-direction: column;
//   padding: 0px;
// }

// .function-item image {
//   width: 30px;
//   height: 30px;
// }

// .function-item text {
//   margin-top: 15px;
//   font-size: 12px;
//   width: 50px;
//   color: #333;
// }

// .header-bottom {
//   padding: 10px;
// }

// .header-span {
//   background-color: #fff;
//   border-radius: 10px;
//   padding: 10px 15px;
//   width: auto;
//   /* 自动宽度 */
//   min-width: 200px;
//   /* 最小宽度确保文字完整显示 */
//   border: none;
//   white-space: nowrap;
//   display: inline-block;
//   /* 行内块元素 */
// }

// .scroll-container {
//   flex: 1;
//   overflow-y: auto;
//   padding: 0 20px;
//   padding-bottom: 150px;
//   /* 增加底部内边距，确保内容不被遮挡 */
//   margin-bottom: 0;
//   height: calc(100vh - 350px);
//   /* 设置固定高度，减去header和bottom的高度 */
// }

// .chat-container {
//   width: 100%;
//   min-height: 100%;
//   padding-bottom: 20px;
//   /* 添加一些底部间距 */
// }

// /* 聊天内容部分 */
// .message-item {
//   margin: 15px 0;
//   position: relative;
//   /* 确保消息定位正确 */
// }

// .user-message {
//   display: flex;
//   justify-content: flex-end;
// }

// .ai-message {
//   display: block;
//   margin-bottom: 10px;
// }

// .message-content,
// .typing-content {
//   max-width: 70%;
//   padding: 12px 18px;
//   border-radius: 20px;
//   line-height: 1.6;
// }

// .user-message .message-content {
//   background-color: #4285f4;
//   color: white;
//   align-self: flex-end;
// }

// .ai-message .typing-content {
//   background-color: #e5f5ff;
//   color: #333;
//   position: relative;
//   padding: 12px 18px;
//   border-radius: 12px;
//   margin-bottom: 0;
//   width: 100%;
//   max-width: 85%;
// }

// .thinking-animation {
//   color: #666;
//   font-size: 14px;
// }

// .dots {
//   display: inline-block;
//   width: 1em;
//   text-align: left;
// }

// /* 打字机光标效果 */
// .typing-content::after {
//   display: none;
//   /* 隐藏光标 */
// }

// .typing .typing-content::after {
//   display: none;
//   /* 隐藏光标 */
// }

// /* 底输入框 */
// .bottom {
//   position: fixed;
//   bottom: 90px;
//   left: 0;
//   right: 0;
//   padding: 10px 20px;
//   background-color: rgba(241, 252, 254);
//   z-index: 100;
//   box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
//   /* 添加轻微阴影 */
// }

// .voiceMessage {
//   display: flex;
//   align-items: center;
//   flex-direction: row;
//   gap: 10px;
// }

// .voice-icon {
//   width: 40px;
//   height: 40px;
//   cursor: pointer;
//   transition: transform 0.2s ease;
// }

// .voice-icon:hover {
//   transform: scale(1.1);
// }

// .input-container {
//   display: flex;
//   align-items: center;
//   border: 1.7px solid rgba(97, 209, 255);
//   padding: 5px 15px;
//   border-radius: 20px;
//   flex: 1;
// }

// .input-container input {
//   flex: 1;
//   border: none;
//   outline: none;
//   background: transparent;
//   font-size: 14px;
// }

// .send-icon {
//   width: 35px;
//   height: 35px;
//   cursor: pointer;
//   transition: transform 0.2s ease;
// }

// .send-icon:hover {
//   transform: scale(1.1);
// }

// /* 表格样式 */
// .expense-table {
//   width: 100%;
//   border-collapse: collapse;
//   margin: 15px 0;
//   font-size: 14px;
//   border: 2px solid #333;
//   /* 加粗外边框 */
//   border-spacing: 0;
// }

// .expense-table caption {
//   text-align: left;
//   font-weight: bold;
//   font-size: 15px;
//   margin-bottom: 8px;
//   color: #333;
// }

// .expense-table th,
// .expense-table td {
//   padding: 12px 15px;
//   text-align: left;
//   border: 1px solid #333;
//   /* 加深格子线颜色 */
// }

// .expense-table th {
//   background-color: #f5f7fa;
//   font-weight: 600;
//   color: #333;
// }

// .expense-table tr:last-child td {
//   font-weight: bold;
//   background-color: #f9f9f9;
// }</style>