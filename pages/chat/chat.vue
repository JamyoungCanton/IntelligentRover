<template>
	<view class="container">
		<view class="header">
			<view class="header-top">
				<image src="https://wlmtsys.obs.cn-south-1.myhuaweicloud.com/post/wlmtsys17843786381807740873AI导游 (无字版).png" mode="widthFix" class="logo"></image>
				<image src="https://wlmtsys.obs.cn-south-1.myhuaweicloud.com/post/wlmtsys16333321491417963510智游侠文字.png" mode="widthFix" class="logo-title"></image>
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
		<div class="scroll-container" @scroll="handleScroll">
			<view class="chat-container">
				<view v-for="(msg, index) in chatMessages" :key="index" class="message-item">
					<view v-if="msg.type === 'user'" class="user-message">
						<div class="message-content">{{ msg.content }}</div>
					</view>
					<view v-else class="ai-message">
						<div class="typing-content" :class="{ typing: isTyping && index === chatMessages.length - 1 }">
							<span v-html="msg.content">
								
							</span>

						</div>
					</view>
				</view>
			</view>
		</div>

		<!-- 底部输入框 -->
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
import { ref, nextTick, onMounted, watch } from 'vue';
import {useUserStore} from '@/store/modules/user';
import * as TextEncoding from 'text-encoding-shim'


const headerCenterFunction = [
  { icon: '/static/chat/ai图标-海钓体验.svg', text: '海岛体验' },
  { icon: '/static/chat/ai图标-浮潜探索.svg', text: '浮潜探索' },
  { icon: '/static/chat/ai图标-亲子娱乐.svg', text: '亲子旅游' },
  { icon: '/static/chat/ai图标-休闲畅游.svg', text: '休闲畅游' },
  { icon: '/static/chat/ai图标-海岛介绍.svg', text: '海岛介绍' }
];

const message = ref('');
const chatMessages = ref([]);
let isTyping = ref(false);  //在 AI 处理请求期间标识加载状态
const userStore = useUserStore();
let currentScrollTop = 0

// 滚动到底部函数
const scrollToBottom = async () => {
  await nextTick();
  const query = uni.createSelectorQuery();
  query.select('.scroll-container').boundingClientRect(data => {
    if (data) {
      const newScrollTop = data.height;
      // 只有当新高度大于当前滚动位置时才更新
      if (newScrollTop > currentScrollTop) {
        uni.pageScrollTo({
          scrollTop: newScrollTop,
          duration: 300
        });
        currentScrollTop = newScrollTop;
      }
    }
  }).exec();
};

// 发送消息
const sendMessage = async () => {
  if (!message.value.trim()) return;
  // 添加用户消息
  chatMessages.value.push({ type: 'user', content: message.value });
  const userInput = message.value;
  message.value = '';
  // 添加AI消息（初始为空）
  chatMessages.value.push({ type: 'ai', content: [], id: Date.now(), thinking: false, typing: true });
  // 发送AI请求
  await sendAiRequest(userInput);
};



const messages = ref([]);
const buffer = ref('');
const decoder = new TextEncoding.TextDecoder('utf-8');
const requestTask = ref(null);


