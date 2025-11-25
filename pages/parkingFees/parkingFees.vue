<template>
  <view class="page">
    <!-- 顶部栏 -->
    <view class="nav-bar" :style="{ paddingTop: safeAreaInsets.top ? safeAreaInsets.top + 'px' : '0px' }">
      <uni-icons @click="goBack" type="back" size="24" color="#FFFFFF"></uni-icons>
      <text class="nav-title">停车缴费</text>
    </view>

    <!-- 主内容区 -->
    <scroll-view class="main-content" scroll-y>
      <!-- 左侧：车牌输入 -->
      <view class="card input-card">
        <text class="label">请输入车牌号</text>
        <view class="plate-input">
          <input type="text" class="number-input" v-model="plateNumber" placeholder="例如：粤A12345" maxlength="8" />
        </view>
        <text class="subtip">支持新能源车牌格式</text>
        <button @click="getParkingDeatil" class="query-btn"><uni-icons type="search" size="20" color="#FFFFFF" /> 查询停车信息</button>
        <view class="quick-row">
          <view class="quick-item"><uni-icons type="calendar" size="18" color="#87909A" /> 历史记录</view>
          <view class="quick-item"><uni-icons type="chat" size="18" color="#87909A" /> 联系客服</view>
          <view class="quick-item"><uni-icons type="gift" size="18" color="#87909A" /> 优惠券</view>
        </view>

        <view v-if="filteredParkingInfoList.length > 0" class="history-plates">
          <view class="plate-item" v-for="(item, index) in filteredParkingInfoList" :key="index" @click="selectPlate(item.licensePlate)">
            {{ item.licensePlate }}
          </view>
        </view>
      </view>

      <!-- 右侧：查询结果（在下方显示） -->
      <view v-if="hasResult" class="result-panel">
        <view class="card result-card">
          <view class="info-row">
            <text class="info-label">车牌号码</text>
            <text class="info-value">{{ parkingInfo.licensePlate || plateNumber }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">入场时间</text>
            <text class="info-value">{{ parkingInfo.entryTime }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">当前时间</text>
            <text class="info-value">{{ currentTime }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">停车时长</text>
            <text class="info-value">{{ durationText }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">计费标准</text>
            <text class="info-value">{{ parkingInfo.rateDescription }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">需缴费用</text>
            <text class="price">￥{{ parkingInfo.amountPayable }}</text>
          </view>
        </view>

        <view class="bottom-bar inline">
          <button class="pay-btn" @click="onPayClick(parkingInfo)">立即支付 ￥{{ parkingInfo.amountPayable }}</button>
        </view>
      </view>
    </scroll-view>


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
  uni.showToast({
    title: '支付成功',
    icon: 'success',
    duration: 1500
  });
  setTimeout(() => {
    uni.switchTab({
      url: '/pages/index/index'
    });
  }, 1500);
};

// 结果展示条件
const hasResult = computed(() => !!parkingInfo.value.entryTime && parkingInfo.value.amountPayable > 0);

// 当前时间格式
const pad = (n) => (n < 10 ? '0' + n : '' + n);
const currentTime = computed(() => {
  const d = new Date();
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}年${m}月${day}日 ${h}:${min}`;
});

// 时长格式化为“X小时Y分钟”
const durationText = computed(() => {
  const mins = Number(parkingInfo.value.parkingDuration || 0);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}分钟`;
  return `${h}小时${m}分钟`;
});
</script>

<style>
page { height: 100%; background-color: #f5f5f5; }

.page { height: 100%; display: flex; flex-direction: column; }

.nav-bar { position: relative;height: 120rpx; display: flex; align-items: center; justify-content: space-between; padding: 0 32rpx; background-color: #1E88E5; box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08); }
.nav-title { position: absolute; left: 50%; transform: translateX(-50%); font-size: 34rpx; font-weight: 600; color: #FFFFFF; padding-right: 50rpx;}

.main-content { flex: 1; overflow: auto; }

.card { background-color: #ffffff; border-radius: 16rpx; padding: 32rpx; margin-bottom: 32rpx; width: 86%; box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06); }
.input-card { margin: 24rpx auto; }
.result-panel { margin: 0 auto; width: 100%; display: flex; flex-direction: column; align-items: center; }
.result-card { width: 86%; }

.label { font-size: 28rpx; color: #666666; margin-bottom: 16rpx; }

.plate-input { display: flex; gap: 16rpx; margin-bottom: 24rpx; margin-top: 10px; }
.number-input { flex: 1; height: 88rpx; border: 2rpx solid #e0e0e0; border-radius: 12rpx; text-align: center; font-size: 32rpx; font-weight: 500; background: #f9fafb; }
.subtip { color: #87909A; font-size: 24rpx; margin-bottom: 24rpx; }
.query-btn { height: 88rpx; background-color: #1E88E5; border-radius: 12rpx; display: flex; align-items: center; justify-content: center; font-size: 30rpx; color: #ffffff; gap: 8rpx; }
.quick-row { margin-top: 24rpx; display: flex; gap: 28rpx; color: #87909A; font-size: 24rpx; }
.quick-item { display: flex; align-items: center; gap: 8rpx; }

.history-plates { display: flex; flex-direction: column; align-items: center; margin-top: 16px; }
.plate-item { background-color: #f0f0f0; padding: 10px 20px; border: 1px solid #ccc; border-radius: 8rpx; margin-bottom: 10px; color: #666666; cursor: pointer; text-align: center; width: 100%; box-sizing: border-box; }
.plate-item:hover { background-color: #e0e0e0; }
.plate-item.active { border-color: #1E88E5; color: #1E88E5; }

.info-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 26rpx; }
.info-label { font-size: 28rpx; color: #666666; }
.info-value { font-size: 28rpx; font-weight: 500; color: #333333; }
.price { font-size: 36rpx; font-weight: 700; color: #1677FF; }

.bottom-bar.inline { width: 86%; margin: 0 auto 32rpx auto; background: transparent; box-shadow: none; }
.pay-btn { background-color: #1677FF; color: #ffffff; padding: 0rpx 64rpx; border-radius: 12rpx; font-size: 32rpx; width: 100%; height: 88rpx; }
</style>