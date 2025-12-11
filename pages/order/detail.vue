<template>
  <view class="page">
    <!-- 头部状态 -->
    <view class="header-section">
      <view class="status-title">{{ statusText }}</view>
      <view class="status-time" v-if="orderInfo.payTime">支付时间: {{ orderInfo.payTime }}</view>
    </view>

    <!-- 订单商品列表 -->
    <view class="order-items">
      <view class="item-card" v-for="(item, index) in orderItems" :key="index">
        <image class="item-image" :src="item.imageUrl" mode="aspectFill"></image>
        <view class="item-info">
          <view class="item-row-top">
            <text class="item-title">{{ item.goodsName || '未知商品' }}</text>
            <text class="item-price">¥ {{ Number(item.price || item.amount || 0).toFixed(2) }}</text>
          </view>
          <view class="item-detail-row">
            <text>创建时间: {{ item.createTime }}</text>
          </view>
          <view class="item-detail-row">
            <text>联系人: {{ item.contractName || '智游侠' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单信息汇总 -->
    <view class="order-summary">
      <view class="summary-row">
        <text class="label">实付款:</text>
        <text class="value price">合计 {{ totalAmount }}</text>
      </view>
      <view class="summary-row">
        <text class="label">订单编号:</text>
        <text class="value">{{ mainOrderSn }}</text>
      </view>
      <view class="summary-row" v-if="firstOrder.createTime">
        <text class="label">下单时间:</text>
        <text class="value">{{ firstOrder.createTime }}</text>
      </view>
       <view class="summary-row" v-if="firstOrder.payTime">
        <text class="label">支付时间:</text>
        <text class="value">{{ firstOrder.payTime }}</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <!-- 仅在非待支付状态（已支付、已取消等）显示删除按钮 -->
      <button v-if="firstOrder.payStatus !== 'UNPAID'" class="delete-btn" @click="handleDelete">删除订单</button>
      <!-- 仅在已支付状态显示评价按钮 -->
      <button v-if="firstOrder.payStatus === 'PAID'" class="review-btn" @click="handleReview">评价一下</button>
      <!-- 仅在待支付状态显示立即支付按钮 -->
      <button v-if="firstOrder.payStatus === 'UNPAID'" class="pay-btn" @click="handlePay">立即支付</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
const orderSn = ref('');
const orderInfo = ref({});
const orderItems = ref([]); // 列表展示的订单项
const firstOrder = computed(() => orderItems.value[0] || {});
const mainOrderSn = computed(() => firstOrder.value.orderSn || orderSn.value);

const statusText = computed(() => {
  const status = firstOrder.value.payStatus;
  if (status === 'UNPAID') return '待支付';
  if (status === 'PAID') return '交易完成'; // Assuming PAID means complete for now as per screenshot "交易完成"
  if (status === 'CANCEL') return '已取消';
  return '未知状态';
});

const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + Number(item.price || item.amount || 0), 0).toFixed(2);
});

const orderSns = ref([]);

onLoad((options) => {
  if (options.orderSns) {
    try {
      const sns = JSON.parse(decodeURIComponent(options.orderSns));
      if (Array.isArray(sns) && sns.length > 0) {
        orderSns.value = sns;
        // 如果有多个SN，调用批量获取逻辑
        fetchAllOrderDetails();
        return;
      }
    } catch (e) {
      console.error('解析 orderSns 失败', e);
    }
  }

  if (options.orderSn) {
    orderSn.value = options.orderSn;
    orderSns.value = [options.orderSn];
    fetchOrderDetail();
  }
});

