<template>
  <view class="page">
    <view class="nav">
      <uni-icons type="arrow-left" size="24" color="#fff" @click="goBack" />
      <text class="nav-title">预约支付</text>
    </view>

    <scroll-view class="content" scroll-y>
      <view class="card">
        <text class="card-title">个人信息</text>
        <view class="form-item">
          <text class="label">姓名</text>
          <input v-model="form.name" class="input" placeholder="请输入您的姓名" />
        </view>
        <view class="form-item">
          <text class="label">手机号</text>
          <input v-model="form.phone" type="number" class="input" placeholder="请输入您的手机号" />
        </view>
        <view class="form-item">
          <text class="label">身份证号</text>
          <input v-model="form.idCardNo" class="input" placeholder="请输入您的身份证号" />
        </view>
      </view>

      <view class="card">
        <text class="card-title">选择日期</text>
        <view class="date-row">
          <view v-for="(d, i) in dateOptions" :key="i" :class="['date-chip', selectedDate === d.date && 'active']" @click="selectedDate = d.date">
            <text class="date-day">{{ d.day }}</text>
            <text class="date-week">{{ d.week }}</text>
            <text class="date-month">{{ d.month }}</text>
          </view>
        </view>
        <view class="open-time">
          <text>开放时间： {{ openTime }}</text>
        </view>
      </view>

      <view class="card">
        <text class="card-title">备注</text>
        <textarea v-model="remark" class="textarea" placeholder="请输入..." />
      </view>

      <view class="card">
        <text class="card-title">商品列表</text>
        <view class="items">
          <view v-for="(item, idx) in items" :key="idx" class="item">
            <view class="item-left">
              <text class="item-name">{{ item.name || '商品' }}</text>
              <text class="item-type">{{ item.type || '—' }}</text>
            </view>
            <text class="item-price">¥ {{ Number(item.ticketprice || item.price || 0) }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <text class="total">¥ {{ totalPrice.toFixed(2) }}</text>
      <button class="buy-btn" :disabled="isPaying" @click="handlePay">{{ isPaying ? '支付处理中...' : '立即购买' }}</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

const items = ref([]) // [{id, name, type, ticketprice, starttime, endtime}]
const orderSns = ref([]) // 多个订单号，用于共同支付
const remark = ref('')
const isPaying = ref(false)

const form = ref({
  name: '',
  phone: '',
  idCardNo: ''
})

const selectedDate = ref('')
const showMore = ref(false)
const dateOptions = ref([])
const loadedDays = ref(0)
const weeks = ['周日','周一','周二','周三','周四','周五','周六']
const addDays = (count) => {
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const offset = loadedDays.value + i
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
    dateOptions.value.push({
      date: `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,
      day: d.getDate(),
      week: weeks[d.getDay()],
      month: `${d.getMonth()+1}月`
    })
  }
  loadedDays.value += count
}

const pad = n => n < 10 ? '0' + n : n

const openTime = computed(() => {
  if (!items.value || items.value.length === 0) return '09:00 - 23:00'
  const first = items.value[0]
  const s = (first.starttime || '09:00').slice(0,5)
  const e = (first.endtime || '23:00').slice(0,5)
  return `${s} - ${e}`
})

const totalPrice = computed(() => {
  return (items.value || []).reduce((sum, it) => sum + Number(it.ticketprice || it.price || 0), 0)
})

onLoad(async (options) => {
  try {
    if (options.items) {
      const arr = JSON.parse(decodeURIComponent(options.items))
      items.value = Array.isArray(arr) ? arr : []
    }
    if (options.orderSns) {
      const arr = JSON.parse(decodeURIComponent(options.orderSns))
      orderSns.value = Array.isArray(arr) ? arr : []
    }
    
    // Fetch latest details for items
    if (items.value.length > 0) {
      await fetchItemDetails()
    }

    addDays(5)
    if (options.price) {
      const p = Number(options.price)
      if (!isNaN(p)) {
        if (items.value.length > 0) {
          items.value[0].price = p
          items.value[0].ticketprice = p
        }
      }
    }
    if (!selectedDate.value && dateOptions.value.length) selectedDate.value = dateOptions.value[0].date
    form.value.name = userStore.userInfo?.realname || ''
    form.value.phone = userStore.userInfo?.phone || ''
    form.value.idCardNo = userStore.userInfo?.idCardNo || ''
  } catch (e) {
    console.error('解析参数失败', e)
  }
})

const goBack = () => { uni.navigateBack() }

// 已移除更多按钮，默认展开日期

const handlePay = async () => {
  if (isPaying.value) return
  if (!form.value.name || !form.value.phone || !form.value.idCardNo) {
    uni.showToast({ title: '请完善个人信息', icon: 'none' })
    return
  }
  if (!selectedDate.value) {
    uni.showToast({ title: '请选择日期', icon: 'none' })
    return
  }

  isPaying.value = true
  uni.showLoading({ title: '处理中...' })

  try {
    // 1. 如果没有订单号，先创建订单
    if (!orderSns.value || orderSns.value.length === 0) {
      const newSns = []
      for (const item of items.value) {
        const sn = await createOrderRequest(item)
        if (sn) newSns.push(sn)
      }
      if (newSns.length === 0) throw new Error('订单创建失败')
      orderSns.value = newSns
    }

    // 2. 支付订单 (已移除，改为跳转到详情页支付)
    // for (const sn of orderSns.value) {
    //   await payOrderRequest(sn)
    // }

    // 3. 成功跳转
    uni.hideLoading()
    isPaying.value = false
    
    // 跳转到订单详情页
    const allSns = JSON.stringify(orderSns.value);
    uni.redirectTo({
      url: `/pages/order/detail?orderSns=${encodeURIComponent(allSns)}`
    })

  } catch (err) {
    console.error(err)
    isPaying.value = false
    uni.hideLoading()
    uni.showToast({ title: err.message || '支付失败', icon: 'none' })
  }
}

const createOrderRequest = (item) => {
  return new Promise((resolve, reject) => {
    const getFullTime = (t, defaultT) => {
      const time = t || defaultT
      if (time.length === 5) return time + ':00'
      return time
    }
    const startTime = getFullTime(item.starttime, '09:00:00')
    const endTime = getFullTime(item.endtime, '23:00:00')
    const dateStr = selectedDate.value
    const startDateTime = `${dateStr} ${startTime}`
    const endDateTime = `${dateStr} ${endTime}`

    const orderData = {
      contract: {
        contractName: form.value.name,
        contractPhone: form.value.phone
      },
      items: [
        {
          bookInfo: {
            date: dateStr,
            fullname: form.value.name,
            idCardNo: form.value.idCardNo,
            idCardType: "ID_CARD",
            schedule: startTime
          },
          productId: item.id,
          productType: item.type || "Attractions",
          imageUrl: item.imageUrl || '',
          quantity: 1
        }
      ],
      travelStartDate: startDateTime,
      travelEndDate: endDateTime
    }
    
    uni.request({
      url: 'https://island.zhangshuiyi.com/island/front/order/createOrder',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'X-Access-Token': userStore.token
      },
      data: orderData,
      success: (res) => {
        if (res.data.success && res.data.code === 200) {
          resolve(res.data.result.orderSn)
        } else {
          reject(new Error(res.data.message || '创建订单失败'))
        }
      },
      fail: (err) => reject(err)
    })
  })
}

const payOrderRequest = (sn) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `https://island.zhangshuiyi.com/island/front/order/payOrder?orderSn=${sn}`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'X-Access-Token': userStore.token,
      },
      success: (res) => { 
        if (res.data.success) resolve(res)
        else reject(new Error(res.data.message || '支付失败'))
      },
      fail: (err) => reject(err)
    })
  })
}
</script>

