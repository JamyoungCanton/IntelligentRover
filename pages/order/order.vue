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
            <image class="order-image"
              :src="order.imageUrl" mode="aspectFill">
            </image>
            <view class="order-details">
              <text class="detail-text">创建时间：{{ order.createTime || '未知' }}</text>
              <text class="detail-text">联系人：{{ order.createBy || '未知' }}</text>
              <text class="detail-text">订单号：{{ order.orderSn || '未知' }}</text>
            </view>
          </view>
          <view class="order-footer">
            <text class="price">¥ {{ order.price || order.amount || 0 }}</text>
            <view class="button-group">
<!-- v-if="order.payStatus === 'UNPAID'" -->
              <button class="btn btn-default"
                @click="deleteOrder(order)">取消订单</button>

              <button v-if="order.payStatus === 'UNPAID'" class="btn btn-primary" @click="payOrder(order)">立即支付</button>
              <button v-else class="btn btn-primary" @click="getOrderDetailById1(order.orderSn)">查看详情</button>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>


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
              <text class="value order-sn">{{ currentOrderDetail.orderSn || '未知' }}</text>
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
            <view class="detail-row" v-if="currentOrderDetail.payStatus === 'PAID'">
              <text class="label">支付时间：</text>
              <text class="value">{{ currentOrderDetail.payTime || '未知' }}</text>
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
    <Tabbar />
  </view>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user';
import Tabbar from '../Tabbar/Tabbar.vue';

const tabs = ['全部', '待支付', '进行中', '已完成'];
const currentTab = ref(0);
const orders = ref([]);
const userStore = useUserStore();

const searchKeyword = ref(''); // 搜索结果关键词
const showDetailPopup = ref(false); // 控制弹窗显示
const currentOrderDetail = ref(null); // 当前订单详情

const DEBUG = false; // 调试时可设为true

// 订单状态映射（去除已支付、待出行）
const statusMap = {
  1: { payStatus: 'UNPAID' }, // 待支付
  2: { orderStatus: 'PROCESSING' }, // 进行中
  3: { orderStatus: 'COMPLETED' } // 已完成
};

function fixDateStr(str) {
  if (!str) return '';
  if (str.includes('T')) return str;
  // 兼容 iOS
  return str.replace(/-/g, '/');
}

function getOrderStartDate(order) {
  return order.travelStartDate || (order.mainOrder && order.mainOrder.travelStartDate) || '';
}

function getOrderEndDate(order) {
  return order.travelEndDate || (order.mainOrder && order.mainOrder.travelEndDate) || '';
}

function isOrderOngoing(order, now) {
  const startDateStr = fixDateStr(getOrderStartDate(order));
  const endDateStr = fixDateStr(getOrderEndDate(order));
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const payStatus = order.payStatus;
  const isOngoing = payStatus === 'PAID' && now >= startDate && now <= endDate;
  if (DEBUG) {
    console.log({
      payStatus,
      startDateStr,
      endDateStr,
      startDate,
      endDate,
      now,
      isOngoing
    });
  }
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;
  return isOngoing;
}

function isOrderCompleted(order, now) {
  const endDateStr = fixDateStr(getOrderEndDate(order));
  const endDate = new Date(endDateStr);
  if (isNaN(endDate.getTime())) return false;
  return order.payStatus === 'PAID' && now > endDate;
}

// 根据当前标签和搜索关键词过滤订单
const filteredOrders = computed(() => {
  let result = orders.value;

  // 根据标签筛选
  if (currentTab.value !== 0) {
    if (currentTab.value === 1) {
      result = result.filter(order => order.payStatus === 'UNPAID');
    } else if (currentTab.value === 2) {
      // 进行中
      const now = new Date(); // 使用当前北京时间
      result = result.filter(order => isOrderOngoing(order, now));
    } else if (currentTab.value === 3) {
      // 已完成
      const now = new Date(); // 使用当前北京时间
      result = result.filter(order => isOrderCompleted(order, now));
    }
  }

  // 搜索关键词筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(order =>
      (order.orderSn && order.orderSn.toLowerCase().includes(keyword)) ||
      (order.goodsName && order.goodsName.toLowerCase().includes(keyword)) ||
      (order.title && order.title.toLowerCase().includes(keyword))
    );
  }

  // 过滤掉已取消订单
  result = result.filter(order => {
    return order.orderStatus !== 'CANCELLED' && order.mainOrder?.orderStatus !== 'CANCELLED';
  });

  // 按创建时间排序
  result.sort((a, b) => {
    const parseDate = (dateStr) => {
      if (!dateStr) return new Date(0);
      const parsedDate = new Date(dateStr.replace(/-/g, '/'));
      return isNaN(parsedDate.getTime()) ? new Date(0) : parsedDate;
    };
    const dateA = parseDate(a.createTime);
    const dateB = parseDate(b.createTime);
    return dateB.getTime() - dateA.getTime();
  });

  if (DEBUG) {
    console.log('原始订单数据:', orders.value);
    console.log('筛选后订单数据:', result);
  }

  return result;
});