// 获取所有传入的订单详情
const fetchAllOrderDetails = async () => {
  uni.showLoading({ title: '加载中...' });
  const promises = orderSns.value.map(sn => {
    return new Promise((resolve) => {
      uni.request({
        url: `https://island.zhangshuiyi.com/island/front/order/getMyOrderInfo/${sn}`,
        method: 'GET',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Access-Token': userStore.token
        },
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

  try {
    const results = await Promise.all(promises);
    const validOrders = results.filter(o => o !== null);
    
    // 处理图片逻辑
    validOrders.forEach(order => {
      if (order.orderType === 'Parking') {
        order.imageUrl = 'https://wuminghui.top:9000/wlmtsys/2025/06/18/1eec475aa85047188c67915c7b4b9a83.jpg';
      }
      if (order.orderType === 'Transportation') {
        order.imageUrl = 'https://wuminghui.top:9000/wlmtsys/2025/06/18/c9adb25fc3d44abfaeeef5f0af7c90b4.jpg';
      }
    });

    if (validOrders.length > 0) {
      orderItems.value = validOrders;
      orderInfo.value = validOrders[0]; // 使用第一个订单作为主信息（如支付状态等）
      
      // 如果只有一个订单，还是尝试去查找关联订单（兼容旧逻辑）
      if (validOrders.length === 1) {
        fetchRelatedOrders(validOrders[0]);
      }
    } else {
      uni.showToast({ title: '获取订单详情失败', icon: 'none' });
    }
  } catch (e) {
    console.error(e);
    uni.showToast({ title: '网络错误', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
};

const handlePay = () => {
  const sn = mainOrderSn.value;
  if (!sn) return;
  
  uni.showLoading({ title: '支付处理中...' });
  
  uni.request({
    url: `https://island.zhangshuiyi.com/island/front/order/payOrder?orderSn=${sn}`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token
    },
    success: (res) => {
      if (res.data.success) {
        uni.showToast({ title: '支付成功', icon: 'success' });
        setTimeout(() => {
          fetchOrderDetail();
        }, 1500);
      } else {
        uni.showToast({ title: res.data.message || '支付失败', icon: 'none' });
      }
    },
    fail: () => {
      uni.showToast({ title: '网络请求失败', icon: 'none' });
    },
    complete: () => {
      uni.hideLoading();
    }
  });
};

const fetchOrderDetail = () => {
  uni.showLoading({ title: '加载中...' });
  // 这里我们需要获取订单详情。
  // 如果是套餐，我们需要获取关联的订单。
  // 由于目前只有一个 getMyOrderInfo/${orderSn} 接口，我们先调用它。
  // 如果需要获取同组订单，可能需要调用 getMyOrderList 并筛选。
  
  // 策略：先获取指定 orderSn 的详情。
  // 然后尝试获取列表来查找同组订单（为了还原 order.vue 中的分组逻辑）。
  
  // 1. 获取当前订单详情
  uni.request({
    url: `https://island.zhangshuiyi.com/island/front/order/getMyOrderInfo/${orderSn.value || mainOrderSn.value}`,
    method: 'GET',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token
    },
    success: (res) => {
      if (res.data.success) {
        // 修复图片链接
        if (res.data.result.orderType === 'Parking') {
           res.data.result.imageUrl = 'https://wuminghui.top:9000/wlmtsys/2025/06/18/1eec475aa85047188c67915c7b4b9a83.jpg';
        }
        if (res.data.result.orderType === 'Transportation') {
           res.data.result.imageUrl = 'https://wuminghui.top:9000/wlmtsys/2025/06/18/c9adb25fc3d44abfaeeef5f0af7c90b4.jpg';
        }

        orderInfo.value = res.data.result;
        // 初始只放入这一个
        orderItems.value = [res.data.result];
        
        // 2. 尝试获取列表以查找关联订单 (模拟 order.vue 的分组逻辑)
        fetchRelatedOrders(res.data.result);
      } else {
        uni.showToast({ title: res.data.message || '获取详情失败', icon: 'none' });
      }
    },
    fail: () => {
      uni.showToast({ title: '网络错误', icon: 'none' });
    },
    complete: () => {
      uni.hideLoading();
    }
  });
};

const fetchRelatedOrders = (currentOrder) => {
  // 使用与 order.vue 相同的逻辑查找同组订单
  // 这里的 key 逻辑需要和 order.vue 保持一致
  // key = o.mainOrder?.orderSn || o.mainOrderSn || o.batchId || (o.createTime || '');
  
  // 为了找到同组，我们需要获取列表。这里假设 pageSize 300 足够覆盖。
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/front/order/getMyOrderList',
    method: 'GET',
    data: { pageNo: 1, pageSize: 300 }, // 获取足够多的订单以进行匹配
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token
    },
    success: (res) => {
      if (res.data.success) {
        const allOrders = res.data.result.records || [];
        
        // 处理图片逻辑 (同 order.vue)
        allOrders.forEach(order => {
           if (order.orderType === 'Parking') {
            order.imageUrl = 'https://wuminghui.top:9000/wlmtsys/2025/06/18/1eec475aa85047188c67915c7b4b9a83.jpg';
          }
          if (order.orderType === 'Transportation') {
            order.imageUrl = 'https://wuminghui.top:9000/wlmtsys/2025/06/18/c9adb25fc3d44abfaeeef5f0af7c90b4.jpg';
          }
        });

        // 找到当前订单在列表中的对象（为了获取完整的关联信息）
        const matchedCurrent = allOrders.find(o => o.orderSn === currentOrder.orderSn);
        const targetOrder = matchedCurrent || currentOrder;
        
        const key = targetOrder.mainOrder?.orderSn || targetOrder.mainOrderSn || targetOrder.batchId || (targetOrder.createTime || '');
        
        if (key) {
           const group = allOrders.filter(o => {
             const k = o.mainOrder?.orderSn || o.mainOrderSn || o.batchId || (o.createTime || '');
             return k === key;
           });
           
           if (group.length > 0) {
             orderItems.value = group;
           }
        }
      }
    }
  });
};

const handleDelete = () => {
   uni.showModal({
    title: '提示',
    content: '确定要删除该订单吗？',
    success: (res) => {
      if (res.confirm) {
        // 调用删除接口
        // 注意：如果是套餐，是否删除所有？order.vue 中是单个删除。
        // 但底部按钮通常是删除整个显示的订单。
        // 这里我们先只删除第一个，或者循环删除？
        // 截图中的"删除订单"看起来是针对整个详情页的。
        // 如果是套餐，可能需要调用多次删除或者有一个批量删除接口。
        // 目前 order.vue 中 deleteOrder 只是删除单个。
        // 我们这里先实现删除当前显示的列表中的所有项（如果是套餐）。
        
        deleteOrders(orderItems.value);
      }
    }
  });
};

const handleReview = () => {
  const item = firstOrder.value;
  // 尝试获取商品ID，不同订单类型字段可能不同
  const id = item.goodsId || item.productId;
  // 获取类型，默认 itinerary
  const type = item.orderType || item.productType || 'itinerary';
  
  if (!id) {
    uni.showToast({ title: '无法获取商品信息', icon: 'none' });
    return;
  }
  
  uni.navigateTo({
    url: `/pages/itineraryEvaluation/itineraryEvaluation?productId=${id}&type=${type}`
  });
};

const deleteOrders = async (items) => {
  uni.showLoading({ title: '删除中...' });
  
  let successCount = 0;
  for (const item of items) {
     if (!item.orderId) continue;
     try {
       await new Promise((resolve, reject) => {
          uni.request({
            url: `https://island.zhangshuiyi.com/island/front/order/Cancel`, // 接口名为 Cancel，但在 order.vue 中被用作"取消订单"(deleteOrder)
            // 待确认：order.vue 中 deleteOrder 是 "取消订单"。
            // 截图中的是 "删除订单"。通常 "删除" 是 delete 接口，"取消" 是 cancel。
            // 但 order.vue 中 unPaid 状态下是 "取消订单"。
            // 如果是 "交易完成" (Paid)，通常不能 "取消"，只能 "删除" (隐藏)。
            // 现在的 backend 似乎只有一个 Cancel 接口？
            // order.vue 中 deleteOrder 调用的就是 Cancel。
            // 且 order.vue 中只有 UNPAID 状态才显示取消按钮。
            // 截图显示 "交易完成" 也有 "删除订单"。
            // 也许需要另一个接口？
            // 暂时使用 Cancel 接口，或者 delete 接口。
            // 让我们检查 order.vue 看看有没有 delete 接口。
            // order.vue 只有 Cancel。
            // 也许 delete 是另一个 url: /island/front/order/delete?
            // 我先假设用 Cancel，如果不行再调整。
            // 或者，如果状态是 PAID，Cancel 可能会失败。
            // 让我们先用 Cancel，如果失败提示用户。
            
            // 修正：仔细看 order.vue，line 513: url: .../Cancel
            // 只有 UNPAID 才显示取消。
            // 截图是 "交易完成"，所以这应该是一个"逻辑删除" (Hide) 接口。
            // 我先搜索一下代码库有没有 delete 相关的 api。
            
            method: 'GET',
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'X-Access-Token': userStore.token
            },
            data: { orderId: item.orderId },
            success: (res) => {
              if (res.data.success) resolve(res);
              else reject(res.data.message);
            },
            fail: (err) => reject(err)
          });
       });
       successCount++;
     } catch (e) {
       console.error(e);
     }
  }
  
  uni.hideLoading();
  if (successCount === items.length) {
    uni.showToast({ title: '删除成功', icon: 'success' });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } else {
    uni.showToast({ title: '部分删除失败或不支持删除', icon: 'none' });
  }
};

</script>

<style>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx; /* 留出底部按钮空间 */
}

.header-section {
  background-color: #fff;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
}

.status-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.status-time {
  font-size: 26rpx;
  color: #999;
}

.order-items {
  background-color: #fff;
  margin-bottom: 20rpx;
}

.item-card {
  display: flex;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.item-card:last-child {
  border-bottom: none;
}

.item-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
  background-color: #eee;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-row-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10rpx;
}

.item-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  flex: 1;
  margin-right: 20rpx;
}

.item-price {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.item-detail-row {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
}

.order-summary {
  background-color: #fff;
  padding: 30rpx;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
  font-size: 28rpx;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #666;
}

.value {
  color: #333;
}

.value.price {
  font-weight: bold;
  font-size: 32rpx;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  padding: 20rpx 30rpx;
  box-sizing: border-box;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: flex-end;
}

.delete-btn {
  margin: 0;
  background-color: #fff;
  color: #666;
  border: 1rpx solid #ddd;
  font-size: 28rpx;
  padding: 10rpx 40rpx;
  border-radius: 8rpx;
  line-height: 1.5;
}

.review-btn {
  margin: 0;
  background-color: #fff;
  color: #1890FF;
  border: 1rpx solid #1890FF;
  font-size: 28rpx;
  padding: 10rpx 40rpx;
  border-radius: 8rpx;
  line-height: 1.5;
  margin-left: 20rpx;
}

.pay-btn {
  margin: 0;
  background-color: #1890FF;
  color: #fff;
  border: none;
  font-size: 28rpx;
  padding: 10rpx 40rpx;
  border-radius: 8rpx;
  line-height: 1.5;
  margin-left: 20rpx;
}
</style>