// 发送ai请求 ，调用接口
const sendAiRequest = (userInput) => {
  messages.value = [];
  const token = userStore.token;
  const requestData = {
    conversation_id: '',
    inputs: {
      original_intention: '',
      recommended_plan: ''
    },
    query: userInput,
    webMode: 'MAPP-小程序'
  };

  isTyping.value = true;

  requestTask.value = uni.request({
    url: 'https://island.zhangshuiyi.com/island/front/ai/chat/chatMessage-stream-flux      ',
    method: 'POST',
    header: {
      'X-Access-Token': token,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    },
    data: requestData,
    responseType: 'arraybuffer',
    enableChunked: true,
    timeout: 600000,
    success: () => {},
    fail: (err) => {
      console.error('请求失败：', err);
      isTyping.value = false;
    }
  });

  // 定义一个去重函数，发现接受到的数组中，会重复上一条
  const uniqueArray = (arr) => {
    const seen = new Set();
    return arr.filter(item => {
      const value = typeof item === 'string' ? item : JSON.stringify(item);
      if (!seen.has(value)) {
        seen.add(value);
        return true;
      }
      return false;
    });
  };


  if (requestTask.value && requestTask.value.onChunkReceived) {
  	  // 监听接收消息
  requestTask.value?.onChunkReceived((res) => {
    try {
      const arrayBuffer = new Uint8Array(res.data);
      const chunkStr = decoder.decode(arrayBuffer);
      buffer.value += chunkStr;
  
      let eventEndIndex;
      while ((eventEndIndex = buffer.value.indexOf('\n\n')) >= 0) {
        const eventData = buffer.value.slice(0, eventEndIndex);
        buffer.value = buffer.value.slice(eventEndIndex + 2);
  
        const parsed = parseSSEEvent(eventData);
        if (parsed?.data) {
          try {
            const json = JSON.parse(parsed.data);
			      console.log(json);
			
            if (json?.data?.content) {
              json.data.content = json.data.content.replace(/\n/g, '<br>');
            }
            
            // 渲染内容 只渲染了title和answer,后续可以加
            if (json.data && json.data.title) {
              messages.value.push(json.data.title);
            }
            if (json.data && json.data.outputs.answer) {
              messages.value.push(json.data.outputs.answer);
            }
			

          
            // 对 messages 数组进行去重
            let uniqueMessages = uniqueArray(messages.value);
            if (uniqueMessages.length > 0) {
              uniqueMessages.pop(); 
            }
  
            let allMessages = '';
            for (let i = 0; i < uniqueMessages.length; i++) {
              let itemStr;
              if (typeof uniqueMessages[i] === 'string') {
                itemStr = uniqueMessages[i];
              } else {
                try {
                  itemStr = JSON.stringify(uniqueMessages[i]);
                } catch (error) {
                  console.error('转换元素为字符串时出错:', error);
                  continue;
                }
              }
              // 去掉双引号
              itemStr = itemStr.replace(/^"|"$/g, ''); 
              // 追加处理后的字符串和换行符
              allMessages += itemStr + '\n';

              console.log("未处理替换标签前的 allMessages: ", allMessages);
              

              
              allMessages = allMessages.replace(/<\/details>/g, '');
              allMessages = allMessages.replace(/<ask>/g, '');
              allMessages = allMessages.replace(/<\/ask>/g, '');
              allMessages = allMessages.replace(/<details style="color:gray;background-color: #f8f8f8;padding: 8px;border-radius: 4px;" open>/g, '');
              allMessages = allMessages.replace(/<summary>/g, '');
              allMessages = allMessages.replace(/<\/summary>/g, '');
              allMessages= allMessages.replace(/<\/details>/g, '');
              allMessages = allMessages.replace(/<Activity>/g, '');
              allMessages = allMessages.replace(/<\/Activity>/g, '');
              allMessages = allMessages.replace(/<Attraction>/g, '');
              allMessages = allMessages.replace(/<\/Attraction>/g, '');     
              allMessages = allMessages.replace(/<Transport>/g, '');
              allMessages = allMessages.replace(/<\/Transport>/g, '');
              allMessages = allMessages.replace(/<Accommodation>/g, '');
              allMessages = allMessages.replace(/<\/Accommodation>/g, '');     
              allMessages = allMessages.replace(/<Restaurant>/g, '');
              allMessages = allMessages.replace(/<\/Restaurant>/g, '');
            }
            console.log('最后出来的字符串 allMessages: ', allMessages);
              
            if (chatMessages.value.length > 0) {
              chatMessages.value[chatMessages.value.length - 1].content = allMessages.replace(/\n/g, '<br>');
              startTypingEffect(allMessages.replace(/\n/g, '<br>'), chatMessages.value.length - 1);
            }
  
          } catch (e) {
          }
        }
      }
    } catch (err) {
      console.error('流数据解析失败：', err);
    }
  });

  requestTask.value.onAbort?.(() => {
    console.warn('连接中止');
    isTyping.value = false;
  });
  requestTask.value.onComplete?.(() => {
    isTyping.value = false;
  });
  }



};

// 解析SSE文本事件
function parseSSEEvent(rawData) {
  const lines = rawData.split('\n');
  const event = { data: '' };

  lines.forEach(line => {
    const index = line.indexOf(':');
    if (index > 0) {
      const field = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim();
      if (field === 'data') {
        event.data += value + '\n';
      } else {
        event[field] = value;
      }
    }
  });

  event.data = event.data.trimEnd();
  return event;
}
// 打印机效果
const startTypingEffect = (content, messageIndex) => {
  // 直接显示完整内容
  chatMessages.value[messageIndex].content = content;
  scrollToBottom();
};

// 监听消息列表变化
watch(chatMessages, () => {
  scrollToBottom();
}, { deep: true });


onMounted(() => {
  chatMessages.value = [];
});

// 滚动事件处理
const handleScroll = (e) => {
  currentScrollTop = e.detail.scrollTop;
};



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
	display: flex;
	flex-direction: row; 
	margin-bottom: 15px;
	align-items: center;
}

.header-top image {
	width: 70px;
	height: 20px;
	display: block;
}
.header-top .logo-title {
	width: 120px;
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
	bottom: 50px;
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
