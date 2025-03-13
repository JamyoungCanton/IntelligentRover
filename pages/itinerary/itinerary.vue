<template>
  <view class="container">
    <view class="header">
      <text class="title">我的行程</text>
      <view class="actions">
        <view class="search-icon">
          <uni-icons type="search" size="24" color="#666"></uni-icons>
        </view>
        <view class="add-btn" @click="addNewItinerary">
          <text class="plus">+</text>
        </view>
      </view>
    </view>
    
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === tab.value }" 
        v-for="tab in tabs" 
        :key="tab.value"
        @click="changeTab(tab.value)"
      >
        {{ tab.label }}
      </view>
    </view>
    
    <view class="itinerary-list">
      <view 
        class="itinerary-card" 
        v-for="item in filteredItineraries" 
        :key="item.id"
      >
        <!-- 使用 navigator 包裹图片，实现点击图片跳转 -->
        <navigator 
          :url="`/pages/itinerary/itineraryDetails?id=${item.id}`" 
          class="card-image"
        >
          <image :src="getImagePath(item.coverImage)" mode="widthFix"></image>
          <view class="status-tag">{{ item.status }}</view>
        </navigator>
        
        <view class="card-content">
          <!-- 使用 navigator 包裹标题，实现点击标题跳转 -->
          <navigator 
            :url="`/pages/itinerary/itineraryDetails?id=${item.id}`" 
            class="card-title"
          >
            {{ item.title }}
          </navigator>
          <view class="card-date">{{ item.date }}</view>
          
          <view class="card-info">
            <view class="info-item">
              <uni-icons type="calendar" size="16" color="#666"></uni-icons>
              <text>{{ item.days }}天</text>
            </view>
            <view class="info-item">
              <uni-icons type="contact" size="16" color="#666"></uni-icons>
              <text>{{ item.price }}元</text>
            </view>
            <view class="info-item">
              <uni-icons type="location" size="16" color="#666"></uni-icons>
              <text>{{ item.type }}</text>
            </view>
          </view>
        </view>
        
        <view class="card-actions">
          <view class="action-btn-group">
            <view class="action-btn" @click.stop="editItinerary(item.id)">
              <uni-icons type="edit" size="18" color="#333"></uni-icons>
              <text>编辑</text>
            </view>
            <view class="action-btn" @click.stop="shareItinerary(item.id)">
              <uni-icons type="share" size="18" color="#333"></uni-icons>
              <text>分享</text>
            </view>
          </view>
          <view class="action-btn delete" @click.stop="deleteItinerary(item.id)">
            <uni-icons type="trash" size="18" color="#333"></uni-icons>
            <text>删除</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { itineraryData, getImagePath } from './itinerary.js';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';

export default {
  components: {
    uniIcons
  },
  data() {
    return {
      tabs: [
        { label: '全部', value: 'all' },
        { label: '进行中', value: 'ongoing' },
        { label: '未开始', value: 'upcoming' },
        { label: '已完成', value: 'completed' }
      ],
      activeTab: 'all',
      itineraries: itineraryData
    };
  },
  computed: {
    filteredItineraries() {
      if (this.activeTab === 'all') return this.itineraries;
      
      return this.itineraries.filter(item => {
        if (this.activeTab === 'upcoming') return item.status === '未开始';
        return true;
      });
    }
  },
  methods: {
    getImagePath(imageName) {
      return getImagePath(imageName);
    },
    changeTab(value) {
      this.activeTab = value;
    },
    editItinerary(id) {
      uni.showToast({
        title: `编辑行程 ${id}`,
        icon: 'none'
      });
    },
    shareItinerary(id) {
      uni.showToast({
        title: `分享行程 ${id}`,
        icon: 'none'
      });
    },
    deleteItinerary(id) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除行程 ${id} 吗？`,
        success: (res) => {
          if (res.confirm) {
            this.itineraries = this.itineraries.filter(item => item.id !== id);
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            });
          }
        }
      });
    },
    addNewItinerary() {
      uni.showToast({
        title: '添加新行程',
        icon: 'none'
      });
    }
  }
};
</script>

<style scoped>
.container {
  padding: 0 20px;
  background-color: #f7f7f7;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.title {
  font-size: 24px;
  font-weight: bold;
}

.actions {
  display: flex;
  align-items: center;
}

.search-icon {
  margin-right: 20px;
}

.plus {
  font-size: 28px;
  color: #1989fa;
}

.tabs {
  display: flex;
  background-color: #fff;
  border-radius: 10px;
  margin-bottom: 20px;
  overflow: hidden;
}

.tab-item {
  padding: 10px 20px;
  color: #666;
}

.tab-item.active {
  background-color: #1989fa;
  color: #fff;
}

.itinerary-list {
  margin-bottom: 60px;
}

.itinerary-card {
  background-color: #fff;
  border-radius: 15px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.card-image {
  position: relative;
}

.card-image image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.status-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 14px;
}

.card-content {
  padding: 15px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.card-date {
  color: #666;
  margin-bottom: 10px;
}

.card-info {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  align-items: center;
}

.info-item {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 14px;
}

.info-item uni-icons {
  margin-right: 5px;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  border-top: 1px solid #f0f0f0;
}

.action-btn-group {
  display: flex;
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #333;
}

.action-btn uni-icons {
  margin-right: 5px;
}

.action-btn.delete {
  color: #ff5a5f;
}
</style>