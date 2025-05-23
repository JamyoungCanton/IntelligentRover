<template>
	<view class="container">
		<!-- 将header移到滚动容器外部 -->
		<view class="header">
			<view class="header-top">
				<image src="https://wlmtsys.obs.cn-south-1.myhuaweicloud.com/post/wlmtsys17170461054774894891ai顶部.png" mode="widthFix" class="logo"></image>
			</view>
			<view class="header-center">
				<p class="header-center-text">欢迎使用AI旅游助手!我可以帮您规划完美的海岛之旅。您可以选择以下热门选项，或直接告诉我您的需求。</p>
				<div class="header-center-function">
					<div class="function-item" v-for="item in headerCenterFunction" :key="item.icon">
						<image :src="item.icon" mode="widthFix"></image>
						<text>{{item.text}}</text>
					</div>
				</div>
			</view>
			<view class="header-bottom">
				<div class="header-span">东澳岛2天行程</div>
			</view>
		</view>

		<!-- 聊天内容滚动区域 -->
		<div class="scroll-container">
			<view class="chat-container">
				<view v-for="(msg, index) in chatMessages" :key="index" class="message-item">
					<view v-if="msg.type === 'user'" class="user-message">
						<div class="message-content">{{ msg.content }}</div>
					</view>
					<view v-else class="ai-message">
						<div class="typing-content" :class="{ typing: isTyping && index === chatMessages.length - 1 }">
							<span v-html="msg.content"></span>
						</div>
					</view>
				</view>
			</view>
		</div>

		<div class="bottom">
			<div class="voiceMessage">
				<img class="voice-icon" src="/static/chat/ai图标-语音输入.svg" alt="语音输入">
				<div class="input-container">
					<input type="text" placeholder="请输入旅游目的地或旅游问题" v-model="message" @keyup.enter="sendMessage" />
					<img class="send-icon" @click="sendMessage" src="/static/chat/ai图标-发送.svg" alt="发送">
				</div>
			</div>
		</div>
		<Tabbar />
	</view>
</template>

<script setup >
import Tabbar from '../Tabbar/Tabbar.vue';
import { ref, reactive, nextTick, onMounted, watch } from 'vue';
import {useUserStore} from '@/store/modules/user';

// 固定回复内容
const FIXED_REPLY = "现在的样式更加现代化，交互体验更好，而且代码更容易维护。图标大小现在是通过 CSS 类来控制的，如果需要调整大小，只需要修改对应的 CSS 类即可。你可以刷新页面查看效果。如果你想调整任何具体的样式（比如图标大小、颜色、间距等），请告诉我，我可以进一步帮你调整。";

const headerCenterFunction = [
  { icon: '/static/chat/ai图标-海钓体验.svg', text: '海岛体验' },
  { icon: '/static/chat/ai图标-浮潜探索.svg', text: '浮潜探索' },
  { icon: '/static/chat/ai图标-亲子娱乐.svg', text: '亲子旅游' },
  { icon: '/static/chat/ai图标-休闲畅游.svg', text: '休闲畅游' },
  { icon: '/static/chat/ai图标-海岛介绍.svg', text: '海岛介绍' }
];

const message = ref('');
const chatMessages = ref([]);
let isTyping = ref(false);
let currentIndex = 0;
const userStore = useUserStore();

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
  chatMessages.value.push({ type: 'user', content: message.value });
  const userInput = message.value;
  message.value = ''; // 清空输入框
  
  // 添加AI消息（初始为空）
  chatMessages.value.push({ type: 'ai', content: [], id: Date.now(), thinking: false, typing: true });
  
  // 发送AI请求
  await sendAiRequest(userInput);
};

// 发送ai请求
const sendAiRequest = async (userInput) => {
  try {
    const token = userStore.token; // 从store获取token
    console.log('发送请求，token:', token);
    console.log('发送的消息:', userInput);

    const requestData = {
      conversation_id: '',
      inputs: {
        original_intention: '',
        recommended_plan: ''
      },
      query: userInput,
      webMode: 'MAPP-小程序'
    };

    // 显示思考动画
    isTyping.value = true;

    try {
      const response = await uni.request({
        url: 'https://island.zhangshuiyi.com/island/front/ai/chat/chatMessage-stream-flux',
        method: 'POST',
        data: requestData,
        header: {
          'X-Access-Token': token,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        }
      });

      console.log('API响应:', response);

      if (response.data && response.statusCode === 200) {
        console.log('响应数据:', response.data);
        
        // 处理流式响应数据
        const responseText = response.data;
        const chunks = responseText.split('data:').filter(chunk => chunk.trim());
        
        let finalAnswer = null;
        
        // 查找最终答案
        for (const chunk of chunks) {
          try {
            const jsonData = JSON.parse(chunk);
            if (jsonData.event === 'workflow_finished' && jsonData.data?.outputs?.answer) {
              try {
                finalAnswer = JSON.parse(jsonData.data.outputs.answer);
                break;
              } catch (e) {
                console.error('解析最终答案失败:', e);
              }
            }
          } catch (e) {
            console.error('解析数据块失败:', e);
            continue;
          }
        }

        if (finalAnswer && Array.isArray(finalAnswer)) {
          // 处理最终答案
          const safeAnswer = finalAnswer.map(item => {
            if (!item) return { type: 'text', content: '' };
            
            // 特别处理表格类型数据
            if (item.type === 'table') {
              return {
                type: item.type,
                id: item.id || '',
                content: Array.isArray(item.content) ? item.content : []
              };
            }
            
            // 处理其他类型的内容
            return {
              type: item.type || 'text',
              id: item.id || '',
              content: typeof item.content === 'string' ? item.content : String(item.content || '')
            };
          }).filter(item => item.content);

          // 更新消息内容
          chatMessages.value[chatMessages.value.length - 1].content = safeAnswer;
          chatMessages.value[chatMessages.value.length - 1].typing = false;
        } else {
          chatMessages.value[chatMessages.value.length - 1].content = [{
            type: 'text',
            content: '抱歉，我现在无法回答您的问题。'
          }];
        }
      } else {
        console.error('请求失败:', response.statusCode, response.data);
        chatMessages.value[chatMessages.value.length - 1].content = [{
          type: 'text',
          content: '抱歉，请求出错了，请稍后再试。'
        }];
      }
    } catch (error) {
      console.error('请求失败:', error);
      chatMessages.value[chatMessages.value.length - 1].content = [{
        type: 'text',
        content: '抱歉，网络请求失败，请稍后再试。'
      }];
    }

    // 结束打字动画
    isTyping.value = false;
    chatMessages.value[chatMessages.value.length - 1].typing = false;
    
    // 滚动到底部
    scrollToBottom();
  } catch (error) {
    console.error('AI请求出错：', error);
    chatMessages.value.push({ 
      type: 'ai', 
      content: [{
        type: 'text',
        content: '抱歉，发生了错误，请稍后再试。'
      }],
      typing: false 
    });
    scrollToBottom();
  }
};

