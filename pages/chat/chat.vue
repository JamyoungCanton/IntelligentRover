<template>
  <view class="ai-container">
    <view class="nav-bar" :style="{ paddingTop: (safeAreaInsets.top || statusBarHeight) + 'px' }">
      <view class="nav-back" @click="goBack">
        <uni-icons type="back" size="24" color="#333333"></uni-icons>
      </view>
      <text class="nav-title">AI智游侠</text>
      <view class="nav-right" style="width: 24px;"></view>
    </view>
    
    <view v-if="chatMessageList.length == 0" class="ai-nochat-wrapper">
      <view class="ai-nochat-header">
        <image src="/static/chat/ai.png" mode="widthFix"></image>
        <view class="ai-nochat-header-title">智游侠</view>
        <view class="ai-nochat-header-desc">
          懂旅游的AI助手，为您提供个性化旅游建议
        </view>
      </view>
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

    <view v-if="chatMessageList.length > 0" class="chat-list-wrapper">
      <template v-for="(msg, index) in chatMessageList" :key="`msg-${index}-${msg.id}-${globalUpdateKey}`">
        <view v-if="msg.type === 'user'" class="user-message">
          <div class="message-content">{{ msg.content }}</div>
        </view>

        <view v-else class="ai-message">
          <view class="typing-content" :class="{ typing: isTyping && index === chatMessageList.length - 1 }">
            <view v-if="workflowData.nodes.size > 0 && index === chatMessageList.length - 1" class="workflow-container">
              <view class="workflow-header" @click.stop="toggleWorkflow" @tap.stop="toggleWorkflow">
                <view class="workflow-title">
                  <text class="workflow-icon">{{ workflowData.status === 'finished' ? '✓' : '⟳' }}</text>
                  <text>工作流</text>
                  <text class="workflow-status" :class="workflowData.status">
                    {{ workflowData.status === 'finished' ? '已完成' : workflowData.status === 'error' ? '失败' : '运行中' }}
                  </text>
                </view>
                <view class="workflow-toggle-icon">
                  <uv-icon :name="workflowExpanded === true ? 'arrow-up' : 'arrow-down'" size="20" color="#fff"></uv-icon>
                </view>
              </view>
              
              <view v-if="workflowExpanded === true" class="workflow-content" :key="`workflow-content-${globalUpdateKey}`">
                <template v-for="node in workflowData.rootNodes" :key="node.id">
                  <view class="workflow-node" :class="{ 'has-children': node.children && node.children.length > 0 }">
                    <view class="node-item" @click="node.children && node.children.length > 0 ? toggleNode(node.id) : null">
                      <view class="node-left">
                        <text class="node-icon">{{ getNodeIcon(node.type) }}</text>
                        <text class="node-title">{{ node.title }}</text>
                      </view>
                      <view class="node-right">
                        <text class="node-time">{{ getNodeCurrentTime(node) }}</text>
                        <text class="node-status" :class="node.status">{{ getNodeStatusIcon(node.status) }}</text>
                        <uv-icon 
                          v-if="node.children && node.children.length > 0"
                          :name="expandedNodes.has(node.id) ? 'arrow-down' : 'arrow-right'" 
                          size="14" 
                          color="#666"
                        ></uv-icon>
                      </view>
                    </view>
                    <!-- 递归渲染子节点 -->
                    <view v-if="expandedNodes.has(node.id) && node.children && node.children.length > 0" class="node-children">
                      <view 
                        v-for="child in node.children" 
                        :key="child.id" 
                        class="workflow-node child-node"
                      >
                        <view class="node-item" @click="child.children && child.children.length > 0 ? toggleNode(child.id) : null">
                          <view class="node-left">
                            <text class="node-icon">{{ getNodeIcon(child.type) }}</text>
                            <text class="node-title">{{ child.title }}</text>
                          </view>
                          <view class="node-right">
                            <text class="node-time">{{ getNodeCurrentTime(child) }}</text>
                            <text class="node-status" :class="child.status">{{ getNodeStatusIcon(child.status) }}</text>
                            <uv-icon 
                              v-if="child.children && child.children.length > 0"
                              :name="expandedNodes.has(child.id) ? 'arrow-down' : 'arrow-right'" 
                              size="14" 
                              color="#666"
                            ></uv-icon>
                          </view>
                        </view>
                        <!-- 递归渲染更深层的子节点 -->
                        <view v-if="expandedNodes.has(child.id) && child.children && child.children.length > 0" class="node-children">
                          <view 
                            v-for="grandchild in child.children" 
                            :key="grandchild.id" 
                            class="workflow-node child-node"
                          >
                            <view class="node-item">
                              <view class="node-left">
                                <text class="node-icon">{{ getNodeIcon(grandchild.type) }}</text>
                                <text class="node-title">{{ grandchild.title }}</text>
                              </view>
                              <view class="node-right">
                                <text class="node-time">{{ getNodeCurrentTime(grandchild) }}</text>
                                <text class="node-status" :class="grandchild.status">{{ getNodeStatusIcon(grandchild.status) }}</text>
                              </view>
                            </view>
                          </view>
                        </view>
                      </view>
                    </view>
                  </view>
                </template>
                
                <template v-for="[parallelId, parallel] in workflowData.parallelBranches" :key="parallelId">
                  <view class="parallel-container">
                    <view class="parallel-branches">
                      <template v-for="[branchId, branchNodes] in parallel.branches" :key="branchId">
                        <view class="branch-container">
                          <view class="branch-header">
                            分支-{{ formatBranchName(branchId, parallel.id) }}
                          </view>
                          <view class="branch-nodes">
                            <view 
                              v-for="node in branchNodes" 
                              :key="node.id" 
                              class="workflow-node"
                              :class="{ 'has-children': node.children && node.children.length > 0 }"
                            >
                              <view class="node-item" @click="node.children && node.children.length > 0 ? toggleNode(node.id) : null">
                                <view class="node-left">
                                  <text class="node-icon">{{ getNodeIcon(node.type) }}</text>
                                  <text class="node-title">{{ node.title }}</text>
                                </view>
                                <view class="node-right">
                                  <text class="node-time">{{ getNodeCurrentTime(node) }}</text>
                                  <text class="node-status" :class="node.status">{{ getNodeStatusIcon(node.status) }}</text>
                                  <uv-icon 
                                    v-if="node.children && node.children.length > 0"
                                    :name="expandedNodes.has(node.id) ? 'arrow-down' : 'arrow-right'" 
                                    size="14" 
                                    color="#666"
                                  ></uv-icon>
                                </view>
                              </view>
                              <!-- 递归渲染子节点 -->
                              <view v-if="expandedNodes.has(node.id) && node.children && node.children.length > 0" class="node-children">
                                <view 
                                  v-for="child in node.children" 
                                  :key="child.id" 
                                  class="workflow-node child-node"
                                >
                                  <view class="node-item" @click="child.children && child.children.length > 0 ? toggleNode(child.id) : null">
                                    <view class="node-left">
                                      <text class="node-icon">{{ getNodeIcon(child.type) }}</text>
                                      <text class="node-title">{{ child.title }}</text>
                                    </view>
                                    <view class="node-right">
                                      <text class="node-time">{{ getNodeCurrentTime(child) }}</text>
                                      <text class="node-status" :class="child.status">{{ getNodeStatusIcon(child.status) }}</text>
                                      <uv-icon 
                                        v-if="child.children && child.children.length > 0"
                                        :name="expandedNodes.has(child.id) ? 'arrow-down' : 'arrow-right'" 
                                        size="14" 
                                        color="#666"
                                      ></uv-icon>
                                    </view>
                                  </view>
                                  <!-- 递归渲染更深层的子节点 -->
                                  <view v-if="expandedNodes.has(child.id) && child.children && child.children.length > 0" class="node-children">
                                    <view 
                                      v-for="grandchild in child.children" 
                                      :key="grandchild.id" 
                                      class="workflow-node child-node"
                                    >
                                      <view class="node-item">
                                        <view class="node-left">
                                          <text class="node-icon">{{ getNodeIcon(grandchild.type) }}</text>
                                          <text class="node-title">{{ grandchild.title }}</text>
                                        </view>
                                        <view class="node-right">
                                          <text class="node-time">{{ getNodeCurrentTime(grandchild) }}</text>
                                          <text class="node-status" :class="grandchild.status">{{ getNodeStatusIcon(grandchild.status) }}</text>
                                        </view>
                                      </view>
                                    </view>
                                  </view>
                                </view>
                              </view>
                            </view>
                          </view>
                        </view>
                      </template>
                    </view>
                  </view>
                </template>
              </view>
            </view>
            
            <template v-if="msg.content && Array.isArray(msg.content) && msg.content.length > 0">
              <view class="ai-response-content">
                <template v-for="(item, i) in msg.content" :key="i + (item.id || i) + item.type">
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

            <template v-else-if="msg.thinking && (!msg.content || !Array.isArray(msg.content) || msg.content.length === 0)">
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
            <view v-else-if="msg.content && typeof msg.content === 'string'" v-html="msg.content" class="message-text"></view>
          </view>
          
          <view v-if="workflowData.nodes.size > 0 && !msg.thinking && index === chatMessageList.length - 1" class="workflow-container">
            <view class="workflow-header" @click.stop="toggleWorkflow">
              <view class="workflow-title">
                <text class="workflow-icon">{{ workflowData.status === 'finished' ? '✓' : '⟳' }}</text>
                <text>工作流</text>
                <text class="workflow-status" :class="workflowData.status">
                  {{ workflowData.status === 'finished' ? '已完成' : workflowData.status === 'error' ? '失败' : '运行中' }}
                </text>
              </view>
              <view class="workflow-toggle-icon">
                <uv-icon :name="workflowExpanded === true ? 'arrow-up' : 'arrow-down'" size="20" color="#fff"></uv-icon>
              </view>
            </view>
            
            <view v-if="workflowExpanded === true" class="workflow-content" :key="`workflow-content-${globalUpdateKey}`">
              <!-- 渲染根节点 -->
              <template v-for="node in workflowData.rootNodes" :key="node.id">
                <view class="workflow-node" :class="{ 'has-children': node.children && node.children.length > 0 }">
                  <view class="node-item" @click="node.children && node.children.length > 0 ? toggleNode(node.id) : null">
                    <view class="node-left">
                      <text class="node-icon">{{ getNodeIcon(node.type) }}</text>
                      <text class="node-title">{{ node.title }}</text>
                    </view>
                    <view class="node-right">
                      <text class="node-time">{{ getNodeCurrentTime(node) }}</text>
                      <text class="node-status" :class="node.status">{{ getNodeStatusIcon(node.status) }}</text>
                      <uv-icon 
                        v-if="node.children && node.children.length > 0"
                        :name="expandedNodes.has(node.id) ? 'arrow-down' : 'arrow-right'" 
                        size="14" 
                        color="#666"
                      ></uv-icon>
                    </view>
                  </view>
                  <!-- 递归渲染子节点 -->
                  <view v-if="expandedNodes.has(node.id) && node.children && node.children.length > 0" class="node-children">
                    <view 
                      v-for="child in node.children" 
                      :key="child.id" 
                      class="workflow-node child-node"
                    >
                      <view class="node-item" @click="child.children && child.children.length > 0 ? toggleNode(child.id) : null">
                        <view class="node-left">
                          <text class="node-icon">{{ getNodeIcon(child.type) }}</text>
                          <text class="node-title">{{ child.title }}</text>
                        </view>
                        <view class="node-right">
                          <text class="node-time">{{ getNodeCurrentTime(child) }}</text>
                          <text class="node-status" :class="child.status">{{ getNodeStatusIcon(child.status) }}</text>
                          <uv-icon 
                            v-if="child.children && child.children.length > 0"
                            :name="expandedNodes.has(child.id) ? 'arrow-down' : 'arrow-right'" 
                            size="14" 
                            color="#666"
                          ></uv-icon>
                        </view>
                      </view>
                      <!-- 递归渲染更深层的子节点 -->
                      <view v-if="expandedNodes.has(child.id) && child.children && child.children.length > 0" class="node-children">
                        <view 
                          v-for="grandchild in child.children" 
                          :key="grandchild.id" 
                          class="workflow-node child-node"
                        >
                          <view class="node-item">
                            <view class="node-left">
                              <text class="node-icon">{{ getNodeIcon(grandchild.type) }}</text>
                              <text class="node-title">{{ grandchild.title }}</text>
                            </view>
                            <view class="node-right">
                              <text class="node-time">{{ getNodeCurrentTime(grandchild) }}</text>
                              <text class="node-status" :class="grandchild.status">{{ getNodeStatusIcon(grandchild.status) }}</text>
                            </view>
                          </view>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
              </template>
              
              <!-- 渲染并行分支 -->
              <template v-for="[parallelId, parallel] in workflowData.parallelBranches" :key="parallelId">
                <view class="parallel-container">
                  <view class="parallel-branches">
                      <template v-for="[branchId, branchNodes] in parallel.branches" :key="branchId">
                        <view class="branch-container">
                          <view class="branch-header">
                            分支-{{ formatBranchName(branchId, parallel.id) }}
                          </view>
                        <view class="branch-nodes">
                          <view 
                            v-for="node in branchNodes" 
                            :key="node.id" 
                            class="workflow-node"
                          >
                            <view class="node-item">
                              <view class="node-left">
                                <text class="node-icon">{{ getNodeIcon(node.type) }}</text>
                                <text class="node-title">{{ node.title }}</text>
                              </view>
                              <view class="node-right">
                                <text class="node-time" v-if="node.elapsedTime">{{ formatElapsedTime(node.elapsedTime) }}</text>
                                <text class="node-status" :class="node.status">{{ getNodeStatusIcon(node.status) }}</text>
                              </view>
                            </view>
                          </view>
                        </view>
                      </view>
                    </template>
                  </view>
                </view>
              </template>
            </view>
          </view>

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
              <uv-button color="linear-gradient(to right, #FF9800, #F57C00)" shape="circle" @click="oneClickOrder">一键下单</uv-button>
            </view>


          </view>
        </view>
      </template>
      <view style="height: 300rpx;"></view>
    </view>


    <view class="input-wrapper">
      <view class="input-row">
        <view class="mic-wrapper" @longpress="startVoiceInput" @touchend="stopVoiceInput" @touchcancel="stopVoiceInput">
          <uv-button
            icon="mic"
            size="mini"
            shape="circle"
            class="send-button"
            :type="isVoiceListening ? 'primary' : 'default'"
          ></uv-button>
        </view>
        <uv-textarea v-model="message" placeholder="请输入旅游目的地或旅游问题" :maxlength="1000" autoHeight></uv-textarea>
        <uv-button
          icon="arrow-upward"
          iconColor="#fff"
          type="primary"
          size="mini"
          shape="circle"
          class="send-button"
          @click="sendMessage"
        ></uv-button>
      </view>
    </view>

    <Tabbar />
  </view>
