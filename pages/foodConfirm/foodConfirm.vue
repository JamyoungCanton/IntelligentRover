<template>
	<view class="page">
		<view class="header" :style="{ paddingTop: `${statusBarHeight}px` }">
			<text class="title">确认订单</text>
		</view>

		<view class="content">
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
					<view class="detail-item">
						<text class="detail-label">用餐时间</text>
						<picker mode="time" @change="bindTimeChange" class="time-picker">
							<view class="picker-text">{{ diningTime || '请选择用餐时间' }}</view>
						</picker>
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
			<button class="confirm-btn" @click="handleConfirmPayment">确认支付</button>
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
const diningTime = ref('');
const remark = ref('');


onMounted(() => {
	const { statusBarHeight: sbHeight, safeAreaInsets: insets } = uni.getSystemInfoSync();
	statusBarHeight.value = sbHeight;
	safeAreaInsets.value = insets;


	// uni.request({
	// 	url: `https://island.zhangshuiyi.com/island/front/product/dining/${id.value}`,
	// 	method: 'GET',
	// 	header: {
	// 		'Content-Type': 'application/x-www-form-urlencoded',
	// 		'X-Access-Token': userStore.token,
	// 	},
	// 	success: (res) => {
	// 		foodDetails.value = res.data;
	// 	},
	// 	fail: (err) => {
	// 		console.log(err);
	// 	}
	// })
})

const increaseQuantity = () => quantity.value++;
const decreaseQuantity = () => quantity.value > 1 && quantity.value--;
const bindTimeChange = (e) => diningTime.value = e.detail.value;

const handleConfirmPayment = () => {
	if (!contactName.value) return uni.showToast({ title: '请输入联系人姓名', icon: 'none' });
	if (!phone.value) return uni.showToast({ title: '请输入手机号码', icon: 'none' });
	if (!diningTime.value) return uni.showToast({ title: '请选择用餐时间', icon: 'none' });

	const orderData = {
		foodId: id.value,
		quantity: quantity.value,
		contactName: contactName.value,
		phone: phone.value,
		diningTime: diningTime.value,
		remark: remark.value,
		totalAmount: foodDetails.value.price * quantity.value
	};

	uni.navigateTo({
		url: '/pages/pay_success/pay_success'
	});
};

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

				// 更新餐厅详情数据，匹配模板结构
				foodDetails.value = {
					restaurant: details.name || '餐厅名称',
					address: details.address || '餐厅地址',
					businessHours: details.starthour && details.endhour
						? `${details.starthour}-${details.endhour}`
						: '10:00-22:00',
					price: details.priceaverage || 168,
					image: details.imageUrl || '/static/foodDetails/dish1.jpg'
				};
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

onLoad((options) => {
	console.log('饮食详情页面收到的ID:', options.id);
	// id.value = options.id;

	// 调用接口获取餐厅信息
	getRestaurantDetailsById(options.id);
});
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
	text-align: center;
	border-bottom: 1px solid #f0f0f0;
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