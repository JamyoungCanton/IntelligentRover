<template>
  <view class="ai-container">
    <!-- 导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: (safeAreaInsets.top || statusBarHeight) + 'px' }">
      <view class="nav-back" @click="goBack">
        <uni-icons type="back" size="24" color="#333333"></uni-icons>
      </view>
      <text class="nav-title">AI智游侠</text>
      <view class="nav-right" style="width: 24px;"></view>
    </view>
    
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
        <!-- 用户对话框 -->
        <view v-if="msg.type === 'user'" class="user-message">
          <div class="message-content">{{ msg.content }}</div>
        </view>

        <!-- ai回复框 -->
        <view v-else class="ai-message">
          <view class="typing-content" :class="{ typing: isTyping && index === chatMessageList.length - 1 }">
            <template v-if="msg.content && msg.content.length > 0">
              <view class="ai-response-content">
                <template v-for="(item, i) in msg.content" :key="i + item.content">
                  <view v-if="item.type === 'text'" v-html="item.content" class="message-text"></view>
                  <view
                    v-else-if="['Activity', 'Attraction', 'Transport', 'Accommodation', 'Restaurant'].includes(item.type)"
                    class="clickable-item" @click="handleItemClick(item)">
                    <view class="icon">{{ iconMap[item.type] }}</view>
                    {{ item.content }}
                    <view class="more"><uv-icon name="arrow-right" size="12" color="#999"></uv-icon></view>
                  </view>
                  <view v-else-if="item.type === 'ask'" class="clickable-item" @click="handleAskClick(item)"
                    style="display: inline-block;">
                    {{ item.content }}
                  </view>
                  <view v-else v-html="item.content" class="message-text"></view>
                </template>
              </view>
            </template>

            <template v-else-if="msg.thinking">
              <view class="thinking-animation">
                <view class="time mb-20">({{ Math.floor((Date.now() - msg.startTime) / 1000) }}s)正在思考中{{ dots }}
                </view>

                <uv-steps :current="progressCurrent" active-color="#3c9cff" inactive-color="#999">
                  <uv-steps-item v-for="(step, index) in progressList" :title="step.title" :key="step.title"
                    :desc="step.time">
                    <template v-slot:icon>
                      <uv-icon v-if="progressCurrent > index" name="checkmark" color="#3c9cff"></uv-icon>
                      <uv-loading-icon v-else-if="progressCurrent == index"></uv-loading-icon>
                      <uv-icon v-else name="lock" color="#999"></uv-icon>
                    </template>
                  </uv-steps-item>
                </uv-steps>
              </view>
            </template>
            <view v-else v-html="msg.content"></view>
          </view>

          <!-- 行程是否有帮助 -->
          <view class="action-button-wrapper" v-if="msg.type === 'ai' && msg.showOptimizer">
            <view class="action-button" @click="handleLike('like')">
              <uv-icon :name="msg.isLike.value == 'like' ? 'thumb-up-fill' : 'thumb-up'"
                :color="msg.isLike.value == 'like' ? '#fc9e39' : msg.isLike.value == 'dislike' ? '#ccc' : '#666'"
                size="24"></uv-icon>
              <view class="mr-10"
                :style="{ 'color': msg.isLike.value == 'like' ? '#fc9e39' : msg.isLike.value == 'dislike' ? '#ccc' : '#666' }">
                有帮助
              </view>
            </view>
            <view class="action-button" @click="handleLike('dislike')">
              <uv-icon :name="msg.isLike.value == 'dislike' ? 'thumb-down-fill' : 'thumb-down'"
                :color="msg.isLike.value == 'dislike' ? '#f56c6c' : msg.isLike.value == 'like' ? '#ccc' : '#666'"
                size="24"></uv-icon>
              <view class="mr-10"
                :style="{ 'color': msg.isLike.value == 'dislike' ? '#f56c6c' : msg.isLike.value == 'like' ? '#ccc' : '#666' }">
                没帮助
              </view>
            </view>
          </view>
          <!-- 行程优化组件 -->
          <view class="trip-optimizer" v-if="msg.type === 'ai' && msg.showOptimizer">
            <view class="optimizer-header">
              <text class="optimizer-title">优化行程</text>
              <text class="optimizer-subtitle">您可以调整行程景点和行程偏好，对其进行优化</text>
            </view>

            <view class="option-group">
              <text class="option-label">出行天数</text>
              <view>
                <uv-slider v-model="selectedDays" min="1" max="5" step="1" show-value></uv-slider>
              </view>
            </view>
            <view class="option-group">
              <text class="option-label">同行人员</text>
              <view class="option-buttons">
                <uv-button v-for="person in personList" :key="person.name" style="width: max-content;"
                  :type="person.selected ? 'primary' : 'default'" plain @click="person.selected = !person.selected">
                  {{ person.name }}
                </uv-button>
              </view>
            </view>
            <view class="option-group">
              <text class="option-label">行程偏好</text>
              <view class="preference-tags">
                <uv-button v-for="tag in preferenceTagList" :key="tag.name" style="width: max-content;"
                  :type="tag.selected ? 'primary' : 'default'" plain @click="tag.selected = !tag.selected">
                  {{ tag.name }}
                </uv-button>
              </view>
            </view>

            <view class="confirm-button-wrapper">
              <uv-button color="linear-gradient(to right, #1976D2, #1565C0)" shape="circle"
                @click="optimizeTrip">优化行程规划</uv-button>
              <uv-button color="linear-gradient(to right, #FF9800, #F57C00)" shape="circle">一键下单</uv-button>
            </view>


          </view>
        </view>
      </template>
      <!-- 占位符 -->
      <view style="height: 300rpx;"></view>
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

    <Tabbar />
  </view>
