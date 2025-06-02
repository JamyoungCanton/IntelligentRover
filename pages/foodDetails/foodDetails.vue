<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="header" :style="{ paddingTop: `${statusBarHeight}px` }">
			<view class="back-icon">
				<uni-icons type="back" size="24" color="#333" @click="goBack"></uni-icons>
			</view>
			<view class="title">店铺详情</view>
			<view class="share-icon">
				<uni-icons type="share" size="24" color="#333" @click="share"></uni-icons>
			</view>
		</view>

		<!-- 店铺图片 -->
		<view class="shop-image">
			<image :src="shopMainImage" mode="widthFix"></image>
			<view class="shop-info-overlay">
				<view class="shop-name">{{ staticTexts.shopName }}</view>
				<view class="shop-rating">
					<view class="star-rating">
						<template v-for="(star, index) in renderStars(staticTexts.shopRating.rating)" :key="index">
							<uni-icons :type="star.type" size="18" :color="star.color"></uni-icons>
						</template>
					</view>
					<text class="rating">{{ staticTexts.shopRating.rating }}</text>
					<text class="monthly-sales">{{ staticTexts.shopRating.monthlySales }}</text>
					<text class="average-price">{{ staticTexts.shopRating.averagePrice }}</text>
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
					<text class="detail-label">{{ staticTexts.detailLabels.businessHours }}</text>
					<view class="detail-value">
						<uni-icons type="time" size="16" color="#666"></uni-icons>
						<text>{{ staticTexts.businessHours }}</text>
					</view>
				</view>
			</view>
			<view class="detail-item">
				<view class="detail-icon">
					<uni-icons type="location" size="20" color="#666"></uni-icons>
				</view>
				<view class="detail-content">
					<text class="detail-label">{{ staticTexts.detailLabels.address }}</text>
					<view class="detail-value">
						<text>{{ staticTexts.address }}</text>
					</view>
				</view>
			</view>
			<view class="detail-item">
				<view class="detail-icon">
					<uni-icons type="phone" size="20" color="#666"></uni-icons>
				</view>
				<view class="detail-content">
					<text class="detail-label">{{ staticTexts.detailLabels.phone }}</text>
					<view class="detail-value">
						<text>{{ staticTexts.phone }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 餐厅介绍 -->
		<view class="restaurant-intro">
			<view class="section-title">餐厅介绍</view>
			<view class="intro-content">
				<text class="intro-text" :class="{ 'collapsed': !isIntroUnfolded }" ref="introText">
					{{ staticTexts.shopIntro }}
				</text>
				<view class="unfold" @click="toggleIntro">
					<text :class="isIntroUnfolded ? 'fold-text' : 'unfold-text'">{{ isIntroUnfolded ? '收起' : '展开'
					}}</text>
				</view>
			</view>
		</view>

		<!-- 店铺实拍 -->
		<view class="shop-photos">
			<view class="section-title">店铺实拍</view>
			<scroll-view class="photo-scroll" scroll-x enable-flex>
				<view class="photo-item" v-for="(photo, index) in shopPhotos" :key="index">
					<view v-if="imageLoading" class="loading-placeholder">
						<uni-icons type="image" size="30" color="#999"></uni-icons>
					</view>
					<image :src="`https://wuminghui.top:9000/travel/${photo}`" mode="aspectFill" @load="imageLoading = false" @error="handleImageError"></image>
				</view>
			</scroll-view>
		</view>

		<!-- 用户评价 -->
		<view class="user-reviews">
			<view class="review-header">
				<view class="review-title">用户评价 (1,234)</view>
				<view class="view-all" @click="viewAllReviews">
					<text>查看全部 ></text>
				</view>
			</view>

			<view class="review-list">
				<view class="review-item" v-for="(review, index) in reviews" :key="index">
					<view class="reviewer-info">
						<image class="avatar" :src="review.avatar" mode="aspectFill"></image>
						<view class="reviewer-name-rating">
							<view class="reviewer-name">{{ review.name }}</view>
							<view class="review-rating-date">
								<view class="review-rating">
									<view class="star-rating">
										<template v-for="(star, index) in renderStars(review.rating)" :key="index">
											<uni-icons :type="star.type" size="16" :color="star.color"></uni-icons>
										</template>
									</view>
								</view>
								<view class="review-date">{{ review.date }}</view>
							</view>
						</view>
					</view>
					<view class="review-content">{{ review.content }}</view>
					<view class="review-images" v-if="review.images">
						<image :src="review.images" mode="aspectFill"></image>
					</view>
				</view>
			</view>
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
		<view class="time-picker-section">
			<view class="section-title">选择用餐时间</view>
			<view class="date-picker">
				<text>选择用餐日期：</text>
				<picker mode="date" :value="diningDate" :start="todayStr" @change="onDiningDateChange">
					<view class="picker-value">{{ diningDate || '请选择' }}</view>
				</picker>
			</view>
		</view>

		<!-- 立即预订按钮 -->
		<view class="book-now" :style="{ paddingBottom: `${safeAreaInsets.bottom}px` }">
			<button class="book-button" @click="bookNow">立即预订</button>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user';

const safeAreaInsets = ref({});
const statusBarHeight = ref(0);
const foodDetails = ref(null);
const userStore = useUserStore();
const id = ref('');

const shopMainImage = ref('');

// 更新页面显示的数据的函数
const updatePageDetails = (details) => {
	if (details) {
		staticTexts.value.shopName = details.name || staticTexts.value.shopName;
		staticTexts.value.address = details.address || staticTexts.value.address;

		// 使用正则表达式提取时分
		const formatTime = (timeString) => {
			const match = timeString ? timeString.match(/(\d{2}:\d{2})/) : null;
			return match ? match[1] : null;
		};

		const startTime = formatTime(details.starthour) || '10:00';
		const endTime = formatTime(details.endhour) || '22:00';

		staticTexts.value.businessHours = `${startTime}-${endTime}`;
		staticTexts.value.shopRating.averagePrice = `人均 ¥${details.priceaverage || 168}`;
	}
};

// 注册组件
const components = {
	uniIcons
};

// 星级渲染函数
const renderStars = (rating) => {
	// 如果没有评分，返回5个空星
	if (!rating && rating !== 0) {
		return Array(5).fill({ type: 'star', color: '#CCCCCC' });
	}

	const stars = [];
	const fullStars = Math.floor(rating);
	const halfStar = rating % 1 >= 0.5;

	// 添加满星
	for (let i = 0; i < fullStars; i++) {
		stars.push({ type: 'star-filled', color: '#FFCC00' });
	}

	// 添加半星（不行）
	// if (halfStar) {
	// 	stars.push({ type: 'half', color: '#FFCC00' });
	// }

	// 添加空星
	while (stars.length < 5) {
		stars.push({ type: 'star', color: '#CCCCCC' });
	}

	return stars;
};

// 数据
const isIntroUnfolded = ref(false);
const shopPhotos = ref(['photo1.jpg', 'photo2.jpg', 'photo3.jpg']);

const staticTexts = ref({
	// 页面基础信息
	title: '店铺详情',
	backIcon: '返回',
	shareIcon: '分享',

	// 店铺基本信息
	shopName: '海鲜大排档',
	shopIntro: '本店主打新鲜海鲜，采用当日现捕海鲜，确保最佳口感。店内环境整洁，服务热情周到。推荐菜品包括清蒸海斑、椒盐濑尿虾、姜葱炒蟹等。欢迎品尝！',
	businessHours: '10:00-22:00',
	address: '广州市海珠区新港东路123号',
	phone: '020-12345678',

	// 功能按钮
	functionButtons: [
		{ icon: 'phone', text: '电话' },
		{ icon: 'location', text: '导航' },
		{ icon: 'calendar', text: '预订' }
	],

	// 店铺评分
	shopRating: {
		rating: 4.8,
		monthlySales: '月售 2,384',
		averagePrice: '人均 ¥168'
	},

	// 详情标签
	detailLabels: {
		businessHours: '营业时间',
		address: '地址',
		phone: '电话'
	},

	// 评价与推荐
	reviewTitle: '用户评价 (1,234)',
	recommendedDishesTitle: '推荐菜品',
	reviewViewAllText: '查看全部 >',

	// 按钮文字
	bookNowText: '立即预订',
	introToggleTexts: {
		unfold: '展开',
		fold: '收起'
	},

	// 用户评价相关文字
	reviews: [
		{
			avatar: 'https://wuminghui.top:9000/wlmtsys/2025/06/02/df90fbeb9bad4ae895a10deab1eeaa2c.jpg',
			name: '李小姐',
			date: '2024-01-15',
			content: '海鲜非常新鲜，服务态度很好，环境也很干净，值得推荐！',
			rating: 5,
			images: 'https://wuminghui.top:9000/wlmtsys/2025/06/02/d1f51a32fb384ed79d5c788d931185b9.jpg'
		},
		{
			avatar: 'https://wuminghui.top:9000/wlmtsys/2025/06/02/38fc8a8cb33a4229b5fed00bdcedd7a9.jpg',
			name: '张先生',
			date: '2024-01-14',
			content: '菜品味道不错，就是价格稍贵。总体来说还是很满意的。',
			rating: 4,
			images: null
		}
	]
});

const recommendedDishes = ref([
	{
		image: 'https://wuminghui.top:9000/wlmtsys/2025/06/02/32205ab6539049b79581d7080fb835d6.jpg',
		name: '清蒸海斑',
		desc: '新鲜海斑鱼，清蒸工艺',
		price: 188
	},
	{
		image: 'https://wuminghui.top:9000/wlmtsys/2025/06/02/7a9b523fe5804d3cbea93223c628a314.jpg',
		name: '椒盐濑尿虾',
		desc: '现捕濑尿虾，椒盐配方',
		price: 98
	},
	{
		image: 'https://wuminghui.top:9000/wlmtsys/2025/06/02/bfcbc05e156445198555de4204faf596.jpg',
		name: '姜葱炒蟹',
		desc: '新鲜花蟹，姜葱爆炒',
		price: 138
	}
]);

// 将静态文字中的评价数据赋值给 reviews
const reviews = ref(staticTexts.value.reviews);

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

const toggleIntro = () => {
	isIntroUnfolded.value = !isIntroUnfolded.value;
	const introTextElement = document.querySelector('.intro-text');
	if (isIntroUnfolded.value) {
		console.log('展开餐厅介绍');
		// 展开时显示全文
		introTextElement.classList.remove('collapsed');
	} else {
		console.log('收起餐厅介绍');
		// 收起时省略文本
		introTextElement.classList.add('collapsed');
	}
};

const viewAllReviews = () => {
	console.log('查看全部评价');
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
	
	// 构建订单数据
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
					idCardNo: userStore.userInfo?.idCard || '110101199001011234',
					idCardType: "ID_CARD",
					schedule: ''
				},
				productId: foodDetails.value.id,
				productType: "Dining",
				quantity: 1
			}
		],
		travelStartDate: diningDate.value,
		travelEndDate: diningDate.value
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
					url: `/pages/foodConfirm/foodConfirm?id=${foodDetails.value.id}&date=${encodeURIComponent(diningDate.value)}&time=${encodeURIComponent(diningTime.value)}&orderId=${res.data.result.id}`
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