</template>

<script setup>
import Tabbar from '../Tabbar/Tabbar.vue';
import { ref, reactive, nextTick, onMounted, watch, triggerRef, computed } from 'vue';
import { StreamRequest } from '../../utils/request.js';
import { marked } from 'marked';

import { useUserStore } from '@/store/modules/user';
const userStore = useUserStore();

const safeAreaInsets = ref({});
const statusBarHeight = ref(0);

const goBack = () => {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({
        url: '/pages/index/index'
      });
    }
  });
};
const hasToken = () => {
  if (userStore.token === '') {
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
  const windowInfo = uni.getWindowInfo();
  const deviceInfo = uni.getDeviceInfo();
  statusBarHeight.value = windowInfo.statusBarHeight || 0;
  safeAreaInsets.value = deviceInfo.safeAreaInsets || {};
})
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

const iconMap = reactive({
  'Activity': '📍',
  'Accommodation': '🏨',
  'Transport': '🚌',
  'Restaurant': '🍽️',
  'Attraction': '🏞️',
})

const progressCurrent = ref(0);
const progressList = reactive([
  { title: '意图解析', time: '' },
  { title: '查询数据', time: '' },
  { title: '整理资料', time: '' },
]);

const message = ref('');
let chatMessageList = reactive([]);
const responseData = ref([]);
const isVoiceListening = ref(false);
let recognition = null;
let wxRecManager = null;
let wechatSI = null;
let voiceInterim = '';
let lastVoiceAppend = '';

