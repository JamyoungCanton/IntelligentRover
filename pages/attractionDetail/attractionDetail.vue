<template>
  <view class="container">
    <view class="header">
      <img :src="hotelData.imageUrl" alt="" style="width: 100%;height: 100%;object-fit: cover;">
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
        <text class="section-content">{{ hotelData.description.replace(/<[^>]*>/g, '') }}</text>
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
            <text class="location-contentprice" v-if="hotelData.ticketprice === 0" style="color:red">免费</text>
            <text class="location-contentprice"  v-if="hotelData.ticketprice !== 0" style="color:red">￥{{ hotelData.ticketprice }}.00</text>
          </view>
      </view>
      <view class="attractionimg">
        <text class="section-title">景点实拍</text>
        <view class="attimg">
          <image
            src="https://wlmtsys.com:9000/travel/19.jpg"
            mode="scaleToFill"
          />
          <image
            src="https://wlmtsys.com:9000/travel/32.jpg"
            mode="scaleToFill"
          />
          <image
            src="http://island.zhangshuiyi.com/static_file/attractions/4灯塔.jpg"
            mode="scaleToFill"
          />
          <image
            src="https://wlmtsys.com:9000/travel/20.webp"
            mode="scaleToFill"
          />
          <image
            src="https://wlmtsys.com:9000/travel/18.jpg"
            mode="scaleToFill"
          />
          <image
            src="https://wlmtsys.com:9000/travel/12.jpg"
            mode="scaleToFill"
          />
        </view>
      </view>

      <view class="reviews">
      <text class="section-title">住客点评</text>
      <view class="review-item">
        <div class="comheader">
          <div class="ava-name-rating">
            <img src="/static/hotel-attctive/ava.png"  style="width: 50px;height: 50px; margin-right: 5px;" alt="">
            <div class="name-rating">
              <text class="date">张女士</text>
              <text class="rating">★★★★★</text>
            </div>
          </div>
          <text class="time">2025-03-15</text>
        </div>
      <text class="comment">白天可体验刺激的水上项目，傍晚在观景台欣赏落日余晖，夜晚还有精彩的特色表演。</text>
      </view>
      <view class="review-item">
        <view class="comheader">
          <view class="ava-name-rating">
            <img src="/static/hotel-attctive/ava.png " style="width: 50px;height: 50px; margin-right: 5px;" alt="">
            <view class="name-rating">
              <text class="date">黄女士</text>
              <text class="rating">★★★★</text>
            </view>
          </view>
          <text class="time">2025-02-27</text>
        </view>
        <text class="comment">这里山海相拥，风光旖旎。碧蓝海水与奇石嶙峋的海岸线交相辉映，漫步沙滩可感受细软白沙的温柔触感。登高远眺，壮阔海景尽收眼底，是摄影爱好者的绝佳取景地</text>
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

  if (hotel.ticketprice === 0) {
    // 使用模态对话框替代toast
    uni.showModal({
      title: '免费景点',
      content: '该景点免费，无需预订门票',
      showCancel: false,
      confirmText: '我知道了',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
        }
      }
    });
    return; // 直接返回，不执行后续逻辑
  }

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
    productType: "Attractions",
    imageUrl: hotel.imageUrl,
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
  console.log("订单创建结果："+res.data);
  
  if (res.data.code === 200) {
    uni.showToast({
      title: '订单创建成功',
      icon: 'success',
      duration: 1500
    });
    // 可以跳转到订单详情页或其他页面
<<<<<<< HEAD
    const orderSn = res.data.result.orderSn;
    uni.navigateTo({ url: `/pages/comfirmAttractionOrder/confirmAttrationOrder?id=${hotelData.value.id}&orderSn=${orderSn}` })
=======
   uni.navigateTo({
    url: `/pages/comfirmAttractionOrder/confirmAttrationOrder?id=${hotelData.value.id}&price=${hotelData.value.ticketprice}`
  });

>>>>>>> f7755687a477af4d7824bc2248556139e04b9be2
  } else {
    uni.showToast({
      title: '未开放，维护中',
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
  margin-left: 0px;
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
.location-contentprice{
  font-size: 24px;
  margin-top: 5px;
  font-weight: bold;

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
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.name-rating{
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.name-rating .rating{
  font-size: 20px;
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