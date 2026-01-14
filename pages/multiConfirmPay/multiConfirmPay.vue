<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="nav-bar">
        <uni-icons type="left" size="24" color="#333" @click="goBack" class="nav-back"></uni-icons>
        <text class="nav-title">预约支付</text>
      </view>
    </view>
    <!-- 占位符，防止内容被导航栏遮挡 -->
    <view class="nav-placeholder" :style="{ height: (statusBarHeight + 44) + 'px' }"></view>

    <!-- 商品列表 -->
    <view class="section-card">
      <view class="section-title">商品列表</view>
      <view class="item-row" v-for="(item, index) in orderItems" :key="index">
        <view class="item-left" v-if="item.imageUrl || item.image || item.productImage">
          <image 
            :src="item.imageUrl || item.image || item.productImage" 
            mode="aspectFill" 
            class="product-img"
          />
        </view>
        <view class="item-center">
          <text class="item-name">{{ item.goodsName || item.productName || item.name || '未知商品' }}</text>
          <view class="item-type-tag" v-if="item.type || item.productType">
            <text class="type-text">{{ getTypeLabel(item.type || item.productType) }}</text>
          </view>
          <text class="item-desc">{{ item.description || '暂无描述' }}</text>
        </view>
        <view class="item-right">
          <text class="item-price">¥ {{ Number(item.price || item.amount || 0).toFixed(0) }}</text>
          <uni-icons type="close" size="20" color="#3c9cff" class="remove-icon" @click="handleRemoveItem(index)" v-if="orderItems.length > 1"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 选择日期 -->
    <view class="section-card">
      <view class="section-title">选择日期</view>
      <view class="date-scroll">
        <view 
          class="date-item" 
          v-for="(date, index) in dateList" 
          :key="index"
          :class="{ active: selectedDateIndex === index }"
          @click="selectedDateIndex = index"
        >
          <text class="day">{{ date.day }}</text>
          <text class="week">{{ date.week }}</text>
          <text class="month">{{ date.month }}</text>
        </view>
      </view>
      <view class="open-time">开放时间: 08:00 - 17:30</view>
    </view>

    <!-- 预定人信息 -->
    <view class="section-card">
      <view class="section-title">预定人信息</view>
      <view class="passenger-tags">
        <view 
          class="passenger-tag" 
          v-for="(p, index) in selectedPassengers" 
          :key="index"
          :class="{ active: currentPassengerIndex === index }"
          @click="currentPassengerIndex = index"
        >
          {{ index + 1 }}
        </view>
        <view class="add-tag" @click="openPassengerSelector">
          新增/更换
        </view>
      </view>
      
      <view class="contact-info" v-if="currentPassenger">
        <uni-icons type="person" size="18" color="#3c9cff"></uni-icons>
        <text class="label">联系人 {{ currentPassengerIndex + 1 }}</text>
        <text class="value">{{ currentPassenger.name }}</text>
        <text class="label" style="margin-left: 20rpx;">手机号 {{ currentPassengerIndex + 1 }}</text>
        <text class="value">{{ maskPhone(currentPassenger.phone) }}</text>
        <uni-icons type="compose" size="18" color="#3c9cff" class="edit-icon" @click="editPassenger(currentPassenger)"></uni-icons>
      </view>
    </view>

    <!-- 备注 -->
    <view class="section-card">
      <view class="section-title">备注</view>
      <textarea 
        class="remark-input" 
        placeholder="请输入..." 
        v-model="remark"
        auto-height
      />
    </view>

    <!-- 底部栏 -->
    <view class="bottom-bar">
      <view class="total-price">¥ {{ totalAmount }}</view>
      <button class="submit-btn" @click="handleSubmit">提交订单</button>
    </view>
    <!-- 预定人选择弹窗 -->
    <view class="popup-mask" v-if="showPassengerPopup" @click="closePassengerSelector">
      <view class="popup-content" @click.stop>
        <view class="popup-header">
          <text class="popup-title">选择预定人</text>
          <uni-icons type="closeempty" size="24" color="#999" @click="closePassengerSelector"></uni-icons>
        </view>
        <scroll-view scroll-y class="popup-list">
          <view 
            class="popup-item" 
            v-for="(p, index) in passengers" 
            :key="index"
            @click="togglePassengerSelection(p)"
          >
            <view class="popup-item-info">
              <text class="popup-item-name">{{ p.name }}</text>
              <text class="popup-item-phone">{{ maskPhone(p.phone) }}</text>
            </view>
            <view class="popup-item-check">
               <uni-icons v-if="isSelected(p)" type="checkmarkempty" size="24" color="#3c9cff"></uni-icons>
            </view>
          </view>
          <view v-if="passengers.length === 0" class="popup-empty">
            暂无常用旅客
          </view>
        </scroll-view>
        <view class="popup-footer">
          <button class="manage-btn" @click="goToPassengerManage">管理/新增旅客</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
