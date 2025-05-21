<template>
  <view class="page">
    <!-- 导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: safeAreaInsets.top ? safeAreaInsets.top + 'px' : '0px' }">
      <uni-icons @click="goBack" type="back" size="24" color="#333333"></uni-icons>
      <text class="nav-title">停车收费</text>
      <uni-icons type="search" size="24" color="#333333"></uni-icons>
    </view>

    <!-- 主内容区 -->
    <scroll-view class="main-content" scroll-y>
      <!-- 车牌输入卡片 -->
      <view class="card">
        <text class="label">请输入车牌号</text>
        <view class="plate-input">
          <input type="text" class="number-input" v-model="plateNumber" placeholder="请输入车牌号如:粤C45678" maxlength="6" />
          <button @click="getParkingDeatil" class="change-btn">
            查询
          </button>
        </view>
        <!-- 新增：展示模糊查询结果 -->
        <view v-if="filteredParkingInfoList.length > 0" class="history-plates">
          <view class="plate-item" v-for="(item, index) in filteredParkingInfoList" :key="index" @click="selectPlate(item.licensePlate)">
            {{ item.licensePlate }}
          </view>
        </view>
      </view>

      <!-- 停车信息卡片 -->
      <view class="card">
        <view class="info-row">
          <text class="info-label">当前停车地点</text>
          <text class="info-value">{{ parkingInfo.parkingLocation }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">入场时间</text>
          <text class="info-value">{{ parkingInfo.entryTime }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">已停车时长</text>
          <text class="info-value">{{ parkingInfo.parkingDuration }} 分钟</text>
        </view>
        <view class="info-row">
          <text class="info-label">应付金额</text>
          <text class="price">¥{{ parkingInfo.amountPayable }}</text>
        </view>
        <text class="fee-standard">收费标准：{{ parkingInfo.rateDescription }}</text>
      </view>

      <!-- 支付方式卡片 -->
      <view class="card">
        <text class="title">支付方式</text>
        <view class="payment-list">
          <label class="payment-item" v-for="(item, index) in paymentMethods" :key="index">
            <view class="payment-info">
              <image :src="item.icon" mode="scaleToFill" />
              <text>{{ item.name }}</text>
            </view>
            <radio :value="item.value" :checked="selectedPayment === item.value" @click="selectedPayment = item.value"
              color="#1E88E5" />
          </label>
        </view>
      </view>

      <view class="standard">
        <view class="payStanding">
          <text class="PayStandingTitle">收费标准</text>
        </view>
        <view class="payStandingContent">
          <block v-for="(item, index) in parkingInfo.rateDescriptionList" :key="index">
            <text class="standingItem">{{ index + 1 }}. {{ item }}</text>
          </block>
        </view>
      </view>

    </scroll-view>

    <!-- 底部支付栏 -->
    <view class="bottom-bar">
      <button class="pay-btn" @click="onPayClick(parkingInfo)">立即支付 ￥{{ parkingInfo.amountPayable }}</button>
    </view>


  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/store/modules/user';
import { onShow } from '@dcloudio/uni-app';

const userStore = useUserStore();

const plateProvince = ref('');
const plateNumber = ref('');
const selectedPayment = ref('wechat');
const parkingInfo = ref({
  parkingLocation: '',
  entryTime: '',
  parkingDuration: 0,
  amountPayable: 0,
  rateDescription: '',
  rateDescriptionList: []
});
const rateDescriptionList = ref([]);

const paymentMethods = ref([
  { name: '微信支付', icon: 'https://wuminghui.top:9000/wlmtsys/2025/05/19/53fe7786fa524c07b4228f81aa9605b3.png', color: '#07C160', value: 'wechat' },
  { name: '支付宝', icon: 'https://wuminghui.top:9000/wlmtsys/2025/05/19/3e6ccbf7345c4f65aed388dc0565ffb9.png', color: '#1677FF', value: 'alipay' }
]);

// 获取屏幕的安全距离
const safeAreaInsets = uni.getSystemInfoSync().safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };

// 返回上一页
const goBack = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

onShow(() => {
  // 在页面显示时，获取用户信息
  getParkingList()
});
const parkingInfoList = ref([]);

// 获取所有停车信息
const getParkingList = () => {
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/parking/ilParkingRecords/list',
    method: 'GET',
    header: {
      'X-Access-Token': userStore.token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: {
      pageNo: 1,
      pageSize: 50
    },
    success: (res) => {
      if (res.data.code === 401) {
        uni.showModal({
          title: '请重新登录',
          content: '',
          showCancel: false,
          confirmText: '确定',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/login/login' });
            }
          },
        });
      }
      if (res.data.code === 200) {
        const result = res.data.result.records;
        console.log(result);
        parkingInfoList.value = result;

      }
    },
  })

}


const getParkingDeatil = () => {
  if (!plateNumber.value) {
    uni.showModal({
      title: '请输入车牌号',
      content: '',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
    });
    return;

  }
  // 处理车牌输入逻辑
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/parking/ilParkingRecords/queryByCarNum',
    method: 'GET',
    header: {
      'X-Access-Token': userStore.token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: {
      carNum: plateNumber.value
    },
    success: (res) => {
      if (res.data.code === 401) {
        uni.showModal({
          title: '请重新登录',
          content: '',
          showCancel: false,
          confirmText: '确定',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/login/login' });
            }
          },
        });
      }
      else if (res.data.result && res.data.result.length > 0) {
        const result = res.data.result[0];
        parkingInfo.value = result;

        // 按逗号分隔 rateDescription
        parkingInfo.value.rateDescriptionList = result.rateDescription.split('，');
        // 注意：这里使用的是中文逗号
        rateDescriptionList.value = parkingInfo.value.rateDescriptionList
      } else {
        uni.showToast({
          title: '未找到停车信息',
          icon: 'none',
        });
      }

    },
  })
}

