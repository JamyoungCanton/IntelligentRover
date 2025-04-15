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

		<!-- 功能按钮 -->
		<view class="function-buttons">
			<view v-for="(button, index) in staticTexts.functionButtons" :key="index" class="function-item"
				@click="handleFunctionButton(button.text)">
				<uni-icons :type="button.icon" size="30" color="#007AFF"></uni-icons>
				<text>{{ button.text }}</text>
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
					<image :src="`/static/foodDetails/${photo}`" mode="aspectFill"></image>
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
						<image class="avatar" :src="`/static/foodDetails/${review.avatar}`" mode="aspectFill"></image>
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
						<image :src="`/static/foodDetails/${review.images}`" mode="aspectFill"></image>
					</view>
				</view>
			</view>
		</view>

		<!-- 推荐菜品 -->
		<view class="recommended-dishes">
			<view class="section-title">推荐菜品</view>
			<scroll-view class="dishes-scroll" scroll-x enable-flex>
				<view class="dish-item" v-for="(dish, index) in recommendedDishes" :key="index">
					<image :src="`/static/foodDetails/${dish.image}`" mode="aspectFill"></image>
					<view class="dish-name">{{ dish.name }}</view>
					<view class="dish-desc">{{ dish.desc }}</view>
					<view class="dish-price">¥{{ dish.price }}</view>
				</view>
			</scroll-view>
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
// 静态文字变量
const shopMainImage = ref('/static/foodDetails/shop.jpg');

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
			avatar: 'avatar1.jpg',
			name: '李小姐',
			date: '2024-01-15',
			content: '海鲜非常新鲜，服务态度很好，环境也很干净，值得推荐！',
			rating: 5,
			images: 'review1.jpg'  // 添加图片字段
		},
		{
			avatar: 'avatar2.jpg',
			name: '张先生',
			date: '2024-01-14',
			content: '菜品味道不错，就是价格稍贵。总体来说还是很满意的。',
			rating: 4,
			images: null  // 对于没有图片的评论，设置为 null
		}
	]
});

