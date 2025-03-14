<template>
  <view class="container">
    <view class="header">
      <text class="title">{{ texts.title }}</text>
      <view class="actions">
        <view class="search-icon">
          <uni-icons :type="icons.search" :size="iconsSize" :color="iconsColor"></uni-icons>
        </view>
        <view class="add-btn" @click="addNewItinerary">
          <text class="plus">{{ icons.plus }}</text>
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
          :url="`/pages/itineraryDetails/itineraryDetails?id=${item.id}`" 
          class="card-image"
        >
          <image :src="getImagePath(item.coverImage)" mode="widthFix"></image>
          <view class="status-tag">{{ item.status }}</view>
        </navigator>
        
        <view class="card-content">
          <!-- 使用 navigator 包裹标题，实现点击标题跳转 -->
          <navigator 
            :url="`/pages/itineraryDetails/itineraryDetails?id=${item.id}`" 
            class="card-title"
          >
            {{ item.title }}
          </navigator>
          <view class="card-date">{{ item.date }}</view>
          
          <view class="card-info">
            <view class="info-item">
              <uni-icons :type="icons.calendar" :size="iconsSizeSmall" :color="iconsColor"></uni-icons>
              <text>{{ item.days }}天</text>
            </view>
            <view class="info-item">
              <uni-icons :type="icons.contact" :size="iconsSizeSmall" :color="iconsColor"></uni-icons>
              <text>{{ item.price }}元</text>
            </view>
            <view class="info-item">
              <uni-icons :type="icons.location" :size="iconsSizeSmall" :color="iconsColor"></uni-icons>
              <text>{{ item.type }}</text>
            </view>
          </view>
        </view>
        
        <view class="card-actions">
          <view class="action-btn-group">
            <view class="action-btn" @click.stop="editItinerary(item.id)">
              <uni-icons :type="icons.edit" :size="iconsSizeMedium" :color="iconsColorDark"></uni-icons>
              <text>编辑</text>
            </view>
            <view class="action-btn" @click.stop="shareItinerary(item.id)">
              <uni-icons :type="icons.share" :size="iconsSizeMedium" :color="iconsColorDark"></uni-icons>
              <text>分享</text>
            </view>
          </view>
          <view class="action-btn delete" @click.stop="deleteItinerary(item.id)">
            <uni-icons :type="icons.trash" :size="iconsSizeMedium" :color="iconsColorDark"></uni-icons>
            <text>删除</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';

const itineraryData = [
  {
    id: 1,
    title: "两天精选海岛行程",
    date: "2024.01.15 - 2024.01.16",
    days: 2,
    price: 1288,
    type: "海岛游",
    status: "未开始",
    coverImage: "island.jpg", // 图片名称，实际路径在组件中处理
    details: [
      { time: "08:00", title: "乘坐摆渡车前往海岛", location: "酒店门口", description: "" },
      { time: "09:00", title: "海岛游览", location: "海岛", description: "享受海滩美景" },
      { time: "14:00", title: "享用午餐", location: "海岛餐厅", description: "" },
      { time: "15:00", title: "返回酒店", location: "酒店", description: "" }
    ]
  },
  {
    id: 2,
    title: "碧海鱼排",
    date: "2024.01.18",
    days: 1,
    price: 398,
    type: "海鲜美食",
    status: "未开始",
    coverImage: "fish-pier.jpg", // 图片名称，实际路径在组件中处理
    details: [
      { time: "08:00", title: "乘坐'万山号'摆渡车前往'碧海渔排'", location: "万山海景酒店门口", description: "" },
      { time: "09:00", title: "在'碧海渔排'进行海钓活动", location: "碧海渔排", description: "享受自助烹饪服务" },
      { time: "14:00", title: "在'碧海渔排'享用午餐", location: "碧海渔排餐厅", description: "" },
      { time: "15:00", title: "乘坐'万山号'摆渡车返回酒店", location: "万山海景酒店", description: "" },
      { time: "16:30", title: "金沙滩海滩漫步", location: "金沙滩海滩", description: "" },
      { time: "18:00", title: "海景餐吧晚餐", location: "海景餐吧", description: "观看夕阳下的海边美景" }
    ]
  }
];

function getImagePath(imageName) {
  return `/static/itinerary/${imageName}`;
}

export default {
  components: {
    uniIcons
  },
  data() {
    return {
      // 文本内容
      texts: {
        title: '我的行程'
      },
      // 图标类型和样式
      icons: {
        search: 'search',
        plus: '+',
        calendar: 'calendar',
        contact: 'contact',
        location: 'location',
        edit: 'edit',
        share: 'share',
        trash: 'trash'
      },
      // 图标大小和颜色
      iconsSize: 24,
      iconsSizeSmall: 16,
      iconsSizeMedium: 18,
      iconsColor: '#666',
      iconsColorDark: '#333',
      // 标签页配置
      tabs: [
        { label: '全部', value: 'all' },
        { label: '进行中', value: 'ongoing' },
        { label: '未开始', value: 'upcoming' },
        { label: '已完成', value: 'completed' }
      ],
      activeTab: 'all',
      // 行程数据
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