onLoad((options) => {
	console.log('饮食详情页面收到的参数:', options);
	
	// 确保id存在
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
	
	// 如果有传入营业时间，则使用传入的时间
	if (options.startTime && options.endTime) {
		timeRange.value.start = formatTime(decodeURIComponent(options.startTime));
		timeRange.value.end = formatTime(decodeURIComponent(options.endTime));
	}

	// 如果有传入图片URL，则使用传入的图片
	if (options.imageURL) {
		shopMainImage.value = decodeURIComponent(options.imageURL);
	}

	// 调用接口获取餐厅信息
	getRestaurantDetailsById(options.id);
});

onMounted(() => {
	const { statusBarHeight: sbHeight, safeAreaInsets: insets } = uni.getSystemInfoSync();
	statusBarHeight.value = sbHeight;
	safeAreaInsets.value = insets;

});

// 调用接口获取餐厅信息
const getRestaurantDetailsById = (id) => {
	console.log('开始获取餐厅信息，ID:', id);
	
	const headers = {
		'Content-Type': 'application/x-www-form-urlencoded'
	};
	if (userStore.token) {
		headers['X-Access-Token'] = userStore.token;
	}

	uni.request({
		url: `https://island.zhangshuiyi.com/island/front/product/dining/${id}`,
		method: 'GET',
		header: headers,
		success: (res) => {
			console.log("获取餐厅信息成功:", res.data);
			if (res.data && res.data.id) {
				const details = res.data;
				
				// 保存餐厅详情到foodDetails变量
				foodDetails.value = details;
				console.log('保存的餐厅信息:', foodDetails.value);

				// 更新店铺主照片（如果没有从上一页传入图片，则使用接口返回的图片）
				if (!shopMainImage.value) {
					shopMainImage.value = details.imageUrl || '/static/foodDetails/shop.jpg';
				}

				// 更新店铺基本信息
				staticTexts.value.shopName = details.name || staticTexts.value.shopName;

				// 删除description中的<p>标签
				const cleanDescription = details.description
					? details.description.replace(/<\/?p>/g, '')
					: staticTexts.value.shopIntro;

				staticTexts.value.shopIntro = cleanDescription;
				staticTexts.value.address = details.address || staticTexts.value.address;
				staticTexts.value.phone = details.phone || staticTexts.value.phone;

				// 如果没有从上一页传入时间，则使用接口返回的时间
				if (!timeRange.value.start || !timeRange.value.end) {
					timeRange.value.start = formatTime(details.starthour) || '10:00';
					timeRange.value.end = formatTime(details.endhour) || '22:00';
				}

				// 更新显示的营业时间
				staticTexts.value.businessHours = `${timeRange.value.start}-${timeRange.value.end}`;

				// 更新评分和价格信息
				staticTexts.value.shopRating.rating = details.rating || staticTexts.value.shopRating.rating;
				staticTexts.value.shopRating.monthlySales = `月售 ${details.monthSale || 0}`;
				staticTexts.value.shopRating.averagePrice = `人均 ¥${details.priceaverage || 168}`;

				// 获取餐厅图片
				getRestaurantImages(id);
			} else {
				console.error('获取餐厅信息失败: 返回数据格式不正确');
				uni.showToast({
					title: '获取餐厅信息失败',
					icon: 'none',
					duration: 2000
				});
			}
		},
		fail: (err) => {
			console.error('获取餐厅信息失败:', err);
			uni.showToast({
				title: '网络错误，请重试',
				icon: 'none',
				duration: 2000
			});
		}
	});
};

