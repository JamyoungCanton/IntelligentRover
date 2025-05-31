<template>
	<view class="page">
		<view class="header" :style="{ paddingTop: `${statusBarHeight}px` }">
			<view class="header-content">
				<view class="back-btn" @click="handleBack">
					<text class="back-icon">‹</text>
				</view>
				<text class="title">确认订单</text>
			</view>
		</view>

		<view class="content">
			<!-- 选择用餐日期 -->
			<view class="card">
				<view class="detail-item">
					<text class="detail-label">用餐日期</text>
					<picker mode="date" :value="diningDate" :start="todayStr" @change="onDiningDateChange">
						<view class="picker-text">{{ diningDate || '请选择用餐日期' }}</view>
					</picker>
				</view>
			</view>

			<!-- 餐厅信息 -->
			<view class="card">
				<image class="restaurant-image" :src="foodDetails.image" mode="aspectFill"></image>
				<text class="restaurant-name">{{ foodDetails.restaurant }}</text>
				<view class="info-line">
					<text class="info-label">地址：</text>
					<text class="info-value">{{ foodDetails.address }}</text>
				</view>
				<view class="info-line">
					<text class="info-label">营业时间：</text>
					<text class="info-value">{{ foodDetails.businessHours }}</text>
				</view>
				<view class="info-line">
					<text class="info-label">单价：</text>
					<text class="info-value">¥{{ foodDetails.price }}</text>
				</view>
			</view>

			<!-- 订单详情 -->
			<view class="card">
				<view class="order-detail">
					<view class="detail-item">
						<text class="detail-label">数量</text>
						<view class="quantity-control">
							<button class="quantity-btn" @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
							<text class="quantity-value">{{ quantity }}</text>
							<button class="quantity-btn" @click="increaseQuantity">+</button>
						</view>
					</view>
				</view>
			</view>

			<!-- 联系人信息 -->
			<view class="card">
				<view class="contact-info">
					<view class="input-wrapper">
						<text class="input-label">联系人</text>
						<input v-model="contactName" class="input-field" placeholder="请输入联系人姓名" />
					</view>
					<view class="input-wrapper">
						<text class="input-label">联系方式</text>
						<input type="number" v-model="phone" class="input-field" placeholder="请输入手机号码" />
					</view>
				</view>
			</view>

			<!-- 备注信息 -->
			<view class="card">
				<textarea v-model="remark" class="remark-input" placeholder="请输入特殊需求或注意事项" />
			</view>
		</view>

		<!-- 底部支付栏 -->
		<view class="bottom-bar" :style="{ paddingBottom: `${safeAreaInsets.bottom}px` }">
			<view class="total-price">
				<text>合计：¥{{ foodDetails.price * quantity }}</text>
			</view>
			<button class="confirm-btn" @click="handleConfirmPayment()">立即预订</button>
		</view>
	</view>
</template>

<script setup>
import { useUserStore } from '@/store/modules/user';
import { onLoad } from '@dcloudio/uni-app';
import { ref, onMounted } from 'vue';


const safeAreaInsets = ref({});
const statusBarHeight = ref(0);

const userStore = useUserStore();
const id = ref('');
const foodDetails = ref({
	restaurant: '',
	address: '',
	businessHours: '',
	price: 0,
	image: ''
});
const quantity = ref(1);
const contactName = ref('');
const phone = ref('');
const diningDate = ref('');
const diningStartTime = ref('');
const diningEndTime = ref('');
const today = new Date();
const pad = (n) => n < 10 ? '0' + n : n;
const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;




const increaseQuantity = () => quantity.value++;
const decreaseQuantity = () => quantity.value > 1 && quantity.value--;
const handleBack = () => {
	uni.navigateBack();
};

