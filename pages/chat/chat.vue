<template>
	<view class="container">
		<div class="scroll-container">
			<view class="header">
			<view class="header-top">
				<image src="https://wlmtsys.obs.cn-south-1.myhuaweicloud.com/post/wlmtsys17170461054774894891ai顶部.png" mode="widthFix" class="logo"></image>
			</view>
			<view class="header-center">
				<p class="header-center-text">欢迎使用AI旅游助手!我可以帮您规划完美的海岛之旅。您可以选择以下热门选项，或直接告诉我您的需求。</p>
				<div class="header-center-function">
					<div class="function-item"  v-for="item in headerCenterFunction" :key="item.icon">
						<image :src="item.icon" mode="widthFix"></image>
						<text>{{item.text}}</text>
					</div>
				</div>
			</view>
			<view class="header-bottom">
				<div class="header-span">东澳岛2天行程</div>
			</view>
		</view>

		<view class="chat-container">
      <!-- 历史消息展示 -->
      <view 
        v-for="(msg, index) in chatMessages" 
        :key="index" 
        class="message-item"
      >
        <!-- 用户消息 -->
        <view v-if="msg.type === 'user'" class="user-message">
          <div class="message-content">{{ msg.content }}</div>
        </view>
        <!-- AI回复消息 -->
        <view v-else class="ai-message">
          <div 
            class="typing-content"
            :class="{ typing: isTyping && index === chatMessages.length - 1 }"
          >
            <!-- 打字机效果内容 -->
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
let isTyping = ref(false); // 打字机状态
let currentIndex = 0; // 当前打字位置

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
const sendMessage = () => {
  if (!message.value.trim()) return;
  
  // 添加用户消息
  chatMessages.value.push({ type: 'user', content: message.value });
  message.value = ''; // 清空输入框
  
  // 滚动到底部
  scrollToBottom();
  
  // 添加AI消息（初始为空）
  chatMessages.value.push({ type: 'ai', content: '' });
  
  // 1秒后开始打字机回复
  setTimeout(() => {
    startTypingEffect();
  }, 1000);
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
	padding: 20px;
	padding-bottom: 160px; /* Add padding to account for bottom bar and input */
	display: flex;
	flex-direction: column;
}

.scroll-container {
	flex: 1;
	overflow-y: auto;
	margin-bottom: 20px;
}

.chat-container {
	flex: 1;
	overflow-y: visible;
	margin-bottom: 20px;
}

.header {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	border-radius: 10px;
}
.header-top{
	width: 100%;
}
.header-top image{
	width: 150px;
	height: 20px;
}
.header-center{
	background-color: #fff;
	border-radius: 15px;
	padding: 15px;
	font-size: 14px;
}
.header-center-text{
	margin-bottom: 12px;
}
.header-center-function{
	display: flex;
	align-items: center;
	flex-direction: row;	
	justify-content: space-between;
	border-radius: 10px;
	padding: 10px;
	width: 100%;
	margin: 0%;
}
.function-item{
	display: flex;
	align-items: center;
	flex-direction: column;	
	border-radius: 10px;
	padding: 0px;
}
.function-item image{
	width: 30px;
	height: 30px;
}
.function-item text{
	margin-top: 15px;
	font-size: 12px;
	width: 50px;
	color: #333;
}
.header-bottom{
	margin-top: 5px;
	padding: 10px;
}
.header-span{
	background-color: #fff;
	border-radius: 10px;
	padding: 10px;
	width: 50%;
	border: none;
}


/* 聊天内容部分 */
.message-item {
  margin: 15px 0;
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
	border-radius: 10px;
	width: 90%;
	position: fixed;
	bottom: 83px;
	left: 50%;
	transform: translateX(-50%);
	background-color: rgba(241, 252, 254); /* Add semi-transparent background */
	padding: 10px;
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