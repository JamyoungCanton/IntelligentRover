<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav">
      <view class="search-container">
        <view class="search-wrapper">
          <uni-icons class="search-icon" type="search" size="16" color="#999"></uni-icons>
          <input class="search-input" type="text" placeholder="搜索订单编号/景点名称" v-model="searchKeyword"
            @input="e => debouncedSearch(e.target.value)" @confirm="getOrderList" />
        </view>
        <view class="filter-btn" @click="getOrderList">
          <uni-icons type="search" size="20" color="#1890FF"></uni-icons>
        </view>
      </view>
      <scroll-view class="order-status-tabs" scroll-x>
        <view class="tabs-wrapper">
          <view v-for="(tab, index) in tabs" :key="index" class="tab-item" :class="{ active: currentTab === index }"
            @click="handleTabClick(index)">
            {{ tab }}
            <view v-if="currentTab === index" class="tab-indicator"></view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 主内容区 -->
    <scroll-view class="main-content" scroll-y>


      <view class="order-list">
        <!-- 无订单数据时显示 -->
        <view v-if="filteredOrders.length === 0" class="no-order">
          <text>暂无符合条件的订单数据</text>
        </view>

        <!-- 动态渲染订单列表 -->
        <view v-else v-for="(order, index) in filteredOrders" :key="order.id || index" class="order-item">
          <view class="order-header">
            <text class="order-title">{{ order.orderSn || '未知订单' }}</text>
            <text class="order-status" :class="{
              'waiting': order.payStatus === 'UNPAID',
              'paid': order.payStatus === 'PAID',
              'completed': order.payStatus === 'CANCEL'
            }">
              {{ order.payStatus === 'UNPAID' ? '待支付' :
                order.payStatus === 'PAID' ? '已支付' :
                  order.payStatus === 'CANCEL' ? '已取消' : '未知状态' }}
            </text>
          </view>
          <view class="order-info">
            <image class="order-image"
              src="https://ai-public.mastergo.com/ai/img_res/eca975b4a54bcecdd2e27d4c0f8a986a.jpg" mode="aspectFill">
            </image>
            <view class="order-details">
              <text class="detail-text">创建时间：{{ order.createTime || '未知' }}</text>
              <text class="detail-text">联系人：{{ order.contractName || '未知' }}</text>
              <text class="detail-text">订单号：{{ order.orderSn || '未知' }}</text>
            </view>
          </view>
          <view class="order-footer">
            <text class="price">¥ {{ order.amount || 0 }}</text>
            <view class="button-group">
              <button v-if="order.payStatus === 'UNPAID'" class="btn btn-default">取消订单</button>
              <button v-if="order.payStatus === 'UNPAID'" class="btn btn-primary">立即支付</button>
              <button v-else class="btn btn-primary">查看详情</button>
            </view>
          </view>
        </view>


      </view>



    </scroll-view>


  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user';

const tabs = ['全部', '待支付', '待出行', '进行中', '已完成'];
const currentTab = ref(0);
const orders = ref([]); // 存储订单数据
const userStore = useUserStore();
const searchKeyword = ref(''); // 搜索关键词

// 订单状态映射
const statusMap = {
  1: { payStatus: 'UNPAID' }, // 待支付
  2: { orderStatus: 'WAITING' }, // 待出行
  3: { orderStatus: 'PROCESSING' }, // 进行中
  4: { orderStatus: 'COMPLETED' } // 已完成
};

// 根据当前标签和搜索关键词过滤订单
const filteredOrders = computed(() => {
  let result = orders.value;

  // 根据标签筛选
  if (currentTab.value !== 0) { // 不是"全部"标签
    const status = statusMap[currentTab.value];
    result = result.filter(order => {
      return Object.entries(status).every(([key, value]) => order[key] === value);
    });
  }

  // 根据搜索关键词筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(order =>
      (order.orderSn && order.orderSn.toLowerCase().includes(keyword)) || // 订单编号
      (order.title && order.title.toLowerCase().includes(keyword)) // 景点名称
    );
  }

  return result;
});

// 搜索处理函数
const handleSearch = (value) => {
  searchKeyword.value = value;
};

// 防抖函数
const debounce = (fn, delay = 300) => {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

// 带防抖的搜索处理函数  如果用户快速输入多个字符，只有在用户停止输入300ms后才会执行一次搜索 
const debouncedSearch = debounce(handleSearch);

// 切换标签页处理函数
const handleTabClick = (index) => {
  currentTab.value = index;
  getOrderList(); // 切换标签时重新获取订单列表
};

// 获取订单列表
const getOrderList = () => {
  // 显示加载提示
  uni.showLoading({
    title: '加载订单中...'
  });

  // 构建请求参数
  const params = {
    pageNo: 1,
    pageSize: 10
  };

  // 添加标签对应的筛选条件
  if (currentTab.value !== 0) {
    Object.assign(params, statusMap[currentTab.value]);
  }

  // 添加搜索关键词
  if (searchKeyword.value) {
    params.keyword = searchKeyword.value;
  }

  // 发起请求获取订单列表
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/order/ilOrder/list',
    method: 'GET',
    data: params,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token
    },
    success: (res) => {
      console.log('订单列表响应数据:', res.data);
      // 如果请求成功，更新订单数据
      if (res.data.success) {
        orders.value = res.data.result.records || [];
      }
    },
    fail: (err) => {
      console.error('获取订单列表失败:', err);
      uni.showToast({
        title: '获取订单失败',
        icon: 'none'
      });
    },
    complete: () => {
      uni.hideLoading();
    }
  });
};

// 每次进入页面时调用
onShow(() => {
  console.log('订单页面显示');
  getOrderList();
});
</script>

<style>
page {
  height: 100%;
}

.page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
}

/* 导航样式 */
.nav {
  background: #fff;
  padding-top: 20rpx;
  flex-shrink: 0;
}

.search-container {
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  margin-bottom: 20rpx;
}

.search-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 16rpx;
  padding: 20rpx;
  position: relative;
}

.search-icon {
  margin-right: 20rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
}

.filter-btn {
  margin-left: 20rpx;
  padding: 20rpx;
}

.order-status-tabs {
  white-space: nowrap;
  padding: 0 30rpx 20rpx;
}

.tabs-wrapper {
  display: inline-flex;
}

.tab-item {
  padding: 20rpx 30rpx;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #1890FF;
  font-weight: 500;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4rpx;
  background-color: #1890FF;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  overflow: auto;
}

.order-list {
  padding: 30rpx;
}

.order-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.order-title {
  font-size: 32rpx;
  font-weight: 500;
}

.order-status {
  font-size: 28rpx;
}

.order-status.waiting {
  color: #1890FF;
}

.order-status.paid {
  color: #52c41a;
}

.order-status.completed {
  color: #999;
}

.order-info {
  display: flex;
  margin-bottom: 20rpx;
}

.order-image {
  width: 200rpx;
  height: 140rpx;
  border-radius: 12rpx;
}

.order-details {
  flex: 1;
  margin-left: 20rpx;
}

.detail-text {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 2rpx solid #f5f5f5;
}

.price {
  font-size: 32rpx;
  font-weight: 500;
}

.button-group {
  display: flex;
  gap: 20rpx;
}

.btn {
  font-size: 24rpx;
  padding: 12rpx 30rpx;
  border-radius: 8rpx;
}

.btn-default {
  background: #fff;
  border: 2rpx solid #ddd;
  color: #666;
}

.btn-primary {
  background: #1890FF;
  color: #fff;
}
</style>