// 打字机效果
const startTypingEffect = () => {
  isTyping.value = true;
  currentIndex = 0;
  const replyContent = FIXED_REPLY.split(''); // 拆分成字符数组
  const lastMessageIndex = chatMessages.value.length - 1;
  
  // 逐个字符显示
  const timer = setInterval(() => {
    if (currentIndex < replyContent.length) {
      // 更新最后一条消息的内容
      chatMessages.value[lastMessageIndex].content = replyContent.slice(0, currentIndex + 1).join('').replace(/\n/g, '<br>');
      currentIndex++;
      // 每次更新内容后滚动到底部
      scrollToBottom();
    } else {
      isTyping.value = false;
      clearInterval(timer);
      // 完成打字后最后滚动一次
      scrollToBottom();
    }
  }, 50); // 控制打字速度（50ms/字符）
};

// 监听消息列表变化
watch(chatMessages, () => {
  scrollToBottom();
}, { deep: true });

onMounted(() => {
  // 初始化时不显示多余空白
  chatMessages.value = [];
});

</script>

<style>
.container {
	min-height: 100vh;
	background-color: rgba(241, 252, 254);
	display: flex;
	flex-direction: column;
	position: relative;
}

.header {
	padding: 20px;
	background-color: rgba(241, 252, 254);
	z-index: 10;
}

.header-top {
	margin-bottom: 15px;
}

.header-top image {
	width: 150px;
	height: 20px;
	display: block;
}

.header-center {
	background-color: #fff;
	border-radius: 15px;
	padding: 15px;
	font-size: 14px;
	margin-bottom: 15px;
}

.header-center-text {
	margin-bottom: 12px;
}

.header-center-function {
	display: flex;
	align-items: center;
	flex-direction: row;	
	justify-content: space-between;
	padding: 10px;
	width: 100%;
}

.function-item {
	display: flex;
	align-items: center;
	flex-direction: column;	
	padding: 0px;
}

.function-item image {
	width: 30px;
	height: 30px;
}

.function-item text {
	margin-top: 15px;
	font-size: 12px;
	width: 50px;
	color: #333;
}

.header-bottom {
	padding: 10px;
}

.header-span {
	background-color: #fff;
	border-radius: 10px;
	padding: 10px;
	width: 50%;
	border: none;
}

.scroll-container {
	flex: 1;
	overflow-y: auto;
	padding: 0 20px;
	padding-bottom: 150px; /* 增加底部内边距，确保内容不被遮挡 */
	margin-bottom: 0;
	height: calc(100vh - 350px); /* 设置固定高度，减去header和bottom的高度 */
}

.chat-container {
	width: 100%;
	min-height: 100%;
	padding-bottom: 20px; /* 添加一些底部间距 */
}

/* 聊天内容部分 */
.message-item {
	margin: 15px 0;
	position: relative; /* 确保消息定位正确 */
}

.user-message {
	display: flex;
	justify-content: flex-end;
}

.ai-message {
	display: flex;
	justify-content: flex-start;
}

.message-content,
.typing-content {
	max-width: 70%;
	padding: 12px 18px;
	border-radius: 20px;
	line-height: 1.6;
}

.user-message .message-content {
	background-color: #4285f4;
	color: white;
	align-self: flex-end;
}

.ai-message .typing-content {
	background-color: #e5f5ff;
	color: #333;
	position: relative;
}

/* 打字机光标效果 */
.typing-content::after {
	display: none; /* 隐藏光标 */
}

.typing .typing-content::after {
	display: none; /* 隐藏光标 */
}

/* 底输入框 */
.bottom {
	position: fixed;
	bottom: 90px;
	left: 0;
	right: 0;
	padding: 10px 20px;
	background-color: rgba(241, 252, 254);
	z-index: 100;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05); /* 添加轻微阴影 */
}
.voiceMessage{
	display: flex;
	align-items: center;
	flex-direction: row;
	gap: 10px;
}
.voice-icon {
	width: 40px;
	height: 40px;
	cursor: pointer;
	transition: transform 0.2s ease;
}
.voice-icon:hover {
	transform: scale(1.1);
}
.input-container {
	display: flex;
	align-items: center;
	border: 1.7px solid rgba(97, 209, 255);
	padding: 5px 15px;
	border-radius: 20px;
	flex: 1;
}
.input-container input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 14px;
}
.send-icon {
	width: 35px;
	height: 35px;
	cursor: pointer;
	transition: transform 0.2s ease;
}
.send-icon:hover {
	transform: scale(1.1);
}
</style>