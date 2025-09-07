<template>
	<view class="container">
		<!-- 顶部导航栏 --> 
		

		<!--  店铺图片 -->
		<view class="shop-image">
			<image :src="shopMainImage || foodDetails?.imageUrl" mode="widthFix"></image>
			<view class="shop-info-overlay">
				<view class="shop-name">{{ foodDetails?.name || '加载中...' }}</view>
				<view class="shop-rating">
					<view class="star-rating">
						<template v-for="(star, index) in renderStars(foodDetails?.rating || 0)" :key="index">
							<uni-icons :type="star.type" size="18" :color="star.color"></uni-icons>
						</template>
					</view>
					<text class="rating">{{ foodDetails?.rating || 0 }}</text>
					<text class="monthly-sales">月售 {{ foodDetails?.monthSale || 0 }}</text>
					<text class="average-price">人均 ¥{{ foodDetails?.priceaverage || 0 }}</text>
				</view>
			</view>
		</view>


		<!-- 店铺详情 -->
		<view class="shop-details">
			<view class="detail-item">
				<view class="detail-icon">
					<uni-icons type="location" size="20" color="#666"></uni-icons>
				</view>
				<view class="detail-content">
					<text class="detail-label">营业时间</text>
					<view class="detail-value">
						<uni-icons type="time" size="16" color="#666"></uni-icons>
						<text>{{ foodDetails?.starthour || '00:00' }}-{{ foodDetails?.endhour || '00:00' }}</text>
					</view>
				</view>
			</view>
			<view class="detail-item">
				<view class="detail-icon">
					<uni-icons type="location" size="20" color="#666"></uni-icons>
				</view>
				<view class="detail-content">
					<text class="detail-label">地址</text>
					<view class="detail-value">
						<text>{{ foodDetails?.address || '暂无地址' }}</text>
					</view>
				</view>
			</view>
			<view class="detail-item">
				<view class="detail-icon">
					<uni-icons type="phone" size="20" color="#666"></uni-icons>
				</view>
				<view class="detail-content">
					<text class="detail-label">电话</text>
					<view class="detail-value">
						<text>{{ foodDetails?.phone || '暂无电话' }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 餐厅介绍 -->
		<view class="restaurant-intro">
			<view class="section-title">餐厅介绍</view>
			<view class="intro-content">
				<text class="intro-text" :class="{ 'collapsed': !isIntroUnfolded }" ref="introText">
					{{ foodDetails?.description || '暂无介绍' }}
				</text>
				<view class="unfold" @click="toggleIntro">
					<text :class="isIntroUnfolded ? 'fold-text' : 'unfold-text'">{{ isIntroUnfolded ? '收起' : '展开' }}</text>
				</view>
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


		<!-- 用户评价 -->
		<view class="reviews">
			<scroll-view scroll-x class="comment-scroll">
				<view class="comment-row">
					<view
						class="comment-card"
						v-for="(item, idx) in displayedComments"
						:key="item.id || idx"
					>
						<view class="comment-header">
							<image :src="item.avatar || '/static/my/default-avatar.png'" class="comment-avatar" />
							<view class="comment-user">
								<text class="comment-username">{{ item.username || '匿名用户' }}</text>
								<text class="comment-date">{{ item.createTime }}</text>
							</view>
						</view>
						<view class="comment-content">
							<view v-if="getValidImages(item.images).length">
								<image
									v-for="(img, i) in getValidImages(item.images)"
									:key="i"
									:src="img"
									class="comment-img"
									mode="aspectFill"
								/>
							</view>
							{{ item.comment }}
						</view>
					</view>
					<view
						v-if="!showAllComments && comments.length > 3"
						class="comment-more-btn"
						@click="toggleComments"
					>
						<view class="see-all-btn-img">
							<text class="see-all-text">查<br/>看<br/>全<br/>部</text>
							<view class="see-all-arrow">
								<uni-icons type="arrowright" size="18" color="#fff" />
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		<view style="color:#999;text-align:center;padding:20px 0;">
			仅限已支付该商品订单的用户评论
		</view>

		<!-- 推荐菜品 -->
		<view class="recommended-dishes">
			<view class="section-title">推荐菜品</view>
			<scroll-view class="dishes-scroll" scroll-x enable-flex>
				<view class="dish-item" v-for="(dish, index) in recommendedDishes" :key="index">
					<image :src="dish.image" mode="aspectFill"></image>
					<view class="dish-name">{{ dish.name }}</view>
					<view class="dish-desc">{{ dish.desc }}</view>
					<view class="dish-price">¥{{ dish.price }}</view>
				</view>
			</scroll-view>
		</view>

		<!-- 在推荐菜品后面，立即预订按钮前面添加时间选择部分 -->
		
			<view class="date-picker">
				<uni-icons type="calendar" size="22" color="#007aff" style="margin-right:8px;" />
				<text>选择用餐日期：</text>
				<picker mode="date" :value="diningDate" :start="todayStr" @change="onDiningDateChange">
					<view :class="['picker-value', !diningDate ? 'unselected' : '']">
						{{ diningDate || '请选择' }}
					</view>
				</picker>
			</view>

		<!-- 立即预订按钮 -->
		<view class="book-now" :style="{ paddingBottom: `${safeAreaInsets.bottom}px` }">
			<button class="book-button" @click="bookNow">立即预订</button>
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
			if (res.data && res.data.result) {
				const details = res.data.result;
				foodDetails.value = details;
				comments.value = details.comments || [];
				
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
	if (res.data.success && Array.isArray(res.data.result)) {
		comments.value = res.data.result;
	} else {
		comments.value = [];
	}
};

// 获取有效的图片数组
function getValidImages(images) {
	if (!images) return [];
	if (Array.isArray(images)) return images.filter(Boolean);
	if (typeof images === 'string') return images.split(',').filter(Boolean);
	return [];
}

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

	// 检查是否选择了日期
	if (!diningDate.value) {
		uni.showToast({
			title: '请选择用餐日期',
			icon: 'none',
			duration: 2000
		});
		return;
	}

	console.log('开始创建订单，日期:', diningDate.value);
	
	// 拼接营业时间
	const startTime = (timeRange.value.start || '10:00').length === 5
		? timeRange.value.start + ':00'
		: timeRange.value.start || '10:00:00';
	const endTime = (timeRange.value.end || '22:00').length === 5
		? timeRange.value.end + ':00'
		: timeRange.value.end || '22:00:00';

	const startDateTime = `${diningDate.value} ${startTime}`;
	const endDateTime = `${diningDate.value} ${endTime}`;

	const orderData = {
		contract: {
			contractName: userStore.userInfo?.realname || '游客',
			contractPhone: userStore.userInfo?.phone || '13800138000'
		},
		items: [
			{
				bookInfo: {
					date: diningDate.value,
					fullname: userStore.userInfo?.realname || '游客',
					idCardNo: userStore.userInfo?.idCardNo || '110101199001011234',
					idCardType: "ID_CARD",
					schedule: `${startTime}-${endTime}`
				},
				productId: foodDetails.value.id,
				productType: "Dining",
				quantity: 1,
				price: foodDetails.value.price,
				amount: foodDetails.value.price * 1,
				name: foodDetails.value.name,
				image: foodDetails.value.image,
				specs: `${startTime}-${endTime}`
			}
		],
		travelStartDate: startDateTime,
		travelEndDate: endDateTime
	};

	console.log('订单数据:', orderData);

	// 发送创建订单请求
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
			if (res.data.success) {
				// 创建订单成功后跳转到确认页面
				uni.navigateTo({
					url: `/pages/foodConfirm/foodConfirm?id=${foodDetails.value.id}&date=${encodeURIComponent(diningDate.value)}&startDateTime=${encodeURIComponent(startDateTime)}&endDateTime=${encodeURIComponent(endDateTime)}&orderId=${res.data.result.id}`
				});
			} else {
				uni.showToast({
					title: res.data.message || '预订失败',
					icon: 'none',
					duration: 2000
				});
			}
		},
		fail: (err) => {
			console.error('创建订单失败:', err);
			uni.showToast({
				title: '网络错误，请重试',
				icon: 'none',
				duration: 2000
			});
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
</script>

<style scoped>
.container {
	background-color: #f5f5f5;
	min-height: 100vh;
	padding-bottom: calc(80px + env(safe-area-inset-bottom)); /* 为底部按钮留出空间 */
}

.shop-image {
	position: relative;
}

.shop-info-overlay {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 10;
	/* 确保在图片上层 */
	background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
	color: white;
	padding: 15px;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
}

.shop-info-overlay .shop-name {
	font-size: 20px;
	font-weight: bold;
	margin-bottom: 10px;
}

.shop-info-overlay .shop-rating {
	display: flex;
	align-items: center;
	width: 100%;
	flex-wrap: wrap;
}

.shop-info-overlay .rating,
.shop-info-overlay .monthly-sales,
.shop-info-overlay .average-price {
	color: white;
	margin-left: 10px;
	font-size: 12px;
}

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

/* 店铺详情 */
.shop-details {
	background-color: #fff;
	padding: 15px;
	margin-bottom: 10px;
}

.detail-item {
	display: flex;
	align-items: center;
	margin-bottom: 15px;
}

.detail-icon {
	margin-right: 0px;
	/* 增加detail-icon和detail-content之间的距离 */
	display: flex;
	align-items: center;
}

.detail-label {
	margin-left: 10px;
	font-weight: bold;
}

.detail-value {
	flex: 1;
	color: #666;
	margin-left: 16rpx;
}

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

/* 用户评价 */
.reviews {
	width: 100%;
	background: none;
	border: none;
	border-radius: 0;
	box-shadow: none;
	margin: 0;
	padding: 0;
}

.comment-scroll {
	width: 100%;
}

.comment-row {
	display: flex;
	flex-direction: row;
	align-items: stretch;
}

.comment-card {
	display: flex;
	flex-direction: column;
	min-width: 220px;
	max-width: 70vw;
	background: #fff;
	border-radius: 12px;
	box-shadow: 0 2px 8px rgba(0,0,0,0.04);
	padding: 16px;
	margin-right: 12px;
	height: 120px;
	box-sizing: border-box;
}

.comment-header { display: flex; align-items: center; }
.comment-avatar { width: 40px; height: 40px; border-radius: 50%; margin-right: 10px; }
.comment-user { display: flex; flex-direction: column; }
.comment-username { font-weight: bold; color: #333; }
.comment-date { color: #aaa; font-size: 12px; }
.comment-content { color: #444; font-size: 15px; margin-top: 6px; }
.comment-more-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-width: 80px;
	height: 120px;
	background: #e9e6e6;
	border-radius: 18px;
	margin-right: 12px;
	margin-bottom: 5px;
	cursor: pointer;
	box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.see-all-btn-img {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
.see-all-text {
	writing-mode: vertical-rl;
	font-size: 18px;
	color: #222;
	letter-spacing: 2px;
	margin-bottom: 8px;
	font-weight: bold;
}
.see-all-arrow {
	width: 23px;
	height: 23px;
	background: #222;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}
.see-all-arrow uni-icons {
	color: #fff !important;
}

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
.book-now {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #fff;
	padding: 15px;
	padding-bottom: calc(15px + env(safe-area-inset-bottom)); /* 适配底部安全区域 */
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
	z-index: 100;
}

.book-button {
	background-color: #3b82f6;
	color: #fff;
	border: none;
	border-radius: 25px;
	padding: 6px 0;
	font-size: 18px;
	font-weight: bold;
	width: 100%;
	box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
	transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.book-button:active {
	transform: scale(0.98);
	background-color: #3b82f6;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

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