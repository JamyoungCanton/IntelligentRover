<template>
  <view class="container">
    <!-- 顶部图片轮播 -->
    <swiper v-if="attractionImages.length > 0" class="header-swiper" :indicator-dots="true" :autoplay="false" :circular="true" :interval="4000" :duration="500">
      <swiper-item v-for="(img, idx) in attractionImages" :key="idx">
        <image :src="img.url || img" mode="aspectFill" style="width:100%;height:230px;object-fit:cover;" />
      </swiper-item>
    </swiper>
    <view v-else class="no-image-placeholder">
      <uni-icons type="image" size="60" color="#ccc" />
      <text style="color:#999;">暂无图片</text>
    </view>

    <!-- 信息栏 -->
    <view class="info-bar">
      <view class="price-row">
        <text class="price-main">￥{{ hotelData.ticketprice || '--' }}</text>
        <text class="price-desc">起/人</text>
      </view>
      <view class="info-row">
        <uni-icons type="location" size="18" color="#3B82F6" />
        <text class="info-label">交通路线：</text>
        <text class="info-value">{{ hotelData.location }}</text>
      </view>
    </view>

    <!-- 景点介绍 -->
    <view class="section">
      <view>
        <text class="section-title">景点介绍</text>
      </view>
      <text class="section-content">{{ hotelData.description.replace(/<[^>]*>/g, '') }}</text>
    </view>

    <!-- 日期选择 -->
    <view class="booking-card">
      <view class="booking-row">
        <uni-icons type="calendar" size="22" color="#3B82F6" />
        <text class="booking-label">游玩日期</text>
        <picker
          mode="date"
          :value="playDate"
          :start="monthStart"
          :end="monthEnd"
          @change="onPlayDateChange"
        >
          <text class="booking-value">{{ playDate || '请选择' }}</text>
        </picker>
      </view>
      <view class="booking-divider"></view>
      <view class="booking-row end-row">
        <uni-icons type="flag" size="20" color="#3B82F6" />
        <text class="booking-label">运营时间</text>
        <text class="booking-value">{{ hotelData.starttime || '--:--' }} - {{ hotelData.endtime || '--:--' }}</text>
      </view>
    </view>

    <!-- 评价区 -->
    <view class="reviews">
      <text class="section-title">点评</text>

      <!-- 评论详情展示（只展示一条，按新接口commentDetail） -->
      <template v-if="commentDetail">
        <view class="comment-card">
          <view class="comment-header">
            <image :src="commentDetail.avatar || (commentDetail.sysUser && commentDetail.sysUser.avatar) || 'https://wuminghui.top:9000/default-avatar.png'" class="comment-avatar" />
            <view class="comment-user-info">
              <text class="comment-username">{{ commentDetail.username || (commentDetail.sysUser && commentDetail.sysUser.realname) || '匿名用户' }}</text>
              <text class="comment-time">{{ commentDetail.createTime }}</text>
            </view>
            <!-- 右侧查看更多按钮 -->
            <view class="comment-more" @click="goToAllComments(commentDetail.productId)">查看更多</view>
          </view>
          <view class="comment-score-row">
            <uni-rate :value="commentDetail.score || 5" readonly size="20" />
            <text class="comment-score">{{ commentDetail.score || 10 }}分</text>
            <text class="comment-score-desc">{{ commentDetail.type || '非常满意' }}</text>
          </view>
          <view class="comment-content">{{ commentDetail.comment }}</view>
        </view>
      </template>
      <view v-else class="no-comments">
        <uni-icons type="chat" size="24" color="#999"></uni-icons>
        <text>暂无内容，期待你留下宝贵的评论</text>
      </view>

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

    <!-- 底部按钮 -->
    <view class="fixed-bottom-bar">
      <button class="book-now-btn" @click="creaOrder(hotelData)">立即预订</button>
    </view>
  </view>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { useUserStore } from '@/store/modules/user'

  const userStore = useUserStore();
  const hotelData = ref({});
  const attractionImages = ref([]);
  const comments = ref([]);
  const id = ref(0);
  const playDate = ref('');
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const pad = n => n < 10 ? '0' + n : n;
  const monthStart = `${year}-${pad(month)}-01`;
  const monthEnd = `${year}-${pad(month)}-${pad(new Date(year, month, 0).getDate())}`;
  const newComment = ref('');
  const showAllComments = ref(false);
  const allowComment = ref(false); // 是否允许评论
  const commentDetail = ref(null);

  onLoad((options) => {
    id.value = options.id;
    getAttrictionDetail();
    checkOrderPaid();
    getCommentDetail(options.id);
  })

  const getAttrictionDetail = () => {
    uni.request({
      url: 'https://island.zhangshuiyi.com/island/product/ilAttractions/queryById',
      method: 'GET',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Access-Token': userStore.token || ''
      },
      data: { id: id.value },
      success: (res) => {
        if (res.data.success && res.data.result) {
          hotelData.value = res.data.result;
          // 处理图片
          if (Array.isArray(res.data.result.images) && res.data.result.images.length > 0) {
            attractionImages.value = res.data.result.images;
          } else if (res.data.result.imageUrl) {
            attractionImages.value = [res.data.result.imageUrl];
          } else {
            attractionImages.value = [];
          }
          // 处理评论
          comments.value = res.data.result.comments || [];
        }
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
  const creaOrder = (hotel) => {
    if (!playDate.value) {
      uni.showToast({ title: '请选择游玩日期', icon: 'none' });
      return;
    }
    if (hotel.ticketprice === 0) {
      // ...免费逻辑
      return;
    }
    // 获取餐厅运营时间
    const startTime = (hotel.starttime || '10:00').length === 5
      ? hotel.starttime + ':00'
      : hotel.starttime || '10:00:00';
    const endTime = (hotel.endtime || '22:00').length === 5
      ? hotel.endtime + ':00'
      : hotel.endtime || '22:00:00';

    // 拼接完整的开始和结束时间
    const startDateTime = `${playDate.value} ${startTime}`;
    const endDateTime = `${playDate.value} ${endTime}`;

    const orderData = {
      contract: {
        contractName: userStore.userInfo?.realname || '游客',
        contractPhone: userStore.userInfo?.phone || '13800138000'
      },
      items: [
        {
          bookInfo: {
            date: playDate.value,
            fullname: userStore.userInfo?.realname || '游客',
            idCardNo: userStore.userInfo?.idCardNo || '110101199001011234',
            idCardType: "ID_CARD",
            schedule: startTime
          },
          productId: hotel.id,
          productType: "Attractions",
          imageUrl: hotel.imageUrl,
          quantity: 1
        }
      ],
      travelStartDate: startDateTime,
      travelEndDate: endDateTime
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
  })

  const onPlayDateChange = (e) => {
    playDate.value = e.detail.value;
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
        getAttrictionDetail(); // 刷新评论列表
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

  const getCommentDetail = (id) => {
    uni.request({
      url: 'https://island.zhangshuiyi.com/island/il-user-comments/CommentsDetail',
      method: 'GET',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Access-Token': userStore.token || ''
      },
      data: { id },
      success: (res) => {
        if (res.data.success && res.data.result) {
          commentDetail.value = res.data.result;
        }
      }
    });
  };

  const goToAllComments = (id) => {
    // 实现跳转到所有评论页面的逻辑
    console.log('跳转到所有评论页面', id);
  };

  if (!hotelData.value.starttime || !hotelData.value.endtime) {
    hotelData.value.starttime = '10:00';
    hotelData.value.endtime = '22:00';
  }

</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #f8f8f8;
  padding-bottom: 30px;
}
.header-swiper {
  width: 100vw;
  height: 230px;
  background: #eee;
}
.info-bar {
  background: #fff;
  border-radius: 18px 18px 0 0;
  box-shadow: 0 4px 24px rgba(59,130,246,0.06);
  margin-top: -5px;
  padding: 18px 20px 10px 20px;
}
.price-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
}
.price-main {
  color: #FF9800;
  font-size: 28px;
  font-weight: bold;
}
.price-desc {
  color: #888;
  font-size: 15px;
  margin-right: 10px;
}
.child-price {
  color: #FF9800;
  font-size: 16px;
  margin-left: 10px;
}
.sold-count {
  margin-left: auto;
  color: #999;
  font-size: 14px;
}
.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}
.info-label {
  color: #333;
  font-size: 15px;
  margin-left: 6px;
}
.info-value {
  color: #666;
  font-size: 15px;
  margin-left: 4px;
}
.section {
  margin: 24px 0 0 0;
  padding: 18px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(59,130,246,0.04);
}
.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;

}
.section-content {
  font-size: 15px;
  color: #444;
  line-height: 1.7;
}
.booking-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(59,130,246,0.06);
  margin: 32px 0 24px 0;
  padding: 0;
  overflow: hidden;
  width: 90vw;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}