const startVoiceInput = () => {
  try {
    if (isVoiceListening.value === true) {
      return;
    }
    if (typeof wx !== 'undefined') {
      try {
        if (!wechatSI && typeof requirePlugin === 'function') {
          wechatSI = requirePlugin('WechatSI') || null;
        }
      } catch (e) {}
      if (wechatSI && typeof wechatSI.getRecordRecognitionManager === 'function') {
        try {
          uni.authorize({ scope: 'scope.record' });
        } catch (e) {}
        wxRecManager = wechatSI.getRecordRecognitionManager();
        isVoiceListening.value = true;
        if (typeof wxRecManager.onStart === 'function') {
          wxRecManager.onStart = () => {};
        }
        wxRecManager.onRecognize = (res) => {
          const text = res && res.result ? String(res.result) : '';
          if (text) {
            voiceInterim = text;
          }
        };
        wxRecManager.onStop = (res) => {
          isVoiceListening.value = false;
          let text = res && res.result ? String(res.result) : '';
          if (!text && voiceInterim) {
            text = voiceInterim;
          }
          voiceInterim = '';
          if (text) {
            const current = String(message.value || '');
            if (text !== lastVoiceAppend && !current.endsWith(text)) {
              message.value = current + text;
              lastVoiceAppend = text;
            }
          }
        };
        wxRecManager.onError = () => {
          isVoiceListening.value = false;
          uni.showToast({ title: '语音识别失败', icon: 'none', duration: 2000 });
        };
        wxRecManager.start({
          lang: 'zh_CN',
          duration: 30000,
          vad_eos: 2000
        });
        return;
      }
    }
    if (typeof plus !== 'undefined' && plus && plus.speech && typeof plus.speech.startRecognize === 'function') {
      isVoiceListening.value = true;
      plus.speech.startRecognize(
        {
          lang: 'zh-CN',
          punctuation: true
        },
        (res) => {
          isVoiceListening.value = false;
          const text = Array.isArray(res) ? String(res[0] || '') : String(res || '');
          if (text) {
            message.value = (message.value || '') + text;
          }
        },
        () => {
          isVoiceListening.value = false;
          uni.showToast({ title: '语音识别失败', icon: 'none', duration: 2000 });
        }
      );
      return;
    }
    const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (SR) {
      recognition = new SR();
      recognition.lang = 'zh-CN';
      recognition.interimResults = true;
      recognition.continuous = true;
      isVoiceListening.value = true;
      let finalTranscript = '';
      recognition.onresult = (e) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcript = e.results[i][0] && e.results[i][0].transcript ? e.results[i][0].transcript : '';
          if (e.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
      };
      recognition.onend = () => {
        isVoiceListening.value = false;
        if (finalTranscript) {
          message.value = (message.value || '') + finalTranscript;
        }
      };
      recognition.onerror = () => {
        isVoiceListening.value = false;
        uni.showToast({ title: '语音识别失败', icon: 'none', duration: 2000 });
      };
      recognition.start();
      return;
    }
    uni.showToast({ title: '当前平台不支持语音输入', icon: 'none', duration: 2000 });
  } catch (e) {
    isVoiceListening.value = false;
    uni.showToast({ title: '语音识别异常', icon: 'none', duration: 2000 });
  }
};

const stopVoiceInput = () => {
  try {
    if (wxRecManager && typeof wxRecManager.stop === 'function') {
      wxRecManager.stop();
      isVoiceListening.value = false;
      return;
    }
    if (recognition && typeof recognition.stop === 'function') {
      recognition.stop();
    } else if (typeof plus !== 'undefined' && plus && plus.speech && typeof plus.speech.stopRecognize === 'function') {
      plus.speech.stopRecognize();
    }
    isVoiceListening.value = false;
  } catch (e) {
    isVoiceListening.value = false;
  }
};
const globalUpdateKey = ref(0);
const isTyping = ref(false);
const dots = ref('');

const workflowData = reactive({
  nodes: new Map(),
  parallelBranches: new Map(),
  rootNodes: [],
  status: 'running',
  startTime: null,
  endTime: null
});

const workflowExpanded = ref(false);
const expandedNodes = reactive(new Set());

const nodeIconMap = {
  'start': '🏠',
  'end': '🏁',
  'llm': '🤖',
  'question-classifier': '🔍',
  'if-else': '🔀',
  'condition': '🔀',
  'code': '</>',
  'http': '🌐',
  'variable-assigner': '=',
  'variable-assign': '=',
  'default': '⚙️'
};

const formatElapsedTime = (seconds) => {
  if (seconds === null || seconds === undefined || isNaN(seconds)) {
    return '';
  }
  
  const absSeconds = Math.abs(seconds);
  const milliseconds = absSeconds * 1000;
  
  if (absSeconds < 1) {
    return `${Math.round(milliseconds)} ms`;
  }
  
  if (absSeconds < 60) {
    const secs = Math.floor(absSeconds);
    const ms = Math.round((absSeconds - secs) * 1000);
    if (ms === 0) {
      return `${secs} s`;
    }
    return `${secs} s ${ms} ms`;
  }
  
  const minutes = Math.floor(absSeconds / 60);
  const secs = Math.floor(absSeconds % 60);
  const ms = Math.round((absSeconds % 1) * 1000);
  
  if (secs === 0 && ms === 0) {
    return `${minutes} m`;
  } else if (ms === 0) {
    return `${minutes} m ${secs} s`;
  } else {
    return `${minutes} m ${secs}.${Math.floor(ms / 100)} s`;
  }
};

const getNodeCurrentTime = (node) => {
  if (!node) return '';
  
  if (node.elapsedTime !== null && node.elapsedTime !== undefined && !isNaN(node.elapsedTime)) {
    const time = node.elapsedTime;
    if (time >= 0 && time < 3600) {
      return formatElapsedTime(time);
    }
  }
  
  if (node.status === 'running' && node.startTime) {
    const elapsed = (Date.now() - node.startTime) / 1000;
    if (elapsed >= 0 && elapsed < 3600) {
      return formatElapsedTime(elapsed);
    }
  }
  
  return '';
};

