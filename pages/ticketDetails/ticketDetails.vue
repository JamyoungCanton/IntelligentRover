<template>
  <view class="container">
    <view class="transport-info">
      <view class="island-info">
        <text class="island-name">{{ fromIslandName || '出发岛屿' }}</text>
        <p><text class="island-name island-desc ">{{ fromIslandName+'码头' || '码头' }}</text></p>
      </view>
      <view class="arrow">
        <image class="line" src="/static/ticket/line.png"></image><image src="/static/ticket/boat.png" class="arrow-img"></image><image class="line" src="/static/ticket/line.png"></image>
		<view class="duration-view">
			<text class="duration">约{{ ticketInfo?.duration || 0 }}小时</text>
      </view>
      </view>
      <view class="island-info">
        <text class="island-name">{{ toIslandName || '到达岛屿' }}</text>
        <p><text class="island-name island-desc">{{ toIslandName+'码头' || '码头' }}</text></p>
      </view>
      
    </view>
    
    <view class="price-section">
      <text class="price">¥{{ selectedCabinPrice || 0 }}起</text>
      <button class="book-btn" @click="createOrder">立即预订</button>
    </view>
    
    <view class="section-title"><text>航班时刻</text></view>
    <view class="schedule-section">
      <view class="schedule-list">
        <view 
          v-for="(schedule, index) in parsedSchedule" 
          :key="index" 
          class="schedule-item"
        >
          <text class="time">{{ schedule.time }}</text>
          <text :class="['status', schedule.status === '余票充足' ? 'available' : 'limited']">{{ schedule.status }}</text>
        </view>
      </view>
    </view>
    
    <view class="section-title"><text>舱位类型</text></view>
    <view class="cabin-section">
      <view class="cabin-list">
        <view 
          v-for="(cabin, index) in cabinTypes" 
          :key="index" 
          class="cabin-item"
          :class="{ 'selected': selectedCabinIndex === index }"
          @click="selectCabin(index)"
        >
          <b><text class="cabin-name">{{ cabin.name }}</text></b>
          <text class="cabin-price">¥{{ cabin.price }}</text>
        </view>
      </view>
    </view>
    
    <view class="section-title"><text>乘船须知</text></view>
    <view class="instructions-section">
      <view class="instructions-list">
        <view 
          v-for="(instruction, index) in instructions" 
          :key="index"
          class="instruction-item"
        >
          <image :src="instruction.icon" class="instruction-icon"></image>
          <text class="instruction-text">{{ instruction.text }}</text>
        </view>
      </view>
    </view>
    
    <view v-if="error" class="error-message">
      <text>{{ error }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
const ticketInfo = ref(null);
const parsedSchedule = ref([]);
const cabinTypes = ref([]);
const instructions = ref([]);
const error = ref('');
const selectedCabinIndex = ref(-1); // 选中的舱位索引
const selectedCabinPrice = ref(0); // 选中的舱位价格
const fromIslandName = ref(''); // 出发岛屿名称
const toIslandName = ref(''); // 到达岛屿名称

// 岛屿ID到名称的映射
const islandMap = {
  101: '东澳岛',
  102: '万山岛',
  103: '外伶仃岛',
  104: '桂山岛'
  // 根据实际情况添加更多的岛屿ID和名称
};

// 从URL参数中获取ticketId
const ticketId = ref('');

onLoad((options) => {
  if (options.ticketId) {
    ticketId.value = options.ticketId;
    console.log('获取到的ticketId:', ticketId.value);
    fetchOrderDetails();
  } else {
    error.value = '缺少ticketId参数';
  }
});

// 获取交通详情数据
const fetchOrderDetails = () => {
  if (!userStore.token) {
    error.value = '未登录，请先登录';
    return;
  }

  uni.request({
    url: 'https://island.zhangshuiyi.com/island/product/ilTransportation/queryById',
    method: 'GET',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token || ''
    },
    data: {
      id: ticketId.value
    },
    success: (res) => {
      console.log('接口返回的数据:', res.data);
      if (res.data.success) {
        ticketInfo.value = res.data.result;
        console.log('获取到的交通详情数据:', ticketInfo.value);
        
        // 使用映射更新岛屿名称
        fromIslandName.value = islandMap[ticketInfo.value.fromislandid] || '未知岛屿';
        toIslandName.value = islandMap[ticketInfo.value.toislandid] || '未知岛屿';
        
        // 解析schedule字段为数组
        if (res.data.result.schedule) {
          parsedSchedule.value = res.data.result.schedule.split(',').map(item => {
            const [time, status] = item.split('|');
            return {
              time: time || '00:00',
              status: status || '余票充足'
            };
          });
          console.log('解析后的航班时刻:', parsedSchedule.value);
        }
        
        // 解析舱位类型
        cabinTypes.value = [
          { name: '普通舱', price: 128, description: '标准座椅' },
          { name: '商务舱', price: 228, description: '宽敞座椅，赠送饮品' }
        ];
        console.log('舱位类型数据:', cabinTypes.value);
        
        // 解析乘船须知
        // 解析乘船须知
        instructions.value = [
            { 
				text: '请提前30分钟到达码头检票', 
				icon: '/static/ticket/ticket.png'
			},
			{
				text: '候船区：东澳岛码头2号候船厅', 
				icon: '/static/ticket/address.png' 
			},
			{ 
				text: '靠岛时间：约15分钟', 
				icon: '/static/ticket/mao.png' 
			},
			{ 
				text: '请携带有效身份证件', 
				icon: '/static/ticket/i.png' 
			}
			];
        console.log('乘船须知数据:', instructions.value);
        
        // 默认选中第一个舱位
        selectedCabinIndex.value = 0;
        selectedCabinPrice.value = cabinTypes.value[0].price;
      } else {
        error.value = res.data.message || '获取数据失败';
        console.error('获取数据失败:', error.value);
      }
    },
    fail: (err) => {
      console.error('网络请求失败:', err);
      error.value = '网络请求失败，请稍后重试';
    }
  });
};

