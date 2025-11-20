<template>
  <view 
    v-if="showButton"
    class="ai-float-btn" 
    @touchstart.stop="startDrag" 
    @touchmove.stop.prevent="moveDrag"
    @touchend.stop="endDrag" 
    :style="{ left: dragX + 'px', top: dragY + 'px' }"
  >
    <view class="ai-btn">
      <image 
        class="ai-icon"
        src="https://gitee.com/luo-shaominggitee/island_image/raw/main/ai_logo/AI%E5%AF%BC%E6%B8%B8%20(%E6%97%A0%E5%AD%97%E7%89%88).png"
        mode="aspectFit"
        @error="handleImageError"
      />
    </view>
    <text class="ai-text">AI</text>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 显示状态
const showButton = ref(true);

// 拖曳相关状态
const dragX = ref(300); // 设置默认初始位置，避免为0时不可见
const dragY = ref(400); // 设置默认初始位置
const startX = ref(0);
const startY = ref(0);
const offsetX = ref(0);
const offsetY = ref(0);
const isDragging = ref(false);
const startTime = ref(0); // 记录开始触摸的时间
const moveDistance = ref(0); // 记录移动距离

// 按钮尺寸（rpx转px）
const buttonWidth = ref(0);
const buttonHeight = ref(0);

// 图片加载错误处理
const handleImageError = (e) => {
  console.error('AI图标加载失败:', e);
};

// 初始化位置 - 默认在屏幕右侧中间
onMounted(() => {
  console.log('AI悬浮按钮组件已挂载');
  // 使用 nextTick 确保 DOM 已渲染
  setTimeout(() => {
    try {
      const windowInfo = uni.getWindowInfo();
      console.log('获取窗口信息:', windowInfo);
      
      // 将rpx转换为px (rpx = px * 750 / 屏幕宽度)
      const rpxToPx = windowInfo.windowWidth / 750;
      buttonWidth.value = 96 * rpxToPx;
      buttonHeight.value = 96 * rpxToPx;
      
      // 初始位置：右侧中间，距离右边20px
      dragX.value = windowInfo.windowWidth - buttonWidth.value - 20;
      dragY.value = (windowInfo.windowHeight - buttonHeight.value) / 2;
      
      console.log('AI悬浮按钮初始化完成:', {
        windowWidth: windowInfo.windowWidth,
        windowHeight: windowInfo.windowHeight,
        buttonWidth: buttonWidth.value,
        buttonHeight: buttonHeight.value,
        dragX: dragX.value,
        dragY: dragY.value
      });
      
      showButton.value = true;
    } catch (error) {
      console.error('AI悬浮按钮初始化失败:', error);
      // 设置默认值
      dragX.value = 300;
      dragY.value = 400;
      showButton.value = true;
    }
  }, 200);
});

// 点击事件
const handleClick = (e) => {
  console.log('AI按钮点击事件触发', { isDragging: isDragging.value });
  
  // 如果正在拖曳，不触发点击
  if (isDragging.value) {
    console.log('正在拖曳，忽略点击');
    return;
  }
  
  console.log('执行跳转到聊天页面');
  // 跳转到聊天页面
  uni.navigateTo({
    url: '/pages/chat/chat',
    success: () => {
      console.log('成功跳转到聊天页面');
    },
    fail: (err) => {
      console.error("导航到聊天页面失败:", err);
      // 如果navigateTo失败，尝试reLaunch
      uni.reLaunch({
        url: '/pages/chat/chat'
      });
    }
  });
};

// 开始拖曳
const startDrag = (e) => {
  // 阻止事件冒泡，避免触发页面滚动
  e.stopPropagation();
  isDragging.value = false; // 重置拖曳状态
  const { clientX, clientY } = e.touches[0];
  startX.value = clientX;
  startY.value = clientY;
  offsetX.value = dragX.value;
  offsetY.value = dragY.value;
  
  // 记录开始时间，用于区分点击和拖曳
  startTime.value = Date.now();
};

// 拖曳中
const moveDrag = (e) => {
  // 阻止默认滚动行为和事件冒泡
  e.preventDefault();
  e.stopPropagation();
  
  const { clientX, clientY } = e.touches[0];
  const deltaX = clientX - startX.value;
  const deltaY = clientY - startY.value;
  
  // 计算移动距离
  moveDistance.value = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  // 如果移动距离超过10px，认为是拖曳
  if (moveDistance.value > 10) {
    isDragging.value = true;
    
    const x = offsetX.value + deltaX;
    const y = offsetY.value + deltaY;
    
    // 获取屏幕尺寸
    const windowInfo = uni.getWindowInfo();
    const screenWidth = windowInfo.windowWidth;
    const screenHeight = windowInfo.windowHeight;
    
    // 限制按钮在屏幕内
    const minX = 0;
    const maxX = screenWidth - buttonWidth.value;
    const minY = 0;
    const maxY = screenHeight - buttonHeight.value - 100; // 减去底部导航栏高度
    
    dragX.value = Math.max(minX, Math.min(x, maxX));
    dragY.value = Math.max(minY, Math.min(y, maxY));
  }
  
  return false; // 阻止事件继续传播
};

// 结束拖曳
const endDrag = (e) => {
  // 阻止事件冒泡
  if (e) {
    e.stopPropagation();
  }
  
  const endTime = Date.now();
  const timeDiff = endTime - startTime.value;
  
  // 如果移动距离小于10px且时间小于300ms，认为是点击而不是拖曳
  if (moveDistance.value < 10 && timeDiff < 300 && !isDragging.value) {
    console.log('检测到点击，移动距离:', moveDistance.value, '时间:', timeDiff);
    // 延迟执行点击，确保拖曳状态已重置
    setTimeout(() => {
      if (!isDragging.value) {
        handleClick();
      }
    }, 50);
  }
  
  // 如果确实发生了拖曳，处理位置限制和吸附
  if (isDragging.value) {
    const windowInfo = uni.getWindowInfo();
    const screenWidth = windowInfo.windowWidth;
    const screenHeight = windowInfo.windowHeight;
    
    // 限制按钮在屏幕内
    dragX.value = Math.max(0, Math.min(dragX.value, screenWidth - buttonWidth.value));
    dragY.value = Math.max(0, Math.min(dragY.value, screenHeight - buttonHeight.value - 100));
    
    // 自动吸附到边缘
    setTimeout(() => {
      if (dragX.value < screenWidth / 2) {
        // 吸附到左边
        dragX.value = 10;
      } else {
        // 吸附到右边
        dragX.value = screenWidth - buttonWidth.value - 10;
      }
    }, 100);
  }
  
  // 重置状态
  setTimeout(() => {
    isDragging.value = false;
    moveDistance.value = 0;
  }, 100);
};
</script>

<style lang="scss" scoped>
.ai-float-btn {
  position: fixed !important;
  z-index: 10000 !important;
  width: 96rpx;
  height: 120rpx;
  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  pointer-events: auto;
  visibility: visible !important;
  opacity: 1 !important;
  
  .ai-btn {
    width: 96rpx;
    height: 96rpx;
    background-color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
    transition: transform 0.2s;
    flex-shrink: 0;
    border: 2rpx solid #3c9cff;
    
    &:active {
      transform: scale(0.95);
    }
    
    .ai-icon {
      width: 70rpx;
      height: 70rpx;
      border-radius: 50%;
      display: block;
    }
  }
  
  .ai-text {
    font-size: 20rpx;
    color: #333;
    margin-top: 4rpx;
    font-weight: 500;
  }
}
</style>

