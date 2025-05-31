<template>
  <view class="container">
    <view class="header">
      <img src="https://wuminghui.top:9000/wlmtsys/2025/04/22/01b4e40e018145a3b7926e46fa939a65.png" style="width: 100%;" alt="">
      <view class="title-name">
        <text class="title">{{ hotelData.name }}</text>
        <view class="rating">
              <uni-rate :value="hotelData.rating" size="20" readonly></uni-rate>
              <text class="score">{{ hotelData.rating }}</text>
        </view>
      </view>
      <view class="address">
      </view>
      <view class="tags">
        <text class="tag">餐饮</text>
        <text class="tag">{{ hotelData.hoteltheme }}</text>
        <text class="tag">{{ hotelData.hoteltype }}</text>
        <text class="tag">{{ hotelData.starrating }}星级</text>
      </view>
    </view>
    <view class="toomtype">
      <view class="room">
        <view class="roomtitem">
          <view class="roomtitle">房型: </view>
          <view class="roomcontent">{{ hotelData.roomtype }}</view>
        </view>
        <view class="roomtitem">
          <view class="roomtitle">预订方式：</view>
          <view class="roomcontent">{{ hotelData.bookingmethod }}</view>
        </view>
        <view class="roomtitem">
          <view class="roomtitle">库存: </view>
          <view class="roomcontent">{{ hotelData.roominventory }}</view>
        </view>
        <view class="roomtitem">
          <view class="roomtitle">入住时间: </view>
          <view class="roomcontent">14:00:00</view>
        </view>
        <view class="roomtitem">
          <view class="roomtitle">退房时间: </view>
          <view class="roomcontent">12:00:00</view>
        </view>
      </view>
    </view>
    <view class="price">
      <text class="current-price">¥{{ hotelData.price }}</text>
      <text class="original-price">¥1,088 起/晚</text>
      <button class="discount">限时特惠</button>
    </view>
    <view class="footer">
      <view class="nav-btn">
        <image src="/static/hotel-attctive/navigation.png" mode="aspectFill" class="nav-icon"></image>
        <text class="nav-text">导航路线</text>
      </view>
      <view class="nav-btn">
        <image src="/static/hotel-attctive/phone.png" mode="aspectFill" class="nav-icon"></image>
        <text class="nav-text">联系电话</text>
      </view>
      <view class="nav-btn">
        <image src="/static/hotel-attctive/start.png" mode="aspectFill" class="nav-icon"></image>
        <text class="nav-text">收藏</text>
      </view>
      <view class="nav-btn">
        <image src="/static/hotel-attctive/share.png" mode="aspectFill" class="nav-icon"></image>
        <text class="nav-text">分享</text>
      </view>
    </view>

    <view class="hotel-facilities">
      <text class="section-title">酒店设施</text>
      <view class="facility-list">
        <view class="facility-item">
          <image src="/static/hotel-attctive/facility1.png" class="facility-icon"></image>
          <text class="facility-name">免费WiFi</text>
        </view>
        <view class="facility-item">
          <image src="/static/hotel-attctive/facility2.png" class="facility-icon"></image>
          <text class="facility-name">餐厅</text>
        </view>
        <view class="facility-item">
          <image src="/static/hotel-attctive/facility3.png" class="facility-icon"></image>
          <text class="facility-name">停车场</text>
        </view>
        <view class="facility-item">
          <image src="/static/hotel-attctive/facility4.png" class="facility-icon"></image>
          <text class="facility-name">泳池</text>
        </view>
        <view class="facility-item">
          <image src="/static/hotel-attctive/facility5.png" class="facility-icon"></image>
          <text class="facility-name">健身房</text>
        </view>
        <view class="facility-item">
          <image src="/static/hotel-attctive/facility6.png" class="facility-icon"></image>
          <text class="facility-name">商务中心</text>
        </view>
        <view class="facility-item">
          <image src="/static/hotel-attctive/facility7.png" class="facility-icon"></image>
          <text class="facility-name">酒吧</text>
        </view>
        <view class="facility-item">
          <image src="/static/hotel-attctive/facility8.png" class="facility-icon"></image>
          <text class="facility-name">24小时服务</text>
        </view>
      </view>
    </view>
   
    
    <view class="reviews">
      <text class="section-title">住客点评</text>
      <view class="review-item">
        <div class="comheader">
          <div class="ava-name-rating">
            <img src="/static/hotel-attctive/ava.png" style="width: 50px;height: 50px; margin-right: 5px;" alt="">
            <div class="name-rating">
              <text class="date">张女士</text>
              <text class="rating">★★★★★</text>
            </div>
          </div>
          <text class="time">2025-03-15</text>
        </div>
      <text class="comment">位置很好，就在海边，房间干净整洁，服务态度也很好，早餐丰富，性价比高。</text>
      </view>
      <view class="review-item">
        <view class="comheader">
          <view class="ava-name-rating">
            <img src="/static/hotel-attctive/ava.png "   style="width: 50px;height: 50px; margin-right: 5px;" alt="">
            <view class="name-rating">
              <text class="date">黄女士</text>
              <text class="rating">★★★★</text>
            </view>
          </view>
          <text class="time">2025-02-27</text>
        </view>
        <text class="comment">酒店环境优美，海景房视野开阔，床品舒适干净，前台服务热情周到，早餐品种丰富，下次还会选择入住。</text>
      </view>
    </view>
    
    <view class="date-picker-section">
      <text>选择入住日期：</text>
      <picker mode="date" :value="checkinDate" :start="todayStr" @change="onCheckinDateChange">
        <view class="picker-value">{{ checkinDate || '请选择' }}</view>
      </picker>
    </view>
    <button @click="creaOrder(hotelData)" class="book-now">立即预订</button>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