const statusBarHeight = ref(0);
const orderSn = ref('');
const orderItems = ref([]);
const dateList = ref([]);
const selectedDateIndex = ref(0);
const remark = ref('');

const goBack = () => {
  uni.navigateBack();
};

// 预定人相关
const passengers = ref([]); // 所有常用旅客
const selectedPassengers = ref([]); // 当前订单选中的旅客
const currentPassengerIndex = ref(0);
const showPassengerPopup = ref(false);

const currentPassenger = computed(() => selectedPassengers.value[currentPassengerIndex.value] || null);

const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + Number(item.price || item.amount || 0), 0).toFixed(2);
});

onLoad((options) => {
  uni.setNavigationBarTitle({
    title: '订单详情'
  });

  if (options.orderSn) {
    orderSn.value = options.orderSn;
    fetchOrderDetail();
  } else if (options.orderSns) {
    try {
      const sns = JSON.parse(decodeURIComponent(options.orderSns));
      if (Array.isArray(sns) && sns.length > 0) {
        fetchMultipleOrders(sns);
      }
    } catch (e) {
      console.error('解析订单号失败', e);
    }
  } else if (options.items) {
    // 兼容直接传 items 的情况 (如 Attraction/Food 跳转)
    try {
      const items = JSON.parse(decodeURIComponent(options.items));
      if (Array.isArray(items) && items.length > 0) {
        orderItems.value = items;
      }
    } catch (e) {
      console.error('解析商品信息失败', e);
    }
  } else {
    // 尝试从 storage 获取 items (解决 URL 长度限制问题)
    const storedItems = uni.getStorageSync('tempOrderItems');
    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        if (Array.isArray(items) && items.length > 0) {
          orderItems.value = items;
        }
        // 清除 storage，避免污染
        uni.removeStorageSync('tempOrderItems');
      } catch (e) {
        console.error('解析 Storage 商品信息失败', e);
      }
    }
  }
  generateDates();
});

onShow(() => {
  loadCommonPassengers();
});

const loadCommonPassengers = () => {
  const stored = uni.getStorageSync('common_passengers');
  if (stored) {
    passengers.value = JSON.parse(stored);
    
    // 验证已选旅客是否仍在列表中（防止被删除）
    const validIds = passengers.value.map(p => p.id);
    const validSelected = selectedPassengers.value.filter(p => validIds.includes(p.id));
    
    // 如果有被删除的，更新已选列表
    if (validSelected.length !== selectedPassengers.value.length) {
      selectedPassengers.value = validSelected;
      if (currentPassengerIndex.value >= selectedPassengers.value.length) {
        currentPassengerIndex.value = Math.max(0, selectedPassengers.value.length - 1);
      }
    }

    // 默认选中第一个作为初始预定人，如果没有则为空
    if (selectedPassengers.value.length === 0 && passengers.value.length > 0) {
      selectedPassengers.value = [passengers.value[0]];
      currentPassengerIndex.value = 0;
    }
  } else {
    passengers.value = [];
  }
};

const openPassengerSelector = () => {
  showPassengerPopup.value = true;
};

const closePassengerSelector = () => {
  showPassengerPopup.value = false;
};

const isSelected = (p) => {
  return selectedPassengers.value.some(item => item.id === p.id);
};

const togglePassengerSelection = (p) => {
  const idx = selectedPassengers.value.findIndex(item => item.id === p.id);
  if (idx > -1) {
    // 已选中，取消选中
    selectedPassengers.value.splice(idx, 1);
    // 如果取消的是当前展示的，调整index
    if (currentPassengerIndex.value >= selectedPassengers.value.length) {
      currentPassengerIndex.value = Math.max(0, selectedPassengers.value.length - 1);
    }
  } else {
    // 未选中，添加
    selectedPassengers.value.push(p);
    // 选中新添加的
    currentPassengerIndex.value = selectedPassengers.value.length - 1;
  }
};

