<template>
	<view class="container">
		<!-- 顶部导航栏 --> 
		

    <view class="hero">
      <image :src="shopMainImage || foodDetails?.imageUrl" class="hero-img" mode="aspectFill" />
    </view>

    <view class="intro-card">
      <view class="attraction-name"><text>{{ foodDetails?.name || '加载中...' }}</text></view>
      <view class="section-title">餐厅介绍</view>
      <view class="info-row">
        <view class="rating-line">
          <uni-rate :value="foodDetails?.rating || 0" size="14" readonly></uni-rate>
          <text class="rating-score">{{ foodDetails?.rating || 0 }}</text>
        </view>
        <view class="addr-right">
          <uni-icons type="location" size="16" color="#999" />
          <text class="addr-text">{{ foodDetails?.address || '暂无地址' }}</text>
        </view>
      </view>
      <view class="info-row">
        <uni-icons type="phone" size="16" color="#666" />
        <text class="info-label">电话</text>
        <text class="info-value">{{ foodDetails?.phone || '暂无电话' }}</text>
      </view>
      <view class="info-row">
        <uni-icons type="time" size="16" color="#666" />
        <text class="info-label">营业时间</text>
        <text class="info-value">{{ formatTime(foodDetails?.starthour) }} - {{ formatTime(foodDetails?.endhour) }}</text>
      </view>
      <text class="intro-desc">{{ introText }}</text>
    </view>


    <view class="section ticket-section">
      <view><text class="section-title">餐位费</text></view>
      <view class="ticket-row">
        <view class="ticket-left"><text class="ticket-type">费用</text><text class="ticket-price">￥{{ foodDetails?.price || 0 }}</text></view>
        <button class="ticket-btn" @click="bookNow">立即购买</button>
      </view>
    </view>

		<!-- 店铺实拍 -->
		<view class="shop-photos" v-if="shopPhotos.length">
			<view class="section-title">店铺实拍</view>
			<scroll-view class="photo-scroll" scroll-x enable-flex>
				<view class="photo-item" v-for="(photo, index) in shopPhotos" :key="index">
					<image :src="photo" mode="aspectFill"></image>
				</view>
			</scroll-view>
		</view>


    <view class="reviews-card">
      <view class="reviews-header"><text class="reviews-title">用户评价（{{ comments.length }}）</text></view>
      <view v-if="displayedComments.length === 0" class="no-comments">暂无评价</view>
      <view v-for="(item, idx) in displayedComments" :key="item.id || idx" class="review-item">
        <view class="review-user">
          <image :src="(item.avatar && String(item.avatar).replace(/[`\s]/g,'')) || '/static/my/default-avatar.png'" class="review-avatar" />
          <view class="review-user-info">
            <text class="review-username">{{ item.username || '匿名用户' }}</text>
            <text class="review-time">{{ item.createTime }}</text>
          </view>
        </view>
        <view class="review-content">{{ item.comment }}</view>
        <view v-if="itemMergedImages(item).length" class="review-images">
          <image v-for="(img, i) in itemMergedImages(item)" :key="i" :src="img" class="review-img" mode="aspectFill" />
        </view>
      </view>
      <view v-if="!showAllComments && comments.length > 3" class="show-more" @click="toggleComments">查看更多</view>
    </view>
	</view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user';

const safeAreaInsets = ref({});
const statusBarHeight = ref(0);
const foodDetails = ref(null);
const userStore = useUserStore();
const id = ref('');
const shopMainImage = ref('');
const isIntroUnfolded = ref(false);
const shopPhotos = ref([]);
const comments = ref([]);
const showAllComments = ref(false);
const displayedComments = computed(() => showAllComments.value ? comments.value : comments.value.slice(0, 3));