<style>
.page { display: flex; flex-direction: column; height: 100vh; background: #f5f6fb;margin-top: 70rpx; }
.nav { display: flex; align-items: center; gap: 10rpx; padding: 24rpx; background: #1677FF; color: #fff; }
.nav-title { font-size: 32rpx; font-weight: 700; }
.content { flex: 1; }
.card { background: #fff; border-radius: 20rpx; margin: 24rpx; padding: 24rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.06); }
.card-title { font-size: 30rpx; color: #1677FF; font-weight: 700; margin-bottom: 18rpx; }
.form-item { margin-bottom: 18rpx; }
.label { display: block; font-size: 26rpx; color: #666; margin-bottom: 10rpx; }
.input { width: 100%; height: 88rpx; border: 1px solid #e5e7eb; border-radius: 16rpx; padding: 0 24rpx; font-size: 28rpx; }
.date-row { display: flex; align-items: center; gap: 16rpx; }
.date-chip { width: 120rpx; height: 120rpx; border: 1px solid #dbeafe; border-radius: 16rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #334155; }
.date-chip.active { border-color: #1677FF; color: #1677FF; background: #eff6ff; }
.date-chip.more { width: 120rpx; height: 120rpx; border: 1px dashed #cbd5e1; color: #475569; }
.date-day { font-size: 34rpx; font-weight: 700; }
.date-week { font-size: 24rpx; color: #64748b; }
.date-month { font-size: 24rpx; color: #94a3b8; }
.open-time { margin-top: 14rpx; color: #334155; }
.textarea { width: 100%; height: 160rpx; border: 1px solid #e5e7eb; border-radius: 16rpx; padding: 16rpx; font-size: 28rpx; }
.items { display: flex; flex-direction: column; gap: 14rpx; }
.item { display: flex; justify-content: space-between; align-items: center; padding: 16rpx; background: #f8fafc; border-radius: 12rpx; }
.item-left { display: flex; flex-direction: column; }
.item-name { font-size: 28rpx; color: #111827; font-weight: 600; }
.item-type { font-size: 24rpx; color: #6b7280; }
.item-price { font-size: 28rpx; color: #1677FF; font-weight: 700; }
.bottom-bar { display: flex; align-items: center; justify-content: space-between; padding: 24rpx; background: #fff; box-shadow: 0 -4rpx 12rpx rgba(0,0,0,0.06); }
.total { font-size: 32rpx; color: #1677FF; font-weight: 700; }
.buy-btn { background: #1677FF; color: #fff;margin-right:20rpx ; border: none; border-radius: 12rpx; height: 80rpx; padding: 0 36rpx; font-size: 30rpx; }
</style>
