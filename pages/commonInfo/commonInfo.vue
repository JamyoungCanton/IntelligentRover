<template>
  <view class="container">
    <!-- 顶部操作栏 (仅在选择模式显示) -->
    <view class="selection-bar" v-if="isSelectionMode">
      <view class="select-all" @click="toggleSelectAll">
        <checkbox :checked="isAllSelected" color="#3c9cff" style="transform:scale(0.8)" />
        <text>全选</text>
      </view>
      <text class="cancel-btn" @click="exitSelectionMode">取消</text>
    </view>

    <!-- 列表区域 -->
    <view v-if="passengers.length > 0" class="list-container" :class="{ 'with-selection-bar': isSelectionMode }">
      <view class="passenger-card" v-for="(item, index) in passengers" :key="index" @click="handleCardClick(item)">
        <!-- 选择框 (仅在选择模式显示) -->
        <view class="checkbox-wrapper" v-if="isSelectionMode">
           <checkbox :checked="selectedIds.includes(item.id)" color="#3c9cff" style="transform:scale(0.8)" @click.stop="toggleSelect(item.id)" />
        </view>
        
        <view class="card-content">
          <view class="card-header">
            <text class="name">{{ item.name }}</text>
            <view v-if="item.isSelf" class="self-tag">本人</view>
          </view>
          <view class="info-row">
            <text class="label">身份证</text>
            <text class="value">{{ maskIdCard(item.idCard) }}</text>
          </view>
          <view class="info-row">
            <text class="label">手机号码</text>
            <text class="value">{{ maskPhone(item.phone) }}</text>
          </view>
        </view>
        <uni-icons v-if="!isSelectionMode" type="right" size="16" color="#999"></uni-icons>
      </view>
      <view class="no-more">没有更多了</view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text>暂无常用旅客信息</text>
    </view>

    <!-- 底部操作栏 -->
    <view class="footer-bar">
      <button class="btn delete-btn" @click="handleBatchDeleteBtn">
        {{ isSelectionMode ? `删除(${selectedIds.length})` : '批量删除' }}
      </button>
      <button class="btn add-btn" @click="goToAdd" :disabled="isSelectionMode" :class="{ disabled: isSelectionMode }">新增旅客</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const passengers = ref([]);
const isSelectionMode = ref(false);
const selectedIds = ref([]);

const isAllSelected = computed(() => {
  return passengers.value.length > 0 && selectedIds.value.length === passengers.value.length;
});

// 模拟从本地存储获取数据
const loadPassengers = () => {
  const stored = uni.getStorageSync('common_passengers');
  if (stored) {
    passengers.value = JSON.parse(stored);
  } else {
    passengers.value = [];
  }
};

onShow(() => {
  loadPassengers();
  // 重置选择状态
  isSelectionMode.value = false;
  selectedIds.value = [];
});

const maskIdCard = (id) => {
  if (!id) return '';
  return id.replace(/^(\d{6})\d+(\d{2})$/, "$1********$2");
};

const maskPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/^(\d{3})\d+(\d{4})$/, "$1***$2");
};

const goToAdd = () => {
  if (isSelectionMode.value) return;
  uni.navigateTo({
    url: '/pages/commonInfo/addPassenger'
  });
};

const handleCardClick = (item) => {
  if (isSelectionMode.value) {
    toggleSelect(item.id);
  } else {
    editPassenger(item);
  }
};

const editPassenger = (item) => {
    uni.navigateTo({
        url: `/pages/commonInfo/addPassenger?id=${item.id}`
    })
}

const toggleSelect = (id) => {
  const index = selectedIds.value.indexOf(id);
  if (index === -1) {
    selectedIds.value.push(id);
  } else {
    selectedIds.value.splice(index, 1);
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = passengers.value.map(p => p.id);
  }
};

const exitSelectionMode = () => {
  isSelectionMode.value = false;
  selectedIds.value = [];
};

const handleBatchDeleteBtn = () => {
  if (!isSelectionMode.value) {
    // 进入选择模式
    isSelectionMode.value = true;
    return;
  }

  // 执行删除逻辑
  if (selectedIds.value.length === 0) {
    uni.showToast({ title: '请选择要删除的旅客', icon: 'none' });
    return;
  }

  uni.showModal({
      title: '提示',
      content: `确定要删除选中的 ${selectedIds.value.length} 位旅客吗？`,
      success: function (res) {
          if (res.confirm) {
              const newList = passengers.value.filter(p => !selectedIds.value.includes(p.id));
              passengers.value = newList;
              uni.setStorageSync('common_passengers', JSON.stringify(newList));
              
              uni.showToast({ title: '删除成功', icon: 'success' });
              
              // 退出选择模式
              exitSelectionMode();
          }
      }
  });
};
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #F8F8F8;
  padding-bottom: 120rpx; /* 为底部按钮留出空间 */
}

.selection-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);

  .select-all {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: #333;
    
    checkbox {
      margin-right: 10rpx;
    }
  }

  .cancel-btn {
    font-size: 28rpx;
    color: #666;
  }
}

.list-container {
  padding: 20rpx;
  
  &.with-selection-bar {
    padding-top: 20rpx;
  }
}

.passenger-card {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-wrapper {
  margin-right: 20rpx;
  display: flex;
  align-items: center;
}

.card-content {
  flex: 1;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  
  .name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-right: 16rpx;
  }

  .self-tag {
    font-size: 20rpx;
    color: #fff;
    background-color: #3c9cff;
    padding: 2rpx 10rpx;
    border-radius: 20rpx;
  }
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
  font-size: 28rpx;
  color: #666;

  .label {
    width: 140rpx; // 对齐标签
  }
  
  .value {
      color: #999;
  }
}

.no-more {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  margin-top: 20rpx;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  font-size: 28rpx;
  color: #999;
}

.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);

  .btn {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    border-radius: 44rpx;
    font-size: 32rpx;
    margin: 0 15rpx;
    border: none;
    
    &::after {
      border: none;
    }
  }

  .delete-btn {
    background-color: #ff4d4f;
    color: #fff;
  }

  .add-btn {
    background-color: #3c9cff;
    color: #fff;
    
    &.disabled {
      background-color: #ccc;
      color: #fff;
    }
  }
}
</style>