const handleWorkflowEvent = (chunk) => {
  const event = chunk.event;
  const data = chunk.data || {};
  
  try {
    if (event === 'workflow_started') {
      workflowData.status = 'running';
      workflowData.startTime = data.created_at ? data.created_at * 1000 : Date.now();
      workflowData.nodes.clear();
      workflowData.parallelBranches.clear();
      workflowData.rootNodes = [];
      console.log('工作流开始');
      startWorkflowTimeUpdate();
    }
    
    else if (event === 'node_started') {
      const nodeId = data.node_id || data.id;
      if (!nodeId) return;
      
      const isParallelStartNode = data.parallel_start_node_id === nodeId || 
                                   (data.node_type === 'parallel' || data.title?.includes('并行'));
      
      const node = {
        id: nodeId,
        title: data.title || '未知节点',
        type: data.node_type || 'default',
        status: 'running',
        startTime: data.created_at ? data.created_at * 1000 : Date.now(),
        endTime: null,
        elapsedTime: null,
        parallelId: data.parallel_id,
        parallelBranchId: data.parallel_branch_id,
        parallelStartNodeId: data.parallel_start_node_id,
        isParallelStart: isParallelStartNode,
        children: [],
        parentId: data.predecessor_node_id,
        index: data.index
      };
      
      workflowData.nodes.set(nodeId, node);
      
      if (isParallelStartNode && data.parallel_id) {
        if (!workflowData.parallelBranches.has(data.parallel_id)) {
          workflowData.parallelBranches.set(data.parallel_id, {
            id: data.parallel_id,
            startNodeId: nodeId,
            startNodeTitle: node.title || '并行执行',
            branches: new Map(),
            startTime: data.created_at ? data.created_at * 1000 : Date.now()
          });
        }
      }
      else if (!node.parentId && !node.parallelId) {
        if (!workflowData.rootNodes.find(n => n.id === nodeId)) {
          workflowData.rootNodes.push(node);
        }
      }
      
      if (node.parentId && workflowData.nodes.has(node.parentId)) {
        const parent = workflowData.nodes.get(node.parentId);
        if (!parent.children.find(n => n.id === nodeId)) {
          parent.children.push(node);
        }
      }
      
      if (data.parallel_id && data.parallel_branch_id) {
        if (!workflowData.parallelBranches.has(data.parallel_id)) {
          workflowData.parallelBranches.set(data.parallel_id, {
            id: data.parallel_id,
            branches: new Map(),
            startTime: data.created_at ? data.created_at * 1000 : Date.now()
          });
        }
        const parallel = workflowData.parallelBranches.get(data.parallel_id);
        if (!parallel.branches.has(data.parallel_branch_id)) {
          parallel.branches.set(data.parallel_branch_id, []);
        }
        const branch = parallel.branches.get(data.parallel_branch_id);
        if (!branch.find(n => n.id === nodeId)) {
          branch.push(node);
        }
      }
      
      expandedNodes.add(nodeId);
    }
    
    else if (event === 'node_finished') {
      const nodeId = data.node_id || data.id;
      if (!nodeId || !workflowData.nodes.has(nodeId)) return;
      
      const node = workflowData.nodes.get(nodeId);
      node.status = data.status === 'succeeded' ? 'success' : (data.status === 'failed' ? 'error' : 'finished');
      node.endTime = data.finished_at ? data.finished_at * 1000 : Date.now();
      if (node.startTime && node.endTime) {
        node.elapsedTime = (node.endTime - node.startTime) / 1000;
      } else if (data.elapsed_time) {
        node.elapsedTime = data.elapsed_time;
      }
      
      console.log(`节点完成: ${node.title}, 耗时: ${node.elapsedTime}s`);
    }
    
    else if (event === 'parallel_branch_started') {
      const parallelId = data.parallel_id;
      const branchId = data.parallel_branch_id;
      if (!parallelId || !branchId) return;
      
      if (!workflowData.parallelBranches.has(parallelId)) {
        workflowData.parallelBranches.set(parallelId, {
          id: parallelId,
          branches: new Map(),
          startTime: data.created_at ? data.created_at * 1000 : Date.now()
        });
      }
      
      const parallel = workflowData.parallelBranches.get(parallelId);
      if (!parallel.branches.has(branchId)) {
        parallel.branches.set(branchId, []);
      }
    }
    
    else if (event === 'parallel_branch_finished') {
      const parallelId = data.parallel_id;
      const branchId = data.parallel_branch_id;
      if (parallelId && branchId && workflowData.parallelBranches.has(parallelId)) {
        const parallel = workflowData.parallelBranches.get(parallelId);
        if (parallel.branches.has(branchId)) {
          const branch = parallel.branches.get(branchId);
          branch.forEach(node => {
            if (workflowData.nodes.has(node.id)) {
              const nodeObj = workflowData.nodes.get(node.id);
              if (nodeObj.status === 'running') {
                nodeObj.status = 'success';
                nodeObj.endTime = data.finished_at ? data.finished_at * 1000 : Date.now();
                if (nodeObj.startTime && nodeObj.endTime) {
                  nodeObj.elapsedTime = (nodeObj.endTime - nodeObj.startTime) / 1000;
                }
              }
            }
          });
        }
      }
    }
    
    else if (event === 'workflow_finished') {
      workflowData.status = data.status === 'succeeded' ? 'finished' : 'error';
      workflowData.endTime = data.finished_at ? data.finished_at * 1000 : Date.now();
      
      workflowData.nodes.forEach(node => {
        if (node.status === 'running') {
          node.status = 'success';
          if (!node.endTime) {
            node.endTime = workflowData.endTime;
            if (node.startTime) {
              node.elapsedTime = (node.endTime - node.startTime) / 1000;
            }
          }
        }
      });
      
      console.log('工作流完成');
      setTimeout(() => {
        stopWorkflowTimeUpdate();
      }, 200);
    }
  } catch (error) {
    console.error('处理工作流事件出错:', error, chunk);
  }
};

let isToggling = false;
const toggleWorkflow = () => {
  console.log('toggleWorkflow: 点击工作流头部', '当前状态:', workflowExpanded.value);
  
  // 防止重复点击导致状态混乱
  if (isToggling) {
    console.log('toggleWorkflow: 正在处理中，忽略重复点击');
    return;
  }
  isToggling = true;
  
  workflowExpanded.value = !workflowExpanded.value;
  console.log('toggleWorkflow: 切换后状态:', workflowExpanded.value);
  
  globalUpdateKey.value = Date.now();
  
  nextTick(() => {
    globalUpdateKey.value = Date.now() + 1;
    console.log('toggleWorkflow: nextTick 完成, workflowExpanded:', workflowExpanded.value);
  });
  
  setTimeout(() => {
    isToggling = false;
  }, 100);
};

let nodeTogglingMap = new Map();
const toggleNode = (nodeId) => {
  if (nodeId === undefined || nodeId === null || nodeId === '') {
    console.warn('toggleNode: 无效的 nodeId', nodeId);
    return;
  }
  
  const idStr = String(nodeId);
  
  // 防止重复点击导致状态混乱
  if (nodeTogglingMap.has(idStr)) {
    console.log('toggleNode: 正在处理中，忽略重复点击', idStr);
    return;
  }
  nodeTogglingMap.set(idStr, true);
  
  console.log('toggleNode: 切换节点', idStr, '当前状态:', expandedNodes.has(idStr));
  
  if (expandedNodes.has(idStr)) {
    expandedNodes.delete(idStr);
    console.log('toggleNode: 折叠节点', idStr);
  } else {
    expandedNodes.add(idStr);
    console.log('toggleNode: 展开节点', idStr);
  }
  
  globalUpdateKey.value = Date.now();
  
  setTimeout(() => {
    nodeTogglingMap.delete(idStr);
  }, 200);
};

const getNodeIcon = (nodeType) => {
  return nodeIconMap[nodeType] || nodeIconMap.default;
};

const getNodeStatusIcon = (status) => {
  if (status === 'success' || status === 'finished') {
    return '✓';
  } else if (status === 'error' || status === 'failed') {
    return '✗';
  } else if (status === 'running') {
    return '⟳';
  }
  return '○';
};

const formatBranchName = (branchId, parallelId) => {
  if (!branchId) return 'A';
  
  if (typeof branchId === 'number' || /^\d+$/.test(String(branchId))) {
    const num = parseInt(branchId);
    return String.fromCharCode(65 + (num % 26));
  }
  
  // 如果 branchId 是字符串，取第一个字符
  const str = String(branchId);
  if (str.length > 0) {
    const firstChar = str.charAt(0).toUpperCase();
    if (firstChar >= 'A' && firstChar <= 'Z') {
      return firstChar;
    }
    // 如果不是字母，转换为字母
    const code = firstChar.charCodeAt(0);
    return String.fromCharCode(65 + (code % 26));
  }
  
  return 'A';
};
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
  try {
    if (!message.value.trim()) return;

    // 添加用户消息
    chatMessageList.push({ type: 'user', content: message.value });
    const userInput = message.value;
    message.value = ''; // 清空输入框

    // 重置进度条
    progressCurrent.value = 0;
    progressList[0].time = '';
    progressList[1].time = '';
    progressList[2].time = '';

    // 重置工作流数据
    workflowData.nodes.clear();
    workflowData.parallelBranches.clear();
    workflowData.rootNodes = [];
    workflowData.status = 'running';
    workflowData.startTime = Date.now();
    workflowData.endTime = null;
    expandedNodes.clear();
    workflowExpanded.value = false; // 默认收起

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
  } catch (error) {
    console.error('发送消息时出错:', error);
    // 确保清除思考状态
    if (chatMessageList.length > 0) {
      const lastIndex = chatMessageList.length - 1;
      if (chatMessageList[lastIndex].thinking) {
        chatMessageList[lastIndex].thinking = false;
        chatMessageList[lastIndex].typing = false;
        if (!chatMessageList[lastIndex].content || chatMessageList[lastIndex].content.length === 0) {
          chatMessageList[lastIndex].content = [{
            type: 'text',
            content: '抱歉，发送消息时出错，请稍后重试。'
          }];
        }
      }
    }
    uni.showToast({
      title: '发送失败，请重试',
      icon: 'none',
      duration: 2000
    });
  }
};

const finalChunk = ref("");
let isProcessingResponse = false; // 标记是否正在处理响应，防止重复处理