const recommendedDishes = ref([
	{
		image: 'dish1.jpg',
		name: '清蒸海斑',
		desc: '新鲜海斑鱼，清蒸工艺',
		price: 188
	},
	{
		image: 'dish2.jpg',
		name: '椒盐濑尿虾',
		desc: '现捕濑尿虾，椒盐配方',
		price: 98
	},
	{
		image: 'dish3.jpg',
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

const bookNow = () => {
	console.log('立即预订');
	uni.navigateTo({
		url: `/pages/foodConfirm/foodConfirm?id=${id.value}`
	});

};



onLoad((options) => {
	console.log('饮食详情页面收到的ID:', options.id);
	id.value = options.id;

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
	uni.request({
		url: 'https://island.zhangshuiyi.com/island/product/ilDining/queryById',
		method: 'GET',
		header: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'X-Access-Token': userStore.token || ''
		},
		data: {
			id: id
		},
		success: (res) => {
			console.log("获取餐厅信息成功:", res.data);
			if (res.data.code === 200 && res.data.result) {
				const details = res.data.result;

				// 保存餐厅详情到foodDetails变量
				foodDetails.value = details;

				// 更新店铺主照片，优先使用imageUrl，如果没有则使用shopPhotos，最后使用默认图片
				shopMainImage.value = details.imageUrl || details.shopPhotos || '/static/foodDetails/shop.jpg';

				// 更新店铺基本信息
				staticTexts.value.shopName = details.name || staticTexts.value.shopName;

				// 删除description中的<p>标签
				const cleanDescription = details.description
					? details.description.replace(/<\/?p>/g, '')
					: staticTexts.value.shopIntro;

				staticTexts.value.shopIntro = cleanDescription;
				staticTexts.value.address = details.address || staticTexts.value.address;
				staticTexts.value.phone = details.phone || staticTexts.value.phone;

				// 使用正则表达式提取时分
				const formatTime = (timeString) => {
					const match = timeString ? timeString.match(/(\d{2}:\d{2})/) : null;
					return match ? match[1] : null;
				};

				const startTime = formatTime(details.starthour) || '10:00';
				const endTime = formatTime(details.endhour) || '22:00';

				// 更新营业时间
				staticTexts.value.businessHours = `${startTime}-${endTime}`;

				// 更新评分和价格信息
				staticTexts.value.shopRating.rating = details.rating || staticTexts.value.shopRating.rating;
				staticTexts.value.shopRating.monthlySales = `月售 ${details.monthSale || 0}`;
				staticTexts.value.shopRating.averagePrice = `人均 ¥${details.priceaverage || 168}`;

				// 更新推荐菜品
				if (details.dishes && details.dishes.length > 0) {
					recommendedDishes.value = details.dishes.slice(0, 3).map(dish => ({
						image: dish.image || 'dish1.jpg',
						name: dish.name || '未命名菜品',
						desc: dish.description || '暂无描述',
						price: dish.price || 0
					}));
				}

				// 更新店铺实拍照片
				if (details.shopPhotos && details.shopPhotos.length > 0) {
					shopPhotos.value = details.shopPhotos.slice(0, 3).map(photo => photo || 'photo1.jpg');
				}

				// 更新用户评价
				if (details.reviews && details.reviews.length > 0) {
					reviews.value = details.reviews.slice(0, 2).map(review => ({
						avatar: review.avatar || 'avatar1.jpg',
						name: review.name || '匿名用户',
						date: review.date || '2024-01-15',
						content: review.content || '用户未填写评价',
						rating: review.rating || 5,
						images: review.images || null
					}));
				}
			} else {
				uni.showToast({
					title: '获取餐厅信息失败',
					icon: 'none',
					duration: 2000
				});
			}
		},
		fail: (err) => {
			// 在控制台打印错误信息
			console.error('获取餐厅信息失败:', err);

			uni.showToast({
				title: '网络错误，请重试',
				icon: 'none',
				duration: 2000
			});
		}
	})
}

// 创建订单函数
const createOrder = () => {
	// 检查是否获取到了餐厅详情
	if (!foodDetails.value) {
		uni.showToast({
			title: '请先获取餐厅信息',
			icon: 'none',
			duration: 2000
		});
		return;
	}

	// 计算价格（使用人均价格）
	const price = foodDetails.value.priceaverage || 100;  // 默认100元如果没有价格
	const quantity = 1;  // 默认预订1份
	const totalAmount = price * quantity;

	// 构建订单数据
	const orderData = {
		contract: {
			contractName: userStore.userInfo?.realname || '游客',  // 从用户信息中获取姓名
			contractPhone: userStore.userInfo?.phone || '13800138000'  // 从用户信息中获取电话
		},
		items: [
			{
				bookInfo: {
					date: new Date().toISOString().split('T')[0], // 当前日期
					fullname: userStore.userInfo?.realname || '游客',  // 预订人姓名
					idCardNo: userStore.userInfo?.idCard || '110101199001011234',  // 身份证号
					idCardType: "ID_CARD",  // 默认为身份证
					schedule: foodDetails.value.starthour || '12:00'  // 使用餐厅营业开始时间
				},
				productId: foodDetails.value.id,  // 餐厅ID
				productType: "Dining",  // 餐饮类型
				quantity: quantity,  // 预订数量
				price: price,  // 单价
				amount: totalAmount  // 总金额
			}
		]
	};

	// 在控制台打印订单信息
	console.log('创建订单数据:', orderData);

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
			// 在控制台打印响应结果
			console.log('创建订单响应:', res.data);

			if (res.data.success) {
				uni.showToast({
					title: '预订成功',
					icon: 'success',
					duration: 2000
				});
				// 预订成功后跳转到订单页面
				setTimeout(() => {
					uni.navigateTo({
						url: '/pages/order/order'
					});
				}, 2000);
			} else {
				uni.showToast({
					title: res.data.message || '预订失败',
					icon: 'none',
					duration: 2000
				});
			}
		},
		fail: (err) => {
			// 在控制台打印错误信息
			console.error('创建订单失败:', err);

			uni.showToast({
				title: '网络错误，请重试',
				icon: 'none',
				duration: 2000
			});
		}
	});
};
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
}

.book-button {
	background-color: #007AFF;
	color: white;
	border: none;
	border-radius: 10px;
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
</style>