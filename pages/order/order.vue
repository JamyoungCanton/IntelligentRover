<template>
  <view class="page">
    <!-- 订单详情弹窗 -->
    <view class="detail-popup" v-if="showDetailPopup">
      <view class="popup-mask" @click="closeDetailPopup"></view>
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">订单详情</text>
          <view class="close-btn" @click="closeDetailPopup">
            <uni-icons type="close" size="20" color="#666"></uni-icons>
          </view>
        </view>
        <scroll-view class="popup-body" scroll-y>
          <view class="detail-item" v-if="currentOrderDetail">
            <view class="detail-row">
              <text class="label">商品名称：</text>
              <text class="value">{{ currentOrderDetail.goodsName || '未知商品' }}</text>
            </view>
            <view class="detail-row">
              <text class="label">订单编号：</text>
              <text class="value">{{ currentOrderDetail.orderSn || '未知' }}</text>
            </view>
            <view class="detail-row">
              <text class="label">下单时间：</text>
              <text class="value">{{ currentOrderDetail.createTime || '未知' }}</text>
            </view>
            <view class="detail-row">
              <text class="label">订单金额：</text>
              <text class="value">¥{{ currentOrderDetail.amount || '0' }}</text>
            </view>
            <view class="detail-row">
              <text class="label">支付状态：</text>
              <text class="value" :class="{
                'status-waiting': currentOrderDetail.payStatus === 'UNPAID',
                'status-paid': currentOrderDetail.payStatus === 'PAID',
                'status-cancel': currentOrderDetail.payStatus === 'CANCEL'
              }">
                {{ currentOrderDetail.payStatus === 'UNPAID' ? '待支付' :
                  currentOrderDetail.payStatus === 'PAID' ? '已支付' :
                    currentOrderDetail.payStatus === 'CANCEL' ? '已取消' : '未知状态' }}
              </text>
            </view>
            <view class="detail-row">
              <text class="label">联系人：</text>
              <text class="value">{{ currentOrderDetail.contractName || '未知' }}</text>
            </view>
            <view class="detail-row" v-if="currentOrderDetail.contractPhone">
              <text class="label">联系电话：</text>
              <text class="value">{{ currentOrderDetail.contractPhone }}</text>
            </view>
            <view class="detail-row" v-if="currentOrderDetail.remark">
              <text class="label">备注信息：</text>
              <text class="value">{{ currentOrderDetail.remark }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
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
            <text class="order-title">{{ order.goodsName || '未知商品' }}</text>
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
            <image class="order-image" src="https://ai-public.mastergo.com/ai/img_res/eca975b4a54bcecdd2e27d4c0f8a986a.jpg" mode="aspectFill">
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
              <button v-if="order.payStatus === 'UNPAID'" class="btn btn-default" @click="cancelOrder(order.id)">取消订单</button>
              <button v-if="order.payStatus === 'UNPAID'" class="btn btn-primary" @click="payOrder(order)">立即支付</button>
              <button v-else class="btn btn-primary" @click="getOrderDetail(order.id)">查看详情</button>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user';

const tabs = ['全部', '待支付', '待出行', '进行中', '已完成'];
const currentTab = ref(0);
const orders = ref([]);
const userStore = useUserStore();
const searchKeyword = ref('');
const showDetailPopup = ref(false);
const currentOrderDetail = ref(null);

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

  // 按照创建时间降序排序，最近的订单在最上面
  result.sort((a, b) => {
    const dateA = new Date(a.createTime);
    const dateB = new Date(b.createTime);
    return dateB - dateA;
  });

  return result;
});

// 搜索按钮点击事件
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

// 带防抖的搜索处理函数
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
    pageSize: 300
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
    success: async (res) => {
      console.log('订单列表响应数据:', res.data);
      // 如果请求成功，更新订单数据
      if (res.data.success) {
        const orderList = res.data.result.records || [];
        // 为每个订单获取详细信息
        const ordersWithDetails = await Promise.all(
          orderList.map(async (order) => {
            // 获取订单详情
            const details = await new Promise((resolve) => {
              uni.request({
                url: 'https://island.zhangshuiyi.com/island/order/ilOrder/listIlOrderItemByMainId',
                method: 'GET',
                data: {
                  orderId: order.id,
                  pageNo: 1,
                  pageSize: 10
                },
                header: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'X-Access-Token': userStore.token
                },
                success: (detailRes) => {
                  if (detailRes.data.success && detailRes.data.result.records?.length > 0) {
                    // 获取第一个订单项的商品名称
                    resolve(detailRes.data.result.records[0].goodsName || '未知商品');
                  } else {
                    resolve('未知商品');
                  }
                },
                fail: () => resolve('未知商品')
              });
            });

            // 将商品名称添加到订单对象中
            return {
              ...order,
              goodsName: details
            };
          })
        );

        // 更新订单列表
        orders.value = ordersWithDetails;
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

// 根据订单ID查询订单明细并显示弹窗
const getOrderDetail = (orderId) => {
  // 显示加载提示
  uni.showLoading({
    title: '加载订单详情...'
  });

  // 先找到当前订单的基本信息
  const currentOrder = orders.value.find(order => order.id === orderId);
  if (currentOrder) {
    currentOrderDetail.value = currentOrder;
  }

  // 构建请求参数
  const params = {
    orderId: orderId,
    pageNo: 1,
    pageSize: 10
  };

  // 发起请求获取订单明细
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/order/ilOrder/listIlOrderItemByMainId',
    method: 'GET',
    data: params,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token
    },
    success: (res) => {
      console.log('订单明细响应数据:', res.data);
      if (res.data.success) {
        const orderItems = res.data.result.records || [];
        // 更新当前订单详情
        if (orderItems.length > 0) {
          currentOrderDetail.value = {
            ...currentOrderDetail.value,
            ...orderItems[0],
            items: orderItems
          };
        }
        // 显示弹窗
        showDetailPopup.value = true;
      } else {
        uni.showToast({
          title: res.data.message || '获取订单明细失败',
          icon: 'none'
        });
      }
    },
    fail: (err) => {
      console.error('获取订单明细失败:', err);
      uni.showToast({
        title: '获取订单明细失败',
        icon: 'none'
      });
    },
    complete: () => {
      uni.hideLoading();
    }
  });
};