// 搜索功能

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


// 获取用户自身的订单列表  GET
const getOrderList = () => {
  uni.showLoading({ title: '加载订单中...' });

  const params = {
    pageNo: 1,
    pageSize: 300
  };

  // 只在"待支付"时传 payStatus
  if (currentTab.value === 1) {
    params.payStatus = 'UNPAID';
  }

  // 搜索关键词
  if (searchKeyword.value) {
    params.keyword = searchKeyword.value;
  }

  uni.request({
    url: 'https://island.zhangshuiyi.com/island/front/order/getMyOrderList',
    method: 'GET',
    data: params,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token
    },
    success: (res) => {
      if (res.data.success) {
        const orderList = res.data.result.records || [];
        // 遍历订单列表，当 orderType 为 "Parking" 时修改 imageUrl
        orderList.forEach(order => {
          if (order.orderType === 'Parking') {
            order.imageUrl = 'https://wuminghui.top:9000/wlmtsys/2025/06/18/1eec475aa85047188c67915c7b4b9a83.jpg';
          }
          if (order.orderType === 'Transportation') {
            order.imageUrl = 'https://wuminghui.top:9000/wlmtsys/2025/06/18/c9adb25fc3d44abfaeeef5f0af7c90b4.jpg';
          }
        });
        orders.value = orderList;
        console.log('订单列表数据:', orderList);
        console.log('订单列表数据:', res.data.result.records);
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


// 根据订单ID查询订单详情  GET
const getOrderDetailById1 = (orderSn) => {
  uni.showLoading({ title: '加载订单详情中...' });

  uni.request({
    url: `https://island.zhangshuiyi.com/island/front/order/getMyOrderInfo/${orderSn}`,
    method: 'GET',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token
    },
    success: (res) => {
      if (res.data.success) {
        const detail = res.data.result;

        // 如果接口没有返回 goodsName，则尝试从已有 orders 中找
        const matched = orders.value.find(o => o.orderSn === orderSn);
        if (matched && !detail.goodsName) {
          detail.goodsName = matched.goodsName;
        }

        currentOrderDetail.value = detail;
        showDetailPopup.value = true;
      } else {
        uni.showToast({ title: res.data.message || '获取订单详情失败', icon: 'none' });
      }
    },
    fail: () => {
      uni.showToast({ title: '获取订单详情失败', icon: 'none' });
    },
    complete: () => {
      uni.hideLoading();
    }
  });
};


// 根据订单ID查询订单详情 GET，获取的订单信息比1更多，！！！获取会失败！！！
const getOrderDetailById2 = (orderSn) => {
  console.log(orderSn)
  // 显示加载提示
  uni.showLoading({
    title: '加载订单明细中...'
  });

  // 发起请求获取订单明细详细信息
  uni.request({
    url: `https://island.zhangshuiyi.com/island/front/order/getOrderItemInfo/${orderSn}`,
    method: 'GET',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token
    },
    success: (res) => {
      console.log('订单明细响应数据:', res.data);

      // 如果请求成功，处理响应数据
      if (res.data.success) {
        currentOrderDetail.value = res.data.result;
        showDetailPopup.value = true; // 显示弹窗
      } else {
        // 处理请求失败的情况
        uni.showToast({
          title: res.data.message || '获取订单详情失败',
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


// 关闭详情弹窗
const closeDetailPopup = () => {
  showDetailPopup.value = false;
  currentOrderDetail.value = null;
};

// 删除订单方法
const deleteOrder = (order) => {
  console.log('deleteOrder参数:', order, 'order.id:', order.id, 'order.orderId:', order.orderId);
  if (!order.orderId) {
    uni.showToast({ title: '订单ID不存在，无法取消', icon: 'none' });
    return;
  }
  uni.showModal({
    title: '取消订单',
    content: '您确定要取消该订单吗？',
    success: (res) => {
      if (!res.confirm) return;
      uni.showLoading({ title: '取消中...' });
      
      uni.request({
        url: `https://island.zhangshuiyi.com/island/front/order/Cancel`,
        method: 'GET',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Access-Token': userStore.token
        },
        data: { orderId: order.orderId },
        success: (res) => {
          if (res.data && res.data.success) {
            getOrderList();
            uni.showToast({ title: '订单已取消', icon: 'success' });
          } else {
            uni.showToast({
              title: res.data?.message || '取消失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('取消请求失败:', err);
          uni.showToast({ title: '网络错误，取消失败', icon: 'none' });
        },
        complete: () => {
          uni.hideLoading();
        }
      });
    }
  });
};


// 立即支付方法
// const payOrder = (order) => {
//   // 显示加载提示
//   uni.showLoading({
//     title: '支付处理中...'
//   });

//   // 发起支付请求
//   uni.request({
//     url: 'https://island.zhangshuiyi.com/island/front/order/payOrder',
//     method: 'POST',
//     data: {
//       orderSn: order.orderSn
//     },
//     header: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//       'X-Access-Token': userStore.token
//     },
//     success: (res) => {
//       console.log('支付请求响应结果:', res.data);

//       // 根据响应处理支付结果
//       if (res.data.success) {
//         // 支付成功的处理
//         uni.showToast({
//           title: '支付成功',
//           icon: 'success'
//         });

//         // 更新订单状态
//         const index = orders.value.findIndex(item => item.orderSn === order.orderSn);
//         if (index !== -1) {
//           orders.value[index].payStatus = 'PAID';
//         }
//       } else {
//         // 支付失败的处理
//         uni.showToast({
//           title: res.data.message || '支付失败',
//           icon: 'none'
//         });
//       }
//     },
//     fail: (err) => {
//       console.error('支付请求失败:', err);
//       uni.showToast({
//         title: '支付请求失败',
//         icon: 'none'
//       });
//     },
//     complete: () => {
//       // 隐藏加载提示
//       uni.hideLoading();
//     }
//   });
// };

// 立即支付跳转支付页面
const payOrder = (order) => {
	console.log('点击立即支付，order:', order);
	uni.showLoading({ title: '刷新订单中...' });
	uni.request({
		url: 'https://island.zhangshuiyi.com/island/front/order/getMyOrderInfo/' + order.orderSn,
		method: 'GET',
		header: { 'X-Access-Token': userStore.token },
		success: (res) => {
			console.log('订单详情返回:', res.data);
			if (res.data.success && res.data.result.payStatus === 'UNPAID') {
				const result = res.data.result;
				const now = new Date();
				const startDate = new Date(fixDateStr(result.travelStartDate));
				const endDate = new Date(fixDateStr(result.travelEndDate));
				console.log('接口返回travelStartDate:', result.travelStartDate, 'travelEndDate:', result.travelEndDate);
				console.log('startDate:', startDate, 'endDate:', endDate, 'now:', now);
				console.log('startDate.getTime():', startDate.getTime(), 'endDate.getTime():', endDate.getTime());
				console.log('isNaN(startDate.getTime()):', isNaN(startDate.getTime()));
				console.log('isNaN(endDate.getTime()):', isNaN(endDate.getTime()));
				console.log('startDate <= now:', startDate <= now);
				console.log('endDate < startDate:', endDate < startDate);
				if (
					isNaN(startDate.getTime()) ||
					isNaN(endDate.getTime()) ||
					startDate <= now ||
					endDate < startDate
				) {
					uni.hideLoading();
					console.log('日期校验不通过');
					uni.showToast({ title: '旅游开始/结束时间无效，无法支付', icon: 'none' });
					getOrderList();
					return;
				}
				uni.hideLoading();
				console.log('跳转到支付页:', order.orderSn);
				uni.navigateTo({ url: `/pages/activityPay/activityPay?orderSn=${order.orderSn}` });
			} else {
				uni.hideLoading();
				console.log('订单状态不允许支付');
				uni.showToast({ title: '订单状态已变更，请刷新订单列表', icon: 'none' });
				getOrderList();
			}
		},
		fail: (err) => {
			uni.hideLoading();
			console.log('请求失败:', err);
			uni.showToast({ title: '网络异常，无法获取订单', icon: 'none' });
		}
	});
};


// 每次进入页面时调用
onShow(() => {
  console.log('订单页面显示');
  getOrderList();
});

// 获取当前北京时间
function getBeijingTime() {
  const now = new Date();
  // 北京时间 = UTC时间 + 8小时
  return new Date(now.getTime() + (8 - now.getTimezoneOffset() / 60) * 60 * 60 * 1000);
}
// 用法
const now = getBeijingTime();
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
  display: flex;
  width: 90%;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
  box-sizing: border-box;
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
  color: #f3a200;
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
  height: 35px;
  line-height: 23px;
}

.btn-default {
  background: #fff;
  border: 2rpx solid #ddd;
  color: #666;
}

.btn-primary {
  height: 35px;
  background: #1890FF;
  color: #fff;
}

/* 弹窗样式 */
.detail-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}

.popup-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.popup-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 900rpx;
  /* 增大最大宽度 */
  width: 90%;
  /* 增大宽度百分比 */
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.popup-title {
  font-size: 36rpx;
  font-weight: 500;
}

.close-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-body {
  max-height: 70vh;
  /* 调整最大高度 */
  min-height: 400rpx;
  /* 增加最小高度 */
  padding: 30rpx;
  overflow-y: auto;
  /* 添加垂直滚动 */
}

.detail-item {
  padding: 20rpx 0;
}

.detail-row {
  display: flex;
  margin-bottom: 20rpx;
  align-items: flex-start;
  /* 修正对齐方式 */
}

.label {
  width: 160rpx;
  font-size: 28rpx;
  color: #666;
}

.value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.order-sn {
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
  max-width: 100%;
  line-height: 1.5;
  text-overflow: clip;
  overflow: visible;
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
</style>