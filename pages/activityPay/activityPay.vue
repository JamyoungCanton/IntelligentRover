<template>
	<view>
		<view class="header">
			<view class="back" @click="goBack">←</view>
			<view class="title">支付订单</view>
		</view>

		<view class="order-container">
			<template v-if="isLoading">
				<view class="loading">
					<text>加载中...</text>
				</view>
			</template>
			<template v-else-if="error">
				<view class="error">
					<text>{{ error }}</text>
				</view>
			</template>
			<template v-else-if="orderInfo">
				<view class="order-card">
					<!-- 订单基本信息 -->
					<view class="order-base-info">
						<view class="info-item">
							<text class="info-label">订单编号：</text>
							<text class="info-value">{{ orderInfo.orderSn }}</text>
						</view>
						<view class="info-item">
							<text class="info-label">下单时间：</text>
							<text class="info-value">{{ orderInfo.createTime }}</text>
						</view>
						<view class="info-item">
							<text class="info-label">订单金额：</text>
							<text class="info-value">¥{{ orderInfo.amount }}</text>
						</view>
						<view class="info-item">
							<text class="info-label">联系人：</text>
							<text class="info-value">{{ orderInfo.contractName }}</text>
						</view>
						<view class="info-item">
							<text class="info-label">联系电话：</text>
							<text class="info-value">{{ orderInfo.contractPhone }}</text>
						</view>
					</view>

					<!-- 商品列表 -->
					<view v-if="orderInfo.items && orderInfo.items.length > 0" class="order-items">
						<view class="order-item" v-for="(item, index) in orderInfo.items" :key="index">
							<image class="item-image" :src="item.image" mode="aspectFill"></image>
							<view class="item-info">
								<text class="item-name">{{ item.name }}</text>
								<text class="item-spec">{{ item.specs }}</text>
							</view>
							<view class="item-right">
								<text class="item-price">¥{{ item.price }}</text>
								<text class="item-quantity">x{{ item.quantity }}</text>
							</view>
						</view>
					</view>

					<!-- 支付方式选择 -->
					<view class="payment-methods">
						<text class="section-title">选择支付方式</text>
						<radio-group @change="handlePaymentChange">
							<label class="payment-method">
								<image class="method-icon" src="/static/route/wechat.png"></image>
								<text class="method-text">微信支付</text>
								<radio class="method-radio" value="wechat" checked />
							</label>
							<label class="payment-method">
								<image class="method-icon" src="/static/route/alipay.png"></image>
								<text class="method-text">支付宝支付</text>
								<radio class="method-radio" value="alipay" />
							</label>
						</radio-group>
					</view>
				</view>

				<!-- <view v-if="orderInfo && (!orderInfo.items || orderInfo.items.length === 0)" class="empty">
					<text>暂无订单信息</text>
				</view> -->
			</template>
		</view>

		<view class="footer">
			<view class="total">
				总计：<text class="amount">¥{{ totalAmount }}</text>
			</view>
			<button class="pay-btn" @click="handlePayment">立即支付</button>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/modules/user';

const safeAreaInsets = ref({ bottom: 0 });
const statusBarHeight = ref(0);
const userStore = useUserStore();

const orderSn = ref('')
const orderInfo = ref({})
const totalAmount = ref(0)
const isLoading = ref(true)
const error = ref(null)
const paymentMethod = ref('wechat')

const handlePaymentChange = (e) => {
	paymentMethod.value = e.detail.value
}

onLoad((options) => {
	orderSn.value = options.orderSn

	console.log("传入的订单orderSn为:", orderSn.value)
	getOrderDetailById(orderSn.value);
	uni.setNavigationBarTitle({
		title: '支付订单'
	})
})


const getOrderDetailById = (orderSn) => {
	// 显示加载提示
	uni.showLoading({
		title: '加载订单详情中...'
	});

	isLoading.value = true;
	error.value = null;

	// 发起请求获取订单详情
	uni.request({
		url: `https://island.zhangshuiyi.com/island/front/order/getMyOrderInfo/${orderSn}`,
		method: 'GET',
		header: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'X-Access-Token': userStore.token
		},
		success: (res) => {
			console.log('订单详情响应数据:', res.data);

			if (res.data.success) {
				// 确保数据结构与模板匹配
				const result = res.data.result || {};
				orderInfo.value = {
					items: result.items || [], // 确保有items数组
					...result
				};
				totalAmount.value = result.amount || 0;
			} else {
				error.value = res.data.message || '获取订单失败';
				uni.showToast({
					title: error.value,
					icon: 'none'
				});
			}
		},
		fail: (err) => {
			console.error('获取订单详情失败:', err);
			error.value = '网络请求失败';
			uni.showToast({
				title: error.value,
				icon: 'none'
			});
		},
		complete: () => {
			uni.hideLoading();
			isLoading.value = false;
		}
	});
}