// 选中舱位
const selectCabin = (index) => {
  selectedCabinIndex.value = index;
  selectedCabinPrice.value = cabinTypes.value[index].price;
};

// 创建订单
const createOrder = () => {
  if (!userStore.token) {
    uni.showToast({
      title: '未登录,请先登录',
      icon: 'none',
      duration: 1500
    });
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    }, 500);
    return;
  }

  const orderData = {
    contract: {
      contractName: userStore.userInfo.realname || '默认联系人',
      contractPhone: userStore.userInfo.phone || '12345678901'
    },
    items: [
      {
        bookInfo: {
          date: ticketInfo.value.schedule,
          fullname: userStore.userInfo.realname || '默认联系人',
          idCardNo: userStore.userInfo.idCardNo || '110101199001011234',
          idCardType: 'ID_CARD',
          schedule: ticketInfo.value.schedule
        },
        productId: ticketInfo.value.id,
        productType: 'Transportation',
        quantity: 1,
        price: selectedCabinPrice.value
      }
    ]
  };

  console.log('创建订单 - 请求数据:', JSON.stringify(orderData, null, 2));

  uni.request({
    url: 'https://island.zhangshuiyi.com/island/front/order/createOrder',
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token
    },
    data: orderData,
    success: (res) => {
      console.log('创建订单 - 响应数据:', JSON.stringify(res.data, null, 2));

      if (res.data.code === 200) {
        uni.showToast({
          title: '订单创建成功',
          icon: 'success',
          duration: 1500
        });
      } else {
        uni.showToast({
          title: res.data.message || '订单创建失败',
          icon: 'none'
        });
      }
    },
    fail: (err) => {
      console.error('创建订单失败', err);
      uni.showToast({
        title: '创建订单失败，请稍后重试',
        icon: 'none'
      });
    }
  });
};

onMounted(() => {
  fetchOrderDetails();
});
</script>

<style scoped>
.container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.transport-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f3f9ff;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  position: relative;
  height: 150rpx;
}

.island-info {
  text-align: center;
  margin-bottom: 10rpx;
}

.island-name {
  width: 70px;
  font-size: 35rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
}

.island-desc {
  font-size: 24rpx;
  color: #9ea4ac;
}

.line{
	width: 120rpx;
	height: 4rpx;
}

.arrow-img {
  height: 50rpx;
  width: 50rpx;
  margin-bottom: 10rpx;
}

.arrow {
  font-size: 40rpx;
  color: #1890ff;
  font-weight: bold;
  height: 100rpx;
  display: flex;
  align-items: center;
}

.duration-view {
  text-align: center;
  position: absolute;
  bottom: 10rpx;
  left: 43%;
}

.duration {
  font-size: 24rpx;
  color: #89929e;
}

.price-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.price {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.book-btn {
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 15rpx;
  padding: 5rpx 30rpx;
  font-size: 28rpx;
  margin-right: 5rpx;
}

.schedule-section, .cabin-section, .instructions-section {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.instructions-section{
	background-color: #fff;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.cabin-item.selected{
	width: 95%;
	border: #1890ff 1px solid;
	border-radius: 10px;
}

.cabin-description{
	color: #89929e;
	font-size: 15px;
}

.schedule-list, .cabin-list, .instructions-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.schedule-item, .cabin-item, .instruction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx;
  color: #ff4d4f;
}

.cabin-item{
	width: 95%;
}

.time, .cabin-name, .instruction-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.status, .cabin-price {
  font-size: 24rpx;
  padding: 5rpx 15rpx;
  border-radius: 50rpx;
}

.available {
  background-color: #e6f7ff;
  color: #1890ff;
}

.limited {
  background-color: #fff7e6;
  color: #fa8c16;
}

.instruction-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.instruction-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.instruction-text {
  flex: 1;
}

.error-message {
  text-align: center;
  color: #ff4d4f;
  margin-top: 20rpx;
  font-size: 28rpx;
}
</style>