// 获取餐厅详情
const getRestaurantDetailsById = (id) => {
  uni.request({
    url: 'https://island.zhangshuiyi.com/island/product/ilDining/queryById',
    method: 'GET',
    data: { id },
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token || ''
    },
    success: (res) => {
      console.log('餐厅详情接口返回数据:', res.data);
      if (res.data && res.data.result) {
        const details = res.data.result;
        console.log('餐厅详情result字段:', details);
        foodDetails.value = details;
        comments.value = (details.comments || []).map(c => ({
          ...c,
          avatar: typeof c.avatar === 'string' ? c.avatar.replace(/[`\s]/g, '') : c.avatar
        }));
				
				// 处理店铺实拍图片：优先使用传入的图片数据，如果传入的图片为空，再使用后端返回的图片
				if (shopPhotos.value && shopPhotos.value.length > 0) {
					console.log('店铺实拍使用传入的图片数据:', shopPhotos.value);
				} else if (details.images && Array.isArray(details.images)) {
					const processedPhotos = details.images.reduce((acc, imgStr) => {
						if (imgStr && typeof imgStr === 'string') {
							const urls = imgStr.split(',').map(url => url.trim()).filter(url => url);
							return [...acc, ...urls];
						}
						return acc;
					}, []);
					shopPhotos.value = processedPhotos;
					console.log('店铺实拍使用后端返回的图片数据:', shopPhotos.value);
				} else {
					shopPhotos.value = [];
					console.log('店铺实拍没有可用的图片数据');
				}
				
				// 如果后端返回的id为0或null，补上
				if (!details.id) foodDetails.value.id = id;
			}
		}
	});
};

// 星级渲染函数
const renderStars = (rating) => {
	if (!rating && rating !== 0) {
		return Array(5).fill({ type: 'star', color: '#CCCCCC' });
	}

	const stars = [];
	const fullStars = Math.floor(rating);
	const halfStar = rating % 1 >= 0.5;

	for (let i = 0; i < fullStars; i++) {
		stars.push({ type: 'star-filled', color: '#FFCC00' });
	}

	while (stars.length < 5) {
		stars.push({ type: 'star', color: '#CCCCCC' });
	}

	return stars;
};

// 展开/收起介绍
const toggleIntro = () => {
	isIntroUnfolded.value = !isIntroUnfolded.value;
};

// 切换评论显示
const toggleComments = () => {
	showAllComments.value = true;
};

// 获取评论
const getComments = async () => {
  const res = await uni.request({
    url: 'https://island.zhangshuiyi.com/island/il-user-comments/list',
    method: 'GET',
    data: { productId: id.value, type: 'Dining' },
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Access-Token': userStore.token
    }
  });
  if (res.data && res.data.success && Array.isArray(res.data.result) && res.data.result.length > 0) {
    comments.value = res.data.result.map(c => ({
      ...c,
      avatar: typeof c.avatar === 'string' ? c.avatar.replace(/[`\s]/g, '') : c.avatar
    }));
    console.log('评论列表(独立接口):', comments.value);
  } else {
    console.log('评论列表接口未返回有效数据，保留详情接口中的评论');
  }
};

// 获取有效的图片数组
function getValidImages(images) {
  if (!images) return [];
  if (Array.isArray(images)) return images.filter(Boolean);
  if (typeof images === 'string') return images.split(',').filter(Boolean);
  return [];
}

const itemMergedImages = (item) => {
  const imgs = item.images || item.imageList || item.pics || '';
  if (Array.isArray(imgs)) return imgs.map(s => String(s).replace(/[`\s]/g,'')).filter(Boolean);
  if (typeof imgs === 'string') return imgs.split(',').map(s => s.trim().replace(/[`\s]/g,'')).filter(Boolean);
  return [];
};

onLoad((options) => {
	console.log('饮食详情页面收到的参数:', options);
	
	if (!options.id) {
		uni.showToast({
			title: '参数错误',
			icon: 'none',
			duration: 2000
		});
		setTimeout(() => {
			uni.navigateBack();
		}, 2000);
		return;
	}
	
	id.value = options.id;
	
	if (options.startTime && options.endTime) {
		timeRange.value.start = formatTime(decodeURIComponent(options.startTime));
		timeRange.value.end = formatTime(decodeURIComponent(options.endTime));
	}

	// 处理传入的图片数据
	if (options.images) {
		try {
			const images = JSON.parse(decodeURIComponent(options.images));
			console.log('成功解析传入的图片数据:', images);
			// 将传入的图片数据设置到shopPhotos中（店铺实拍）
			if (Array.isArray(images) && images.length > 0) {
				shopPhotos.value = images;
				// 使用第一张图片作为主图片
				shopMainImage.value = images[0];
			}
		} catch (e) {
			console.error('解析图片数据失败:', e);
		}
	}

	// 如果通过imageURL参数传入图片，也设置到shopMainImage
	if (options.imageURL) {
		shopMainImage.value = decodeURIComponent(options.imageURL);
	}

	getRestaurantDetailsById(id.value);
	getComments();
});

onMounted(() => {
	const { statusBarHeight: sbHeight, safeAreaInsets: insets } = uni.getSystemInfoSync();
	statusBarHeight.value = sbHeight;
	safeAreaInsets.value = insets;
});

// 方法
const goBack = () => {
	uni.navigateBack({
		delta: 1 // 返回上一页
	});
};

const share = () => {
	console.log('分享店铺');
};

const callPhone = () => {
	console.log('拨打电话');
};

const navigate = () => {
	console.log('打开导航');
};

const book = () => {
	console.log('打开预订页面');
};

// 添加时间选择相关的响应式变量
const diningDate = ref('');
const diningTime = ref('');
const timeRange = ref({
	start: '10:00',
	end: '22:00'
});

// 获取今天的日期字符串
const today = new Date();
const pad = (n) => n < 10 ? '0' + n : n;
const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

// 格式化时间函数
const formatTime = (timeString) => {
	if (!timeString) return '';
	const [hours, minutes] = timeString.split(':');
	return `${hours}:${minutes || '00'}`;
};

// 日期选择处理函数
const onDiningDateChange = (e) => {
	diningDate.value = e.detail.value;
	console.log('选择的日期:', diningDate.value);
};

// 修改 bookNow 函数
const bookNow = () => {
  console.log('点击预订按钮');
  console.log('当前餐厅信息:', foodDetails.value);
  
  // 检查是否获取到了餐厅详情
  if (!foodDetails.value || !foodDetails.value.id) {
    uni.showToast({
      title: '请先获取餐厅信息',
      icon: 'none',
      duration: 2000
    });
    return;
  }
  if (!userStore.token) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/login/login' });
    }, 800);
    return;
  }
  const dateValue = diningDate.value || todayStr;
  const startTime = (timeRange.value.start || '10:00').length === 5
    ? timeRange.value.start + ':00'
    : timeRange.value.start || '10:00:00';
  const endTime = (timeRange.value.end || '22:00').length === 5
    ? timeRange.value.end + ':00'
    : timeRange.value.end || '22:00:00';

  const startDateTime = `${dateValue} ${startTime}`;
  const endDateTime = `${dateValue} ${endTime}`;

  const orderData = {
    contract: {
      contractName: userStore.userInfo?.realname || '游客',
      contractPhone: userStore.userInfo?.phone || '13800138000'
    },
    items: [
      {
        bookInfo: {
          date: dateValue,
          fullname: userStore.userInfo?.realname || '游客',
          idCardNo: userStore.userInfo?.idCardNo || '110101199001011234',
          idCardType: "ID_CARD",
          schedule: `${startTime}-${endTime}`
        },
        productId: foodDetails.value.id,
        productType: "Dining",
        quantity: 1,
        price: Number(foodDetails.value.price || foodDetails.value.priceaverage || 0),
        amount: Number(foodDetails.value.price || foodDetails.value.priceaverage || 0),
        name: foodDetails.value.name,
        image: foodDetails.value.imageUrl || foodDetails.value.image,
        specs: `${startTime}-${endTime}`
      }
    ],
    travelStartDate: startDateTime,
    travelEndDate: endDateTime
  };

  console.log('订单数据(创建前):', orderData);

  uni.request({
    url: 'https://island.zhangshuiyi.com/island/front/order/createOrder',
    method: 'POST',
    data: orderData,
    header: {
      'Content-Type': 'application/json',
      'X-Access-Token': userStore.token || ''
    },
    success: (res) => {
      console.log('创建订单响应:', res.data);
      if (res.data && (res.data.success || res.data.code === 200) && res.data.result) {
        const orderSn = res.data.result.orderSn || res.data.result.id || '';
        const item = {
          id: foodDetails.value.id,
          name: foodDetails.value.name,
          type: foodDetails.value.type,
          ticketprice: Number(foodDetails.value.price || foodDetails.value.priceaverage || 0),
          starttime: formatTime(foodDetails.value.starthour || timeRange.value.start),
          endtime: formatTime(foodDetails.value.endhour || timeRange.value.end)
        };
        const itemsParam = encodeURIComponent(JSON.stringify([item]));
        const orderSnsParam = encodeURIComponent(JSON.stringify(orderSn ? [orderSn] : []));
        const priceParam = encodeURIComponent(String(item.ticketprice || 0));
        uni.navigateTo({
          url: `/pages/multiConfirmPay/multiConfirmPay?items=${itemsParam}&orderSns=${orderSnsParam}&price=${priceParam}`
        });
      } else {
        uni.showToast({ title: res.data.message || '未能创建订单', icon: 'none' });
      }
    },
    fail: (err) => {
      console.error('创建订单失败:', err);
      uni.showToast({ title: '网络错误，请重试', icon: 'none' });
    }
  });
};