const goBack = () => {
	uni.switchTab({
		url: '/pages/index/index'
	})
}

const handlePayment = () => {
	// 显示加载提示
	// uni.showLoading({
	// 	title: '支付处理中...'
	// });

	// 发起支付请求
	uni.request({
		url: 'https://island.zhangshuiyi.com/island/front/order/payOrder',
		method: 'POST',
		data: {
			orderSn: orderSn.value,
			payType: paymentMethod.value // 添加支付方式参数
		},
		header: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'X-Access-Token': userStore.token
		},
		success: (res) => {
			console.log('支付请求响应结果:', res.data);

			// 根据响应处理支付结果
			if (res.data.success) {
				uni.showToast({
					title: '支付成功',
					icon: 'success'
				});
				setTimeout(() => {
					uni.switchTab({
						url: '/pages/order/order'
					});
				}, 1500);
			} else {
				uni.showToast({
					title: res.data.message || '支付失败',
					icon: 'none'
				});
			}
		},
		fail: (err) => {
			console.error('支付请求失败:', err);
			uni.showToast({
				title: '支付请求失败',
				icon: 'none'
			});
		},
		complete: () => {
			uni.hideLoading();
		}
	});
}
</script>

<style>
.header {
	display: flex;
	align-items: center;
	padding: 20rpx;
	border-bottom: 1px solid #eee;
	margin-top: 50px;
}

.back {
	font-size: 36rpx;
	margin-right: 20rpx;
}

.title {
	font-size: 32rpx;
	font-weight: bold;
}

.order-container {
	padding: 30rpx;
}

.loading,
.error,
.empty {
	text-align: center;
	padding: 40rpx;
	color: #909399;
}

.order-card {
	background: #fff;
	border-radius: 16rpx;
	margin: 20rpx;
	padding: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.order-header {
	display: flex;
	justify-content: space-between;
	padding-bottom: 20rpx;
	border-bottom: 1rpx solid #f5f5f5;
	margin-bottom: 20rpx;
}

.order-sn {
	font-size: 26rpx;
	color: #666;
}

.order-status {
	font-size: 26rpx;
	color: #f56c6c;
}

.order-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 0;
	border-bottom: 1px solid #f0f0f0;
}

.item-image {
	width: 60px;
	height: 60px;
	border-radius: 8px;
	margin-right: 12px;
}

.item-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.item-name {
	font-weight: 600;
	font-size: 15px;
}

.item-spec {
	font-size: 13px;
	color: #999;
}

.item-right {
	text-align: right;
}

.item-price {
	color: #fa541c;
	font-weight: bold;
}

.item-quantity {
	color: #666;
	font-size: 13px;
}

.order-base-info {
	padding: 20rpx;
	background: #f9f9f9;
	border-radius: 8rpx;
	margin-bottom: 20rpx;
}

.info-item {
	display: flex;
	margin-bottom: 16rpx;
	font-size: 28rpx;
}

.info-label {
	color: #666;
	width: 160rpx;
}

.info-value {
	color: #333;
	flex: 1;
}

.payment-methods {
	margin-top: 30rpx;
	padding-top: 20rpx;
	border-top: 1rpx solid #f5f5f5;
}

.section-title {
	display: block;
	font-size: 30rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
}

.payment-method {
	display: flex;
	align-items: center;
	padding: 24rpx 0;
	border-bottom: 1rpx solid #f5f5f5;
}

.method-icon {
	width: 44rpx;
	height: 44rpx;
	margin-right: 20rpx;
}

.method-text {
	font-size: 28rpx;
	flex: 1;
}

.method-radio {
	margin-left: auto;
	transform: scale(0.9);
}

.footer {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	padding: 20rpx;
	background: #fff;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.total {
	font-size: 28rpx;
	margin-right: auto;
}

.amount {
	color: #f56c6c;
	font-weight: bold;
}

.pay-btn {
	background: #409eff;
	color: #fff;
	border-radius: 40rpx;
	padding: 0 40rpx;
	margin-right: 0rpx;
}
</style>