const handleConfirmPayment = () => {
	if (!contactName.value) return uni.showToast({ title: '请输入联系人姓名', icon: 'none' });
	if (!phone.value) return uni.showToast({ title: '请输入手机号码', icon: 'none' });
	if (!diningDate.value) return uni.showToast({ title: '请选择用餐日期', icon: 'none' });

	const orderData = {
		contract: {
			contractName: userStore.userInfo?.realname || '游客',
			contractPhone: userStore.userInfo?.phone || '13800138000'
		},
		items: [
			{
				bookInfo: {
					date: diningDate.value,
					fullname: contactName.value || '游客',
					idCardNo: userStore.userInfo?.idCard || '110101199001011234',
					idCardType: "ID_CARD",
					schedule: `${diningStartTime.value}-${diningEndTime.value}`
				},
				productId: id.value,
				productType: "Dining",
				quantity: quantity.value,
				price: foodDetails.value.price,
				amount: foodDetails.value.price * quantity.value,
				name: foodDetails.value.restaurant,
				image: foodDetails.value.image,
				specs: `${diningStartTime.value}-${diningEndTime.value}`
			}
		],
		travelStartDate: `${diningDate.value} ${diningStartTime.value}`,
		travelEndDate: `${diningDate.value} ${diningEndTime.value}`
	};

	console.log('创建订单 - 请求数据:', JSON.stringify(orderData, null, 2));

	uni.request({
		url: 'https://island.zhangshuiyi.com/island/front/order/createOrder',
		method: 'POST',
		header: {
			'Content-Type': 'application/json',
			'X-Access-Token': userStore.token
		},
		data: orderData,
		success: (res) => {
			console.log('创建订单 - 响应数据:', JSON.stringify(res.data, null, 2));
			if (res.data.code === 200 && res.data.result && res.data.result.orderSn) {
				const orderSn = res.data.result.orderSn;
				uni.showToast({
					title: '订单创建成功',
					icon: 'success',
					duration: 1500
				});
				// 跳转到支付页，传递 orderSn 及必要信息
				uni.navigateTo({
					url: `/pages/activityPay/activityPay?orderSn=${orderSn}&title=${foodDetails.value.title}&price=${foodDetails.value.price * quantity.value}&restaurant=${encodeURIComponent(foodDetails.value.restaurant)}`
				});
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

// 调用接口获取餐厅信息
const getRestaurantDetailsById = (id) => {
	uni.request({
		url: `https://island.zhangshuiyi.com/island/front/product/dining/${id}`,
		method: 'GET',
		header: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'X-Access-Token': userStore.token || ''
		},
		success: (res) => {
			console.log("获取餐厅信息成功:", res.data);
			if (res.data && res.data.id) {
				const details = res.data;

				// 格式化营业时间(去除秒数)
				const formatTime = (timeStr) => {
					if (!timeStr) return '00:00';
					return timeStr.split(':').slice(0, 2).join(':');
				};

				const startHour = formatTime(details.starthour);
				const endHour = formatTime(details.endhour);

				// 更新餐厅详情数据，匹配模板结构
				foodDetails.value = {
					restaurant: details.name || '餐厅名称',
					address: details.address || '餐厅地址',
					businessHours: startHour && endHour
						? `${startHour}-${endHour}`
						: '10:00-22:00',
					price: details.price || details.priceaverage || 150,
					image: details.imageUrl || '/static/foodDetails/dish1.jpg',
					startHour: startHour || '10:00',
					endHour: endHour || '22:00',
					title: details.name || '餐厅名称',
					score: details.rating || 5,
					soldSum: details.monthSale || 0,
					description: details.description ? details.description.replace(/<\/?p>/g, '') : '',
					phone: details.phone || ''
				};

				// 自动填充联系人信息
				if (userStore.userInfo) {
					contactName.value = userStore.userInfo.realname || '';
					phone.value = userStore.userInfo.phone || '';
				}
			} else {
				console.error('接口返回内容:', res.data);
				uni.showToast({
					title: res.data.message || '获取餐厅信息失败',
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

const onDiningDateChange = (e) => {
	diningDate.value = e.detail.value;
};
const onDiningStartTimeChange = (e) => {
	diningStartTime.value = e.detail.value;
};
const onDiningEndTimeChange = (e) => {
	diningEndTime.value = e.detail.value;
};

onLoad((options) => {
	console.log('饮食详情页面收到的ID:', options.id);
	id.value = options.id;

	// 调用接口获取餐厅信息
	getRestaurantDetailsById(options.id);

	if (options.date) {
		diningDate.value = options.date;
	}
});
onMounted(() => {
	const { statusBarHeight: sbHeight, safeAreaInsets: insets } = uni.getSystemInfoSync();
	statusBarHeight.value = sbHeight;
	safeAreaInsets.value = insets;
})
</script>

<style>
page {
	height: 100%;
	background-color: #f5f5f5;
}

.page {
	display: flex;
	flex-direction: column;
	height: 100%;
	background-color: #ffffff;
}

.header {
	padding: 30rpx;
	border-bottom: 1px solid #f0f0f0;
}

.header-content {
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.back-btn {
	position: absolute;
	left: 0;
	padding: 10rpx 20rpx;
}

.back-icon {
	font-size: 48rpx;
	font-weight: bold;
	color: #333;
}

.header .title {
	font-size: 36rpx;
	font-weight: 600;
}

.content {
	flex: 1;
	padding: 20rpx;
	padding-bottom: 160rpx;
}

.card {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 24rpx;
}

.restaurant-image {
	width: 100%;
	height: 300rpx;
	border-radius: 12rpx;
	margin-bottom: 20rpx;
}

.restaurant-name {
	font-size: 32rpx;
	font-weight: 600;
	margin-bottom: 20rpx;
	display: block;
}

.info-line {
	display: flex;
	margin-bottom: 15rpx;
	font-size: 28rpx;
}

.info-label {
	color: #666;
	min-width: 120rpx;
}

.info-value {
	color: #333;
}

.order-detail {
	padding: 0 10rpx;
}

.detail-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f5f5f5;
}

.detail-item:last-child {
	border-bottom: none;
}

.detail-label {
	font-size: 28rpx;
	color: #666;
}

.detail-value {
	font-size: 28rpx;
}

.quantity-control {
	display: flex;
	align-items: center;
}

.quantity-btn {
	width: 60rpx;
	height: 60rpx;
	line-height: 60rpx;
	text-align: center;
	border: 1rpx solid #ddd;
	background-color: #f9f9f9;
	font-size: 32rpx;
	color: #666;
}

.quantity-btn:disabled {
	color: #ccc;
}

.quantity-value {
	width: 80rpx;
	text-align: center;
	font-size: 32rpx;
}

.time-picker {
	padding: 16rpx 0;
}

.picker-text {
	font-size: 28rpx;
	color: #333;
}

/* 网页端专用样式 */
@media (min-width: 768px) {
	.time-picker {
		margin-left: -120rpx;
		/* 增加左移距离至120rpx */
		position: relative;
	}

	/* 请选择用餐时间，调整弹出框位置 */
	uni-picker {
		left: -200rpx !important;
	}
}

.picker-text:empty::after {
	content: '请选择用餐时间';
	color: #999;
}

.contact-info {
	padding: 0 10rpx;
}

.input-wrapper {
	margin-bottom: 20rpx;
}

.input-label {
	display: block;
	font-size: 28rpx;
	color: #666;
	margin-bottom: 12rpx;
}

.input-field {
	width: 100%;
	height: 80rpx;
	padding: 0 20rpx;
	border: 1rpx solid #e5e5e5;
	border-radius: 8rpx;
	font-size: 28rpx;
}

.remark-input {
	width: 100%;
	height: 160rpx;
	padding: 20rpx;
	border: 1rpx solid #e5e5e5;
	border-radius: 8rpx;
	font-size: 28rpx;
}

.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	align-items: center;
	padding: 20rpx 30rpx;
	background-color: #ffffff;
	border-top: 1rpx solid #f0f0f0;
}

.total-price {
	flex: 1;
	font-size: 32rpx;
}

.confirm-btn {
	width: 240rpx;
	height: 80rpx;
	line-height: 80rpx;
	background-color: #3B82F6;
	color: #ffffff;
	font-size: 32rpx;
	font-weight: 500;
	border-radius: 40rpx;
	text-align: center;
}
</style>