let hotelId = ref('')
let hotelData = ref({
})

// 接收路由参数
onLoad((options) => {
  hotelId.value = options.id
  // console.log(hotelId.value);
  getDetailList()
})

// 获取酒店详情
const getDetailList = () => {
  uni.request({
      url: `https://island.zhangshuiyi.com/island/front/product/accommodations/${hotelId.value}`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'X-Access-Token': userStore.token
      },
      success:(res)=>{
        hotelData.value = res.data
        // console.log(hotelData.value);
        
     },
})


}


// 跳转到订单页面并创建订单
const creaOrder = (hotel) => {
  if (!checkinDate.value) {
    uni.showToast({ title: '请选择入住日期', icon: 'none' });
    return;
  }
  const orderData = {
    contract: {
      contractName: userStore.userInfo.realname || '',
      contractPhone: userStore.userInfo.phone || ''
    },
    items: [
      {
        bookInfo: {
          date: checkinDate.value, // 只传年月日
          fullname: userStore.userInfo.realname || '',
          idCardNo: userStore.userInfo.idCardNo || '',
          idCardType: 'ID_CARD',
          schedule: '' // 不传时间段
        },
        productId: hotel.id,
        productType: "Accommodations",
        quantity: 1
      }
    ],
    travelStartDate: checkinDate.value,
    travelEndDate: checkinDate.value
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
      console.log(res.data);
      
      if (res.data.code === 200) {
        uni.showToast({
          title: '订单创建成功',
          icon: 'success',
          duration: 1500
        });
        const orderSn = res.data.result.orderSn; // 获取订单号
        // 可以跳转到订单详情页或其他页面
        uni.navigateTo({ url: `/pages/confirmHotelOrder/confirmHotelOrder?id=${hotelData.value.id}&orderSn=${orderSn}` })
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

const checkinDate = ref('');
const today = new Date();
const pad = n => n < 10 ? '0' + n : n;
const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

const onCheckinDateChange = (e) => {
  checkinDate.value = e.detail.value;
};

</script>

<style scoped>
.container {
  padding: 16px;
}

.header {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  
}
.header .title-name {
  display: flex;
  justify-content: space-between;
  align-content: center;
  align-items: center;
}
 .title-name .rating{
  display: flex;
  justify-content: space-between;
  align-content: center;
  align-items: center;
}
.header img {
  width: 100%;
  height: 250px;
}
.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.rating {
  color: #ff9800;
  margin-bottom: 8px;
}

.tags {
  display: flex;
  margin-top: 10px;
}

.tag {
  background-color: #dbeafe;
  padding: 4px 8px;
  border-radius: 15px;
  color: #1d3bbe;
  margin-right: 10px;
  padding-left: 10px;
  padding-right: 10px
}

.room{
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  border: solid 1px #dbeafe;
  border-radius: 10px;
  padding: 10px;
  margin-left: 20px;
  margin-right: 20px;
}
.roomtitem{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
 .roomcontent{
  font-size: 18px;
  font-weight: 400;
  color: #1d3bbe;
}
.roomtitle{
  font-size: 16px;
  color: #333;
}

.price {
  display: flex;
  margin-bottom: 16px;
  align-items: center;
  align-content: center;
  justify-content: center;
  margin-left: 30px;
}

.current-price {
  font-size: 28px;
  color: #ff5722;
  margin-right: 8px;
  font-weight: 800;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  padding: 0px px;
}

.discount {
  background-color: #ff5722;
  color: #fff;
  padding: 0px 18px;
  border-radius:14px;
  margin-left: 18px;
  font-size: 13px;
}

.footer {
  display: flex;
  justify-content: space-around;
  padding: 0px 0;
  background-color: #fff;
}

.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 5px;
  padding: 10px;
}

.nav-icon {
  width: 35px;
  height: 35px;
  margin-bottom: 5px;
  border-radius: 50%;
  background-color: #dbeafe;
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-btn img {
  width: 50%;  /* 改为50% */
  height: 50%; /* 改为50% */
  object-fit: contain;
}

.nav-text {
  font-size: 16px;
  color: #333;
}

.hotel-facilities {
  background-color: #fff;
  padding: 15px;
  margin-top: 10px;
  border-radius: 10px;
  border: solid 1px #dbeafe;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.facility-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-left: 10px;
  margin-top: 10px
}

.facility-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 25%;
  margin-bottom: 10px;
}

.facility-icon {
  width: 35px;
  height: 35px;
}

.facility-name {
  font-size: 12px;
  color: #333;
  margin-top: 5px;
}

.reviews {
  background-color: #fff;
  border: solid 1px #dbeafe;
  padding: 15px;
  margin-top: 10px;
  border-radius: 10px;
}
.review-item {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  margin-bottom: 15px;
  border-bottom: 1px solid #dbeafe;
}
.comheader{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}
.ava-name-rating{
  display: flex;
  flex-direction: row;
}
.ava-name-rating img{
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}
.name-rating{
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.name-rating .rating{
  font-size: 12px;
  color: #ff9800;
  height: 12px;
}
.name-rating .date{
  font-size: 12px;
}
.time{
  font-size: 12px;
  color: #999;
}
.comment{
  font-size: 15px;
  /* 首行缩进两字符 */
  text-indent: 2em;
  margin-bottom: 8px;
}


.book-now {
  background-color: #ff5722;
  color: #fff;
  border: none;
  padding: 5px 4px;
  border-radius: 4px;
  width: 100%;
}

.date-picker-section {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.date-picker-section text {
  margin-right: 8px;
}

.picker-value {
  padding: 4px 8px;
  border: 1px solid #dbeafe;
  border-radius: 4px;
}
</style>