// 流式请求回调方法
const handleGetBuffer = (e) => {
  try {
    // 防止未定义或空数据
    if (!e || typeof e !== 'string') {
      console.warn('handleGetBuffer: 收到无效数据', e);
      return;
    }
    
    // 标记已收到数据，清除超时定时器
    if (!hasReceivedData) {
      hasReceivedData = true;
      if (requestTimeout) {
        clearTimeout(requestTimeout);
        requestTimeout = null;
      }
    }

    // 尝试解析JSON，如果失败则记录日志
    let chunk;
    try {
      chunk = JSON.parse(e);
      console.log('解析成功，chunk数据:', chunk);
    } catch (parseError) {
      console.warn('JSON解析失败，原始数据:', e);
      return;
    }

    // 记录所有接收到的事件类型，便于调试
    if (chunk.event) {
      console.log('收到事件类型:', chunk.event);
    }

    // 处理工作流事件
    handleWorkflowEvent(chunk);

    let title = chunk.data?.title;

    // 注意：不要在这里清除thinking状态，保持等待界面显示
    // 只有在workflow_finished事件并准备显示内容时，才清除thinking状态

    if (title == '用户意图解析') {
      progressCurrent.value = 1;
      // 取时分
      const date = new Date(chunk.data.created_at * 1000);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      progressList[0].time= `${hours}:${minutes}`;
    } else if (title == '查询后台数据') {
      progressCurrent.value = 2;
      // 取时分
      const date = new Date(chunk.data.created_at * 1000);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      progressList[1].time = `${hours}:${minutes}`; // 将时分格式化为HH:mm
    }

    // 工作流结束 - 只处理真正的 workflow_finished 事件，忽略 node_finished 等中间事件
    // 这样可以避免后端发送的多个中间事件干扰最终结果
    const isWorkflowFinished = chunk.event === "workflow_finished";
    
    if (isWorkflowFinished) {
      console.log("检测到真正的workflow_finished事件，完整数据:", JSON.stringify(chunk, null, 2));
      
      // 尝试多种方式获取answer数据
      let answerData = null;
      
      // 方式1: chunk.data.outputs.answer (这是最标准的格式)
      if (chunk.data?.outputs?.answer) {
        answerData = chunk.data.outputs.answer;
        console.log("从 chunk.data.outputs.answer 获取数据");
      }
      // 方式2: chunk.data.answer
      else if (chunk.data?.answer) {
        answerData = chunk.data.answer;
        console.log("从 chunk.data.answer 获取数据");
      }
      // 方式3: chunk.answer
      else if (chunk.answer) {
        answerData = chunk.answer;
        console.log("从 chunk.answer 获取数据");
      }
      // 方式4: chunk.data 本身可能就是答案
      else if (chunk.data && typeof chunk.data === 'string') {
        answerData = chunk.data;
        console.log("从 chunk.data (字符串) 获取数据");
      }

      if (answerData) {
        console.log("找到答案数据，类型:", typeof answerData, "内容:", answerData);
        
        // 检查是否已经有更完整的数据在处理
        if (isProcessingResponse && finalChunk.value) {
          // 比较新数据和已有数据，如果新数据更完整（长度更长），则更新
          const newDataStr = typeof answerData === 'string' ? answerData : JSON.stringify(answerData);
          const oldDataStr = typeof finalChunk.value === 'string' ? finalChunk.value : JSON.stringify(finalChunk.value);
          
          if (newDataStr.length <= oldDataStr.length) {
            console.log("新数据不完整或相同，跳过处理。新数据长度:", newDataStr.length, "已有数据长度:", oldDataStr.length);
            return;
          } else {
            console.log("新数据更完整，更新处理。新数据长度:", newDataStr.length, "已有数据长度:", oldDataStr.length);
            // 重置标记，允许处理新数据
            isProcessingResponse = false;
          }
        }
        
        // 防止重复处理同一个响应
        if (isProcessingResponse) {
          console.log("正在处理响应，跳过重复的workflow_finished事件");
          return;
        }
        
        isProcessingResponse = true;
        finalChunk.value = answerData;
        
        try {
          const processedContent = processResponseData(answerData);
      console.log("处理后的内容", processedContent);

          if (chatMessageList.length > 0 && processedContent && processedContent.length > 0) {
        const lastIndex = chatMessageList.length - 1;
            
            console.log("开始显示内容，processedContent长度:", processedContent.length);
            console.log("processedContent内容:", processedContent);
            console.log("当前消息索引:", lastIndex);
            console.log("当前消息状态:", chatMessageList[lastIndex]);
            
            // 直接显示完整内容，不使用打字机效果，确保内容能正确显示
            try {
              // 直接赋值内容，确保Vue能检测到变化
              const contentArray = processedContent.map((item, idx) => {
                const newItem = {
                  type: item.type || 'text',
                  id: item.id || '',
                  content: typeof item.content === 'string' ? item.content : String(item.content || '')
                };
                console.log(`处理第${idx}项:`, newItem.type, newItem.content?.substring(0, 50));
                return newItem;
              });
              
              // 使用Vue的响应式更新方式 - 先赋值content，再清除thinking
              // 这样可以确保内容显示后，等待界面才消失
              
              // 强制更新：先清空再赋值，确保Vue能检测到变化
              // 这是最可靠的方法，通过清空再赋值来强制触发响应式更新
              const tempContent = [...contentArray];
              chatMessageList[lastIndex].content = [];
              
                // 使用nextTick确保清空操作完成后再赋值，这样可以强制触发Vue的响应式更新
              nextTick(() => {
                chatMessageList[lastIndex].content = tempContent;
                // 先赋值内容，再清除thinking，确保内容显示后等待界面才消失
                chatMessageList[lastIndex].typing = false;
                chatMessageList[lastIndex].showOptimizer = true;
                chatMessageList[lastIndex].isCurrent = true;
                
                // 在下一个tick清除thinking，确保内容已经显示
                nextTick(() => {
                  chatMessageList[lastIndex].thinking = false;
                });
                
                if (!chatMessageList[lastIndex].isLike) {
                  chatMessageList[lastIndex].isLike = "";
                }
                
                // 强制触发视图更新
                globalUpdateKey.value = Date.now();
                
                console.log("nextTick赋值后内容长度:", chatMessageList[lastIndex].content.length);
                console.log("消息状态:", {
                  thinking: chatMessageList[lastIndex].thinking,
                  typing: chatMessageList[lastIndex].typing,
                  contentLength: chatMessageList[lastIndex].content.length,
                  hasContent: chatMessageList[lastIndex].content && chatMessageList[lastIndex].content.length > 0,
                  content: chatMessageList[lastIndex].content
                });
                
                scrollToBottom();
                
                // 再次确认状态
                nextTick(() => {
                  console.log("最终消息状态:", {
                    thinking: chatMessageList[lastIndex].thinking,
                    contentLength: chatMessageList[lastIndex].content.length,
                    contentIsArray: Array.isArray(chatMessageList[lastIndex].content),
                    firstItem: chatMessageList[lastIndex].content[0],
                    templateShouldShow: !chatMessageList[lastIndex].thinking && 
                                        chatMessageList[lastIndex].content && 
                                        Array.isArray(chatMessageList[lastIndex].content) && 
                                        chatMessageList[lastIndex].content.length > 0
                  });
                  
                  // 再次强制更新key，确保视图重新渲染
                  globalUpdateKey.value = Date.now() + 1;
                  scrollToBottom();
                });
              });
            } catch (error) {
              console.error("直接显示内容时出错:", error);
              // 如果出错，尝试使用打字机效果
              chatMessageList[lastIndex].thinking = false;
              nextTick(() => {
        startTypingEffect(processedContent, 0, 0);
              });
            }
          } else {
            console.warn("处理后的内容为空或无效，processedContent:", processedContent);
            // 即使内容为空，也要清除思考状态
            if (chatMessageList.length > 0) {
              const lastIndex = chatMessageList.length - 1;
              chatMessageList[lastIndex].thinking = false;
              chatMessageList[lastIndex].typing = false;
            }
            isProcessingResponse = false; // 重置标记
          }
        } catch (processError) {
          console.error("处理响应数据时出错:", processError);
          // 即使处理失败，也显示原始数据
          if (chatMessageList.length > 0) {
            const lastIndex = chatMessageList.length - 1;
            chatMessageList[lastIndex].content = [{
              type: 'text',
              content: typeof answerData === 'string' ? answerData : JSON.stringify(answerData)
            }];
            chatMessageList[lastIndex].thinking = false;
            chatMessageList[lastIndex].typing = false;
          }
          isProcessingResponse = false; // 重置标记
        }
      } else {
        console.warn("未找到答案数据，chunk结构:", chunk);
        // 如果找不到答案，至少清除思考状态
        if (chatMessageList.length > 0) {
          const lastIndex = chatMessageList.length - 1;
          chatMessageList[lastIndex].thinking = false;
        }
        isProcessingResponse = false; // 重置标记
      }
    }
  } catch (error) {
    console.error('处理数据块时出错:', error, '原始数据:', e);
    // 即使出错也要清除思考状态
    if (chatMessageList.length > 0) {
      const lastIndex = chatMessageList.length - 1;
      if (chatMessageList[lastIndex].thinking) {
        chatMessageList[lastIndex].thinking = false;
      }
    }
  }
};