</template>

<script setup>
// ------------------ import ------------------
import Tabbar from '../Tabbar/Tabbar.vue';
import { ref, reactive, nextTick, onMounted, watch } from 'vue';
import { StreamRequest } from '../../utils/request.js';
import { marked } from 'marked';
// ------------------- data -------------------

import { useUserStore } from '@/store/modules/user';
const userStore = useUserStore();

// 安全区域信息
const safeAreaInsets = ref({});
const statusBarHeight = ref(0);

// 返回上一页
const goBack = () => {
  uni.navigateBack({
    fail: () => {
      // 如果无法返回，则跳转到首页
      uni.switchTab({
        url: '/pages/index/index'
      });
    }
  });
};
const hasToken = () => {
  if (userStore.token === '') {
    // 提示未登录，请先登录
    uni.showToast({
      title: '未登录,请先登录',
      icon: 'false',
      duration: 2000
    })
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    }, 500);
  }
}

onMounted(() => { 
  hasToken();
  // 获取安全区域信息
  const windowInfo = uni.getWindowInfo();
  const deviceInfo = uni.getDeviceInfo();
  statusBarHeight.value = windowInfo.statusBarHeight || 0;
  safeAreaInsets.value = deviceInfo.safeAreaInsets || {};
})
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

// 图标对照表
const iconMap = reactive({
  'Activity': '📍',
  'Accommodation': '🏨',
  'Transport': '🚌',
  'Restaurant': '🍽️',
  'Attraction': '🏞️',
})

// 进度条位置
const progressCurrent = ref(0);
// 进度条列表
const progressList = reactive([
  { title: '意图解析', time: '' },
  { title: '查询数据', time: '' },
  { title: '整理资料', time: '' },
]);

const message = ref('');
let chatMessageList = reactive([]);
const responseData = ref([]);
const isTyping = ref(false);
const dots = ref('');
const selectedDays = ref(1);
const personList = reactive([{
  name: '6岁以下婴幼儿',
  selected: false
}, {
  name: '6-12岁儿童',
  selected: false
}, {
  name: '65岁以上老人',
  selected: false
}]);

const preferenceTagList = reactive([{
  name: '山水风光',
  selected: false
}, {
  name: '民族风情',
  selected: false
}, {
  name: '历史文化',
  selected: false
}, {
  name: '诗酒文化',
  selected: false
}, {
  name: '文旅活动',
  selected: false
}, {
  name: '户外极限',
  selected: false
}, {
  name: '科学探索',
  selected: false
}, {
  name: '疗愈精心',
  selected: false
}, {
  name: '夜游出行',
  selected: false
}]);

// ------------------- methods -------------------
// 优化行程规划
const optimizeTrip = () => {
  // 构建优化请求内容
  let optimizationRequest = '优化上述行程';

  // 添加出行天数
  if (selectedDays.value) {
    optimizationRequest += `，出行天数为${selectedDays.value}天`;
  }

  // 添加同行人员
  let selectedPersonList = personList.filter(item => item.selected).map(item => item.name).join('、');
  if (selectedPersonList) {
    optimizationRequest += `，同行人员有${selectedPersonList}`;
  }

  // 添加行程偏好
  let selectedTagList = preferenceTagList.filter(item => item.selected).map(item => item.name).join('、');
  if (selectedTagList) {
    optimizationRequest += `，行程偏好为${selectedTagList}`;
  }

  // 自动填充并发送优化请求
  message.value = optimizationRequest;
  sendMessage();

  // 重置选择状态
  selectedDays.value = 1;
};

