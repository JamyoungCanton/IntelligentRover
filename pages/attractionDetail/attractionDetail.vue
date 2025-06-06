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
            v-for="(img, idx) in attractionImages"
            :key="idx"
            :src="img"
            mode="aspectFill"
            @click="previewImage(idx)"
          />
          <text v-if="!attractionImages.length" style="color:#999;font-size:14px;">暂无图片</text>
        </view>
      </view>

      <view class="reviews">
        <text class="section-title">住客点评</text>

        <!-- 评论列表 -->
        <view v-if="!comments || comments.length === 0" class="no-comments">
          <uni-icons type="chat" size="24" color="#999"></uni-icons>
          <text>暂无评论，快来发表第一条评论吧！</text>
        </view>
        <template v-else>
          <view class="review-item" v-for="(comment, index) in displayedComments" :key="index">
            <view class="review-user">
              <image :src="comment.avatar" class="review-avatar"></image>
              <view class="review-user-info">
                <text class="review-username">{{ comment.userName }}</text>
                <text class="review-time">{{ comment.createTime }}</text>
              </view>
            </view>
            <text class="review-content">{{ comment.content }}</text>
          </view>
          
          <!-- 显示更多按钮 -->
          <view v-if="comments.length > 3" class="show-more" @click="toggleComments">
            <text>{{ showAllComments ? '收起' : `显示更多(${comments.length - 3}条)` }}</text>
            <uni-icons 
              :type="showAllComments ? 'top' : 'bottom'" 
              size="14" 
              color="#3B82F6"
            ></uni-icons>
          </view>
        </template>

        <!-- 添加评论区域 -->
        <view v-if="allowComment" class="comment-input-area">
          <view class="comment-user-info">
            <image :src="userStore.userInfo.avatar || 'https://wuminghui.top:9000/default-avatar.png'" class="user-avatar"></image>
            <text class="user-name">{{ userStore.userInfo.realname || userStore.userInfo.username || '游客' }}</text>
          </view>
          <textarea
            v-model="newComment"
            class="comment-textarea"
            placeholder="写下你的评论..."
            :maxlength="200"
          />
          <view class="comment-footer">
            <text class="word-count">{{ newComment.length }}/200</text>
            <button 
              class="submit-btn" 
              :disabled="!newComment.trim()"
              @click="submitComment"
            >发表评论</button>
          </view>
        </view>
        <view v-else style="color:#999;text-align:center;padding:20px 0;">
          仅限已支付该景点订单的用户评论
        </view>
      </view>
    </view>
    <view class="date-picker">
      <text>选择游玩日期：</text>
      <picker mode="date" :value="playDate" :start="todayStr" @change="onPlayDateChange">
        <view class="picker-value">{{ playDate || '请选择' }}</view>
      </picker>
    </view>
    <button @click="creaOrder(hotelData)" class="book-now">立即预订</button>
  </view>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { useUserStore } from '@/store/modules/user'

  const userStore = useUserStore();
  const hotelData = ref({});
  const id = ref(0);
  const attractionImages = ref([]);
  const playDate = ref('');
  const comments = ref([]);
  const newComment = ref('');
  const showAllComments = ref(false);
  const allowComment = ref(false); // 是否允许评论

  const today = new Date();
  const pad = (n) => n < 10 ? '0' + n : n;
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  onLoad((options) => {
    console.log('页面onLoad时token:', userStore.token);
    id.value = options.id;
    getAttrictionDetail();
    getAttractionImages();
    getComments();
    checkOrderPaid(); // 检查是否支付过该商品
  })

  // 根据id获取数据
  const getAttrictionDetail = () => {
    uni.request({
      url: `https://island.zhangshuiyi.com/island/front/product/attractions/${id.value}`,
      method: 'GET',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Access-Token': userStore.token || ''
      },
      success: (res) => {
        hotelData.value = res.data;
        console.log('景点详情数据:', hotelData.value);
      }
    })
  }

  // 获取图片
  const getAttractionImages = () => {
    uni.request({
      url: `https://island.zhangshuiyi.com/island/il-attractionsimages/attractions/${id.value}`,
      method: 'GET',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Access-Token': userStore.token || ''
      },
      success: (res) => {
        if (res.data.code === 200 && Array.isArray(res.data.result)) {
          // 如果返回的图片超过6张，随机选择6张
          if (res.data.result.length > 6) {
            const shuffled = [...res.data.result].sort(() => 0.5 - Math.random());
            attractionImages.value = shuffled.slice(0, 6);
          } else {
            attractionImages.value = res.data.result;
          }
          console.log('景点图片获取成功，数量：', attractionImages.value.length);
        } else {
          attractionImages.value = [];
          console.log('景点图片获取失败，code:', res.data.code);
        }
      },
      fail: (err) => {
        attractionImages.value = [];
        console.log('景点图片接口请求失败', err);
      }
    });
  };

  // 预览图片
  const previewImage = (index) => {
    uni.previewImage({
      urls: attractionImages.value,
      current: index,
      indicator: 'number',
      loop: true
    });
  };

  // 创建订单
  // 跳转到订单页面并创建订单