const goToPassengerManage = () => {
  uni.navigateTo({
    url: '/pages/commonInfo/commonInfo'
  });
};

const getTypeLabel = (type) => {
  const t = (type || '').toLowerCase();
  if (t === 'attractions' || t === 'scenic') return '景点';
  if (t === 'accommodations' || t === 'hotel') return '酒店';
  if (t === 'dining' || t === 'food') return '美食';
  return '商品';
};

const maskPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/^(\d{3})\d+(\d{4})$/, "$1****$2");
};

const generateDates = () => {
  const list = [];
  const today = new Date();
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    list.push({
      day: d.getDate(),
      week: weeks[d.getDay()],
      month: (d.getMonth() + 1) + '月'
    });
  }
  dateList.value = list;
};

const fetchMultipleOrders = async (sns) => {
  uni.showLoading({ title: '加载中' });
  try {
    const promises = sns.map(sn => {
      return new Promise((resolve) => {
        uni.request({
          url: `https://island.zhangshuiyi.com/island/front/order/getMyOrderInfo/${sn}`,
          method: 'GET',
          header: { 'X-Access-Token': userStore.token },
          success: (res) => {
            if (res.data.success) {
              resolve(res.data.result);
            } else {
              resolve(null);
            }
          },
          fail: () => resolve(null)
        });
      });
    });
    
    const results = await Promise.all(promises);
    orderItems.value = results.filter(item => item !== null);
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
};

const fetchOrderDetail = () => {
  uni.request({
    url: `https://island.zhangshuiyi.com/island/front/order/getMyOrderInfo/${orderSn.value}`,
    method: 'GET',
    header: { 'X-Access-Token': userStore.token },
    success: (res) => {
      if (res.data.success) {
        orderItems.value = [res.data.result];
      }
    }
  });
};

const handleRemoveItem = (index) => {
  orderItems.value.splice(index, 1);
};

const handleSubmit = () => {
  if (orderItems.value.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' });
    return;
  }
  if (selectedPassengers.value.length === 0) {
    uni.showToast({ title: '请选择预定人', icon: 'none' });
    return;
  }
  
  // 如果已经有 orderSn (比如从订单列表进来)，直接去支付
  if (orderSn.value) {
    const allSns = JSON.stringify([orderSn.value]);
    uni.redirectTo({
       url: `/pages/order/detail?orderSn=${orderSn.value}&orderSns=${encodeURIComponent(allSns)}`
    });
    return;
  }

  // 创建订单
  createOrder();
};

const createOrder = () => {
  uni.showLoading({ title: '正在提交...' });
  
  // 构造订单数据
  // 假设每个选中的预定人对应一份商品（这里简化处理，如果商品数量逻辑复杂需调整）
  // 对于每个商品，为每个预定人创建一个 item
  const allItems = [];
  const dateStr = dateList.value[selectedDateIndex.value] ? 
    `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2, '0')}-${String(dateList.value[selectedDateIndex.value].day).padStart(2, '0')}` 
    : new Date().toISOString().split('T')[0];

  orderItems.value.forEach(product => {
    selectedPassengers.value.forEach(passenger => {
      allItems.push({
        bookInfo: {
          date: dateStr,
          fullname: passenger.name,
          idCardNo: passenger.idCard, // 假设 passenger 对象有 idCard 字段，注意字段名匹配
          idCardType: "ID_CARD",
          schedule: product.starttime || "08:00"
        },
        productId: product.id,
        productType: product.type || "Accommodations",
        quantity: 1,
        price: Number(product.price || 0),
        amount: Number(product.price || 0),
        name: product.name,
        image: product.imageUrl || product.image || '',
        specs: ''
      });
    });
  });

  const orderData = {
    contract: {
      contractName: selectedPassengers.value[0].name,
      contractPhone: selectedPassengers.value[0].phone
    },
    items: allItems,
    travelStartDate: `${dateStr} 00:00:00`,
    travelEndDate: `${dateStr} 23:59:59`, // 简化的时间逻辑
    remark: remark.value
  };

  uni.request({
    url: 'https://island.zhangshuiyi.com/island/front/order/createOrder',
    method: 'POST',
    header: { 'Content-Type': 'application/json', 'X-Access-Token': userStore.token },
    data: orderData,
    success: (res) => {
      uni.hideLoading();
      if (res.data.success || res.data.code === 200) {
        const resultSn = res.data.result.orderSn || res.data.result.id;
        const sns = resultSn ? [resultSn] : []; // 暂时假设返回一个主订单号或 ID
        
        // 跳转到订单详情页进行支付
        const allSns = JSON.stringify(sns);
        // 获取第一个订单号作为主订单号
        const mainSn = sns[0];
        
        uni.redirectTo({
           url: `/pages/order/detail?orderSn=${mainSn}&orderSns=${encodeURIComponent(allSns)}`
        });
      } else {
        uni.showToast({ title: res.data.message || '下单失败', icon: 'none' });
      }
    },
    fail: () => {
      uni.hideLoading();
      uni.showToast({ title: '网络请求失败', icon: 'none' });
    }
  });
};

const editPassenger = (p) => {
    uni.navigateTo({
        url: `/pages/commonInfo/addPassenger?id=${p.id}`
    })
}

</script>

<style lang="scss" scoped>
.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  z-index: 999;
  border-bottom: 1px solid #eee;
}