// 获取餐厅图片
const getRestaurantImages = (id) => {
	const headers = {
		'Content-Type': 'application/x-www-form-urlencoded'
	};
	if (userStore.token) {
		headers['X-Access-Token'] = userStore.token;
	}

	uni.request({
		url: `https://island.zhangshuiyi.com/island/il-ding-images/attractions/${id}`,
		method: 'GET',
		header: headers,
		success: (res) => {
			console.log("获取餐厅图片成功:", res.data);
			if (res.data.success && res.data.result) {
				// 限制最多显示6张图片
				shopPhotos.value = res.data.result.slice(0, 6);
			} else {
				console.error('获取餐厅图片失败:', res.data.message);
				// 使用默认图片
				shopPhotos.value = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
			}
		},
		fail: (err) => {
			console.error('获取餐厅图片失败:', err);
			// 使用默认图片
			shopPhotos.value = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
		}
	});
};

const handleImageError = (e) => {
	console.error('图片加载失败:', e);
	// 可以设置一个默认图片
	e.target.src = '/static/foodDetails/default.jpg';
};

const imageLoading = ref(true);
</script>

<style scoped>
.container {
	background-color: #f5f5f5;
	min-height: 100vh;
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
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 15px;
	background-color: #fff;
	position: sticky;
	top: 0;
	z-index: 100;
}

