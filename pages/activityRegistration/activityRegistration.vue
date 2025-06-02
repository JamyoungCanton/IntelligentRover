<template>
  <view class="container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <uni-icons :type="icons.back" size="24"></uni-icons>
      </view>
      <text class="title">{{ textData.title }}</text>
    </view>

    <image :src="textData.activityImage" class="registration-image"></image>

    <view class="registration-info">
      <text class="activity-title">{{ textData.activityTitle }}</text>
      <view class="info-item">
        <uni-icons :type="icons.calendar" size="16" color="#666"></uni-icons>
        <text class="info-text">{{ textData.activityTime }}</text>
      </view>
      <view class="info-item">
        <uni-icons :type="icons.location" size="16" color="#666"></uni-icons>
        <text class="info-text">{{ textData.activityLocation }}</text>
      </view>
      <view class="info-item">
        <text class="price">{{ textData.price }}</text>
        <text class="price-unit">{{ textData.priceUnit }}</text>
      </view>
    </view>

    <view class="form-section">
      <text class="section-title">{{ textData.sections.form }}</text>

      <view class="form-item">
        <text class="label">选择活动日期</text>
        <picker mode="date" :value="playDate" :start="todayStr" @change="onPlayDateChange">
          <view class="picker-value">{{ playDate || '请选择活动日期' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">{{ textData.labels.name }}</text>
        <input v-model="form.name" class="input" :placeholder="textData.placeholders.name" maxlength="10" />
      </view>

      <view class="form-item">
        <text class="label">{{ textData.labels.phone }}</text>
        <input v-model="form.phone" class="input" :placeholder="textData.placeholders.phone" maxlength="11" />
      </view>

      <view class="form-item">
        <text class="label">{{ textData.labels.participants }}</text>
        <view class="counter">
          <button @click="decreaseParticipants" class="counter-btn minus" :disabled="form.participants === 1"
            :class="{ 'disabled': form.participants === 1 }">
            {{ textData.buttons.minus }}
          </button>
          <text class="counter-value">{{ form.participants }}</text>
          <button @click="increaseParticipants" class="counter-btn plus">
            {{ textData.buttons.plus }}
          </button>
        </view>
      </view>
    </view>

    <view class="cost-details">
      <text class="section-title">{{ textData.sections.cost }}</text>

      <view class="cost-item">
        <text class="cost-name">{{ textData.costNames.activity }}</text>
        <text class="cost-value">¥{{ activityCost }} × {{ form.participants }}人</text>
      </view>
    </view>

    <view class="agreement">
      <checkbox class="checkbox" :checked="agreed" @click="toggleAgreement"></checkbox>
      <text class="agreement-text">{{ textData.agreements.text }}</text>
    </view>

    <button class="submit-btn" @click="submitRegistration" :disabled="!agreed">
      {{ textData.buttons.submit }}
    </button>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user';

const safeAreaInsets = ref({ bottom: 0 });
const statusBarHeight = ref(0);
const userStore = useUserStore();

// 统一管理的文本数据
const textData = ref({
  // 页面标题
  title: '活动报名',

  // 活动信息
  activityTitle: '深海潜水体验',
  activityTime: '2024年3月15日 09:00-12:00',
  activityLocation: '万山群岛 东澳岛潜水基地',
  activityImage: 'https://wuminghui.top:9000/travel/diving2.jpg',

  // 价格信息
  price: '¥399',
  priceUnit: '/人',

  // 按钮文本
  buttons: {
    minus: '-',
    plus: '+',
    submit: '立即报名'
  },

  // 表单标签和占位符
  labels: {
    name: '姓名',
    phone: '手机号码',
    participants: '参与人数'
  },

  placeholders: {
    name: '请输入真实姓名',
    phone: '请输入手机号码'
  },

  // 协议文本
  agreements: {
    text: '我已阅读并同意《活动协议》和《免责声明》'
  },

  // 费用名称
  costNames: {
    activity: '活动费用',
    insurance: '保险费用'
  },

  // 分段标题
  sections: {
    form: '报名信息',
    cost: '费用明细'
  },

  // 表单验证提示
  validationMessages: {
    name: '请输入姓名',
    phone: '请输入手机号码',
    agreement: '请阅读并同意协议',
    submitSuccess: '报名成功'
  }
})

// 图标和图片路径
const icons = {
  back: 'back',
  calendar: 'calendar',
  location: 'location'
}

// 表单数据
const form = ref({
  name: '',
  phone: '',
  participants: 1
})

// 是否同意协议
const agreed = ref(false)

// 安全区域
const safeArea = ref({ top: 0, bottom: 0 })

// 计算属性
const activityCost = computed(() => {
  const price = textData.value.price.replace(/[^0-9.]/g, '') // 移除¥等非数字字符
  return Number(price) * form.value.participants
})

// 在 script setup 中添加日期相关的状态
const playDate = ref('');
const today = new Date();
const pad = (n) => n < 10 ? '0' + n : n;
const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

// 修改日期选择处理函数
const onPlayDateChange = (e) => {
  // 将选择的日期转换为 YYYY-MM-DD 格式
  const selectedDate = e.detail.value;
  playDate.value = selectedDate;
  
  // 更新活动时间显示
  const timePart = textData.value.activityTime.split(' ')[1] || '09:00-12:00';
  textData.value.activityTime = `${selectedDate} ${timePart}`;
};

// 方法
const goBack = () => {
  uni.navigateBack()
}

const decreaseParticipants = () => {
  if (form.value.participants > 1) {
    form.value.participants--
  }
}

const getSafeAreaInfo = () => {
  const systemInfo = uni.getSystemInfoSync()
  safeArea.value = systemInfo.safeArea || { top: 0, bottom: 0 }
}

const increaseParticipants = () => {
  form.value.participants++
}

const toggleAgreement = () => {
  agreed.value = !agreed.value
}

const submitRegistration = () => {
  if (!form.value.name) {
    uni.showToast({
      title: textData.value.validationMessages.name,
      icon: 'none'
    })
    return
  }
  if (!/^[\u4e00-\u9fa5a-zA-Z]{2,10}$/.test(form.value.name)) {
    uni.showToast({
      title: '姓名需为2-10位中英文字符',
      icon: 'none'
    })
    return
  }
  if (!form.value.phone) {
    uni.showToast({
      title: textData.value.validationMessages.phone,
      icon: 'none'
    })
    return
  }
  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    uni.showToast({
      title: '请输入正确的11位手机号',
      icon: 'none'
    })
    return
  }
  if (!agreed.value) {
    uni.showToast({
      title: textData.value.validationMessages.agreement,
      icon: 'none'
    })
    return
  }

  // 添加日期验证
  if (!playDate.value) {
    uni.showToast({
      title: '请选择活动日期',
      icon: 'none'
    });
    return;
  }

  // 构建订单数据
  const orderData = {
    contract: {
      contractName: form.value.name,
      contractPhone: form.value.phone
    },
    items: [{
      bookInfo: {
        date: playDate.value,
        fullname: form.value.name,
        idCardNo: '',
        idCardType: 'ID_CARD',
        schedule: playDate.value
      },
      productId: activityId.value,
      productType: "Activities",
      imageUrl: textData.value.activityImage,
      quantity: form.value.participants
    }],
    travelStartDate: playDate.value,
    travelEndDate: playDate.value
  }

  console.log('订单数据:', orderData)

  // 提交订单
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/front/order/createOrder',
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token
    },
    data: orderData,
    success: (res) => {
      console.log("订单创建结果：", res.data);
      
      if (res.data.code === 200) {
        uni.showToast({
          title: '订单创建成功',
          icon: 'success',
          duration: 1500
        });
        // 修改跳转页面，直接跳转到支付页面
        const orderSn = res.data.result.orderSn;
        uni.navigateTo({ 
          url: `/pages/activityPay/activityPay?orderSn=${orderSn}`
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
}


// 调用接口获取活动详细信息
const getActivityDetailsById = (id) => {
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/product/ilActivities/queryById',
    method: 'GET',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token || ''
    },
    data: { id: id },
    success: (res) => {
      console.log("获取活动详情成功:", res.data);
      if (res.data.code === 200 && res.data.result) {
        const result = res.data.result;

        // 更新活动基本信息到textData
        textData.value.activityTitle = result.title || textData.value.activityTitle;
        textData.value.activityImage = result.imageUrl || textData.value.activityImage;
        textData.value.activityTime = result.time || textData.value.activityTime;
        textData.value.activityLocation = result.location || textData.value.activityLocation;

        // 更新价格信息
        textData.value.price = result.price ? `¥${result.price}` : textData.value.price;
        textData.value.priceUnit = result.priceUnit || textData.value.priceUnit;

        // 可选：更新成本明细
        if (result.costs) {
          textData.value.costNames = {
            activity: result.costs.activityCostName || textData.value.costNames.activity,
            insurance: result.costs.insuranceCostName || textData.value.costNames.insurance
          };
        }

        // 可选：更新活动流程描述
        if (result.schedules && result.schedules.length) {
          const firstSchedule = result.schedules[0];
          textData.value.sections = {
            form: '报名信息',
            cost: firstSchedule.description || textData.value.sections.cost
          };
        }
      }
    },
    fail: (err) => {
      console.error('获取活动详情失败:', err);
      uni.showToast({
        title: '网络错误，请重试',
        icon: 'none',
        duration: 2000
      });
    },
  });
};

const activityId = ref(null)

onLoad((options) => {
  getSafeAreaInfo()
  console.log('活动订单确认预订页面收到的ID:', options.id);
  activityId.value = options.id || 1;
  getActivityDetailsById(activityId.value);
});
</script>

<style scoped>
/* 样式保持不变 */
.container {
  background-color: #f7f7f7;
  padding: 0 20px;
  padding-top: v-bind('safeArea.top + "px"');
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  background-color: #007AFF;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-align: center;
  flex: 1;
}

.back-btn {
  margin-right: auto;
}

.registration-image {
  width: calc(100% - 40px);
  /* 使图片宽度比顶部蓝色框窄一些 */
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  margin: 0 auto;
  /* 居中显示 */
  display: block;
}

.registration-info {
  background-color: #fff;
  padding: 20px;
  margin-top: 10px;
}

.activity-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.info-text {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
}

.price {
  font-size: 24px;
  /* 钱的颜色 */
  color: #007AFF;
  color: rgb(255, 105, 5);
  font-weight: bold;
}

.price-unit {
  font-size: 14px;
  color: #666;
  margin-left: 5px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 20px 0 10px;
  padding-left: 10px;
  border-left: 4px solid #007AFF;
}

.form-item {
  background-color: #fff;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
}

.label {
  font-size: 16px;
  margin-bottom: 8px;
}

.input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
}

.counter {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.counter-btn {
  background-color: #007AFF;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.counter-btn.minus {
  margin-left: 0;
}

.counter-btn.disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.counter-value {
  font-size: 16px;
  text-align: center;
  flex: 1;
}

.cost-details {
  background-color: #fff;
  padding: 20px;
  margin-top: 10px;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.cost-name {
  font-size: 14px;
  color: #666;
}

.cost-value {
  font-size: 14px;
  font-weight: bold;
}

.agreement {
  display: flex;
  align-items: center;
  margin: 20px 0;
}

.agreement-text {
  font-size: 12px;
  color: #666;
}

.submit-btn {
  width: 100%;
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 15px;
  font-size: 16px;
  margin-top: 10px;
}

.picker-value {
  display: inline-block;
  color: #007aff;
  font-size: 15px;
  background: #fff;
  border-radius: 6px;
  padding: 6px 16px;
  border: 1px solid #e0e0e0;
  min-width: 90px;
  text-align: center;
  transition: border-color 0.2s;
}

.picker-value:active,
.picker-value:focus {
  border-color: #007aff;
}
</style>