.status-bar {
  width: 100%;
  background-color: #fff;
}

.nav-bar {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.nav-back {
  padding: 5px;
}

.nav-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-left: 5px;
  flex: 1;
  text-align: center;
  margin-right: 34px;
}

.nav-placeholder {
  width: 100%;
}

.page {
  min-height: 100vh;
  background-color: #F8F8F8;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.section-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.02);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

/* 商品列表 */
.item-row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.item-left {
  width: 120rpx;
  height: 120rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  overflow: hidden;
  flex-shrink: 0;
}

.product-img {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.item-center {
  flex: 1;
}

.item-name {
  font-size: 30rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.item-type-tag {
  display: flex;
  align-items: center;
  background-color: #f0f2f5;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  align-self: flex-start;
  width: fit-content;
}

.type-text {
  font-size: 22rpx;
  color: #666;
  margin-left: 6rpx;
}

.item-desc {
  font-size: 24rpx;
  color: #999;
}

.item-right {
  display: flex;
  align-items: center;
}

.item-price {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-right: 20rpx;
}

/* 日期选择 */
.date-scroll {
  display: flex;
  overflow-x: auto;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.date-item {
  width: 120rpx;
  height: 140rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  &.active {
    background-color: #E6F7FF;
    border: 1px solid #3c9cff;
    
    .day, .week, .month {
      color: #3c9cff;
    }
  }
  
  .day {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
  
  .week {
    font-size: 24rpx;
    color: #666;
    margin: 4rpx 0;
  }
  
  .month {
    font-size: 20rpx;
    color: #999;
  }
}

.open-time {
  font-size: 24rpx;
  color: #999;
}

/* 预定人 */
.passenger-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.passenger-tag {
  padding: 10rpx 30rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
  
  &.active {
    background-color: #E6F7FF;
    color: #3c9cff;
    border: 1px solid #3c9cff;
  }
}

.add-tag {
  padding: 10rpx 30rpx;
  border: 1px dashed #3c9cff;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #3c9cff;
}

.contact-info {
  background-color: #E6F7FF;
  padding: 20rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  
  .label {
    font-size: 26rpx;
    color: #666;
    margin: 0 10rpx;
  }
  
  .value {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
  }
  
  .edit-icon {
    margin-left: auto;
  }
}

/* 备注 */
.remark-input {
  width: 100%;
  min-height: 100rpx;
  font-size: 28rpx;
  color: #333;
}

/* 底部栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  z-index: 100;
}

.total-price {
  font-size: 40rpx;
  font-weight: bold;
  color: #3c9cff;
}

.submit-btn {
  background-color: #3c9cff;
  color: #fff;
  font-size: 32rpx;
  padding: 0 60rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  margin: 0;
}

/* 弹窗样式 */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.popup-content {
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.popup-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.popup-list {
  max-height: 500rpx;
  margin-bottom: 30rpx;
}

.popup-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.popup-item-info {
  display: flex;
  flex-direction: column;
}

.popup-item-name {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 6rpx;
}

.popup-item-phone {
  font-size: 24rpx;
  color: #999;
}

.popup-empty {
  text-align: center;
  color: #999;
  padding: 40rpx 0;
  font-size: 28rpx;
}

.popup-footer {
  padding-top: 10rpx;
}

.manage-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #f5f5f5;
  color: #3c9cff;
  font-size: 30rpx;
  border-radius: 40rpx;
  border: 1px solid #e0e0e0;
}
</style>