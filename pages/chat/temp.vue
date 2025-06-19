<view v-if="chatMessages.length > 0" class="chat-container">
    <details style="color:gray;background-color: #f8f8f8;padding: 8px;border-radius: 4px;" open>
      <summary> Thinking... </summary>啊啊啊啊
    </details>
    <view v-for="(msg, index) in chatMessages" :key="index" class="message-item">
      <view v-if="msg.type === 'user'" class="user-message">
        <div class="message-content">{{ msg.content }}</div>
      </view>

      <view v-else class="ai-message">
        <div class="typing-content" :class="{ typing: isTyping && index === chatMessages.length - 1 }">
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
                <button v-for="day in [1, 2, 3, 4]" :key="day"
                  :class="['day-btn', { active: selectedDays === day }]" @click="selectedDays = day">
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
                <button v-for="tag in preferenceTags" :key="tag"
                  :class="['tag-btn', { active: selectedTag === tag }]"
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
    </view>
  </view>