// 取消订单
const cancelOrder = (orderId) => {
  // 显示确认弹窗
  uni.showModal({
    title: '确认取消',
    content: '确定要取消该订单吗？',
    success: (res) => {
      if (res.confirm) {
        // 用户点击确定，发送取消订单请求
        uni.showLoading({
          title: '取消订单中...'
        });

        // 发起请求取消订单
        uni.request({
          url: 'https://island.zhangshuiyi.com/island/order/ilOrder/delete',
          method: 'DELETE',
          data: {
            id: orderId
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Access-Token': userStore.token
          },
          success: (res) => {
            console.log('取消订单响应数据:', res.data);
            if (res.data.success) {
              uni.showToast({
                title: '订单已取消',
                icon: 'success'
              });
              // 刷新订单列表
              getOrderList();
            } else {
              uni.showToast({
                title: res.data.message || '取消订单失败',
                icon: 'none'
              });
            }
          },
          fail: (err) => {
            console.error('取消订单请求失败:', err);
            uni.showToast({
              title: '取消订单失败',
              icon: 'none'
            });
          },
          complete: () => {
            uni.hideLoading();
          }
        });
      }
    }
  });
};

// 支付订单
const payOrder = (order) => {
  // 显示确认弹窗
  uni.showModal({
    title: '确认支付',
    content: `确定要支付该订单吗？金额: ¥${order.amount}`,
    success: (res) => {
      if (res.confirm) {
        // 用户点击确定，发送支付请求
        uni.showLoading({
          title: '处理支付中...'
        });

        // 模拟支付过程
        setTimeout(() => {
          // 支付成功后，更新订单状态
          updateOrderStatus(order.id);
        }, 1500);
      }
    }
  });
};

// 更新订单状态
const updateOrderStatus = (orderId) => {
  // 获取当前时间并格式化为后端期望的格式 yyyy-MM-dd HH:mm:ss
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  // 准备请求数据
  const updateData = {
    id: orderId,
    payStatus: 'PAID',
    payTime: formattedDate, // 格式化的当前时间作为支付时间
    // 可以添加其他需要更新的字段
  };

  // 发起请求更新订单状态
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/order/ilOrder/edit',
    method: 'PUT',
    data: updateData,
    header: {
      'Content-Type': 'application/json', // 注意这里是 application/json
      'X-Access-Token': userStore.token
    },
    success: (res) => {
      console.log('更新订单状态响应数据:', res.data);
      if (res.data.success) {
        // 支付成功，跳转到支付成功页面或显示成功提示
        uni.showModal({
          title: '支付成功',
          content: '您的订单已支付成功！',
          showCancel: false,
          success: () => {
            // 刷新订单列表
            getOrderList();

            // 可以选择跳转到支付成功页面
            // uni.navigateTo({
            //   url: '/pages/pay_success/pay_success?orderId=' + orderId
            // });
          }
        });
      } else {
        // 支付失败，显示错误提示
        uni.showModal({
          title: '支付失败',
          content: res.data.message || '订单状态更新失败，请联系客服',
          showCancel: false
        });
      }
    },
    fail: (err) => {
      console.error('更新订单状态请求失败:', err);
      uni.showModal({
        title: '支付失败',
        content: '网络异常，请稍后重试',
        showCancel: false
      });
    },
    complete: () => {
      uni.hideLoading();
    }
  });
};

// 关闭详情弹窗
const closeDetailPopup = () => {
  showDetailPopup.value = false;
  currentOrderDetail.value = null;
};

// 每次进入页面时调用
onShow(() => {
  console.log('订单页面显示');
  getOrderList();
});
</script>

<style>
/* 弹窗样式 */
.detail-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.popup-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.popup-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 500;
}

.close-btn {
  padding: 10rpx;
}

.popup-body {
  flex: 1;
  overflow-y: auto;
}

.detail-item {
  padding: 20rpx 0;
}

.detail-row {
  display: flex;
  margin-bottom: 20rpx;
  line-height: 1.5;
}

.detail-row .label {
  width: 160rpx;
  color: #666;
  font-size: 28rpx;
}

.detail-row .value {
  flex: 1;
  font-size: 28rpx;
}

.status-waiting {
  color: #1890FF;
}

.status-paid {
  color: #52c41a;
}

.status-cancel {
  color: #999;
}

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