.back-icon,
.share-icon {
	width: 40px;
	height: 40px;
	display: flex;
	justify-content: center;
	align-items: center;
}

.title {
	font-size: 18px;
	font-weight: bold;
	flex: 1;
	text-align: center;
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
.user-reviews {
	background-color: #fff;
	padding: 15px;
	margin-bottom: 10px;
}

.review-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15px;
}

.view-all {
	color: #007AFF;
}

.reviewer-info {
	display: flex;
	align-items: center;
	margin-bottom: 10px;
	margin-top: 20px;
}

.avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	margin-right: 10px;
}

.reviewer-name-rating {
	margin-left: -10px;
}

.reviewer-name {
	font-weight: bold;
	margin-left: 10px;
}

.review-rating {
	margin-left: 10px;
}

.review-date {
	margin-left: 10px;
	color: #999;
}

.review-content {
	line-height: 1.6;
	margin-bottom: 10px;
}

.review-images {
	width: 100px;
	height: 100px;
	border-radius: 5px;
	overflow: hidden;
}

.review-images image {
	width: 100%;
	height: 100%;
	object-fit: cover;
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
	padding: 15px;
	margin-top: 10px;
	padding-top: 35px;
}

.book-button {
	background-color: #007AFF;
	color: white;
	border: none;
order-radius: 10px;
	/* 减小圆角半径，使其更接近长方形 */
	padding: 15px 0;
	font-size: 16px;
	width: calc(100% - 30px);
	/* 略微缩小宽度，使两侧有小边距 */
	margin: -30px 15px 0 15px;
	/* 添加水平边距 */
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	/* 添加轻微阴影 */
	transition: transform 0.3s ease, box-shadow 0.3s ease;
	/* 添加过渡效果 */
}

.book-button:active {
	transform: scale(0.98);
	/* 点击时轻微缩小 */
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	/* 点击时阴影变浅 */
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
	margin: 16px 0;
	padding: 8px 0;
	border-radius: 8px;
	background: #fff9f9;
	box-shadow: 0 1px 4px rgba(0,0,0,0.03);
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