// 点赞或点踩
const handleLike = (type) => {
  // 查看最后一条信息的点赞状态
  if (chatMessageList.length > 0) {
    const lastMessage = chatMessageList[chatMessageList.length - 1];
    if (type === 'like' && lastMessage.isLike.value != 'like') {
      uni.showToast({ title: '已点赞，谢谢你对智游侠的支持！', icon: 'none' });
      lastMessage.isLike.value = 'like';
    } else if (type === 'dislike' && lastMessage.isLike.value != 'dislike') {
      uni.showToast({ title: '已点踩，谢谢你的反馈，我们会继续优化进步！', icon: 'none' });
      lastMessage.isLike.value = 'dislike';
    } else {
      lastMessage.isLike.value = "";
    }
  }

};

// 滚动到底部函数
const scrollToBottom = () => {
  nextTick(() => {
    const query = uni.createSelectorQuery();
    query.select('.chat-list-wrapper').boundingClientRect(data => {
      if (data) {
        uni.pageScrollTo({
          scrollTop: data.height,
          duration: 1000
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

const finalChunk = ref("");

// 流式请求回调方法
const handleGetBuffer = (e) => {
  try {
    let chunk = JSON.parse(e);
    let title = chunk.data?.title;

    if (title == '用户意图解析') {
      progressCurrent.value = 1;
      // 取时分
      const date = new Date(chunk.data.created_at * 1000);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      progressList[0].time= `${hours}:${minutes}`;
    } if (title == '查询后台数据') {
      progressCurrent.value = 2;
      // 取时分
      const date = new Date(chunk.data.created_at * 1000);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      progressList[1].time = `${hours}:${minutes}`; // 将时分格式化为HH:mm
    }

    // 工作流结束
    if (chunk.event == "workflow_finished") {

      console.log("直接返回!!!!!!!!!!!!!!!!!!!!!!!!!", chunk.data.outputs.answer);
      finalChunk.value = chunk.data.outputs.answer;
      const processedContent = processResponseData(chunk.data.outputs.answer);
      console.log("处理后的内容", processedContent);

      if (chatMessageList.length > 0) {
        const lastIndex = chatMessageList.length - 1;
        chatMessageList[lastIndex] = {
          ...chatMessageList[lastIndex],
          content: reactive([]),
          typing: false,
          showOptimizer: ref(false), // 初始不显示优化组件
          isCurrent: ref(false), // 标记为已完成
          isLike: ref(""),
        };
        startTypingEffect(processedContent, 0, 0);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

// 打字机效果
const startTypingEffect = (processedContent, rowIndex, charIndex) => {
  const lastIndex = chatMessageList.length - 1;
  let messageList = chatMessageList[lastIndex].content;
  if (rowIndex <= processedContent.length - 1) {
    let lastStreamMessage = JSON.parse(JSON.stringify(processedContent[rowIndex])); // 深拷贝处理后内容
    lastStreamMessage.content = lastStreamMessage.content.slice(0, charIndex + 1);
    if (charIndex == 0) {
      let lsm = reactive(lastStreamMessage)
      messageList.push(lsm);
    } else {
      messageList[rowIndex].content = lastStreamMessage.content;
    }

    scrollToBottom();
    setTimeout(() => {
      if (charIndex < processedContent[rowIndex].content.length - 1) {
        startTypingEffect(processedContent, rowIndex, charIndex + 1)
      } else {
        startTypingEffect(processedContent, rowIndex + 1, 0)
      }
    }, 30);
  } else {
    console.log('完成');

    chatMessageList[lastIndex].showOptimizer.value = true; // 显示优化组件
    chatMessageList[lastIndex].isCurrent.value = true;  // 标记为已完成
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
    console.log('parsedData', parsedData);

    const processedData = parsedData.map(item => {
      // 处理表格 内容中有<table>
      if (item.type === 'text' && item.content.includes('<table')) {
        item.content = item.content
          .replace(/<table/g, '<table style="width:100%; border-collapse: collapse; border: 1px solid #ddd; border-top-left-radius: 8px; border-top-right-radius: 8px; overflow: hidden; margin: 20px 0; box-shadow: 0 3px 9px #eee;"')
          .replace(/<th/g, '<th style="border: 1px solid #ddd; padding: 15px 10px; text-align: left; background: #fff; font-size: 14px;"')
          .replace(/<td/g, '<td style="border: 1px solid #ddd; padding: 15px 10px; font-size: 14px; background: #fff; border-bottom: 1px solid #f0f0f0;"');
      }
      // 将普通文本消息转换为Markdown格式
      if (!['Activity', 'Attraction', 'Transport', 'Accommodation', 'Restaurant'].includes(item.type)) {
        item.content = marked(item.content);
      }
      return item;
    });
    return processedData;

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

/**
 * 处理功能按钮点击事件
 *
 * @param text 被点击按钮的文本内容
 */
const handleTipsClick = (text) => {
  console.log(`功能按钮点击: ${text}`);
  // 为特定按钮设置消息内容并发送
  if (['海岛体验', '浮潜探索', '亲子旅游', '休闲畅游', '海岛介绍'].includes(text)) {
    message.value = text; // 填充输入框
    sendMessage(); // 发送消息
  }
};

/**
 * 处理项目点击事件
 *
 * @param item 点击的项目对象
 */
const handleItemClick = (item) => {
  console.log(`跳转到类型: ${item.type}, ID: ${item.id}`);
  const navigateMap = {
    'Transport': '/pages/ticketBooking/ticketBooking',
    'Accommodation': '/pages/hotelDetail/hotelDetail',
    'Activity': '/pages/activity/activity',
    'Attraction': '/pages/attractionDetail/attractionDetail',
    'Restaurant': '/pages/foodDetails/foodDetails'
  }
  const url = navigateMap[item.type];
  if (url) {
    uni.navigateTo({ url: `${url}?id=${item.id}` });
  } else {
    console.warn('未知的类型:', item.type);
  }

};

/**
 * 处理点击ask选项的事件
 *
 * @param askObj 点击的ask选项对象
 */
const handleAskClick = (askObj) => {
  console.log('点击了ask选项:', askObj);
  // 这里可以添加更多处理逻辑，比如发送对应的问题
  message.value = askObj.content;
  sendMessage();
};

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
@import './chat-dialog.css';  // 注掉这里可以恢复之前的样式

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
    margin-top: 200rpx; // 为导航栏留出空间

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

.thinking-animation {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

// 导航栏样式
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10rpx 30rpx;
  padding-bottom: 20rpx;
  background-color: #fff;
  z-index: 999;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  min-height: 88rpx;
  
  .nav-back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60rpx;
    height: 60rpx;
    cursor: pointer;
  }
  
  .nav-title {
    font-size: 36rpx;
    font-weight: 500;
    color: #333;
    flex: 1;
    text-align: center;
  }
  
  .nav-right {
    width: 60rpx;
  }
}

.chat-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  padding: 25rpx;
  padding-top: 180rpx; // 为导航栏留出空间（状态栏+导航栏高度）
  font-size: $fs-base;
  color: #333;

  .user-message {
    width: max-content;
    max-width: 550rpx;
    margin-left: auto;
    background-color: #00A6ED;  // 用户对话框背景颜色
    padding: 20rpx 40rpx;
    border-radius: 50rpx;
    border-top-right-radius: 0;
    box-shadow: $app-shadow;

    // 用户对话框内容字体
    .message-content{
      color: #fff;
    }
  }

  .clickable-item {
    min-width: 250rpx;
    max-width: 500rpx;
    width: max-content;
    background-color: #fff;
    box-shadow: $app-shadow;
    border-radius: 100rpx;
    padding: 10rpx 20rpx;
    padding-right: 40rpx;
    margin: 20rpx 0;
    display: flex;
    align-items: center;

    &:active {
      background-color: #fcfcfc;
    }

    .icon {
      width: 50rpx;
      height: 50rpx;
      border: 1px solid #eee;
      border-radius: 100%;
      margin-right: 20rpx;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .more {
      margin-left: auto;
      color: #999;
    }
  }
}

// 行程优化组件
// 反馈按钮（点赞点踩）
.action-button-wrapper {
  display: flex;
  align-items: center;

  .action-button {
    display: flex;
    align-items: center;
  }
}

.trip-optimizer {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 25rpx;
  padding: 20rpx;
  margin: 20rpx 0;
  box-shadow: $app-shadow;
  gap: 20rpx;

  .optimizer-header {
    display: flex;
    flex-direction: column;

    .optimizer-title {
      font-size: $fs-large;
      font-weight: bold;
      margin-bottom: 10rpx;
    }

    .optimizer-subtitle {
      font-size: $fs-base;
      color: #666;
    }
  }

  .option-group {
    display: flex;
    flex-direction: column;
    margin-top: 20rpx;
    gap: 20rpx;

    .option-label {
      font-size: $fs-base;
      color: #333;
      font-weight: bold;
    }

    :deep(.uv-button--default) {
      border: 1px solid #ececec;
    }

    .option-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 10rpx;
    }

    .preference-tags {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10rpx;
    }
  }

  .confirm-button-wrapper {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 20rpx;
    margin-top: 10rpx;
  }

}

:deep(h1) {
  margin: 20rpx 0;
}

:deep(h2) {
  margin: 10rpx 0;
}

:deep(h3) {
  margin: 10rpx 0;
}

:deep(p) {
  margin: 10rpx 0;
}

.uv-steps-item__wrapper {
  background-color: #f8f8f8 !important;
  padding: 0rpx 40rpx;
}
</style>