// 新增：计算属性，用于模糊查询
const filteredParkingInfoList = computed(() => {
  if (!plateNumber.value) {
    return [];
  }
  return parkingInfoList.value.filter(item => item.licensePlate.includes(plateNumber.value));
});

// 新增：点击查询结果时将车牌号填入输入框的方法，并隐藏查询结果
const selectPlate = (carNum) => {
  console.log('点击的车牌号:', carNum); // 添加调试语句
  plateNumber.value = carNum;
  // 清空输入框，使计算属性重新计算并隐藏结果
  // plateNumber.value = '';
  getParkingDeatil()
};

const onPayClick = (parking) => {
  console.log(parking.id);

  const orderData = ref({
    contract: {
      contractName: userStore.userInfo.realname || '',
      contractPhone: userStore.userInfo.phone || ''
    },
    items: [
      {
        bookInfo: {
          date: new Date().toISOString().split('T')[0], // 添加默认日期
          fullname: userStore.userInfo.realname || '',
          idCardNo: userStore.userInfo.idCardNo || '',
          idCardType: 'ID_CARD',
          schedule: new Date().toISOString().split('T')[0] // 添加默认日期
        },
        productId: parking.id, // 初始为空字符串
        productType: "Parking",
        quantity: 1
      }
    ]
  })
  // 处理支付点击
  uni.showModal({
    title: '支付',
    content: '是否确认支付？',
    showCancel: true,
    cancelText: '取消',
    confirmText: '确定',
    success: (res) => {
      if (res.confirm) {
        // 处理支付逻辑
        uni.request({
          url: 'https://island.zhangshuiyi.com/island/front/order/createOrder',
          method: 'POST',
          header: {
            'X-Access-Token': userStore.token,
            'Content-Type': 'application/json'
          },
          data: orderData.value,
          success: (success) => {
            console.log(success);

            if (success.data.code === 200) {
              uni.showToast({
                title: '支付成功',
                icon: 'none',
              });
              uni.navigateTo({
                url: '/pages/pay_success/pay_success'
              });
            }
          },
        })

      }
    }
  })
};
</script>

<style>
page {
  height: 100%;
  background-color: #f5f5f5;
}

.page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  background-color: #FFFFFF;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.nav-title {
  font-size: 34rpx;
  font-weight: 500;
  color: #333333;
}

.main-content {
  flex: 1;
  padding: 32rpx;
  overflow: auto;
}

.card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  /* margin-righrt: 32rpx; */
  margin-bottom: 32rpx;
  width: 83%;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.label {
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 16rpx;
}

.plate-input {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
  margin-top: 10px;
}

.province-input {
  width: 100rpx;
  height: 88rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
}

.number-input {
  flex: 1;
  height: 88rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
}

.change-btn {
  width: 88rpx;
  height: 88rpx;
  background-color: #1e88e5;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  width: 28%;
  justify-content: center;
  font-size: 20px;
  font-weight: 400;
  color: #ffffff;
}

.history-plates {
  display: flex;
  flex-direction: column; /* 按列方向排列 */
  align-items: center; /* 内容居中 */
  margin-top: 10px; /* 调整间隙 */
}

.plate-item {
  background-color: #f0f0f0; /* 添加背景色 */
  padding: 10px 20px; /* 调整内边距 */
  border: 1px solid #ccc; /* 调整边框 */
  border-radius: 8rpx;
  margin-bottom: 10px; /* 调整间隙 */
  color: #666666;
  cursor: pointer;
  text-align: center; /* 文字居中 */
  width: 100%; /* 占满宽度 */
  box-sizing: border-box; /* 包含内边距和边框 */
}

.plate-item:hover {
  background-color: #e0e0e0;
}

.plate-item.active {
  border-color: #1E88E5;
  color: #1E88E5;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.info-label {
  font-size: 28rpx;
  color: #666666;
}

.info-value {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}

.price {
  font-size: 36rpx;
  font-weight: 500;
  color: #1E88E5;
}

.fee-standard {
  font-size: 24rpx;
  color: #999999;
}

.title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 32rpx;
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.payment-info image {
  width: 38rpx;
  height: 38rpx;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx;
  /* border: 2rpx solid #e0e0e0; */
  border-radius: 8rpx;
}

.payment-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.standard {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  width: 83%;
}

.payStandingContent {
  display: flex;
  flex-direction: column;
}

.PayStandingTitle {
  font-size: 32rpx;
  font-weight: 500;
}

.payStandingContent {
  margin-top: 22rpx;
  font-size: 26rpx;
  font-weight: 300;

}

.bottom-bar {
  height: 120rpx;
  background-color: #ffffff;
  padding: 0rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  align-content: center;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}


.pay-btn {
  background-color: #1E88E5;
  color: #ffffff;
  padding: 0rpx 64rpx;
  border-radius: 8rpx;
  font-size: 32rpx;
  width: 500rpx;
}
</style>