const handleImageError = (e) => {
	console.error('图片加载失败:', e);
	// 可以设置一个默认图片
	e.target.src = '/static/foodDetails/default.jpg';
};

const imageLoading = ref(true);

// 在 script setup 中添加
const userInfo = computed(() => userStore.userInfo || {});

const introText = computed(() => {
  const raw = foodDetails.value?.description || '';
  return String(raw).replace(/<[^>]*>/g, '').trim() || '暂无介绍';
});
</script>

<style scoped>
.container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: calc(80px + env(safe-area-inset-bottom)); /* 为底部按钮留出空间 */
}

.hero { position: relative; }
.hero-img { width: 100%; height: 230px; object-fit: cover; }

.intro-card { position: relative; margin: -40px 12px 12px 12px; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(59,130,246,0.08); padding: 16px; z-index: 2; }
.attraction-name { font-size: 22px; font-weight: bold; color: #333; margin-bottom: 12px; }
.info-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.rating-line { display: flex; align-items: center; gap: 8px; }
.rating-score { font-size: 24rpx; color: #FF9800; }
.addr-right { display: flex; align-items: center; gap: 6px; color: #666; }
.addr-text { max-width: 52vw; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.info-label { color: #333; font-size: 15px;  }
.info-value { color: #666; font-size: 15px; margin-left: auto; }
.intro-desc { margin-top: 8px; font-size: 14px; color: #444; line-height: 1.7; }

/* 顶部导航栏 */
.header {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	background-color: #fff;
	z-index: 100;
}

.header-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 88rpx;
	padding: 0 32rpx;
	position: relative;
}

.back-icon {
	position: absolute;
	left: 32rpx;
	padding: 10rpx;
	z-index: 101;
}

.share-icon {
	position: absolute;
	right: 32rpx;
	padding: 10rpx;
	z-index: 101;
}

.header-title {
	flex: 1;
	text-align: center;
	font-size: 32rpx;
	font-weight: 500;
	color: #333;
}

/* 确保主内容区域不被头部遮挡 */
.main {
	margin-top: calc(88rpx + var(--status-bar-height));
}

/* 店铺图片 */
.shop-image {
	width: 100%;
	height: 400rpx;
	overflow: hidden;
}

.shop-image image {
	width: 100%;
	height: 100%;
	object-fit: cover;
	/* 裁剪图片以填满容器 */
}

/* 店铺信息 */
.shop-info {
	padding: 15px;
	background-color: #fff;
	margin-bottom: 10px;
}

.shop-name {
	font-size: 22px;
	font-weight: bold;
	margin-bottom: 10px;
}

.shop-rating {
	display: flex;
	align-items: center;
}

.rating {
	font-size: 18px;
	font-weight: bold;
	margin-left: 5px;
}

.monthly-sales,
.average-price {
	margin-left: 15px;
	color: #666;
}

/* 功能按钮 */
.function-buttons {
	display: flex;
	justify-content: space-around;
	padding: 15px;
	background-color: #fff;
	margin-bottom: 10px;
}

.function-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 80px;
}

.function-item text {
	margin-top: 5px;
	font-size: 14px;
}

.section { margin: 24px 0 0 0; padding: 18px 20px; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(59,130,246,0.04); }
.section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #333; }
.ticket-section { margin: 16px 12px; }
.ticket-row { width: 100%; display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.ticket-left { display: flex; align-items: baseline; gap: 10px; }
.ticket-type { font-size: 16px; color: #333; }
.ticket-price { font-size: 20px; color: #FF5A32; font-weight: 700; }
.ticket-btn { background: #1677FF; color: #fff; padding: 3px 16px; border-radius: 10px; border: none; font-size: 14px; margin-right: 5rpx;}

/* 餐厅介绍 */
.restaurant-intro {
	background-color: #fff;
	padding: 15px;
	margin-bottom: 10px;
}

.section-title {
	font-size: 18px;
	font-weight: bold;
	margin-bottom: 10px;
}

.intro-content {
	position: relative;
}

.intro-text {
	line-height: 1.6;
	transition: all 0.3s ease;
}

.intro-text.collapsed {
	display: -webkit-box;
	-webkit-line-clamp: 1;
	/* 修改为1行 */
	-webkit-box-orient: vertical;
	overflow: hidden;
	max-height: 1.6em;
}

.unfold-text {
	color: #007AFF;
	margin-top: 10px;
}

.fold-text {
	color: #007AFF;
	margin-top: 10px;
}

.unfold {
	display: flex;
	justify-content: center;
}

/* 店铺实拍 */
.shop-photos {
	background-color: #fff;
	padding: 15px;
	margin-bottom: 10px;
}

.photo-scroll {
	display: flex;
	overflow-x: auto;
	white-space: nowrap;
	padding: 10px 0;
	scrollbar-width: none;
	-ms-overflow-style: none;
}

.photo-scroll::-webkit-scrollbar {
	display: none;
}

.photo-item {
	display: inline-block;
	flex: 0 0 auto;
	width: 200px;
	/* 增加宽度 */
	height: 130px;
	/* 增加高度 */
	margin-right: 15px;
	border-radius: 10px;
	overflow: hidden;
	box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
	transition: transform 0.3s ease;
}

.photo-item:last-child {
	margin-right: 0;
}

.photo-item:hover {
	transform: scale(1.03);
}

.photo-item image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.reviews-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin: 16px 12px; padding: 16px; }
.reviews-header { margin-bottom: 12px; }
.reviews-title { font-size: 18px; font-weight: 700; color: #333; }
.no-comments { text-align: center; color: #999; padding: 16px 0; }
.review-item { padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.review-user { display: flex; align-items: center; margin-bottom: 16rpx; }
.review-avatar { width: 60rpx; height: 60rpx; border-radius: 50%; margin-right: 16rpx; }
.review-user-info { flex: 1; }
.review-username { font-size: 26rpx; color: #333; font-weight: 500; margin-bottom: 4rpx; }
.review-time { font-size: 22rpx; color: #999; }
.review-content { font-size: 15px; color: #333; line-height: 1.7; margin: 6px 0 8px 76rpx; }
.review-images { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-left: 76rpx; }
.review-img { width: 100%; height: 80px; border-radius: 8px; object-fit: cover; }
.show-more { display: flex; align-items: center; justify-content: center; padding: 20rpx 0; color: #3B82F6; font-size: 26rpx; gap: 8rpx; }

/* 推荐菜品 */
.recommended-dishes {
	background-color: #fff;
	padding: 15px;
	margin-bottom: 10px;
}

.dishes-scroll {
	display: flex;
	overflow-x: auto;
	white-space: nowrap;
	padding: 10px 0;
	scrollbar-width: none;
	-ms-overflow-style: none;
}

.dishes-scroll::-webkit-scrollbar {
	display: none;
}

.dish-item {
	display: inline-block;
	flex: 0 0 auto;
	width: 200px;
	margin-right: 15px;
	border-radius: 10px;
	overflow: hidden;
	box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
	transition: transform 0.3s ease;
}

.dish-item:last-child {
	margin-right: 0;
}

.dish-item:hover {
	transform: scale(1.03);
}

.dish-item image {
	width: 100%;
	height: 200px;
	object-fit: cover;
	margin-bottom: 10px;
}

.dish-name {
	font-weight: bold;
	margin-bottom: 5px;
	padding: 0 10px;
}

.dish-desc {
	color: #666;
	font-size: 14px;
	margin-bottom: 5px;
	padding: 0 10px;
}

.dish-price {
	color: #FF6B6B;
	font-weight: bold;
	padding: 0 10px;
	margin-bottom: 10px;
}

/* 立即预订按钮 */
/* 移除固定底部按钮，改为票务区按钮 */

.time-picker-section {
	background-color: #ffffff;
	border-radius: 10rpx;
	padding: 20rpx;
	margin: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.date-picker {
	display: flex;
	align-items: center;
	justify-content: space-between; /* 左右分布 */
	margin: 16px 0;
	padding: 12px 18px;
	border-radius: 12px;
	background: #f8fafc;
	box-shadow: 0 2px 8px rgba(0,0,0,0.04);
	border: 1px solid #e6e6e6;
}

.date-picker text {
	font-size: 16px;
	color: #222;
	font-weight: 500;
	margin-right: 10px;
}

.picker-value {
	display: inline-block;
	min-width: 110px;
	text-align: center;
	color: #007aff;
	font-size: 16px;
	background: #fff;
	border-radius: 8px;
	padding: 8px 18px;
	border: 1.5px solid #e0e0e0;
	box-shadow: 0 1px 4px rgba(0,0,0,0.03);
	transition: border-color 0.2s, box-shadow 0.2s;
	cursor: pointer;
}

.picker-value:active,
.picker-value:focus {
	border-color: #007aff;
	box-shadow: 0 2px 8px rgba(0,122,255,0.08);
}

.picker-value.unselected {
	color: #bbb;
	border-color: #eee;
	background: #f5f5f5;
}

.loading-placeholder {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: rgb(255, 255, 255);
	border-radius: 10px;
}
</style>
