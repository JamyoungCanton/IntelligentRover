<template>
  <view class="page">
    <view class="content">
      <!-- 订单信息 -->
      <view class="card">
        <view class="card-header">
          <uni-icons type="calendar" size="20" color="#3B82F6" />
          <text class="card-title">订单信息</text>
        </view>
        <view class="order-info">
          <view class="info-item">
            <text class="info-label">出发岛屿</text>
            <text class="info-value">{{ fromIslandName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">到达岛屿</text>
            <text class="info-value">{{ toIslandName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">航班时间</text>
            <text class="info-value">{{ selectedScheduleTime }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">舱位类型</text>
            <text class="info-value">{{ selectedCabinName }}</text>
          </view>
        </view>
      </view>

      <!-- 游客信息 -->
      <view class="card">
        <view class="card-header">
          <uni-icons type="person" size="20" color="#3B82F6" />
          <text class="card-title">游客信息</text>
        </view>
        <view class="input-wrapper">
          <input
            type="text"
            v-model="contactName"
            class="input"
            placeholder="请输入联系人姓名"
          />
          <input
            type="number"
            v-model="contactPhone"
            class="input"
            placeholder="请输入联系人手机号"
          />
        </view>
      </view>

      <!-- 备注信息 -->
      <view class="card">
        <view class="card-header">
          <uni-icons type="chatboxes" size="20" color="#3B82F6" />
          <text class="card-title">备注信息</text>
        </view>
        <textarea
          v-model="remark"
          class="remark-input"
          placeholder="请输入特殊需求或注意事项"
        />
      </view>

      <!-- 支付方式 -->
      <view class="card">
        <view class="card-header">
          <uni-icons type="wallet" size="20" color="#3B82F6" />
          <text class="card-title">支付方式</text>
        </view>
        <view class="payment-list">
          <view
            class="payment-item"
            :class="{ 'selected': selectedPayment === 'wechat' }"
            @click="selectPayment('wechat')"
          >
            <view class="payment-info">
              <uni-icons type="weixin" size="24" color="#07C160" />
              <text class="payment-name">微信支付</text>
            </view>
            <uni-icons
              v-if="selectedPayment === 'wechat'"
              type="checkbox-filled"
              size="20"
              color="#3B82F6"
            />
          </view>
          <view
            class="payment-item"
            :class="{ 'selected': selectedPayment === 'alipay' }"
            @click="selectPayment('alipay')"
          >
            <view class="payment-info">
              <uni-icons type="wallet" size="24" color="#1677FF" />
              <text class="payment-name">支付宝</text>
            </view>
            <uni-icons
              v-if="selectedPayment === 'alipay'"
              type="checkbox-filled"
              size="20"
              color="#3B82F6"
            />
          </view>
        </view>
      </view>

      <!-- 底部支付按钮 -->
      <view class="bottom-bar">
        <button
          class="confirm-btn"
          @click="handleConfirmPayment"
        >确认支付 ¥{{ selectedCabinPrice }}</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
const ticketId = ref('');
const fromIslandName = ref('');
const toIslandName = ref('');
const selectedScheduleTime = ref('');
const selectedCabinName = ref('');
const selectedCabinPrice = ref(0);
const contactName = ref('');
const contactPhone = ref('');
const remark = ref('');
const selectedPayment = ref('wechat');

// 岛屿ID到名称的映射
const islandMap = {
  101: '东澳岛',
  102: '万山岛',
  103: '外伶仃岛',
  104: '桂山岛'
};

// 航班时刻
const parsedSchedule = ref([]);
const selectedScheduleIndex = ref(0);

// 舱位类型
const cabinTypes = ref([
  { name: '普通舱', price: 128, description: '标准座椅' },
  { name: '商务舱', price: 228, description: '宽敞座椅，赠送饮品' }
]);
const selectedCabinIndex = ref(0);

// 页面加载时获取数据
onLoad((options) => {
  if (options.ticketId) {
    ticketId.value = options.ticketId;
    fetchOrderDetails();
  } else {
    uni.showToast({
      title: '缺少订单ID参数',
      icon: 'none'
    });
  }
});

// 获取交通订单详情
const fetchOrderDetails = () => {
  uni.request({
    url: `https://island.zhangshuiyi.com/island/product/ilTransportation/queryById?id=${ticketId.value}`,
    method: 'GET',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token || ''
    },
    success: (res) => {
      if (res.statusCode === 200 && res.data.success) {
        const data = res.data.result;
        fromIslandName.value = islandMap[data.fromislandid] || '未知岛屿';
        toIslandName.value = islandMap[data.toislandid] || '未知岛屿';
        
        // 解析航班时刻
        if (data.schedule) {
          parsedSchedule.value = data.schedule.split(',').map(item => {
            const [time, status] = item.split('|');
            return {
              time: time || '00:00',
              status: status || '余票充足'
            };
          });
          selectedScheduleTime.value = parsedSchedule.value[0].time;
        }
        
        // 默认选中第一个舱位
        selectedCabinName.value = cabinTypes.value[0].name;
        selectedCabinPrice.value = cabinTypes.value[0].price;
      } else {
        uni.showToast({
          title: res.data.message || '获取订单详情失败',
          icon: 'none'
        });
      }
    },
    fail: (err) => {
      uni.showToast({
        title: '网络异常，请稍后重试',
        icon: 'none'
      });
    }
  });
};

// 选择航班时刻
const selectSchedule = (index) => {
  selectedScheduleIndex.value = index;
  selectedScheduleTime.value = parsedSchedule.value[index].time;
};

// 选择舱位
const selectCabin = (index) => {
  selectedCabinIndex.value = index;
  selectedCabinName.value = cabinTypes.value[index].name;
  selectedCabinPrice.value = cabinTypes.value[index].price;
};

// 选择支付方式
const selectPayment = (payment) => {
  selectedPayment.value = payment;
};

// 确认支付
const handleConfirmPayment = () => {
  if (!userStore.token) {
    uni.showToast({
      title: '未登录，请先登录',
      icon: 'none'
    });
    uni.navigateTo({
      url: '/pages/login/login'
    });
    return;
  }

  const orderData = {
    contract: {
      contractName: contactName.value || userStore.userInfo.realname || '默认联系人',
      contractPhone: contactPhone.value || userStore.userInfo.phone || '12345678901'
    },
    items: [
      {
        bookInfo: {
          date: selectedScheduleTime.value,
          fullname: contactName.value || userStore.userInfo.realname || '默认联系人',
          idCardNo: userStore.userInfo.idCardNo || '110101199001011234',
          idCardType: 'ID_CARD',
          schedule: selectedScheduleTime.value
        },
        productId: ticketId.value,
        productType: 'Transportation',
        quantity: 1,
        price: selectedCabinPrice.value
      }
    ]
  };

  uni.request({
    url: 'https://island.zhangshuiyi.com/island/front/order/createOrder',
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token
    },
    data: orderData,
    success: (res) => {
      if (res.statusCode === 200 && res.data.success) {
        uni.showToast({
          title: '支付成功',
          icon: 'success'
        });
        uni.navigateTo({
          url: '/pages/pay_success/pay_success'
        });
      } else {
        uni.showToast({
          title: res.data.message || '支付失败',
          icon: 'none'
        });
      }
    },
    fail: (err) => {
      uni.showToast({
        title: '网络异常，请稍后重试',
        icon: 'none'
      });
    }
  });
};
</script>

<style>
page {
  height: 100%;
  background-color: #f5f5f5;
}

.page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
}

.content {
  flex: 1;
  padding: 32rpx;
  overflow-y: auto;
}

.card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.card-title {
  margin-left: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #3B82F6;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.info-label {
  color: #666666;
}

.info-value {
  color: #333333;
}

.input-wrapper {
  margin-top: 24rpx;
}

.input {
  width: 100%;
  height: 88rpx;
  padding: 0 32rpx;
  margin-bottom: 24rpx;
  border: 1px solid #e5e5e5;
  border-radius: 16rpx;
  font-size: 28rpx;
}

.remark-input {
  width: 100%;
  height: 180rpx;
  padding: 24rpx;
  border: 1px solid #e5e5e5;
  border-radius: 16rpx;
  font-size: 28rpx;
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border: 1px solid #e5e5e5;
  border-radius: 16rpx;
}

.payment-item.selected {
  border-color: #3B82F6;
}

.payment-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.payment-name {
  font-size: 28rpx;
}

.bottom-bar {
  padding: 32rpx;
  background-color: #ffffff;
  border-top: 1px solid #f0f0f0;
}

.confirm-btn {
  width: 100%;
  height: 88rpx;
  background-color: #3B82F6;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>