// 打字机效果 - 优化延迟以提升响应速度
const startTypingEffect = (processedContent, rowIndex, charIndex) => {
  const lastIndex = chatMessageList.length - 1;
  
  // 检查索引有效性
  if (lastIndex < 0) {
    console.error('消息列表为空，无法显示内容');
    return;
  }
  
  // 确保content数组存在
  if (!chatMessageList[lastIndex].content) {
    chatMessageList[lastIndex].content = [];
  }
  
  let messageList = chatMessageList[lastIndex].content;
  
  if (rowIndex < processedContent.length) {
    const currentItem = processedContent[rowIndex];
    
    // 确保currentItem存在且有content属性
    if (!currentItem) {
      console.warn('当前项无效，跳过，rowIndex:', rowIndex);
      startTypingEffect(processedContent, rowIndex + 1, 0);
      return;
    }
    
    if (!currentItem.content) {
      console.warn('当前项没有content属性，跳过:', currentItem);
      startTypingEffect(processedContent, rowIndex + 1, 0);
      return;
    }
    
    let lastStreamMessage = JSON.parse(JSON.stringify(currentItem)); // 深拷贝处理后内容
    const contentLength = typeof lastStreamMessage.content === 'string' 
      ? lastStreamMessage.content.length 
      : 0;
    
    if (contentLength === 0) {
      console.warn('内容长度为0，跳过');
      startTypingEffect(processedContent, rowIndex + 1, 0);
      return;
    }
    
    lastStreamMessage.content = lastStreamMessage.content.slice(0, charIndex + 1);
    
    if (charIndex == 0) {
      // 添加新项
      messageList.push(lastStreamMessage);
      console.log('添加新消息项，类型:', lastStreamMessage.type, '内容长度:', contentLength);
    } else {
      // 更新现有项
      if (messageList[rowIndex]) {
      messageList[rowIndex].content = lastStreamMessage.content;
      } else {
        console.warn('messageList[rowIndex]不存在，rowIndex:', rowIndex, 'messageList长度:', messageList.length);
      }
    }

    scrollToBottom();
    
    // 减少延迟从30ms到10ms，提升打字机效果速度
    setTimeout(() => {
      if (charIndex < contentLength - 1) {
        startTypingEffect(processedContent, rowIndex, charIndex + 1);
      } else {
        // 当前项完成，继续下一项
        console.log('完成第', rowIndex, '项，继续下一项');
        startTypingEffect(processedContent, rowIndex + 1, 0);
      }
    }, 10);
  } else {
    // 所有内容都显示完成
    console.log('打字机效果完成，共显示', processedContent.length, '项，实际显示', messageList.length, '项');
    
    if (chatMessageList[lastIndex]) {
      chatMessageList[lastIndex].typing = false; // 停止打字状态
      chatMessageList[lastIndex].showOptimizer = true; // 显示优化组件
      chatMessageList[lastIndex].isCurrent = true;  // 标记为已完成
      console.log('最终消息内容:', chatMessageList[lastIndex].content);
      console.log('最终消息内容长度:', chatMessageList[lastIndex].content.length);
      
      // 确保内容正确显示
      console.log('最终消息对象:', chatMessageList[lastIndex]);
      console.log('最终内容数组:', chatMessageList[lastIndex].content);
      
      // 如果内容为空，直接赋值完整内容
      if (chatMessageList[lastIndex].content.length === 0 && processedContent.length > 0) {
        console.warn('内容数组为空，直接赋值完整内容');
        chatMessageList[lastIndex].content = processedContent.map(item => ({
          ...item,
          content: typeof item.content === 'string' ? item.content : String(item.content)
        }));
      }
      
      scrollToBottom();
    }
    
    // 重置处理标记
    isProcessingResponse = false;
    
    scrollToBottom();
  }
};


/**
 * 处理响应数据，提取workflow_finished事件的answer字段
 * @param {string|Object|Array} answer - API响应数据
 * @returns {Array} 结构化消息数组
 */
const processResponseData = (answer) => {
  try {
    console.log('processResponseData 输入:', typeof answer, answer);
    
    let parsedData;
    
    // 如果answer已经是数组，直接使用
    if (Array.isArray(answer)) {
      parsedData = answer;
      console.log('answer 是数组，直接使用');
    }
    // 如果answer是对象，尝试转换为数组
    else if (typeof answer === 'object' && answer !== null) {
      parsedData = [answer];
      console.log('answer 是对象，转换为数组');
    }
    // 如果answer是字符串，尝试解析JSON
    else if (typeof answer === 'string') {
      try {
        parsedData = JSON.parse(answer);
        console.log('answer 是字符串，解析为JSON成功');
        
        // 如果解析后不是数组，转换为数组
        if (!Array.isArray(parsedData)) {
          parsedData = [parsedData];
          console.log('解析后不是数组，转换为数组');
        }
      } catch (parseError) {
        // 如果解析失败，当作纯文本处理
        console.log('JSON解析失败，当作纯文本处理');
        return [{
          type: 'text',
          content: marked(answer)
        }];
      }
    }
    // 其他类型，转换为文本
    else {
      console.log('answer 是其他类型，转换为文本');
      return [{
        type: 'text',
        content: marked(String(answer))
      }];
    }

    // 确保parsedData是数组
    if (!Array.isArray(parsedData)) {
      console.warn('parsedData 不是数组，强制转换');
      parsedData = [parsedData];
    }

    console.log('处理前的parsedData:', parsedData);

    // 解析文本中的标签（如<Activity>、<Transport>等），拆分成多个项
    const parseTagsInText = (text) => {
      const result = [];
      const tagPattern = /<(Activity|Attraction|Transport|Accommodation|Restaurant|ask)>(.*?)<\/\1>/g;
      let lastIndex = 0;
      let match;

      while ((match = tagPattern.exec(text)) !== null) {
        // 添加标签前的文本
        if (match.index > lastIndex) {
          const textBefore = text.substring(lastIndex, match.index).trim();
          if (textBefore) {
            result.push({
              type: 'text',
              content: textBefore
            });
          }
        }
        
        // 添加标签项
        const tagType = match[1];
        const tagContent = match[2];
        // 解析标签内容，格式可能是 "ID-Name" 或只有 "Name"
        const parts = tagContent.split('-');
        const id = parts.length > 1 ? parts[0].trim() : '';
        const name = parts.length > 1 ? parts.slice(1).join('-').trim() : tagContent.trim();
        
        result.push({
          type: tagType,
          id: id || '',
          content: name
        });
        
        lastIndex = tagPattern.lastIndex;
      }
      
      // 添加剩余的文本
      if (lastIndex < text.length) {
        const remainingText = text.substring(lastIndex).trim();
        if (remainingText) {
          result.push({
            type: 'text',
            content: remainingText
          });
        }
      }
      
      return result.length > 0 ? result : [{ type: 'text', content: text }];
    };

    const processedData = [];
    
    parsedData.forEach((item, index) => {
      // 如果item是字符串，转换为文本对象
      if (typeof item === 'string') {
        const parsedItems = parseTagsInText(item);
        processedData.push(...parsedItems.map(parsedItem => ({
          ...parsedItem,
          content: parsedItem.type === 'text' ? marked(parsedItem.content) : parsedItem.content
        })));
        return;
      }
      
      // 如果item没有type，默认为text
      if (!item.type) {
        item.type = 'text';
      }
      
      // 如果item没有content，尝试使用其他字段
      if (!item.content && item.text) {
        item.content = item.text;
      }
      if (!item.content && item.message) {
        item.content = item.message;
      }
      if (!item.content) {
        item.content = JSON.stringify(item);
      }

      // 如果item是text类型且包含标签，解析标签
      if (item.type === 'text' && typeof item.content === 'string' && 
          /<(Activity|Attraction|Transport|Accommodation|Restaurant|ask)>/.test(item.content)) {
        const parsedItems = parseTagsInText(item.content);
        processedData.push(...parsedItems.map(parsedItem => ({
          ...parsedItem,
          content: parsedItem.type === 'text' ? marked(parsedItem.content) : parsedItem.content
        })));
        return;
      }

      // 处理表格 内容中有<table>
      if (item.type === 'text' && typeof item.content === 'string' && item.content.includes('<table')) {
        item.content = item.content
          .replace(/<table/g, '<table style="width:100%; border-collapse: collapse; border: 1px solid #ddd; border-top-left-radius: 8px; border-top-right-radius: 8px; overflow: hidden; margin: 20px 0; box-shadow: 0 3px 9px #eee;"')
          .replace(/<th/g, '<th style="border: 1px solid #ddd; padding: 15px 10px; text-align: left; background: #fff; font-size: 14px;"')
          .replace(/<td/g, '<td style="border: 1px solid #ddd; padding: 15px 10px; font-size: 14px; background: #fff; border-bottom: 1px solid #f0f0f0;"');
      }
      
      // 将普通文本消息转换为Markdown格式
      if (!['Activity', 'Attraction', 'Transport', 'Accommodation', 'Restaurant', 'ask'].includes(item.type) && 
          typeof item.content === 'string') {
        item.content = marked(item.content);
      }
      
      processedData.push(item);
    });
    
    console.log('处理后的processedData:', processedData);
    return processedData;

  } catch (error) {
    console.error('处理响应数据出错:', error, '原始数据:', answer);
    // 返回错误提示，但至少显示原始数据
    return [{
      type: 'text',
      content: `处理响应数据时出错: ${error.message}。原始数据: ${typeof answer === 'string' ? answer : JSON.stringify(answer)}`
    }];
  }
}