const creaOrder = (hotel) => {
  if (!playDate.value) {
    uni.showToast({
      title: '请选择游玩日期',
      icon: 'none'
    });
    return;
  }

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

const orderData = {
contract: {
  contractName: userStore.userInfo.realname || '',
  contractPhone: userStore.userInfo.phone || ''
},
items: [
  {
    bookInfo: {
        date: playDate.value,
      fullname: userStore.userInfo.realname || '',
      idCardNo: userStore.userInfo.idCardNo || '',
      idCardType: 'ID_CARD',
        schedule: playDate.value
    },
      productId: hotel.id,
    productType: "Attractions",
    imageUrl: hotel.imageUrl,
    quantity: 1
  }
  ],
  travelStartDate: playDate.value,
  travelEndDate: playDate.value
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
  console.log("订单创建结果："+res.data);
  
  if (res.data.code === 200) {
    uni.showToast({
      title: '订单创建成功',
      icon: 'success',
      duration: 1500
    });
    // 可以跳转到订单详情页或其他页面
    const orderSn = res.data.result.orderSn;
    uni.navigateTo({ url: `/pages/comfirmAttractionOrder/confirmAttrationOrder?id=${hotelData.value.id}&orderSn=${orderSn}` })
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
    getAttractionImages();
  })

  const onPlayDateChange = (e) => {
    playDate.value = e.detail.value;
  };

  // 获取评论列表
  const getComments = async () => {
    try {
      const res = await uni.request({
        url: `https://island.zhangshuiyi.com/island/comments/${id.value}`,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'X-Access-Token': userStore.token
        }
      });
      if (res.data.success) {
        if (res.data.result && Array.isArray(res.data.result)) {
          comments.value = res.data.result.map(comment => ({
            id: comment.id,
            content: comment.content,
            createTime: comment.createTime,
            userName: comment.userVO?.realname || comment.userVO?.username || '匿名用户',
            avatar: comment.userVO && comment.userVO.avatar
              ? (comment.userVO.avatar.startsWith('http') ? comment.userVO.avatar : 'https://wuminghui.top:9000/' + comment.userVO.avatar.replace(/^\/+/, ''))
              : (userStore.userInfo.avatar || 'https://wuminghui.top:9000/default-avatar.png'),
            rating: 5,
            children: comment.children || []
          }));
        } else {
          comments.value = [];
        }
      } else {
        uni.showToast({
          title: res.data.message || '获取评论失败',
          icon: 'none'
        });
      }
    } catch (error) {
      uni.showToast({
        title: '获取评论失败',
        icon: 'none'
      });
    }
  };

  // 检查是否支付过该商品
  const checkOrderPaid = async () => {
    if (!userStore.token) {
      allowComment.value = false;
      return;
    }
    try {
      const res = await uni.request({
        url: 'https://island.zhangshuiyi.com/island/front/order/getMyOrderList',
        method: 'GET',
        header: {
          'X-Access-Token': userStore.token,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
          pageNo: 1,
          pageSize: 100
        }
      });
      if (res.data.success && res.data.result && Array.isArray(res.data.result.records)) {
        // 只要有 payStatus === 'PAID' 且 goodsId === 当前景点id
        allowComment.value = res.data.result.records.some(item =>
          String(item.goodsId) === String(id.value) && item.payStatus === 'PAID'
        );
      } else {
        allowComment.value = false;
      }
    } catch (e) {
      allowComment.value = false;
    }
  };

  // 提交评论
  const submitComment = async () => {
    if (!allowComment.value) {
      uni.showToast({
        title: '仅限已支付该景点订单的用户评论',
        icon: 'none'
      });
      return;
    }
    if (!newComment.value.trim()) {
      uni.showToast({
        title: '评论内容不能为空',
        icon: 'none'
      });
      return;
    }
    if (!userStore.token) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    try {
      const commentData = {
        content: newComment.value,
        postId: id.value, // 景点ID
        fatherId: '', // 父评论ID，这里为空因为是直接评论景点
        receiverId: '', // 接收者ID，这里为空因为是直接评论景点
        repliedCommentId: '' // 回复的评论ID，这里为空因为是直接评论景点
      };
      console.log('提交评论数据:', commentData);
      const res = await uni.request({
        url: 'https://island.zhangshuiyi.com/island/comments/save',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'X-Access-Token': userStore.token
        },
        data: commentData
      });
      console.log('评论提交响应:', res.data);
      if (res.data.success) {
        uni.showToast({
          title: '评论成功',
          icon: 'success'
        });
        newComment.value = ''; // 清空输入框
        getComments(); // 刷新评论列表
      } else {
        uni.showToast({
          title: res.data.message || '评论失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('评论提交异常：', error);
      uni.showToast({
        title: '评论失败，请稍后重试',
        icon: 'none'
      });
    }
  };

  // 添加计算属性来控制显示的评论数量
  const displayedComments = computed(() => {
    if (showAllComments.value) {
      return comments.value;
    }
    return comments.value.slice(0, 3);
  });

  // 添加切换显示状态的方法
  const toggleComments = () => {
    showAllComments.value = !showAllComments.value;
  };

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
  margin-bottom: 20px;
  gap: 10px;
}
.attimg image {
  width: calc(33.33% - 7px);
  height: 200rpx;
  border-radius: 10px;
  object-fit: cover;
}
.reviews, .user-reviews, .review-list {
  width: 100%;
  background: none;
  border: none;
  border-radius: 0;
  box-shadow: none;
  margin: 0;
  padding: 0;
}
.review-header {
  margin-bottom: 20rpx;
}
.review-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.no-comments {
  width: 100vw;
  max-width: 100vw;
  margin-left: -20rpx;
  margin-right: -20rpx;
  background: none;
  border-radius: 0;
  box-sizing: border-box;
  text-align: center;
  padding: 40rpx 30rpx;
  color: #999;
  font-size: 26rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  margin: 20rpx 0;
}
.comment-input-area {
  width: 100vw;
  max-width: 100vw;
  margin-left: -20rpx;
  margin-right: -20rpx;
  background: none;
  border-radius: 0;
  padding: 0;
  margin-bottom: 30rpx;
  box-sizing: border-box;
}
.comment-user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}
.user-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}
.user-name {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}
.comment-textarea {
  width: 100%;
  height: 160rpx;
  background-color: #fff;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  border: 1px solid #e5e5e5;
  margin-bottom: 20rpx;
}
.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}
.word-count {
  font-size: 24rpx;
  color: #999;
}
.submit-btn {
  background-color: #3B82F6;
  color: #fff;
  font-size: 26rpx;
  padding: 8rpx 32rpx;
  border-radius: 8rpx;
  border: none;
}
.submit-btn[disabled] {
  background-color: #ccc;
}
.review-item {
  padding: 20rpx 0;
  border-bottom: 1px solid #f0f0f0;
}
.review-user {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}
.review-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}
.review-user-info {
  flex: 1;
}
.review-username {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 4rpx;
}
.review-time {
  font-size: 22rpx;
  color: #999;
}
.review-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  margin-left: 76rpx;
}
.show-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  color: #3B82F6;
  font-size: 26rpx;
  gap: 8rpx;
}
.book-now {
  background-color: #ff5722;
  color: #fff;
  border: none;
  padding: 5px 4px;
  border-radius: 4px;
  width: 100%;
}
.date-picker {
  display: flex;
  align-items: center;
  margin: 16px 0;
  padding: 8px 0;
  border-radius: 8px;
  background: #fff;
  box-shadow: none;
  border: 1px solid #e0e0e0;
}

.date-picker text {
  font-size: 15px;
  color: #141f2c;
  min-width: 90px;
  font-weight: 500;
  margin-left: 12px;
}

.picker-value {
  display: inline-block;
  margin-right: 12px;
  color: #333;
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
  border-color: #bbb;
}
</style>