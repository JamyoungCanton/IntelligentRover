<template>
  <view class="container">
    <view class="header">
      <img :src="hotelData.imageUrl" alt="">
      <view class="title-name">
        <text class="title">{{ hotelData.name }}</text>
        <view class="rating">
          <uni-rate :value="4.5" size="16" readonly></uni-rate>
          <text>4.5</text>
        </view>
      </view>
    </view>
    <view class="content">
      <view class="section">
        <text class="section-title">景点介绍</text>
        <text class="section-content">{{ hotelData.description }}</text>
      </view>
      <view class="location">
        <!-- 位置图标 -->
        <uni-icons
          type="location"
          color="blue"
          size="24"
        />
        <view class="locationDetail">
          <text class="location-title">交通路线</text>
          <text class="location-content">{{ hotelData.location }}</text>
        </view>
      </view>
      <view class="location">
        <uni-icons
          type="color"
          color=""
          size="24"
        />
        <view class="locationDetail">
          <text class="location-title">开放时间</text>
          <text class="location-content">每天{{ hotelData.starttime }}-{{ hotelData.endtime }}</text>
          <text class="location-content">全年开放</text>
        </view>
      </view>
      <view class="location">
          <!-- 票的图标 -->
          <uni-icons
            type="color"
            color=""
            size="24"
          />
          <view class="locationDetail">
            <text class="location-title" >门票费用</text>
            <text class="location-content" style="color:red">￥{{ hotelData.ticketprice }}</text>
          </view>
      </view>
      <view class="attractionimg">
        <text class="section-title">景点实拍</text>
        <view class="attimg">
          <image
            src="http://island.zhangshuiyi.com/static_file/attractions/4灯塔.jpg"
            mode="scaleToFill"
          />
          <image
            src="http://island.zhangshuiyi.com/static_file/attractions/4灯塔.jpg"
            mode="scaleToFill"
          />
          <image
            src="http://island.zhangshuiyi.com/static_file/attractions/4灯塔.jpg"
            mode="scaleToFill"
          />
          <image
            src="http://island.zhangshuiyi.com/static_file/attractions/4灯塔.jpg"
            mode="scaleToFill"
          />
          <image
            src="http://island.zhangshuiyi.com/static_file/attractions/4灯塔.jpg"
            mode="scaleToFill"
          />
          <image
            src="http://island.zhangshuiyi.com/static_file/attractions/4灯塔.jpg"
            mode="scaleToFill"
          />
        </view>
      </view>

      <view class="reviews">
      <text class="section-title">住客点评</text>
      <view class="review-item">
        <div class="comheader">
          <div class="ava-name-rating">
            <img src="/static/hotel-attctive/ava.png" alt="">
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
            <img src="/static/hotel-attctive/ava.png "  alt="">
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
    </view>
    <button @click="creaOrder(hotelData)" class="book-now">立即预订</button>
  </view>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { useUserStore } from '@/store/modules/user'

  const userStore = useUserStore();
  const hotelData = ref({});
  const id = ref(0);
  onLoad((options) => {
    id.value = options.id;
    console.log(id.value);
    
  })

  // 根据id获取数据
  const getAttrictionDetail = () => {
    uni.request({
      url: 'https://island.zhangshuiyi.com/island/product/ilAttractions/queryById',
      method: 'GET',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Access-Token': userStore.token || ''
      },
      data: {
        id: id.value
      },
      success: (res) => {
        console.log(res.data);
        hotelData.value = res.data.result;
        console.log(hotelData.value);
        
      }
    })
  }

  // 创建订单
  // 跳转到订单页面并创建订单
const creaOrder = (hotel) => {

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
    productId: hotel.id, // 初始为空字符串
    productType: "Activities",
    quantity: 1
  }
]
})


uni.request({
url: 'https://island.zhangshuiyi.com/island/front/order/createOrder',
method: 'POST',
header: {
  'Content-Type': 'application/json',
  'X-Access-Token': userStore.token
},
data: orderData.value,
success: (res) => {
  console.log(res.data);
  
  if (res.data.code === 200) {
    uni.showToast({
      title: '订单创建成功',
      icon: 'success',
      duration: 1500
    });
    // 可以跳转到订单详情页或其他页面
    // uni.navigateTo({ url: `/pages/confirmHotelOrder/confirmHotelOrder?id=${hotelData.value.id}` })
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

  onMounted(() => {
    getAttrictionDetail();
  })

</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #fff;
}
.header {
  width: 100%;
  height: 230px;
  background-color: #fff;
  position: relative;
  overflow: hidden;
}
.header img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.title-name {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
.title {
  font-size: 24px;
  margin-bottom: 10px;
}
.rating {
  font-size: 14px;

}
.rating uni-rate {
  margin-left: 50px;
}
.content {
  padding: 0px 20px;
  background-color: #fff;
  border-radius: 10px;
}
.section {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  /* align-items: center; */
}
.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: start;

}
.section-content {
  /* // 首行缩进两个字符 */
  text-indent: 2em; 
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  text-align: justify;
}
.location {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-direction: row;
  /* 底边线距离上边线距离20px */
  padding-bottom: 20px;
  border-bottom: 1px solid #ccc;
  margin-bottom: 10px;
  margin-top: 25px;
}

.locationDetail {
  display: flex;
  flex-direction: column;
  margin-left: 20px;
}
.locatuon uni-icons {
  margin-right: 10px;
  color: #007AFF;
  font-size: 24px;
}

.location-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}
.location-content {
  font-size: 14px;
  color: #333;
  margin-top: 5px;
}
.openTime {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-direction: row;
  border-bottom: 1px solid #ccc;
  margin-bottom: 10px;
}
.attractionimg {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}
.attimg {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 10px;
}
.attimg image {
  width: 30%;
  height: 100px;
  margin-bottom: 10px;
  border-radius: 10px;
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
  height: 40;
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
</style>