// 超时处理
let requestTimeout = null;
let hasReceivedData = false; // 标记是否已收到数据

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

  // 重置数据接收标记和处理标记
  hasReceivedData = false;
  isProcessingResponse = false;

  // 设置30秒超时，如果30秒内没有收到任何数据，显示错误
  requestTimeout = setTimeout(() => {
    if (!hasReceivedData && chatMessageList.length > 0) {
      const lastIndex = chatMessageList.length - 1;
      if (chatMessageList[lastIndex].thinking) {
        chatMessageList[lastIndex].thinking = false;
        chatMessageList[lastIndex].typing = false;
        if (chatMessageList[lastIndex].content.length === 0) {
          chatMessageList[lastIndex].content = [{
            type: 'text',
            content: '抱歉，AI响应超时，请检查网络连接后重试。'
          }];
        }
        uni.showToast({
          title: '响应超时，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    }
  }, 30000); // 30秒超时

  try {
    const res = await StreamRequest(`/front/ai/chat/chatMessage-stream-flux`, requestData, 'POST', handleGetBuffer);
    console.log("结束！！！！！", res);
    // 清除超时定时器
    if (requestTimeout) {
      clearTimeout(requestTimeout);
      requestTimeout = null;
    }
  } catch (error) {
    console.error('AI请求失败:', error);
    // 清除超时定时器
    if (requestTimeout) {
      clearTimeout(requestTimeout);
      requestTimeout = null;
    }
    // 确保清除思考动画
    try {
      if (chatMessageList.length > 0) {
        const lastIndex = chatMessageList.length - 1;
        chatMessageList[lastIndex].thinking = false;
        chatMessageList[lastIndex].typing = false;
        if (!chatMessageList[lastIndex].content || chatMessageList[lastIndex].content.length === 0) {
          chatMessageList[lastIndex].content = [{
            type: 'text',
            content: '抱歉，AI响应失败，请稍后重试。'
          }];
        }
      }
      uni.showToast({
        title: 'AI响应失败，请重试',
        icon: 'none',
        duration: 2000
      });
    } catch (displayError) {
      console.error('显示错误消息时出错:', displayError);
    }
  }
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

// 根据名称兜底查ID（当工作流未返回id时）
const resolveIdByName = async (productType, name) => {
  try {
    const n = String(name || '').trim();
    if (!n) return '';
    if (productType === 'Attractions') {
      const res = await uni.request({
        url: 'https://island.zhangshuiyi.com/island/product/ilAttractions/list',
        method: 'GET',
        header: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Access-Token': userStore.token || '' },
        data: { pageNo: 1, pageSize: 100 }
      });
      const list = res?.data?.result?.records || [];
      const found = list.find(i => String(i.name || '').includes(n));
      return found?.id ? String(found.id) : '';
    }
    if (productType === 'Accommodations') {
      const res = await uni.request({
        url: 'https://island.zhangshuiyi.com/island/product/ilAccommodations/list',
        method: 'GET',
        header: { 'Content-Type': 'application/json', 'X-Access-Token': userStore.token || '' },
        data: { pageNo: 1, pageSize: 100 }
      });
      const list = res?.data?.result?.records || [];
      const found = list.find(i => String(i.name || '').includes(n));
      return found?.id ? String(found.id) : '';
    }
    if (productType === 'Dining') {
      const res = await uni.request({
        url: 'https://island.zhangshuiyi.com/island/product/ilDining/list',
        method: 'GET',
        header: { 'Content-Type': 'application/json', 'X-Access-Token': userStore.token || '' },
        data: { pageNo: 1, pageSize: 100 }
      });
      const list = res?.data?.result?.records || [];
      const found = list.find(i => String(i.name || '').includes(n));
      return found?.id ? String(found.id) : '';
    }
    if (productType === 'Activities') {
      const res = await uni.request({
        url: 'https://island.zhangshuiyi.com/island/il-package/list',
        method: 'POST',
        header: { 'Content-Type': 'application/json', 'X-Access-Token': userStore.token || '' },
        data: JSON.stringify({ type: null })
      });
      const list = res?.data?.result || [];
      const found = list.find(i => String(i.packname || i.title || '').includes(n));
      return found?.id ? String(found.id) : '';
    }
    // 运输类暂不做兜底（参数较多，避免误配）
    return '';
  } catch (e) {
    console.log('resolveIdByName error', e);
    return '';
  }
};

// 一键下单：从最后一条 AI 回复中提取商品并创建订单
const oneClickOrder = async () => {
  if (!userStore.token) {
    uni.showToast({
      title: '未登录,请先登录',
      icon: 'none',
      duration: 1500
    });
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    }, 500);
    return;
  }

  // 找到最后一条 AI 消息
  const lastAiMsg = [...chatMessageList].reverse().find(m => m.type === 'ai' && Array.isArray(m.content) && m.content.length > 0);
  if (!lastAiMsg) {
    uni.showToast({
      title: '当前没有可下单的推荐内容',
      icon: 'none'
    });
    return;
  }

  // 从 AI 内容中提取带 id 的项目
  const rawItems = lastAiMsg.content.filter(item => item && item.id && item.type && item.type !== 'text' && item.type !== 'ask');
  if (!rawItems.length) {
    uni.showToast({
      title: 'AI 推荐中未找到可下单商品',
      icon: 'none'
    });
    return;
  }

  uni.showLoading({ title: '准备订单中...' });

  // 去重（按 id + 类型）
  const seen = new Set();
  const itemsForOrder = [];

  for (const cur of rawItems) {
    const key = `${cur.type}-${cur.id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // 映射为后端 productType
    const typeMap = {
      Activity: 'Activities',
      Transport: 'Transportation',
      Accommodation: 'Accommodations',
      Restaurant: 'Dining',
      Attraction: 'Attractions'
    };
    const productType = typeMap[cur.type];
    if (!productType) continue;

    // 兜底ID：若未返回id，尝试按名称查询列表获取id
    let productId = String(cur.id || '').trim();
    if (!productId) {
      productId = await resolveIdByName(productType, cur.content);
      if (!productId) {
        console.log('跳过无id商品', cur);
        continue;
      }
    }

    // 获取价格
    let price = 0;
    let starttime = '';
    let endtime = '';
    try {
      let apiUrl = '';
      let isPackage = false;
      
      if (productType === 'Attractions') {
        apiUrl = 'https://island.zhangshuiyi.com/island/product/ilAttractions/queryById';
      } else if (productType === 'Accommodations') {
        apiUrl = 'https://island.zhangshuiyi.com/island/product/ilAccommodations/queryById';
      } else if (productType === 'Transportation') {
        apiUrl = 'https://island.zhangshuiyi.com/island/product/ilTransportation/queryById';
      } else if (productType === 'Dining') {
        apiUrl = 'https://island.zhangshuiyi.com/island/product/ilDining/queryById';
      } else if (productType === 'Activities') {
         isPackage = true;
         apiUrl = `https://island.zhangshuiyi.com/island/il-package/get/${productId}`;
      }

      let res;
      if (isPackage) {
         res = await uni.request({
            url: apiUrl,
            method: 'GET',
            header: {
               'Content-Type': 'application/json',
               'X-Access-Token': userStore.token || ''
            }
         });
         if (res.statusCode === 200 && res.data && res.data.result) {
            price = parseFloat(res.data.result.price) || 0;
         }
      } else {
         res = await uni.request({
            url: apiUrl,
            method: 'GET',
            header: {
               'Content-Type': 'application/x-www-form-urlencoded',
               'X-Access-Token': userStore.token || ''
            },
            data: { id: productId }
         });
         
         if (res.data && (res.data.success || res.data.code === 200) && res.data.result) {
            const r = res.data.result;
            // 尝试查找价格字段
            if (r.ticketprice !== undefined) price = parseFloat(r.ticketprice);
            else if (r.price !== undefined) price = parseFloat(r.price);
            else if (r.minPrice !== undefined) price = parseFloat(r.minPrice);

            // 尝试查找时间字段
            if (r.starttime) starttime = r.starttime;
            if (r.endtime) endtime = r.endtime;
            // 餐饮类可能使用 starthour/endhour
            if (r.starthour) starttime = r.starthour;
            if (r.endhour) endtime = r.endhour;
         }
      }
    } catch (e) {
      console.error('获取商品详情失败', cur.name, e);
    }

    itemsForOrder.push({
      id: productId,
      name: cur.content,
      type: productType,
      ticketprice: price || 0,
      starttime: starttime,
      endtime: endtime
    });
  }

  uni.hideLoading();

  if (!itemsForOrder.length) {
    uni.showToast({
      title: 'AI 推荐类型暂不支持下单',
      icon: 'none'
    });
    return;
  }

  // 跳转到多商品确认支付页面
  uni.navigateTo({
    url: `/pages/multiConfirmPay/multiConfirmPay?items=${encodeURIComponent(JSON.stringify(itemsForOrder))}`
  });
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

  .input-row {
    width: 100%;
    display: flex;
    align-items: flex-end;
    gap: 16rpx;
  }

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

  .input-row .uv-textarea {
    flex: 1;
    width: auto;
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

/* 工作流样式 - 图片卡片风格 */
.workflow-container {
  margin-top: 20rpx;
  margin-left: 0;
  margin-right: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 1;
  
  .workflow-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 24rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    cursor: pointer;
    position: relative;
    width: 100%;
    box-sizing: border-box;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    
    &:active {
      opacity: 0.9;
    }
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2rpx;
      background: rgba(255, 255, 255, 0.2);
    }
    
    .workflow-title {
      display: flex;
      align-items: center;
      gap: 12rpx;
      font-size: 30rpx;
      font-weight: 700;
      color: #fff;
      
      .workflow-icon {
        font-size: 36rpx;
        filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.2));
      }
      
      .workflow-status {
        font-size: 22rpx;
        padding: 6rpx 16rpx;
        border-radius: 20rpx;
        background: rgba(255, 255, 255, 0.25);
        color: #fff;
        backdrop-filter: blur(10rpx);
        font-weight: 500;
        
        &.finished {
          background: rgba(76, 175, 80, 0.3);
        }
        
        &.error {
          background: rgba(244, 67, 54, 0.3);
        }
      }
    }
    
    .workflow-toggle-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48rpx;
      height: 48rpx;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 50%;
      transition: all 0.3s ease;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
      flex-shrink: 0;
      
      &:active {
        transform: scale(0.9);
        background: rgba(255, 255, 255, 0.35);
      }
      
      // 箭头旋转动画
      :deep(.uv-icon) {
        transition: transform 0.3s ease;
        filter: drop-shadow(0 1rpx 2rpx rgba(0, 0, 0, 0.2));
      }
    }
  }
  
  .workflow-content {
    padding: 16rpx;
    overflow: visible;
    background: #fff;
    width: 100%;
    box-sizing: border-box;
    word-wrap: break-word;
    max-width: 100%;
    
    /* 确保内容可见 */
    &::-webkit-scrollbar {
      width: 8rpx;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #ddd;
      border-radius: 4rpx;
    }
  }
  
  .workflow-node {
    margin-bottom: 12rpx;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    max-width: 100%;
    overflow: visible;
    
    &.has-children .node-item {
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.98);
        background: #f5f7fa;
      }
    }
    
    &.child-node {
      margin-left: 30rpx;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        left: -20rpx;
        top: 0;
        bottom: 0;
        width: 2rpx;
        background: linear-gradient(to bottom, #e0e0e0, transparent);
      }
    }
    
    .node-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 14rpx 16rpx;
      background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
      border-radius: 16rpx;
      border: 1px solid rgba(0, 0, 0, 0.06);
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease;
      gap: 10rpx;
      width: 100%;
      box-sizing: border-box;
      overflow: visible;
      width: 100%;
      box-sizing: border-box;
      
      &:active {
        box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.08);
      }
      
      .node-left {
        display: flex;
        align-items: flex-start;
        gap: 10rpx;
        flex: 1;
        min-width: 0;
        overflow: visible;
        
        .node-icon {
          font-size: 28rpx;
          width: 44rpx;
          height: 44rpx;
          min-width: 44rpx;
          max-width: 44rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
          border-radius: 12rpx;
          box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.06);
          flex-shrink: 0;
        }
        
        .node-title {
          font-size: 24rpx;
          color: #2c3e50;
          font-weight: 500;
          flex: 1;
          min-width: 0;
          word-break: break-all;
          overflow-wrap: break-word;
          line-height: 1.5;
          padding-top: 2rpx;
          overflow: visible;
          white-space: normal;
        }
      }
      
      .node-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6rpx;
        flex-shrink: 0;
        min-width: 110rpx;
        padding-left: 10rpx;
        
        .node-time {
          font-size: 20rpx;
          color: #7f8c8d;
          font-weight: 500;
          background: #f8f9fa;
          padding: 3rpx 8rpx;
          border-radius: 6rpx;
          white-space: nowrap;
          line-height: 1.2;
          text-align: right;
          overflow: visible;
        }
        
        .node-status {
          font-size: 22rpx;
          width: 36rpx;
          height: 36rpx;
          min-width: 36rpx;
          max-width: 36rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
          flex-shrink: 0;
          
          &.success, &.finished {
            background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
            color: #fff;
          }
          
          &.error, &.failed {
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
            color: #fff;
          }
          
          &.running {
            background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
            color: #fff;
            animation: rotate 1s linear infinite;
          }
        }
      }
    }
    
    .node-children {
      margin-top: 12rpx;
    }
  }
  
  .parallel-container {
    margin-top: 24rpx;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: 16rpx;
    padding: 20rpx;
    border: 1px solid rgba(0, 0, 0, 0.06);
    
    .parallel-branches {
      padding-left: 0;
      
      .branch-container {
        margin-bottom: 20rpx;
        background: #fff;
        border-radius: 12rpx;
        padding: 16rpx;
        border: 1px solid rgba(0, 0, 0, 0.06);
        
        .branch-header {
          font-size: 26rpx;
          color: #667eea;
          margin-bottom: 12rpx;
          padding-left: 12rpx;
          font-weight: 600;
          position: relative;
          
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4rpx;
            height: 20rpx;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 2rpx;
          }
        }
        
        .branch-nodes {
          .workflow-node {
            margin-left: 0;
          }
        }
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
