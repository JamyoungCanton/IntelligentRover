<template>
	<div class="chat-container">
		<!-- 消息展示区域 -->
		<div class="messages-container">
			<div v-for="(message, index) in messages" :key="index"
				:class="['message', message.isUser ? 'user-message' : 'system-message']">
				<div class="message-content">
					<!-- 用户消息 -->
					<template v-if="message.isUser">
						{{ message.content }}
					</template>
					<!-- 系统消息（tripData渲染） -->
					<template v-else>
						<div class="trip-container">
							<div v-for="(item, idx) in message.content" :key="idx">
								<div v-if="item.type === 'text'" class="text-content">
									{{ item.content }}
								</div>
								<div v-else-if="item.type === '行程概览'" class="trip-section">
									<h3>{{ item.content.split('<br>')[0] }}</h3>
									<p>{{ item.content.split('<br>')[1] }}</p>
								</div>
								<div v-else-if="item.type === '行程安排'" class="trip-section">
									<h3>{{ item.content }}</h3>
								</div>
								<div v-else-if="item.type === '行程日'" class="trip-day">
									<h4>{{ item.content }}</h4>
								</div>
								<div v-else-if="item.type === 'transport'" class="trip-item transport clickable-span"
									@click="handleItemClick(item)">
									{{ item.content }}
								</div>
								<div v-else-if="item.type === 'accommodation'"
									class="trip-item accommodation clickable-span" @click="handleItemClick(item)">
									{{ item.content }}
								</div>
								<div v-else-if="item.type === 'restaurant'" class="trip-item restaurant clickable-span"
									@click="handleItemClick(item)">
									{{ item.content }}
								</div>
								<div v-else-if="item.type === 'activity'" class="trip-item activity clickable-span"
									@click="handleItemClick(item)">
									{{ item.content }}
								</div>
								<div v-else-if="item.type === '推荐亮点'" class="trip-section">
									<h3>{{ item.content }}</h3>
								</div>
								<div v-else-if="item.type === '注意事项'" class="trip-section">
									<h3>{{ item.content }}</h3>
								</div>
								<div v-else-if="item.type === '总结'" class="trip-section">
									<h3>{{ item.content.split('<br>')[0] }}</h3>
									<p>{{ item.content.split('<br>')[1] }}</p>
								</div>
								<div v-else-if="item.type === '价格'" class="price-section">
									<div class="price-info">
										<div class="price">
											<span class="price-symbol">¥</span>
											<span class="price-value">{{ item.content.split(' ')[0].substring(1)
												}}</span>
										</div>
										<div class="price-details">{{ item.content.split(' ')[1] }}</div>
									</div>
								</div>
								<div v-else-if="item.type === '优惠'" class="discount">
									优惠: <span class="discount-value">{{ item.content.substring(3) }}</span>
								</div>
								<div v-else-if="item.type === '按钮'" class="ai-comfirm-button" @click="confirmTrip">
									{{ item.content }}
								</div>
								<hr v-else-if="item.type === 'divider'" class="divider">
							</div>
						</div>
					</template>
				</div>
			</div>
		</div>

		<!-- 底部输入区域 -->
		<div class="input-container">
			<input type="text" v-model="userInput" class="message-input" @keyup.enter="sendMessage"
				placeholder="请输入您的问题...">
			<button class="send-button" @click="sendMessage">发送</button>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			userInput: '',
			messages: [],
			tripData: [
				{
					type: "text",
					id: "",
					content: "据您的需求，我建议如下行程：✅"
				},
				{
					type: "行程概览",
					id: "",
					content: '📝 行程概览<br>📍 本次行程将围绕"海钓"这一核心活动展开，结合万山岛的特色景点和便利交通，为您打造一次难忘的海岛体验。'
				},
				{
					type: "divider",
					id: "",
					content: ""
				},
				{
					type: "行程安排",
					id: "",
					content: "⏱️ 行程安排"
				},
				{
					type: "行程日",
					id: "day1",
					content: "⏰ 第一天：抵达与准备"
				},
				{
					type: "transport",
					id: "1",
					content: "🚢 1-船 从出发地乘船前往万山岛，建议选择上午的班次（8:00或10:00）。"
				},
				{
					type: "accommodation",
					id: "2",
					content: "🏠 2-万山渔家乐 办理入住，稍作休息。"
				},
				{
					type: "restaurant",
					id: "3",
					content: "🍽️ 3-碧海鱼排 享用午餐，品尝新鲜海鲜。"
				},
				{
					type: "activity",
					id: "4",
					content: "🎣 4-海钓 下午开始海钓活动，体验3-4小时的海钓乐趣。"
				},
				{
					type: "accommodation",
					id: "5",
					content: "🏠 5-万山渔家乐 晚餐后返回酒店休息。"
				},
				{
					type: "行程日",
					id: "day2",
					content: "⏰ 第二天：探索与返程"
				},
				{
					type: "restaurant",
					id: "6",
					content: "🍽️ 6-岛上咖啡馆 享用早餐。"
				},
				{
					type: "activity",
					id: "7",
					content: "🎣 7-海钓 上午继续海钓活动，享受海钓的乐趣。"
				},
				{
					type: "restaurant",
					id: "8",
					content: "🍽️ 8-岛上美食坊 午餐后稍作休息。"
				},
				{
					type: "transport",
					id: "9",
					content: "🚢 9-船 下午乘船返程，建议选择13:30的班次。"
				},
				{
					type: "divider",
					id: "",
					content: ""
				},
				{
					type: "推荐亮点",
					id: "",
					content: "📊 推荐亮点"
				},
				{
					type: "activity",
					id: "10",
					content: "🎣 1-海钓 海钓活动是本次行程的核心，适合中等难度的钓鱼爱好者，价格800元。"
				},
				{
					type: "accommodation",
					id: "11",
					content: "🏠 2-万山渔家乐 海景房住宿，价格500元，评分4.2，环境舒适。"
				},
				{
					type: "restaurant",
					id: "12",
					content: "🍽️ 3-碧海鱼排 提供新鲜海鲜，价格为200元。"
				},
				{
					type: "divider",
					id: "",
					content: ""
				},
				{
					type: "注意事项",
					id: "",
					content: "❓ 注意事项"
				},
				{
					type: "text",
					id: "",
					content: "海钓活动需提前预约，建议联系当地旅行社或酒店安排。"
				},
				{
					type: "text",
					id: "",
					content: "船票价格100元，建议提前购票以确保座位。"
				},
				{
					type: "divider",
					id: "",
					content: ""
				},
				{
					type: "总结",
					id: "",
					content: "✉️ 总结<br>本次行程以海钓为核心，结合万山岛的特色餐饮和住宿，为您提供一次轻松愉快的海岛体验。如有其他需求或问题，欢迎随时联系！"
				},
				{
					type: "divider",
					id: "",
					content: ""
				},
				{
					type: "价格",
					id: "",
					content: "¥988 含往返交通、住宿、活动费用"
				},
				{
					type: "优惠",
					id: "",
					content: "优惠: ¥428元"
				},
				{
					type: "按钮",
					id: "",
					content: "确认行程"
				}
			]
		};
	},
	methods: {
		sendMessage() {
			if (!this.userInput.trim()) return;

			// 添加用户消息
			this.messages.push({
				isUser: true,
				content: this.userInput
			});

			// 模拟系统回复，使用现有的tripData
			setTimeout(() => {
				this.messages.push({
					isUser: false,
					content: this.tripData
				});
			}, 500);

			// 清空输入框
			this.userInput = '';

			// 滚动到底部
			this.$nextTick(() => {
				const container = document.querySelector('.messages-container');
				container.scrollTop = container.scrollHeight;
			});
		},
		handleItemClick(item) {
			console.log(`点击了${item.type}: ${item.content}`);

			const pageMap = {
				transport: '/pages/ticketBooking/ticketBooking',
				accommodation: '/pages/hotelBooking/hotelBooking',
				restaurant: '/pages/Orders/Orders',
				activity: '/pages/activity/activity'
			};

			const pagePath = pageMap[item.type];

			if (pagePath) {
				uni.navigateTo({
					url: pagePath
				});
			} else {
				uni.showToast({
					title: '功能尚未实现',
					icon: 'none'
				});
			}
		},
		confirmTrip() {
			console.log('行程已确认！');
			uni.navigateTo({
				url: '/pages/payment/payment'
			});
		}
	}
};
</script>