.booking-row {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  background: #fff;
  position: relative;
  min-height: 48px;
}
.booking-label {
  font-size: 16px;
  color: #333;
  margin-left: 12px;
  flex-shrink: 0;
  font-weight: 500;
}
.booking-value {
  margin-left: auto;
  font-size: 16px;
  color: #3B82F6;
  font-weight: 500;
  min-width: 80px;
  text-align: right;
}
.booking-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0 20px;
}
.end-row {
  background: #f8faff;
}
.fixed-bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.06);
  padding: 12px 20px 18px 20px;
  z-index: 100;
  display: flex;
  justify-content: center;
}
.book-now-btn {
  width: 100%;
  max-width: 400px;
  background: #fff;
  color: #3B82F6;
  border: 2px solid #3B82F6;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  padding: 14px 0;
  box-shadow: 0 2px 8px rgba(59,130,246,0.08);
  transition: background 0.2s, color 0.2s;
}
.book-now-btn:active {
  background: #3B82F6;
  color: #fff;
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
.no-image-placeholder {
  width: 100%;
  height: 230px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f8f8f8;
}
.comment-card { background: #fff; border-radius: 12px; padding: 20rpx; margin: 20rpx 0; }
.comment-header { display: flex; align-items: center; }
.comment-avatar { width: 60rpx; height: 60rpx; border-radius: 50%; margin-right: 16rpx; }
.comment-user-info { flex: 1; }
.comment-username { font-size: 28rpx; color: #333; font-weight: 500; }
.comment-time { font-size: 22rpx; color: #999; margin-left: 10rpx; }
.comment-more { color: #3B82F6; font-size: 26rpx; padding: 0 10rpx; }
.comment-score-row { display: flex; align-items: center; margin: 10rpx 0; }
.comment-score { color: #FF9800; font-size: 28rpx; font-weight: bold; margin-left: 10rpx; }
.comment-score-desc { color: #888; font-size: 24rpx; margin-left: 10rpx; }
.comment-content { font-size: 28rpx; color: #333; line-height: 1.7; margin-top: 10rpx; }
</style>