<style scoped>
.chat-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f5f5f5;
}

.messages-container {
	flex: 1;
	padding: 20px;
	overflow-y: auto;
}

.message {
	margin-bottom: 20px;
	display: flex;
	flex-direction: column;
}

.message-content {
	max-width: 80%;
	padding: 12px;
	border-radius: 8px;
	word-wrap: break-word;
}

.user-message {
	align-items: flex-end;
}

.user-message .message-content {
	background-color: #007AFF;
	color: white;
}

.system-message {
	align-items: flex-start;
}

.system-message .message-content {
	background-color: white;
	color: #333;
}

.input-container {
	display: flex;
	padding: 15px;
	background-color: white;
	border-top: 1px solid #e0e0e0;
}

.message-input {
	flex: 1;
	padding: 10px;
	border: 1px solid #e0e0e0;
	border-radius: 4px;
	margin-right: 10px;
	font-size: 16px;
}

.send-button {
	padding: 10px 20px;
	background-color: #007AFF;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 16px;
}

.send-button:hover {
	background-color: #0056b3;
}

/* 保留原有的样式 */
.trip-container {
	padding: 20px;
}

.text-content {
	margin-bottom: 10px;
}

.trip-section {
	margin-bottom: 20px;
}

.trip-day {
	margin-bottom: 15px;
}

.trip-item {
	margin-bottom: 10px;
	padding: 5px 0;
}

.transport,
.accommodation,
.restaurant,
.activity {
	cursor: pointer;
	padding: 5px;
	border-radius: 4px;
}

.transport {
	background-color: #e0f7fa;
}

.accommodation {
	background-color: #fff8e1;
}

.restaurant {
	background-color: #f3e5f5;
}

.activity {
	background-color: #e8f5e9;
}

.clickable-span {
	display: inline-block;
}

.divider {
	border: none;
	border-top: 1px solid #ddd;
	margin: 20px 0;
}

.price-section {
	margin: 20px 0;
}

.price {
	font-size: 24px;
	font-weight: bold;
}

.discount {
	color: #e53935;
	font-weight: bold;
}

.ai-comfirm-button {
	display: inline-block;
	padding: 10px 20px;
	background-color: #42b983;
	color: white;
	border-radius: 4px;
	cursor: pointer;
	margin-top: 20px;
}
</style>