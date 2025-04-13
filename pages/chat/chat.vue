<template>
	<view class="container" :key="globalUpdateKey">
		<!-- Header -->
		<view class="header">
			<view class="back-icon avatar ai-avatar" @tap="goBack"></view>
			<view class="title">AI旅游助手</view>
			<view class="more-icon avatar ai-avatar" @tap="showMore">
				<image src="/static/chat/more.png"></image>
			</view>
		</view>

		<!-- Chat Container -->
		<scroll-view scroll-y class="chat-container" :scroll-top="scrollTop" scroll-with-animation
			:scroll-into-view="scrollIntoView" :scroll-anchoring="true" enhanced :show-scrollbar="false"
			@scrolltoupper="onScrollToUpper" @scroll="onScroll" style="margin-top: 30px">
			<!-- AI Welcome Message -->
			<view class="message ai-message" id="msg-0">
				<view class="avatar ai-avatar">
					<image src="/static/chat/robot-avatar.png" mode="aspectFill"></image>
				</view>
				<view class="message-content">
					<text>欢迎使用AI旅游助手！我可以帮您规划完美的海岛之旅。您可以选择以下热门选项，或直接告诉我您的需求。</text>

					<!-- Category Options -->
					<view class="category-container">
						<view v-for="(item, index) in categories" :key="index" class="category-item"
							@tap="() => selectCategory(item.id)">
							<image :src="item.icon" mode="aspectFit"></image>
							<text>{{ item.name }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- Chat Messages -->
			<block v-for="(msg, index) in chatMessages" :key="index">
				<!-- User Message -->
				<view v-if="msg.type === 'user'" class="message user-message" :id="`msg-${index + 1}`">
					<view class="avatar user-avatar">
						<image src="/static/chat/user.png"></image>
					</view>
					<view class="message-content">
						<text>{{ msg.content }}</text>
					</view>
				</view>

				<!-- AI Response -->
				<view v-else class="message ai-message" :id="`msg-${index + 1}`"
					:key="`${msg.id || index}-${updateCounter}`">
					<view class="avatar ai-avatar">
						<image src="/static/chat/robot-avatar.png" mode="aspectFill"></image>
					</view>
					<view class="message-content">
						<!-- 思考中状态 -->
						<view v-if="msg.thinking" class="thinking-container">
							{{ msg.content }}
						</view>
						<!-- 结构化回复模板 -->
						<view v-else-if="Array.isArray(msg.content)" class="trip-container">
							<block v-for="(item, idx) in msg.content" :key="`${idx}-${updateCounter}`">
								<!-- 打字机效果的文本内容（带闪烁光标） -->
								<view v-if="item.type === 'text'" class="text-content" :class="{
                  typing: msg.typing && idx === msg.content.length - 1,
                }" v-html="item.content">
								</view>
								<view v-else-if="item.type === 'Transport'" class="trip-item transport clickable-span"
									@tap="handleItemClick(item)">
									{{ item.content }}
								</view>
								<view v-else-if="item.type === 'Accommodation'"
									class="trip-item accommodation clickable-span" @tap="handleItemClick(item)">
									{{ item.content }}
								</view>
								<view v-else-if="item.type === 'Restaurant'" class="trip-item restaurant clickable-span"
									@tap="handleItemClick(item)">
									{{ item.content }}
								</view>
								<view v-else-if="item.type === 'Activity'" class="trip-item activity clickable-span"
									@tap="handleItemClick(item)">
									{{ item.content }}
								</view>
								<view v-else-if="item.type === 'Attraction'" class="trip-item attraction clickable-span"
									@tap="handleItemClick(item)">
									{{ item.content }}
								</view>
								<view v-else-if="item.type === '价格'" class="price-section">
									<view class="price-info">
										<view class="price">
											<span class="price-symbol">¥</span>
											<span class="price-value">{{
                        item.content.split(" ")[0].substring(1)
                      }}</span>
										</view>
										<view class="price-details">{{
                      item.content.split(" ")[1]
                    }}</view>
									</view>
								</view>
								<view v-else-if="item.type === '优惠'" class="discount">
									优惠:
									<span class="discount-value">{{
                    item.content.substring(3)
                  }}</span>
								</view>
								<view v-else-if="item.type === '按钮'" class="ai-comfirm-button" @tap="confirmTrip">
									{{ item.content }}
								</view>
							</block>

							<!-- 总金额显示 -->
							<view v-if="msg.totalAmount" class="total-amount">
								总金额: ¥{{ msg.totalAmount }}
							</view>

							<!-- 确认行程按钮 -->
							<view class="confirm-trip-button" @tap="confirmTrip(msg)">
								确认行程
							</view>
						</view>
					</view>
				</view>
			</block>
		</scroll-view>

		<!-- Input Area -->
		<view class="input-container" :style="{ paddingBottom: safeAreaBottom + 'px' }">
			<view class="add-icon avatar ai-avatar" @tap="showAddOptions" style="background-color: #f5f5f5">
				<image src="/static/chat/add.png"></image>
			</view>
			<input class="message-input" type="text" v-model="inputMessage" placeholder="输入您的需求"
				@confirm="sendMessage" />
			<view class="send-icon avatar ai-avatar" @tap="sendMessage">
				<image src="/static/chat/send.png"></image>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		ref,
		reactive,
		onMounted,
		nextTick,
		computed
	} from "vue";
	import {
		useUserStore
	} from "@/store";
	import {
		marked
	} from "marked";

	export default {
		setup() {
			// 确保marked是可用的
			const markdownParser =
				typeof marked === "function" ? marked : (text) => text;

			// 配置marked选项
			if (typeof marked === "object" && marked.setOptions) {
				marked.setOptions({
					renderer: new marked.Renderer(),
					gfm: true,
					breaks: true,
					pedantic: false,
					sanitize: false,
					smartLists: true,
					smartypants: true,
				});
			}
			// 引入 store
			const userStore = useUserStore();
			const token = computed(() => userStore.token);

			// 全局强制更新键
			const globalUpdateKey = ref(0);
			// 强制更新计数器
			const updateCounter = ref(0);
			// Reactive data
			const inputMessage = ref("");
			const scrollTop = ref(0);
			const scrollIntoView = ref("");
			// 是否允许自动滚动（当用户向上滚动查看历史消息时禁用）
			const enableAutoScroll = ref(true);
			// 记录最后一次的滚动位置
			const lastScrollTop = ref(0);
			// 记录内容的总高度
			const contentHeight = ref(0);
			// 记录可视区域的高度
			const viewportHeight = ref(0);

			// Category data
			const categories = reactive([{
					id: "fishing",
					name: "海钓体验",
					icon: "https://wlmtsys.com:9000/travel/fishing.jpg",
				},
				{
					id: "snorkeling",
					name: "浮潜探索",
					icon: "https://wlmtsys.com:9000/travel/snorkeling.jpg",
				},
				{
					id: "family",
					name: "亲子娱乐",
					icon: "https://wlmtsys.com:9000/travel/family.jpg",
				},
				{
					id: "leisure",
					name: "休闲畅游",
					icon: "https://wlmtsys.com:9000/travel/leisure.jpg",
				},
				{
					id: "island",
					name: "海岛介绍",
					icon: "https://wlmtsys.com:9000/travel/island.jpg",
				},
			]);

			// Chat messages，这个一定，一定，不能删，删了发消息会报错
			const chatMessages = reactive([]);

			// 处理可点击元素的点击事件
			const handleItemClick = (item) => {
				console.log(`点击了${item.type}: ${item.content}`);

				const pageMap = {
					Transport: "/pages/ticketBooking/ticketBooking",
					Accommodation: "/pages/hotelBooking/hotelBooking",
					Restaurant: "/pages/Orders/Orders",
					Activity: "/pages/activity/activity",
				};

				const pagePath = pageMap[item.type];

				if (pagePath) {
					uni.navigateTo({
						url: pagePath,
					});
				} else {
					uni.showToast({
						title: "功能尚未实现",
						icon: "none",
					});
				}
			};

			// 确认行程并跳转到支付页面
			const confirmTrip = () => {
				console.log('行程已确认！');
				uni.navigateTo({
					url: "/pages/payment/payment",
				});
			};

			// Methods
			const selectCategory = (categoryId) => {
				console.log("Selected category:", categoryId);
				chatMessages.push({
					type: "user",
					content: `我想了解${getCategoryName(categoryId)}的详细信息`,
				});
				scrollToLatestMessage();


				// 模拟AI回复2
				AIAnswerThinking2(`我想了解${getCategoryName(categoryId)}的详细信息`)
			};

			const getCategoryName = (categoryId) => {
				const category = categories.find((item) => item.id === categoryId);
				return category ? category.name : "";
			};

			const sendMessage = () => {
				if (!inputMessage.value.trim()) return;

				if (!token.value) {
					uni.showToast({
						title: "请先登录",
						icon: "none",
						duration: 2000,
					});

					setTimeout(() => {
						uni.navigateTo({
							url: "/pages/login/login",
						});
					}, 2000);
					return;
				}

				chatMessages.push({
					type: 'user',
					content: inputMessage.value
				});


				// ----------------------------------------------------
				let deadAnswerDict = {
					"海钓": [{
							type: "text",
							id: "",
							content: "根据您的需求，我建议如下行程：✅"
						},
						{
							type: "text",
							id: "",
							content: "📝 行程概述："
						},
						{
							type: "text",
							id: "",
							content: "您的主要兴趣是海钓，因此我将为您设计一个以海钓为核心的万山岛旅游行程。以下是基于现有数据的推荐："
						},
						{
							type: "text",
							id: "",
							content: "🗺️ 行程安排："
						},
						{
							type: "text",
							id: "",
							content: "1. 抵达万山岛"
						},
						{
							type: "text",
							id: "",
							content: "   - 交通："
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: " 或 "
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "   - 时间：根据船班时间安排"
						},
						{
							type: "text",
							id: "",
							content: "2. 海钓活动"
						},
						{
							type: "text",
							id: "",
							content: "   - 活动："
						},
						{
							type: "Activity",
							id: "1",
							content: "海钓"
						},
						{
							type: "text",
							id: "",
							content: "   - 时长：3-4小时"
						},
						{
							type: "text",
							id: "",
							content: "   - 难度：中等"
						},
						{
							type: "text",
							id: "",
							content: "   - 费用：800元"
						},
						{
							type: "text",
							id: "",
							content: "3. 住宿推荐"
						},
						{
							type: "text",
							id: "",
							content: "   - "
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: " 或 "
						},
						{
							type: "Accommodation",
							id: "5",
							content: "万山岛海滨酒店"
						},
						{
							type: "text",
							id: "",
							content: "4. 餐饮推荐"
						},
						{
							type: "text",
							id: "",
							content: "   - "
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: " 或 "
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "📊 数据审查："
						},
						{
							type: "text",
							id: "",
							content: "- 海钓活动信息："
						},
						{
							type: "Activity",
							id: "1",
							content: "海钓"
						},
						{
							type: "text",
							id: "",
							content: "，时长3-4小时，费用800元"
						},
						{
							type: "text",
							id: "",
							content: "- 住宿选择："
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: " 或 "
						},
						{
							type: "Accommodation",
							id: "5",
							content: "万山岛海滨酒店"
						},
						{
							type: "text",
							id: "",
							content: "- 餐饮选择："
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: " 或 "
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "❓ 注意事项："
						},
						{
							type: "text",
							id: "",
							content: "- 请提前确认船班时间，以便安排行程。"
						},
						{
							type: "text",
							id: "",
							content: "- 海钓活动需提前预约，建议联系当地旅行社或酒店安排。"
						},
						{
							type: "text",
							id: "",
							content: "💬 总结推荐："
						},
						{
							type: "text",
							id: "",
							content: "以上行程专注于您的海钓兴趣，同时提供了舒适的住宿和美味的餐饮选择。希望您在万山岛度过一个愉快的海钓之旅！"
						}
					],
					"浮潜": [{
							type: "text",
							id: "",
							content: "根据您的需求，我建议如下行程：✅"
						},
						{
							type: "text",
							id: "",
							content: "📝 行程概述："
						},
						{
							type: "text",
							id: "",
							content: "您对浮潜活动表现出浓厚兴趣，因此我将为您设计一个以浮潜为核心的万山岛探索行程。以下是基于现有数据的推荐："
						},
						{
							type: "text",
							id: "",
							content: "🗺️ 行程安排："
						},
						{
							type: "text",
							id: "",
							content: "Day 1:"
						},
						{
							type: "text",
							id: "",
							content: "⏰ 上午：抵达万山岛"
						},
						{
							type: "text",
							id: "",
							content: "🚗 交通：建议乘坐"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "，从出发地前往万山岛，预计航程约2小时。"
						},
						{
							type: "text",
							id: "",
							content: "📍 活动：抵达后，前往"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "办理入住，稍作休息。"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 午餐：在"
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "享用当地海鲜。"
						},
						{
							type: "text",
							id: "",
							content: "⏰ 下午：浮潜初体验"
						},
						{
							type: "text",
							id: "",
							content: "📍 活动：前往"
						},
						{
							type: "Activity",
							id: "2",
							content: "浮潜"
						},
						{
							type: "text",
							id: "",
							content: "，在专业教练的指导下，探索万山岛周边的海底世界，预计活动时间2-3小时。"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 晚餐：在"
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "品尝更多海鲜美食。"
						},
						{
							type: "text",
							id: "",
							content: "Day 2:"
						},
						{
							type: "text",
							id: "",
							content: "⏰ 上午：继续浮潜探索"
						},
						{
							type: "text",
							id: "",
							content: "📍 活动：再次体验"
						},
						{
							type: "Activity",
							id: "2",
							content: "浮潜"
						},
						{
							type: "text",
							id: "",
							content: "，深入探索不同的浮潜点，发现更多海洋生物。"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 午餐：在"
						},
						{
							type: "Restaurant",
							id: "10",
							content: "岛上美食坊"
						},
						{
							type: "text",
							id: "",
							content: "享用午餐。"
						},
						{
							type: "text",
							id: "",
							content: "⏰ 下午：自由活动"
						},
						{
							type: "text",
							id: "",
							content: "📍 活动：您可以选择在岛上自由活动，或者再次体验浮潜。"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 晚餐：在"
						},
						{
							type: "Restaurant",
							id: "2",
							content: "岛上咖啡馆"
						},
						{
							type: "text",
							id: "",
							content: "享用晚餐。"
						},
						{
							type: "text",
							id: "",
							content: "Day 3:"
						},
						{
							type: "text",
							id: "",
							content: "⏰ 上午：离开万山岛"
						},
						{
							type: "text",
							id: "",
							content: "🚗 交通：乘坐"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "返回出发地，结束愉快的万山岛之旅。"
						},
						{
							type: "text",
							id: "",
							content: "💡 注意事项："
						},
						{
							type: "text",
							id: "",
							content: "1. 浮潜活动需要一定的体力和水性，请根据自身情况选择是否参与。"
						},
						{
							type: "text",
							id: "",
							content: "2. 建议提前预订浮潜活动和住宿，以确保行程顺利。"
						},
						{
							type: "text",
							id: "",
							content: "3. 请关注天气情况，合理安排行程。"
						},
						{
							type: "text",
							id: "",
							content: "🗣️ 总结："
						},
						{
							type: "text",
							id: "",
							content: "以上行程以浮潜为核心，结合了万山岛的特色美食和舒适住宿，为您打造一个难忘的海岛探索之旅。希望这份推荐能够满足您的需求，祝您旅途愉快！"
						}
					],
					"亲子": [{
							type: "text",
							id: "",
							content: "根据您的需求，我建议如下行程：✅"
						},
						{
							type: "text",
							id: "",
							content: "📝 行程概述："
						},
						{
							type: "text",
							id: "",
							content: "您计划与家人（带儿童）一起前往万山岛，主要关注亲子娱乐活动。以下是为您设计的详细行程，确保适合家庭出游，并包含丰富的亲子体验。"
						},
						{
							type: "text",
							id: "",
							content: "🗺️ 行程安排："
						},
						{
							type: "text",
							id: "",
							content: "📅 建议天数：3天2夜"
						},
						{
							type: "text",
							id: "",
							content: "📌 第一天："
						},
						{
							type: "text",
							id: "",
							content: "- 上午：从出发地乘船前往万山岛。"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "- 中午：抵达后入住"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "，享用午餐"
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：前往"
						},
						{
							type: "Attraction",
							id: "2",
							content: "南沙湾"
						},
						{
							type: "text",
							id: "",
							content: "，享受沙滩浴场，适合儿童玩耍。"
						},
						{
							type: "text",
							id: "",
							content: "- 晚上：在"
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "享用晚餐。"
						},
						{
							type: "text",
							id: "",
							content: "📌 第二天："
						},
						{
							type: "text",
							id: "",
							content: "- 上午：参加"
						},
						{
							type: "Activity",
							id: "2",
							content: "浮潜"
						},
						{
							type: "text",
							id: "",
							content: "，适合亲子一起体验海洋生物。"
						},
						{
							type: "text",
							id: "",
							content: "- 中午：在"
						},
						{
							type: "Restaurant",
							id: "10",
							content: "岛上美食坊"
						},
						{
							type: "text",
							id: "",
							content: "享用午餐。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：前往"
						},
						{
							type: "Attraction",
							id: "10",
							content: "珊瑚礁区"
						},
						{
							type: "text",
							id: "",
							content: "，观赏美丽的珊瑚礁。"
						},
						{
							type: "text",
							id: "",
							content: "- 晚上：返回酒店休息，享用晚餐"
						},
						{
							type: "Restaurant",
							id: "7",
							content: "咖啡小屋"
						},
						{
							type: "text",
							id: "",
							content: "。"
						},
						{
							type: "text",
							id: "",
							content: "📌 第三天："
						},
						{
							type: "text",
							id: "",
							content: "- 上午：参加"
						},
						{
							type: "Activity",
							id: "3",
							content: "徒步"
						},
						{
							type: "text",
							id: "",
							content: "，探索岛屿的自然风光。"
						},
						{
							type: "text",
							id: "",
							content: "- 中午：在"
						},
						{
							type: "Restaurant",
							id: "2",
							content: "岛上咖啡馆"
						},
						{
							type: "text",
							id: "",
							content: "享用午餐。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：乘船返回出发地。"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "🚗 交通建议："
						},
						{
							type: "text",
							id: "",
							content: "- 往返万山岛可选择"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "或"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "，具体时间根据您的出发地安排。"
						},
						{
							type: "text",
							id: "",
							content: "🏨 住宿建议："
						},
						{
							type: "text",
							id: "",
							content: "- 推荐入住"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "，提供海景房，适合家庭入住。"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 餐饮建议："
						},
						{
							type: "text",
							id: "",
							content: "- 推荐尝试"
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "和"
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "，提供丰富的海鲜选择。"
						},
						{
							type: "text",
							id: "",
							content: "❓ 注意事项："
						},
						{
							type: "text",
							id: "",
							content: "- 请提前确认船票和住宿预订，确保行程顺利。"
						},
						{
							type: "text",
							id: "",
							content: "- 亲子活动如浮潜和徒步，请根据儿童年龄和体力情况选择适合的活动。"
						},
						{
							type: "text",
							id: "",
							content: "💬 总结："
						},
						{
							type: "text",
							id: "",
							content: "以上行程专为家庭设计，包含丰富的亲子娱乐活动，确保您和孩子们在万山岛度过一个愉快的假期。如有其他需求或问题，请随时联系我。"
						}
					],
					"娱乐": [{
							type: "text",
							id: "",
							content: "根据您的需求，我建议如下行程：✅"
						},
						{
							type: "text",
							id: "",
							content: "📝 行程概述："
						},
						{
							type: "text",
							id: "",
							content: "您主要关注娱乐活动。以下是为您设计的详细行程，确保适合家庭出游。"
						},
						{
							type: "text",
							id: "",
							content: "🗺️ 行程安排："
						},
						{
							type: "text",
							id: "",
							content: "📅 建议天数：3天2夜"
						},
						{
							type: "text",
							id: "",
							content: "📌 第一天："
						},
						{
							type: "text",
							id: "",
							content: "- 上午：从出发地乘船前往万山岛。"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "- 中午：抵达后入住"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "，享用午餐"
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：前往"
						},
						{
							type: "Attraction",
							id: "2",
							content: "南沙湾"
						},
						{
							type: "text",
							id: "",
							content: "，享受沙滩浴场，适合儿童玩耍。"
						},
						{
							type: "text",
							id: "",
							content: "- 晚上：在"
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "享用晚餐。"
						},
						{
							type: "text",
							id: "",
							content: "📌 第二天："
						},
						{
							type: "text",
							id: "",
							content: "- 上午：参加"
						},
						{
							type: "Activity",
							id: "2",
							content: "浮潜"
						},
						{
							type: "text",
							id: "",
							content: "，适合亲子一起体验海洋生物。"
						},
						{
							type: "text",
							id: "",
							content: "- 中午：在"
						},
						{
							type: "Restaurant",
							id: "10",
							content: "岛上美食坊"
						},
						{
							type: "text",
							id: "",
							content: "享用午餐。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：前往"
						},
						{
							type: "Attraction",
							id: "10",
							content: "珊瑚礁区"
						},
						{
							type: "text",
							id: "",
							content: "，观赏美丽的珊瑚礁。"
						},
						{
							type: "text",
							id: "",
							content: "- 晚上：返回酒店休息，享用晚餐"
						},
						{
							type: "Restaurant",
							id: "7",
							content: "咖啡小屋"
						},
						{
							type: "text",
							id: "",
							content: "。"
						},
						{
							type: "text",
							id: "",
							content: "📌 第三天："
						},
						{
							type: "text",
							id: "",
							content: "- 上午：参加"
						},
						{
							type: "Activity",
							id: "3",
							content: "徒步"
						},
						{
							type: "text",
							id: "",
							content: "，探索岛屿的自然风光。"
						},
						{
							type: "text",
							id: "",
							content: "- 中午：在"
						},
						{
							type: "Restaurant",
							id: "2",
							content: "岛上咖啡馆"
						},
						{
							type: "text",
							id: "",
							content: "享用午餐。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：乘船返回出发地。"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "🚗 交通建议："
						},
						{
							type: "text",
							id: "",
							content: "- 往返万山岛可选择"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "或"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "，具体时间根据您的出发地安排。"
						},
						{
							type: "text",
							id: "",
							content: "🏨 住宿建议："
						},
						{
							type: "text",
							id: "",
							content: "- 推荐入住"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "，提供海景房，适合家庭入住。"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 餐饮建议："
						},
						{
							type: "text",
							id: "",
							content: "- 推荐尝试"
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "和"
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "，提供丰富的海鲜选择。"
						},
						{
							type: "text",
							id: "",
							content: "❓ 注意事项："
						},
						{
							type: "text",
							id: "",
							content: "- 请提前确认船票和住宿预订，确保行程顺利。"
						},
						{
							type: "text",
							id: "",
							content: "- 亲子活动如浮潜和徒步，请根据儿童年龄和体力情况选择适合的活动。"
						},
						{
							type: "text",
							id: "",
							content: "💬 总结："
						},
						{
							type: "text",
							id: "",
							content: "以上行程专为家庭设计，包含丰富的亲子娱乐活动，确保您和孩子们在万山岛度过一个愉快的假期。如有其他需求或问题，请随时联系我。"
						}
					],
					"休闲": [{
							type: "text",
							id: "",
							content: "根据您的需求，我建议如下行程：✅"
						},
						{
							type: "text",
							id: "",
							content: "✅ 根据您的需求，我为您设计了一份万山岛休闲畅游的行程推荐。以下是详细信息："
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "🗺️ 行程概览"
						},
						{
							type: "text",
							id: "",
							content: "本次行程以放松和享受自然为主，适合休闲旅行者。以下是每日安排："
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "📅 第一天：抵达与探索"
						},
						{
							type: "text",
							id: "",
							content: "🕒 时间：全天"
						},
						{
							type: "text",
							id: "",
							content: "📍 地点：万山岛"
						},
						{
							type: "text",
							id: "",
							content: "🚗 交通：建议选择"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "或"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "前往万山岛。"
						},
						{
							type: "text",
							id: "",
							content: "🏨 住宿：推荐入住"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "或"
						},
						{
							type: "Accommodation",
							id: "5",
							content: "万山岛海滨酒店"
						},
						{
							type: "text",
							id: "",
							content: "，享受舒适的海景房。"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 餐饮：晚餐可选择"
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "，品尝新鲜的海鲜。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "📅 第二天：自然与活动"
						},
						{
							type: "text",
							id: "",
							content: "🕒 时间：全天"
						},
						{
							type: "text",
							id: "",
							content: "📍 地点：万山岛"
						},
						{
							type: "text",
							id: "",
							content: "🎯 活动："
						},
						{
							type: "text",
							id: "",
							content: "- 上午：体验"
						},
						{
							type: "Activity",
							id: "2",
							content: "浮潜"
						},
						{
							type: "text",
							id: "",
							content: "，探索海底世界。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：选择"
						},
						{
							type: "Activity",
							id: "3",
							content: "徒步"
						},
						{
							type: "text",
							id: "",
							content: "，感受岛上的自然风光。"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 餐饮：午餐可在"
						},
						{
							type: "Restaurant",
							id: "10",
							content: "岛上美食坊"
						},
						{
							type: "text",
							id: "",
							content: "享用，晚餐推荐"
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "📅 第三天：放松与返程"
						},
						{
							type: "text",
							id: "",
							content: "🕒 时间：上午"
						},
						{
							type: "text",
							id: "",
							content: "📍 地点：万山岛"
						},
						{
							type: "text",
							id: "",
							content: "🎯 活动："
						},
						{
							type: "text",
							id: "",
							content: "- 上午：在岛上悠闲散步，享受宁静的海岛时光。"
						},
						{
							type: "text",
							id: "",
							content: "🚗 交通：选择"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "或"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "返回。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "📊 费用估算"
						},
						{
							type: "text",
							id: "",
							content: "- 交通：约200元/人（往返船票）。"
						},
						{
							type: "text",
							id: "",
							content: "- 住宿：约500-800元/晚（根据选择）。"
						},
						{
							type: "text",
							id: "",
							content: "- 餐饮：约200-250元/人/天。"
						},
						{
							type: "text",
							id: "",
							content: "- 活动：浮潜约300元/人，徒步免费。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "❓ 注意事项"
						},
						{
							type: "text",
							id: "",
							content: "- 请提前确认船班时间，避免延误。"
						},
						{
							type: "text",
							id: "",
							content: "- 建议携带防晒用品和舒适的徒步鞋。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "💬 总结"
						},
						{
							type: "text",
							id: "",
							content: "这份行程以休闲为主，结合自然探索和放松活动，适合希望在万山岛度过轻松假期的旅行者。如需进一步调整，请随时告知！"
						}
					],
					"海岛": [{
							type: "text",
							id: "",
							content: "根据您的需求，我为您整理了关于万山岛的详细介绍：✅"
						},
						{
							type: "text",
							id: "",
							content: "📝 根据您的需求，我为您整理了关于万山岛的详细介绍，以下是基于现有数据库信息的内容："
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "🗺️ 万山岛简介"
						},
						{
							type: "text",
							id: "",
							content: "万山岛是珠海市万山群岛中的一座美丽岛屿，以其自然风光和丰富的海洋资源而闻名。以下是关于万山岛的具体信息："
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "📊 万山岛基本信息"
						},
						{
							type: "text",
							id: "",
							content: "- 岛屿名称：万山岛"
						},
						{
							type: "text",
							id: "",
							content: "- 岛屿ID：102"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "🏖️ 推荐景点"
						},
						{
							type: "text",
							id: "",
							content: "目前数据库中关于万山岛的景点信息暂未提供，但您可以期待以下类型的体验："
						},
						{
							type: "text",
							id: "",
							content: "- 自然景观：如海滩、礁石、森林等。"
						},
						{
							type: "text",
							id: "",
							content: "- 文化地标：如灯塔、渔村等。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "🎣 推荐活动"
						},
						{
							type: "text",
							id: "",
							content: "万山岛适合以下活动（基于数据库中的通用活动推荐）："
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Activity",
							id: "1",
							content: "海钓"
						},
						{
							type: "text",
							id: "",
							content: "：适合喜欢钓鱼的游客，价格约800元，时长3-4小时。"
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Activity",
							id: "2",
							content: "浮潜"
						},
						{
							type: "text",
							id: "",
							content: "：适合探索海底世界，价格约300元，时长2-3小时。"
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Activity",
							id: "3",
							content: "徒步"
						},
						{
							type: "text",
							id: "",
							content: "：适合欣赏自然风光，免费，时长4-8小时。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "🏨 推荐住宿"
						},
						{
							type: "text",
							id: "",
							content: "以下是万山岛附近的住宿推荐："
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "：海景房，价格500元，评分4.2。"
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Accommodation",
							id: "5",
							content: "万山岛海滨酒店"
						},
						{
							type: "text",
							id: "",
							content: "：标准间，价格450元，评分4.1。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 推荐餐饮"
						},
						{
							type: "text",
							id: "",
							content: "以下是万山岛附近的餐饮推荐："
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "：价格约200元，营业时间11:00-21:00。"
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "：价格约250元，营业时间11:30-21:30。"
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Restaurant",
							id: "10",
							content: "岛上美食坊"
						},
						{
							type: "text",
							id: "",
							content: "：价格约180元，营业时间10:00-21:00。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "🚢 推荐交通"
						},
						{
							type: "text",
							id: "",
							content: "前往万山岛的交通方式主要为船，以下是推荐选项："
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "：价格100元，出发时间8:00、10:00、14:00。"
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "：价格100元，出发时间9:30、13:30。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "❓ 注意事项"
						},
						{
							type: "text",
							id: "",
							content: "- 目前数据库中关于万山岛的景点信息较少，建议您进一步咨询当地旅游部门或导游以获取更多详细信息。"
						},
						{
							type: "text",
							id: "",
							content: "- 活动价格和交通时间可能因季节或天气变化而调整，请提前确认。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "📢 如果您有更多具体需求（如预算、旅行日期、人数等），请告诉我，我可以为您进一步优化推荐！"
						}
					],
					"爬山": [{
							type: "text",
							id: "",
							content: "根据您的需求，我建议如下行程：✅"
						},
						{
							type: "text",
							id: "",
							content: "📝 行程概述："
						},
						{
							type: "text",
							id: "",
							content: "您的主要意图是进行徒步活动，因此我将为您设计一个以徒步为核心的万山岛旅行计划。以下是基于现有数据的推荐："
						},
						{
							type: "text",
							id: "",
							content: "🗺️ 行程安排："
						},
						{
							type: "text",
							id: "",
							content: "🕒 建议天数：1-2天"
						},
						{
							type: "text",
							id: "",
							content: "📍 第一天："
						},
						{
							type: "text",
							id: "",
							content: "- 上午：抵达万山岛，乘坐"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "从码头出发。"
						},
						{
							type: "text",
							id: "",
							content: "- 中午：在"
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "享用午餐。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：开始您的徒步之旅，体验"
						},
						{
							type: "Activity",
							id: "3",
							content: "徒步"
						},
						{
							type: "text",
							id: "",
							content: "，探索岛上的自然景观。"
						},
						{
							type: "text",
							id: "",
							content: "- 晚上：入住"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "，享受海景房。"
						},
						{
							type: "text",
							id: "",
							content: "📍 第二天："
						},
						{
							type: "text",
							id: "",
							content: "- 上午：继续徒步活动，欣赏岛上的美景。"
						},
						{
							type: "text",
							id: "",
							content: "- 中午：在"
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "享用午餐。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：根据您的兴趣，可以选择继续徒步或参观其他景点。"
						},
						{
							type: "text",
							id: "",
							content: "- 晚上：返回码头，乘坐"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "离开万山岛。"
						},
						{
							type: "text",
							id: "",
							content: "🚗 交通建议："
						},
						{
							type: "text",
							id: "",
							content: "- 往返万山岛的交通方式为船，推荐选择"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "或"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "，费用为100元。"
						},
						{
							type: "text",
							id: "",
							content: "🏨 住宿建议："
						},
						{
							type: "text",
							id: "",
							content: "- 推荐入住"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "，价格为500元，提供海景房，评分为4.2。"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 餐饮建议："
						},
						{
							type: "text",
							id: "",
							content: "- 午餐可以选择"
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "或"
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "，平均价格分别为200元和250元。"
						},
						{
							type: "text",
							id: "",
							content: "❓ 注意事项："
						},
						{
							type: "text",
							id: "",
							content: "- 由于您的预算范围、旅行日期和停留时间未知，建议您根据实际情况调整行程。"
						},
						{
							type: "text",
							id: "",
							content: "- 请确保在徒步活动中注意安全，穿着合适的装备。"
						},
						{
							type: "text",
							id: "",
							content: "💬 总结："
						},
						{
							type: "text",
							id: "",
							content: "这个行程以徒步为核心，结合了万山岛的自然景观和当地美食，为您提供了一个充实而愉快的旅行体验。希望这份推荐能满足您的需求，祝您旅途愉快！"
						}
					],
					"天气": [{
							type: "text",
							id: "",
							content: "U+2705 确认：根据您的需求，我了解到您希望获取万山岛的天气信息。然而，目前的数据库中没有包含具体的天气数据。以下是基于现有数据的万山岛旅游建议，供您参考："
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "U+1F5FA 地图/行程：**万山岛旅游行程推荐**"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "### U+1F4DD 笔记/分析：**行程概览**"
						},
						{
							type: "text",
							id: "",
							content: "- **推荐天数**：2-3天"
						},
						{
							type: "text",
							id: "",
							content: "- **主要活动**：自然景观探索、休闲放松、海上活动"
						},
						{
							type: "text",
							id: "",
							content: "- **适合人群**：家庭、朋友、情侣"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "### U+1F4DD 笔记/分析：**每日行程安排**"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "#### **第一天：抵达与探索**"
						},
						{
							type: "text",
							id: "",
							content: "- U+23F0 时间：上午"
						},
						{
							type: "text",
							id: "",
							content: "  - U+1F697 交通/物流：从珠海乘船前往万山岛 "
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: " 或 "
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "，船票价格为100元。"
						},
						{
							type: "text",
							id: "",
							content: "  - U+1F4CD 地点：抵达后入住 "
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: " 或 "
						},
						{
							type: "Accommodation",
							id: "5",
							content: "万山岛海滨酒店"
						},
						{
							type: "text",
							id: "",
							content: "。"
						},
						{
							type: "text",
							id: "",
							content: "- U+23F0 时间：下午"
						},
						{
							type: "text",
							id: "",
							content: "  - U+1F4CD 地点：在岛上自由漫步，欣赏自然风光。"
						},
						{
							type: "text",
							id: "",
							content: "  - U+1F4CD 地点：晚餐推荐 "
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: " 或 "
						},
						{
							type: "Restaurant",
							id: "10",
							content: "岛上美食坊"
						},
						{
							type: "text",
							id: "",
							content: "，品尝当地海鲜。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "#### **第二天：活动与休闲**"
						},
						{
							type: "text",
							id: "",
							content: "- U+23F0 时间：上午"
						},
						{
							type: "text",
							id: "",
							content: "  - U+1F4CD 地点：参加 "
						},
						{
							type: "Activity",
							id: "2",
							content: "浮潜"
						},
						{
							type: "text",
							id: "",
							content: "，探索海底世界，费用为300元。"
						},
						{
							type: "text",
							id: "",
							content: "- U+23F0 时间：下午"
						},
						{
							type: "text",
							id: "",
							content: "  - U+1F4CD 地点：体验 "
						},
						{
							type: "Activity",
							id: "1",
							content: "海钓"
						},
						{
							type: "text",
							id: "",
							content: "，费用为800元，适合喜欢挑战的游客。"
						},
						{
							type: "text",
							id: "",
							content: "  - U+1F4CD 地点：晚餐推荐 "
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "，享受丰盛的海鲜大餐。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "#### **第三天：返程**"
						},
						{
							type: "text",
							id: "",
							content: "- U+23F0 时间：上午"
						},
						{
							type: "text",
							id: "",
							content: "  - U+1F4CD 地点：在岛上享用早餐，推荐 "
						},
						{
							type: "Restaurant",
							id: "2",
							content: "岛上咖啡馆"
						},
						{
							type: "text",
							id: "",
							content: " 或 "
						},
						{
							type: "Restaurant",
							id: "7",
							content: "咖啡小屋"
						},
						{
							type: "text",
							id: "",
							content: "。"
						},
						{
							type: "text",
							id: "",
							content: "  - U+1F697 交通/物流：乘船返回珠海 "
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: " 或 "
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "### U+1F4DD 笔记/分析：**其他建议**"
						},
						{
							type: "text",
							id: "",
							content: "- U+1F4CA 数据/审查：万山岛以自然景观和海上活动为主，适合喜欢宁静和探索的游客。"
						},
						{
							type: "text",
							id: "",
							content: "- U+2753 疑问/缺口：由于天气信息缺失，建议出发前查询当地天气预报，以便更好地安排活动。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "U+1F4AC 沟通/呈现：希望以上行程建议对您有所帮助！如需进一步调整或补充信息，请随时告知。祝您旅途愉快！"
						}
					],
					"游泳": [{
							type: "text",
							id: "",
							content: "根据您的需求，我建议如下行程：✅"
						},
						{
							type: "text",
							id: "",
							content: "📝 **行程概述**"
						},
						{
							type: "text",
							id: "",
							content: "您提到想要游泳，因此我将为您推荐一个以水上活动为主的行程，主要集中在万山岛及其周边岛屿的沙滩浴场和自然景观。"
						},
						{
							type: "text",
							id: "",
							content: "🗺️ **行程安排**"
						},
						{
							type: "text",
							id: "",
							content: "**第一天：抵达与探索**"
						},
						{
							type: "text",
							id: "",
							content: "- 🕒 **时间**：上午"
						},
						{
							type: "text",
							id: "",
							content: "- 📍 **地点**：从珠海出发，乘坐"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "前往万山岛。"
						},
						{
							type: "text",
							id: "",
							content: "- 📍 **地点**：抵达后，前往"
						},
						{
							type: "Attraction",
							id: "2",
							content: "南沙湾"
						},
						{
							type: "text",
							id: "",
							content: "，享受阳光沙滩和游泳。"
						},
						{
							type: "text",
							id: "",
							content: "- 🕒 **时间**：下午"
						},
						{
							type: "text",
							id: "",
							content: "- 📍 **地点**：在"
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "享用午餐。"
						},
						{
							type: "text",
							id: "",
							content: "- 📍 **地点**：下午继续在"
						},
						{
							type: "Attraction",
							id: "7",
							content: "隐秘海滩"
						},
						{
							type: "text",
							id: "",
							content: "游泳和放松。"
						},
						{
							type: "text",
							id: "",
							content: "**第二天：水上活动**"
						},
						{
							type: "text",
							id: "",
							content: "- 🕒 **时间**：上午"
						},
						{
							type: "text",
							id: "",
							content: "- 📍 **地点**：参加"
						},
						{
							type: "Activity",
							id: "2",
							content: "浮潜"
						},
						{
							type: "text",
							id: "",
							content: "，探索海底世界。"
						},
						{
							type: "text",
							id: "",
							content: "- 🕒 **时间**：下午"
						},
						{
							type: "text",
							id: "",
							content: "- 📍 **地点**：在"
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "享用午餐。"
						},
						{
							type: "text",
							id: "",
							content: "- 📍 **地点**：下午自由活动，可以选择在"
						},
						{
							type: "Attraction",
							id: "10",
							content: "珊瑚礁区"
						},
						{
							type: "text",
							id: "",
							content: "附近游泳或休息。"
						},
						{
							type: "text",
							id: "",
							content: "**第三天：离开**"
						},
						{
							type: "text",
							id: "",
							content: "- 🕒 **时间**：上午"
						},
						{
							type: "text",
							id: "",
							content: "- 📍 **地点**：在"
						},
						{
							type: "Restaurant",
							id: "2",
							content: "岛上咖啡馆"
						},
						{
							type: "text",
							id: "",
							content: "享用早餐。"
						},
						{
							type: "text",
							id: "",
							content: "- 📍 **地点**：乘坐"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "返回珠海。"
						},
						{
							type: "text",
							id: "",
							content: "🚗 **交通与住宿建议**"
						},
						{
							type: "text",
							id: "",
							content: "- 🏨 **住宿**：建议入住"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "，享受海景房的舒适。"
						},
						{
							type: "text",
							id: "",
							content: "- 🚤 **交通**：往返珠海与万山岛的船票费用为100元。"
						},
						{
							type: "text",
							id: "",
							content: "💬 **总结与提示**"
						},
						{
							type: "text",
							id: "",
							content: "- 请根据天气情况携带适当的防晒用品和泳衣。"
						},
						{
							type: "text",
							id: "",
							content: "- 建议提前预订船票和住宿，以确保行程顺利。"
						},
						{
							type: "text",
							id: "",
							content: "希望这份行程能满足您的需求，祝您在万山岛度过一个愉快的假期！✅"
						}
					],
					"旅游": [{
							type: "text",
							id: "",
							content: "根据您的需求，我建议如下行程：✅"
						},
						{
							type: "text",
							id: "",
							content: "📝 **行程概述**"
						},
						{
							type: "text",
							id: "",
							content: "由于您未提供具体的偏好信息，我将为您设计一个全面且灵活的万山岛行程，涵盖自然景观、休闲活动和当地美食体验。"
						},
						{
							type: "text",
							id: "",
							content: "🗺️ **行程计划**"
						},
						{
							type: "text",
							id: "",
							content: "以下为建议的万山岛三日游行程："
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "### **第一天：抵达与探索**"
						},
						{
							type: "text",
							id: "",
							content: "🕰️ **时间安排**"
						},
						{
							type: "text",
							id: "",
							content: "- 上午：抵达万山岛"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：自然景观探索"
						},
						{
							type: "text",
							id: "",
							content: "- 晚上：享受当地美食"
						},
						{
							type: "text",
							id: "",
							content: "📍 **活动内容**"
						},
						{
							type: "text",
							id: "",
							content: "- 乘船抵达万山岛，建议选择"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "，出发时间为8:00。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午可前往"
						},
						{
							type: "Attraction",
							id: "10",
							content: "珊瑚礁区"
						},
						{
							type: "text",
							id: "",
							content: "，欣赏美丽的自然景观。"
						},
						{
							type: "text",
							id: "",
							content: "- 晚上在"
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "享用晚餐，品尝新鲜的海鲜。"
						},
						{
							type: "text",
							id: "",
							content: "🏨 **住宿推荐**"
						},
						{
							type: "text",
							id: "",
							content: "建议入住"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "，体验当地渔家风情。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "### **第二天：休闲与活动**"
						},
						{
							type: "text",
							id: "",
							content: "🕰️ **时间安排**"
						},
						{
							type: "text",
							id: "",
							content: "- 上午：休闲活动"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：徒步探索"
						},
						{
							type: "text",
							id: "",
							content: "- 晚上：放松与美食"
						},
						{
							type: "text",
							id: "",
							content: "📍 **活动内容**"
						},
						{
							type: "text",
							id: "",
							content: "- 上午可选择"
						},
						{
							type: "Activity",
							id: "2",
							content: "浮潜"
						},
						{
							type: "text",
							id: "",
							content: "，享受轻松的水下探索体验。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午参加"
						},
						{
							type: "Activity",
							id: "3",
							content: "徒步"
						},
						{
							type: "text",
							id: "",
							content: "，探索岛屿的自然风光。"
						},
						{
							type: "text",
							id: "",
							content: "- 晚上在"
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "享用晚餐。"
						},
						{
							type: "text",
							id: "",
							content: "🏨 **住宿推荐**"
						},
						{
							type: "text",
							id: "",
							content: "继续入住"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "### **第三天：返程**"
						},
						{
							type: "text",
							id: "",
							content: "🕰️ **时间安排**"
						},
						{
							type: "text",
							id: "",
							content: "- 上午：自由活动"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：返程"
						},
						{
							type: "text",
							id: "",
							content: "📍 **活动内容**"
						},
						{
							type: "text",
							id: "",
							content: "- 上午可自由安排，推荐前往"
						},
						{
							type: "Attraction",
							id: "13",
							content: "岛屿灯塔"
						},
						{
							type: "text",
							id: "",
							content: "，欣赏壮丽的海景。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午乘船返回，建议选择"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "，出发时间为13:30。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "📊 **总结与提示**"
						},
						{
							type: "text",
							id: "",
							content: "- 本次行程未包含具体预算信息，您可根据实际需求调整活动与住宿选择。"
						},
						{
							type: "text",
							id: "",
							content: "- 若您有其他偏好（如季节、活动类型等），请提供更多信息以便优化行程。"
						},
						{
							type: "text",
							id: "",
							content: "🗨️ **额外提示**"
						},
						{
							type: "text",
							id: "",
							content: "- 建议提前预订船票和住宿，确保行程顺利。"
						},
						{
							type: "text",
							id: "",
							content: "- 携带防晒用品和舒适的徒步装备，以应对户外活动。"
						},
						{
							type: "text",
							id: "",
							content: "希望这份行程能为您的万山岛之旅提供灵感！如有其他问题，欢迎随时咨询。"
						}
					],
					"出行": [{
							type: "text",
							id: "",
							content: "根据您的需求，我建议如下行程：🗺️"
						},
						{
							type: "text",
							id: "",
							content: "📅 行程天数：3天"
						},
						{
							type: "text",
							id: "",
							content: "### 第一天"
						},
						{
							type: "text",
							id: "",
							content: "📌 地点：万山岛"
						},
						{
							type: "text",
							id: "",
							content: "- 上午：抵达万山岛，入住"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：前往"
						},
						{
							type: "Attraction",
							id: "10",
							content: "珊瑚礁区"
						},
						{
							type: "text",
							id: "",
							content: "，欣赏自然景观。"
						},
						{
							type: "text",
							id: "",
							content: "- 晚上：在"
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "享用晚餐。"
						},
						{
							type: "text",
							id: "",
							content: "### 第二天"
						},
						{
							type: "text",
							id: "",
							content: "📌 地点：万山岛"
						},
						{
							type: "text",
							id: "",
							content: "- 上午：参加"
						},
						{
							type: "Activity",
							id: "2",
							content: "浮潜"
						},
						{
							type: "text",
							id: "",
							content: "，探索海底世界。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：前往"
						},
						{
							type: "Attraction",
							id: "13",
							content: "岛屿灯塔"
						},
						{
							type: "text",
							id: "",
							content: "，享受观景。"
						},
						{
							type: "text",
							id: "",
							content: "- 晚上：在"
						},
						{
							type: "Restaurant",
							id: "10",
							content: "岛上美食坊"
						},
						{
							type: "text",
							id: "",
							content: "品尝当地美食。"
						},
						{
							type: "text",
							id: "",
							content: "### 第三天"
						},
						{
							type: "text",
							id: "",
							content: "📌 地点：万山岛"
						},
						{
							type: "text",
							id: "",
							content: "- 上午：参加"
						},
						{
							type: "Activity",
							id: "1",
							content: "海钓"
						},
						{
							type: "text",
							id: "",
							content: "，体验钓鱼乐趣。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：自由活动，可以选择在"
						},
						{
							type: "Attraction",
							id: "2",
							content: "南沙湾"
						},
						{
							type: "text",
							id: "",
							content: "放松。"
						},
						{
							type: "text",
							id: "",
							content: "- 晚上：返回，结束愉快的旅程。"
						},
						{
							type: "text",
							id: "",
							content: "🚗 交通：建议使用"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "前往万山岛。"
						},
						{
							type: "text",
							id: "",
							content: "🏨 住宿：推荐"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "，性价比高且评价良好。"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 餐饮：尝试"
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "和"
						},
						{
							type: "Restaurant",
							id: "10",
							content: "岛上美食坊"
						},
						{
							type: "text",
							id: "",
							content: "，享受新鲜海鲜。"
						},
						{
							type: "text",
							id: "",
							content: "❓ 注意事项：请提前确认"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "的班次，以确保顺利出行。"
						},
						{
							type: "text",
							id: "",
							content: "希望这份行程能让您的万山岛之旅愉快且充实！🗺️"
						}
					],
					"住宿": [{
							type: "text",
							id: "",
							content: "根据您的需求，我建议如下行程：✅"
						},
						{
							type: "text",
							id: "",
							content: "📝 行程概览："
						},
						{
							type: "text",
							id: "",
							content: "地图🗺️: 万山岛"
						},
						{
							type: "text",
							id: "",
							content: "时间⏰: 未知"
						},
						{
							type: "text",
							id: "",
							content: "地点📍: 万山岛"
						},
						{
							type: "text",
							id: "",
							content: "交通🚗: 船"
						},
						{
							type: "text",
							id: "",
							content: "住宿🏨: 万山渔家乐或万山岛海滨酒店"
						},
						{
							type: "text",
							id: "",
							content: "📊 审查数据库信息："
						},
						{
							type: "text",
							id: "",
							content: "住宿推荐："
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "Accommodation",
							id: "5",
							content: "万山岛海滨酒店"
						},
						{
							type: "text",
							id: "",
							content: "❓ 疑问/缺口："
						},
						{
							type: "text",
							id: "",
							content: "由于用户的具体出行时间、预算和旅行天数未知，建议根据个人需求进一步调整行程。"
						},
						{
							type: "text",
							id: "",
							content: "🗺️ 详细行程安排："
						},
						{
							type: "text",
							id: "",
							content: "第一天："
						},
						{
							type: "text",
							id: "",
							content: "地点📍: 抵达万山岛"
						},
						{
							type: "text",
							id: "",
							content: "交通🚗: "
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: " 或 "
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "住宿🏨: "
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: " 或 "
						},
						{
							type: "Accommodation",
							id: "5",
							content: "万山岛海滨酒店"
						},
						{
							type: "text",
							id: "",
							content: "餐饮🍽️: 可在岛上餐厅享用晚餐，如 "
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "第二天："
						},
						{
							type: "text",
							id: "",
							content: "地点📍: 探索万山岛"
						},
						{
							type: "text",
							id: "",
							content: "活动🏃: 可选择进行 "
						},
						{
							type: "Activity",
							id: "2",
							content: "浮潜"
						},
						{
							type: "text",
							id: "",
							content: " 或 "
						},
						{
							type: "Activity",
							id: "3",
							content: "徒步"
						},
						{
							type: "text",
							id: "",
							content: "餐饮🍽️: 午餐可在 "
						},
						{
							type: "Restaurant",
							id: "10",
							content: "岛上美食坊"
						},
						{
							type: "text",
							id: "",
							content: " 享用"
						},
						{
							type: "text",
							id: "",
							content: "住宿🏨: 继续在 "
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: " 或 "
						},
						{
							type: "Accommodation",
							id: "5",
							content: "万山岛海滨酒店"
						},
						{
							type: "text",
							id: "",
							content: " 住宿"
						},
						{
							type: "text",
							id: "",
							content: "第三天："
						},
						{
							type: "text",
							id: "",
							content: "地点📍: 离开万山岛"
						},
						{
							type: "text",
							id: "",
							content: "交通🚗: "
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: " 或 "
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "💬 总结推荐："
						},
						{
							type: "text",
							id: "",
							content: "万山岛是一个适合短暂逃离喧嚣的地方，提供舒适的住宿和丰富的活动选择。根据您的偏好，可以选择不同的住宿和活动来丰富您的旅行体验。如有更多具体需求，欢迎进一步咨询以优化您的行程。"
						}
					],
					"美食": [{
							"type": "text",
							"id": "",
							"content": "据您的需求，我建议如下行程：✅"
						},
						{
							"type": "text",
							"id": "",
							"content": "📝 行程概览<br>📍 本次行程以「美食探索」为核心，结合万山岛的特色餐厅和便利交通，为您打造一场味蕾盛宴。"
						},
						{
							"type": "divider",
							"id": "",
							"content": ""
						},
						{
							"type": "text",
							"id": "",
							"content": "⏱️ 行程安排"
						},
						{
							"type": "text",
							"id": "day1",
							"content": "⏰ 第一天：抵达与美食初体验"
						},
						{
							"type": "transport",
							"id": "1",
							"content": "🚢 1-船 从出发地乘船前往万山岛，建议选择上午的班次（航程约2小时）。"
						},
						{
							"type": "accommodation",
							"id": "3",
							"content": "🏠 2-万山渔家乐 办理入住，稍作休息。"
						},
						{
							"type": "restaurant",
							"id": "10",
							"content": "🍽️ 3-岛上美食坊 享用午餐，品尝当地特色海鲜（人均约180元）。"
						},
						{
							"type": "restaurant",
							"id": "1",
							"content": "🍽️ 4-海鲜大排档 晚餐享用新鲜的海鲜大餐（人均约200元）。"
						},
						{
							"type": "text",
							"id": "day2",
							"content": "⏰ 第二天：继续美食探索与返程"
						},
						{
							"type": "restaurant",
							"id": "2",
							"content": "🍽️ 5-岛上咖啡馆 享用早餐，品尝咖啡和轻食（人均约150元）。"
						},
						{
							"type": "restaurant",
							"id": "4",
							"content": "🍽️ 6-海鲜酒家 午餐享用高端海鲜料理（人均约250元）。"
						},
						{
							"type": "restaurant",
							"id": "7",
							"content": "🍽️ 7-咖啡小屋 晚餐在轻松氛围中享用美食（人均约180元）。"
						},
						{
							"type": "transport",
							"id": "2",
							"content": "🚢 8-船 下午乘船返程，建议选择合适的班次。"
						},
						{
							"type": "divider",
							"id": "",
							"content": ""
						},
						{
							"type": "text",
							"id": "",
							"content": "📊 推荐亮点"
						},
						{
							"type": "restaurant",
							"id": "10",
							"content": "🍽️ 1-岛上美食坊 提供新鲜海鲜，适合午餐选择。"
						},
						{
							"type": "restaurant",
							"id": "1",
							"content": "🍽️ 2-海鲜大排档 价格实惠，适合晚餐享用。"
						},
						{
							"type": "restaurant",
							"id": "4",
							"content": "🍽️ 3-海鲜酒家 高端海鲜料理，适合特别体验。"
						},
						{
							"type": "divider",
							"id": "",
							"content": ""
						},
						{
							"type": "text",
							"id": "",
							"content": "❓ 注意事项"
						},
						{
							"type": "text",
							"id": "",
							"content": "1. 建议提前确认船票和住宿预订，以确保行程顺利。"
						},
						{
							"type": "text",
							"id": "",
							"content": "2. 餐饮价格可能因季节和人数变化，建议提前咨询餐厅。"
						},
						{
							"type": "divider",
							"id": "",
							"content": ""
						},
						{
							"type": "text",
							"id": "",
							"content": "✉️ 总结<br>本次行程以美食探索为核心，结合万山岛的特色餐厅和舒适住宿，为您打造一场难忘的味蕾盛宴。希望您能尽情享受这次美食之旅！如有其他需求或问题，欢迎随时联系。"
						},
						{
							"type": "divider",
							"id": "",
							"content": ""
						},
						{
							"type": "text",
							"id": "",
							"content": "¥888 含往返交通、2晚住宿及餐饮费用"
						},
						{
							"type": "text",
							"id": "",
							"content": "优惠: ¥328元（早鸟折扣）"
						}
					],
					"徒步": [{
							type: "text",
							id: "",
							content: "根据您的需求，我建议如下行程：✅"
						},
						{
							type: "text",
							id: "",
							content: "📝 **行程概述**"
						},
						{
							type: "text",
							id: "",
							content: "您的主要兴趣是徒步，因此我将为您设计一个以徒步为核心的万山岛旅行计划。以下是基于现有数据的推荐："
						},
						{
							type: "text",
							id: "",
							content: "🗺️ **行程安排**"
						},
						{
							type: "text",
							id: "",
							content: "⏰ **建议天数**：1-2天"
						},
						{
							type: "text",
							id: "",
							content: "📍 **主要活动**：徒步探索万山岛的自然景观"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "📅 **第一天**"
						},
						{
							type: "text",
							id: "",
							content: "📍 **上午**："
						},
						{
							type: "text",
							id: "",
							content: "- 抵达万山岛，乘坐"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "或"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "前往岛上。"
						},
						{
							type: "text",
							id: "",
							content: "- 开始徒步探索，推荐路线：从码头出发，沿着海岸线徒步，欣赏海景和自然风光。"
						},
						{
							type: "text",
							id: "",
							content: "📍 **下午**："
						},
						{
							type: "text",
							id: "",
							content: "- 继续徒步，探索岛上的自然景观，如"
						},
						{
							type: "Attraction",
							id: "1",
							content: "东澳湾"
						},
						{
							type: "text",
							id: "",
							content: "和"
						},
						{
							type: "Attraction",
							id: "10",
							content: "珊瑚礁区"
						},
						{
							type: "text",
							id: "",
							content: "。"
						},
						{
							type: "text",
							id: "",
							content: "- 如果时间允许，可以前往"
						},
						{
							type: "Attraction",
							id: "16",
							content: "海鸟栖息地"
						},
						{
							type: "text",
							id: "",
							content: "观察海鸟。"
						},
						{
							type: "text",
							id: "",
							content: "📍 **晚上**："
						},
						{
							type: "text",
							id: "",
							content: "- 入住"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "或"
						},
						{
							type: "Accommodation",
							id: "5",
							content: "万山岛海滨酒店"
						},
						{
							type: "text",
							id: "",
							content: "，享受舒适的住宿环境。"
						},
						{
							type: "text",
							id: "",
							content: "- 晚餐推荐在"
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "或"
						},
						{
							type: "Restaurant",
							id: "10",
							content: "岛上美食坊"
						},
						{
							type: "text",
							id: "",
							content: "品尝当地海鲜。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "📅 **第二天**"
						},
						{
							type: "text",
							id: "",
							content: "📍 **上午**："
						},
						{
							type: "text",
							id: "",
							content: "- 早餐后，继续徒步探索岛上的其他区域，如"
						},
						{
							type: "Attraction",
							id: "19",
							content: "潜水点"
						},
						{
							type: "text",
							id: "",
							content: "（如果对潜水感兴趣）。"
						},
						{
							type: "text",
							id: "",
							content: "- 享受岛上的宁静与自然美景。"
						},
						{
							type: "text",
							id: "",
							content: "📍 **下午**："
						},
						{
							type: "text",
							id: "",
							content: "- 返回码头，乘坐"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "或"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "离开万山岛。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "🚗 **交通建议**"
						},
						{
							type: "text",
							id: "",
							content: "- 往返万山岛的交通以船为主，推荐选择"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "或"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "，费用为100元。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "🏨 **住宿建议**"
						},
						{
							type: "text",
							id: "",
							content: "- 推荐入住"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "（海景房，500元/晚）或"
						},
						{
							type: "Accommodation",
							id: "5",
							content: "万山岛海滨酒店"
						},
						{
							type: "text",
							id: "",
							content: "（标准间，450元/晚）。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ **餐饮建议**"
						},
						{
							type: "text",
							id: "",
							content: "- 推荐在"
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "或"
						},
						{
							type: "Restaurant",
							id: "10",
							content: "岛上美食坊"
						},
						{
							type: "text",
							id: "",
							content: "品尝当地海鲜，人均消费约200元。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "❓ **注意事项**"
						},
						{
							type: "text",
							id: "",
							content: "- 由于您的预算、旅行日期和停留时间未知，建议提前确认船票和住宿预订。"
						},
						{
							type: "text",
							id: "",
							content: "- 徒步时请穿着舒适的鞋子和衣物，并携带足够的水和防晒用品。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "💬 **总结**"
						},
						{
							type: "text",
							id: "",
							content: "这份行程以徒步为核心，结合了万山岛的自然景观和舒适的住宿餐饮选择。希望您能享受这次旅行！如有其他需求，请随时告知。"
						}
					],
				}

				let fullContent = []


				fullContent = returnFullcontentByKeyWords(inputMessage.value, deadAnswerDict);

				// 清空输入框并滚动到最新消息
				inputMessage.value = '';
				scrollToLatestMessage();



				// 模拟AI回复
				// AIAnswerThinking(fullContent);
				// 调用接口
				// #ifdef MP-WEIXIN
				callAIInterface(chatMessages[chatMessages.length - 1].content);
				// #endif
				// #ifdef H5
				callAIInterface2(chatMessages[chatMessages.length - 1].content);
				// #endif



			};


			// 在sendMessage中使用此方法会让ai回复一个正在思考中...
			const AIAnswerThinking = function(fullContent) {
				// 创建一个空的AI消息
				const aiMessage = {
					type: "ai",
					content: "正在思考中...", // 初始文本，带点
					id: Date.now(),
					thinking: true, // 标记是否为思考状态
					startTime: Date.now(), // 记录开始时间
				};
				chatMessages.push(aiMessage);

				// 创建思考动画定时器
				let dotCount = 0;
				const THINKING_TIMEOUT = 3000; // 3秒后显示回复
				const thinkingInterval = setInterval(() => {
					if (aiMessage.thinking) { // 只在thinking为true时更新点
						// 检查是否到达模拟回复时间
						if (Date.now() - aiMessage.startTime > THINKING_TIMEOUT) {
							clearInterval(thinkingInterval); // 停止动画
							aiMessage.thinking = false;

							// 准备AI回复的完整内容
							// let fullContent;

							// 初始化空的内容数组，准备逐字填充
							aiMessage.content = [];
							aiMessage.typing = true; // 标记正在打字中

							// 开始打字机效果
							typewriterEffect(aiMessage, fullContent);
						} else {
							dotCount = (dotCount + 1) % 4; // 0到3循环
							aiMessage.content = '正在思考中' + '.'.repeat(dotCount);
							// 触发视图更新
							updateCounter.value++;
						}
					} else {
						clearInterval(thinkingInterval); // 停止动画
					}
				}, 500); // 每500毫秒更新一次

				// 立即触发视图更新
				globalUpdateKey.value = Date.now();
				updateCounter.value++;

				// 确保消息框立即可见
				nextTick(() => {
					scrollToBottom();
				});
			}


			const AIAnswerThinking2 = function(question) {
				console.log(question)
				let fullContent = [];
				if (question == "我想了解海钓体验的详细信息") {
					fullContent = [{
							type: "text",
							id: "",
							content: "据您的需求，我建议如下行程：✅"
						},
						{
							type: "text",
							id: "",
							content: "📝 根据您的需求，我为您设计了一份专注于海钓体验的万山岛旅游行程推荐。以下是详细安排："
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "🗺️ **行程概览**"
						},
						{
							type: "text",
							id: "",
							content: "本次行程以海钓为核心，结合万山岛的特色，为您提供一次难忘的体验。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "⏰ **行程天数**"
						},
						{
							type: "text",
							id: "",
							content: "建议安排 **1-2天**，具体可根据您的停留时间调整。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "Activity",
							id: "1",
							content: "海钓"
						},
						{
							type: "text",
							id: "",
							content: "🎣 **海钓体验**"
						},
						{
							type: "text",
							id: "",
							content: "- **时长**：3-4小时"
						},
						{
							type: "text",
							id: "",
							content: "- **难度**：中等"
						},
						{
							type: "text",
							id: "",
							content: "- **价格**：800元"
						},
						{
							type: "text",
							id: "",
							content: "- **亮点**：在万山岛周边海域体验专业海钓，享受与海洋亲密接触的乐趣。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "🚤 **交通安排**"
						},
						{
							type: "text",
							id: "",
							content: "- **出发时间**：8:00、10:00、14:00"
						},
						{
							type: "text",
							id: "",
							content: "- **费用**：100元"
						},
						{
							type: "text",
							id: "",
							content: "- **建议**：选择适合您时间的班次前往万山岛。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "Accommodation",
							id: "5",
							content: "万山岛海滨酒店"
						},
						{
							type: "text",
							id: "",
							content: "🏨 **住宿推荐**"
						},
						{
							type: "text",
							id: "",
							content: "- **房型**：标准间"
						},
						{
							type: "text",
							id: "",
							content: "- **价格**：450元/晚"
						},
						{
							type: "text",
							id: "",
							content: "- **评分**：4.1"
						},
						{
							type: "text",
							id: "",
							content: "- **亮点**：靠近海边，方便参与海钓活动。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "Restaurant",
							id: "10",
							content: "岛上美食坊"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ **餐饮推荐**"
						},
						{
							type: "text",
							id: "",
							content: "- **营业时间**：10:00-21:00"
						},
						{
							type: "text",
							id: "",
							content: "- **人均消费**：180元"
						},
						{
							type: "text",
							id: "",
							content: "- **亮点**：提供新鲜海鲜，适合海钓后享用。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "❓ **注意事项**"
						},
						{
							type: "text",
							id: "",
							content: "- 海钓活动需提前预约，建议联系当地旅行社或酒店安排。"
						},
						{
							type: "text",
							id: "",
							content: "- 请根据天气情况准备防晒、防风装备。"
						},
						{
							type: "text",
							id: "",
							content: "- 若需延长停留时间，可考虑增加其他活动或景点游览。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "💬 **总结**"
						},
						{
							type: "text",
							id: "",
							content: "本次行程以海钓为核心，结合交通、住宿和餐饮推荐，为您提供一次轻松愉快的万山岛之旅。如有其他需求，欢迎随时咨询！"
						},
						{
							type: "text",
							id: "",
							content: "✅ 祝您旅途愉快！"
						}
					];
				} else if (question == "我想了解浮潜探索的详细信息") {
					fullContent = [{
							type: "text",
							id: "",
							content: "根据您的需求，我建议如下行程：✅"
						},
						{
							type: "text",
							id: "",
							content: "📝 行程概述："
						},
						{
							type: "text",
							id: "",
							content: "您对浮潜活动表现出浓厚兴趣，因此我将为您设计一个以浮潜为核心的万山岛探索行程。以下是基于现有数据的推荐："
						},
						{
							type: "text",
							id: "",
							content: "🗺️ 行程安排："
						},
						{
							type: "text",
							id: "",
							content: "Day 1:"
						},
						{
							type: "text",
							id: "",
							content: "⏰ 上午：抵达万山岛"
						},
						{
							type: "text",
							id: "",
							content: "🚗 交通：建议乘坐"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "，从出发地前往万山岛，预计航程约2小时。"
						},
						{
							type: "text",
							id: "",
							content: "📍 活动：抵达后，前往"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "办理入住，稍作休息。"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 午餐：在"
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "享用当地海鲜。"
						},
						{
							type: "text",
							id: "",
							content: "⏰ 下午：浮潜初体验"
						},
						{
							type: "text",
							id: "",
							content: "📍 活动：前往"
						},
						{
							type: "Activity",
							id: "2",
							content: "浮潜"
						},
						{
							type: "text",
							id: "",
							content: "，在专业教练的指导下，探索万山岛周边的海底世界，预计活动时间2-3小时。"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 晚餐：在"
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "品尝更多海鲜美食。"
						},
						{
							type: "text",
							id: "",
							content: "Day 2:"
						},
						{
							type: "text",
							id: "",
							content: "⏰ 上午：继续浮潜探索"
						},
						{
							type: "text",
							id: "",
							content: "📍 活动：再次体验"
						},
						{
							type: "Activity",
							id: "2",
							content: "浮潜"
						},
						{
							type: "text",
							id: "",
							content: "，深入探索不同的浮潜点，发现更多海洋生物。"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 午餐：在"
						},
						{
							type: "Restaurant",
							id: "10",
							content: "岛上美食坊"
						},
						{
							type: "text",
							id: "",
							content: "享用午餐。"
						},
						{
							type: "text",
							id: "",
							content: "⏰ 下午：自由活动"
						},
						{
							type: "text",
							id: "",
							content: "📍 活动：您可以选择在岛上自由活动，或者再次体验浮潜。"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 晚餐：在"
						},
						{
							type: "Restaurant",
							id: "2",
							content: "岛上咖啡馆"
						},
						{
							type: "text",
							id: "",
							content: "享用晚餐。"
						},
						{
							type: "text",
							id: "",
							content: "Day 3:"
						},
						{
							type: "text",
							id: "",
							content: "⏰ 上午：离开万山岛"
						},
						{
							type: "text",
							id: "",
							content: "🚗 交通：乘坐"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "返回出发地，结束愉快的万山岛之旅。"
						},
						{
							type: "text",
							id: "",
							content: "💡 注意事项："
						},
						{
							type: "text",
							id: "",
							content: "1. 浮潜活动需要一定的体力和水性，请根据自身情况选择是否参与。"
						},
						{
							type: "text",
							id: "",
							content: "2. 建议提前预订浮潜活动和住宿，以确保行程顺利。"
						},
						{
							type: "text",
							id: "",
							content: "3. 请关注天气情况，合理安排行程。"
						},
						{
							type: "text",
							id: "",
							content: "🗣️ 总结："
						},
						{
							type: "text",
							id: "",
							content: "以上行程以浮潜为核心，结合了万山岛的特色美食和舒适住宿，为您打造一个难忘的海岛探索之旅。希望这份推荐能够满足您的需求，祝您旅途愉快！"
						}
					];
				} else if (question == "我想了解亲子娱乐的详细信息") {
					fullContent = [{
							type: "text",
							id: "",
							content: "根据您的需求，我建议如下行程：✅"
						},
						{
							type: "text",
							id: "",
							content: "📝 行程概述："
						},
						{
							type: "text",
							id: "",
							content: "您计划与家人（带儿童）一起前往万山岛，主要关注亲子娱乐活动。以下是为您设计的详细行程，确保适合家庭出游，并包含丰富的亲子体验。"
						},
						{
							type: "text",
							id: "",
							content: "🗺️ 行程安排："
						},
						{
							type: "text",
							id: "",
							content: "📅 建议天数：3天2夜"
						},
						{
							type: "text",
							id: "",
							content: "📌 第一天："
						},
						{
							type: "text",
							id: "",
							content: "- 上午：从出发地乘船前往万山岛。"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "- 中午：抵达后入住"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "，享用午餐"
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：前往"
						},
						{
							type: "Attraction",
							id: "2",
							content: "南沙湾"
						},
						{
							type: "text",
							id: "",
							content: "，享受沙滩浴场，适合儿童玩耍。"
						},
						{
							type: "text",
							id: "",
							content: "- 晚上：在"
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "享用晚餐。"
						},
						{
							type: "text",
							id: "",
							content: "📌 第二天："
						},
						{
							type: "text",
							id: "",
							content: "- 上午：参加"
						},
						{
							type: "Activity",
							id: "2",
							content: "浮潜"
						},
						{
							type: "text",
							id: "",
							content: "，适合亲子一起体验海洋生物。"
						},
						{
							type: "text",
							id: "",
							content: "- 中午：在"
						},
						{
							type: "Restaurant",
							id: "10",
							content: "岛上美食坊"
						},
						{
							type: "text",
							id: "",
							content: "享用午餐。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：前往"
						},
						{
							type: "Attraction",
							id: "10",
							content: "珊瑚礁区"
						},
						{
							type: "text",
							id: "",
							content: "，观赏美丽的珊瑚礁。"
						},
						{
							type: "text",
							id: "",
							content: "- 晚上：返回酒店休息，享用晚餐"
						},
						{
							type: "Restaurant",
							id: "7",
							content: "咖啡小屋"
						},
						{
							type: "text",
							id: "",
							content: "。"
						},
						{
							type: "text",
							id: "",
							content: "📌 第三天："
						},
						{
							type: "text",
							id: "",
							content: "- 上午：参加"
						},
						{
							type: "Activity",
							id: "3",
							content: "徒步"
						},
						{
							type: "text",
							id: "",
							content: "，探索岛屿的自然风光。"
						},
						{
							type: "text",
							id: "",
							content: "- 中午：在"
						},
						{
							type: "Restaurant",
							id: "2",
							content: "岛上咖啡馆"
						},
						{
							type: "text",
							id: "",
							content: "享用午餐。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：乘船返回出发地。"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "🚗 交通建议："
						},
						{
							type: "text",
							id: "",
							content: "- 往返万山岛可选择"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "或"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "，具体时间根据您的出发地安排。"
						},
						{
							type: "text",
							id: "",
							content: "🏨 住宿建议："
						},
						{
							type: "text",
							id: "",
							content: "- 推荐入住"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "，提供海景房，适合家庭入住。"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 餐饮建议："
						},
						{
							type: "text",
							id: "",
							content: "- 推荐尝试"
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "和"
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "，提供丰富的海鲜选择。"
						},
						{
							type: "text",
							id: "",
							content: "❓ 注意事项："
						},
						{
							type: "text",
							id: "",
							content: "- 请提前确认船票和住宿预订，确保行程顺利。"
						},
						{
							type: "text",
							id: "",
							content: "- 亲子活动如浮潜和徒步，请根据儿童年龄和体力情况选择适合的活动。"
						},
						{
							type: "text",
							id: "",
							content: "💬 总结："
						},
						{
							type: "text",
							id: "",
							content: "以上行程专为家庭设计，包含丰富的亲子娱乐活动，确保您和孩子们在万山岛度过一个愉快的假期。如有其他需求或问题，请随时联系我。"
						}
					];
				} else if (question == "我想了解休闲畅游的详细信息") {
					fullContent = [{
							type: "text",
							id: "",
							content: "根据您的需求，我建议如下行程：✅"
						},
						{
							type: "text",
							id: "",
							content: "✅ 根据您的需求，我为您设计了一份万山岛休闲畅游的行程推荐。以下是详细信息："
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "🗺️ 行程概览"
						},
						{
							type: "text",
							id: "",
							content: "本次行程以放松和享受自然为主，适合休闲旅行者。以下是每日安排："
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "📅 第一天：抵达与探索"
						},
						{
							type: "text",
							id: "",
							content: "🕒 时间：全天"
						},
						{
							type: "text",
							id: "",
							content: "📍 地点：万山岛"
						},
						{
							type: "text",
							id: "",
							content: "🚗 交通：建议选择"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "或"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "前往万山岛。"
						},
						{
							type: "text",
							id: "",
							content: "🏨 住宿：推荐入住"
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "或"
						},
						{
							type: "Accommodation",
							id: "5",
							content: "万山岛海滨酒店"
						},
						{
							type: "text",
							id: "",
							content: "，享受舒适的海景房。"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 餐饮：晚餐可选择"
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "，品尝新鲜的海鲜。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "📅 第二天：自然与活动"
						},
						{
							type: "text",
							id: "",
							content: "🕒 时间：全天"
						},
						{
							type: "text",
							id: "",
							content: "📍 地点：万山岛"
						},
						{
							type: "text",
							id: "",
							content: "🎯 活动："
						},
						{
							type: "text",
							id: "",
							content: "- 上午：体验"
						},
						{
							type: "Activity",
							id: "2",
							content: "浮潜"
						},
						{
							type: "text",
							id: "",
							content: "，探索海底世界。"
						},
						{
							type: "text",
							id: "",
							content: "- 下午：选择"
						},
						{
							type: "Activity",
							id: "3",
							content: "徒步"
						},
						{
							type: "text",
							id: "",
							content: "，感受岛上的自然风光。"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 餐饮：午餐可在"
						},
						{
							type: "Restaurant",
							id: "10",
							content: "岛上美食坊"
						},
						{
							type: "text",
							id: "",
							content: "享用，晚餐推荐"
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "📅 第三天：放松与返程"
						},
						{
							type: "text",
							id: "",
							content: "🕒 时间：上午"
						},
						{
							type: "text",
							id: "",
							content: "📍 地点：万山岛"
						},
						{
							type: "text",
							id: "",
							content: "🎯 活动："
						},
						{
							type: "text",
							id: "",
							content: "- 上午：在岛上悠闲散步，享受宁静的海岛时光。"
						},
						{
							type: "text",
							id: "",
							content: "🚗 交通：选择"
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "或"
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "返回。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "📊 费用估算"
						},
						{
							type: "text",
							id: "",
							content: "- 交通：约200元/人（往返船票）。"
						},
						{
							type: "text",
							id: "",
							content: "- 住宿：约500-800元/晚（根据选择）。"
						},
						{
							type: "text",
							id: "",
							content: "- 餐饮：约200-250元/人/天。"
						},
						{
							type: "text",
							id: "",
							content: "- 活动：浮潜约300元/人，徒步免费。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "❓ 注意事项"
						},
						{
							type: "text",
							id: "",
							content: "- 请提前确认船班时间，避免延误。"
						},
						{
							type: "text",
							id: "",
							content: "- 建议携带防晒用品和舒适的徒步鞋。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "💬 总结"
						},
						{
							type: "text",
							id: "",
							content: "这份行程以休闲为主，结合自然探索和放松活动，适合希望在万山岛度过轻松假期的旅行者。如需进一步调整，请随时告知！"
						}
					];
				} else if (question == "我想了解海岛介绍的详细信息") {
					fullContent = [{
							type: "text",
							id: "",
							content: "根据您的需求，我为您整理了关于万山岛的详细介绍：✅"
						},
						{
							type: "text",
							id: "",
							content: "📝 根据您的需求，我为您整理了关于万山岛的详细介绍，以下是基于现有数据库信息的内容："
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "🗺️ 万山岛简介"
						},
						{
							type: "text",
							id: "",
							content: "万山岛是珠海市万山群岛中的一座美丽岛屿，以其自然风光和丰富的海洋资源而闻名。以下是关于万山岛的具体信息："
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "📊 万山岛基本信息"
						},
						{
							type: "text",
							id: "",
							content: "- 岛屿名称：万山岛"
						},
						{
							type: "text",
							id: "",
							content: "- 岛屿ID：102"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "🏖️ 推荐景点"
						},
						{
							type: "text",
							id: "",
							content: "目前数据库中关于万山岛的景点信息暂未提供，但您可以期待以下类型的体验："
						},
						{
							type: "text",
							id: "",
							content: "- 自然景观：如海滩、礁石、森林等。"
						},
						{
							type: "text",
							id: "",
							content: "- 文化地标：如灯塔、渔村等。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "🎣 推荐活动"
						},
						{
							type: "text",
							id: "",
							content: "万山岛适合以下活动（基于数据库中的通用活动推荐）："
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Activity",
							id: "1",
							content: "海钓"
						},
						{
							type: "text",
							id: "",
							content: "：适合喜欢钓鱼的游客，价格约800元，时长3-4小时。"
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Activity",
							id: "2",
							content: "浮潜"
						},
						{
							type: "text",
							id: "",
							content: "：适合探索海底世界，价格约300元，时长2-3小时。"
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Activity",
							id: "3",
							content: "徒步"
						},
						{
							type: "text",
							id: "",
							content: "：适合欣赏自然风光，免费，时长4-8小时。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "🏨 推荐住宿"
						},
						{
							type: "text",
							id: "",
							content: "以下是万山岛附近的住宿推荐："
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Accommodation",
							id: "3",
							content: "万山渔家乐"
						},
						{
							type: "text",
							id: "",
							content: "：海景房，价格500元，评分4.2。"
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Accommodation",
							id: "5",
							content: "万山岛海滨酒店"
						},
						{
							type: "text",
							id: "",
							content: "：标准间，价格450元，评分4.1。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "🍽️ 推荐餐饮"
						},
						{
							type: "text",
							id: "",
							content: "以下是万山岛附近的餐饮推荐："
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Restaurant",
							id: "1",
							content: "海鲜大排档"
						},
						{
							type: "text",
							id: "",
							content: "：价格约200元，营业时间11:00-21:00。"
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Restaurant",
							id: "4",
							content: "海鲜酒家"
						},
						{
							type: "text",
							id: "",
							content: "：价格约250元，营业时间11:30-21:30。"
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Restaurant",
							id: "10",
							content: "岛上美食坊"
						},
						{
							type: "text",
							id: "",
							content: "：价格约180元，营业时间10:00-21:00。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "🚢 推荐交通"
						},
						{
							type: "text",
							id: "",
							content: "前往万山岛的交通方式主要为船，以下是推荐选项："
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Transport",
							id: "1",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "：价格100元，出发时间8:00、10:00、14:00。"
						},
						{
							type: "text",
							id: "",
							content: "- "
						},
						{
							type: "Transport",
							id: "2",
							content: "船"
						},
						{
							type: "text",
							id: "",
							content: "：价格100元，出发时间9:30、13:30。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "❓ 注意事项"
						},
						{
							type: "text",
							id: "",
							content: "- 目前数据库中关于万山岛的景点信息较少，建议您进一步咨询当地旅游部门或导游以获取更多详细信息。"
						},
						{
							type: "text",
							id: "",
							content: "- 活动价格和交通时间可能因季节或天气变化而调整，请提前确认。"
						},
						{
							type: "text",
							id: "",
							content: "---"
						},
						{
							type: "text",
							id: "",
							content: "📢 如果您有更多具体需求（如预算、旅行日期、人数等），请告诉我，我可以为您进一步优化推荐！"
						}
					];
				}

				AIAnswerThinking(fullContent)
			}



			// 实现打字机效果的函数
			const typewriterEffect = (
				message,
				fullContent,
				index = 0,
				charIndex = 0,
				delay = 30
			) => {
				// 如果已经完成所有段落，结束递归
				if (index >= fullContent.length) {
					return;
				}

				const currentItem = fullContent[index];
				const fullText = currentItem.content;

				// 如果是新段落，初始化为空字符串
				if (charIndex === 0) {
					if (!message.content[index]) {
						message.content[index] = {
							type: currentItem.type,
							id: currentItem.id || "",
							content: "",
						};
					}
				}

				// 如果当前段落还没打完
				if (charIndex < fullText.length) {
					// 添加下一个字符
					message.content[index].content = fullText.substring(0, charIndex + 1);
					updateCounter.value++;

					// 安排下一个字符
					setTimeout(() => {
						typewriterEffect(message, fullContent, index, charIndex + 1, delay);
					}, delay);
				} else {
					// 当前段落打完，移到下一段
					setTimeout(() => {
						typewriterEffect(message, fullContent, index + 1, 0, delay);
					}, delay * 10); // 段落之间停顿更长
				}

				// 确保滚动到最新消息
				scrollToBottom();
			};

			//返回响应数据
			function returnFullcontentByKeyWords(text, deadAnswerDict) {
				// 遍历关键字字典
				for (let keyword in deadAnswerDict) {
					// 如果字符串中包含关键字
					if (text.includes(keyword)) {
						// 返回对应关键字的响应数据
						return deadAnswerDict[keyword];
					}
				}
				// 如果没有匹配的关键字，返回默认的空数组
				return [{
					type: "text",
					id: "",
					content: "我是万山岛旅游推荐官，擅长旅游方面的咨询，您有什么万山岛旅游问题请说"
				}];;
			}













			const callAIInterface2 = async (userQuery, retryCount = 0) => {
				const url = 'http://island.zhangshuiyi.com/island/front/ai/chat/chatMessage-stream-flux';
				const data = {
					conversation_id: '',
					inputs: {
						original_intention: '',
						recommended_plan: ''
					},
					query: userQuery,
					webMode: ''
				};

				const body = JSON.stringify(data); // Body 参数

				const response = await fetch(url, {
					method: 'POST',
					headers: {
						'X-Access-Token': token.value,
						'Content-Type': 'application/json', // 必须与 Body 格式匹配
					},
					body: body, // 可以是字符串、FormData、Blob 等
				});

				// console.log("response =>", response);
				const reader = response.body.getReader();
				const decoder = new TextDecoder();

				let str = ''
				while (true) {
					const {
						value
					} = await reader.read();
					const chunk = decoder.decode(value);
					str += chunk
					// console.log("str 合并中 =>", str);
					if (chunk.indexOf('message_end') != -1) {
						console.log("================= 接收结束 开始处理 ===============");
						const chunks = str.split('data:');
						let wantData = ''
						for (let i = 0; i < chunks.length; i++) {
							console.log("chunks[i] =>", chunks[i]);
							if (chunks[i].indexOf('workflow_finished') != -1) {
								console.log("chunks[i] =>", JSON.parse(chunks[i]));
								const jsonData = JSON.parse(chunks[i]);
								const answer = jsonData.data.outputs.answer;
								if (answer) {
									const decodedAnswer = JSON.parse((answer));
									console.log(`事件[${jsonData.event}] 解码后的答案:`,
										decodedAnswer);

									const aiMessage = {
										type: 'ai',
										content: decodedAnswer
									};
									chatMessages.push(aiMessage);
									console.log("chatMessages =>", chatMessages);
									scrollToLatestMessage();
								}
								break;
							}
						}
						console.log("chunks 数组 =>", chunks);
						console.log("================= 接收结束 处理完成开始渲染 ===============");
						break
					};
				}
			}


			const callAIInterface = (userQuery, retryCount = 0) => {
				const MAX_RETRIES = 3;
				// const url = 'http://island.zhangshuiyi.com/island/front/ai/chat/chatMessage-stream-flux';
				const url = 'http://island.zhangshuiyi.com/island/front/ai/chat/chatMessage-stream';
				const data = {
					conversation_id: '',
					inputs: {
						original_intention: '',
						recommended_plan: ''
					},
					query: userQuery,
					webMode: ''
				};

				if (retryCount > 0) {
					uni.showToast({
						title: `第${retryCount}次重试连接...`,
						icon: 'none',
						duration: 2000
					});
				}

				console.log('Current token:', token.value);

				const requestTask = uni.request({
					url: url,
					method: 'POST',
					header: {
						'Content-Type': 'application/json',
						'X-Access-Token': token.value
					},
					data: JSON.stringify(data),
					responseType: 'text',
					enableChunked: true,
					timeout: 30000,
					success: (res) => {
						console.log('请求成功:', res);
					},
					fail: (err) => {
						console.error('请求失败:', err);

						if (err.errMsg && err.errMsg.includes('timeout')) {
							const lastMessage = chatMessages[chatMessages.length - 1];
							if (lastMessage.type === 'ai') {
								lastMessage.thinking = false;
								lastMessage.content = '请求超时，请重试';
							} else {
								chatMessages.push({
									type: 'ai',
									content: '请求超时，请重试',
									thinking: false
								});
							}

							uni.showToast({
								title: '请求超时，请重试',
								icon: 'none',
								duration: 3000
							});

							globalUpdateKey.value = Date.now();
							updateCounter.value++;
						}
					}
				});

				requestTask.onChunkReceived((res) => {
					try {
						const uint8Array = new Uint8Array(res.data);
						const decoder = new TextDecoder('utf-8');
						const text = decoder.decode(uint8Array);
						console.log('收到的原始数据:', text);

						if (text.startsWith('data:')) {
							const jsonStr = text.substring(5).trim();
							try {
								const jsonData = JSON.parse(jsonStr);
								console.log('解析到的JSON数据:', jsonData);

								if (jsonData.event === 'message') {
									let answer = '';
									if (jsonData.data && jsonData.data.outputs && jsonData.data
										.outputs
										.answer) {
										answer = jsonData.data.outputs.answer;
									} else if (jsonData.answer !== undefined) {
										answer = jsonData.answer;
									}

									if (answer) {
										const decodedAnswer = decodeUnicode(answer);
										console.log(`事件[${jsonData.event}] 解码后的答案:`,
											decodedAnswer);

										const aiMessage = {
											type: 'ai',
											content: [
												// 这里可以根据需要解析并生成结构化的回复
												{
													type: "text",
													id: "",
													content: decodedAnswer
												}
											]
										};
										chatMessages.push(aiMessage);
										scrollToLatestMessage();
									}
								}
							} catch (jsonError) {
								console.warn('JSON解析错误:', jsonError);
							}
						}
					} catch (e) {
						console.error('数据处理失败:', e);
					}
				});
			};

			const decodeUnicode = (str) => {
				if (!str) return "";

				try {
					if (typeof str === "string") {
						return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
							String.fromCharCode(parseInt(hex, 16))
						);
					}
					return str;
				} catch (e) {
					console.error("Unicode 解码失败:", e);
					return str;
				}
			};

			const navigatortopaymoent = () => {
				uni.navigateTo({
					url: "/pages/payment/payment",
				});
			};

			const scrollToLatestMessage = () => {
				const lastIndex = chatMessages.length;
				scrollIntoView.value = `msg-${lastIndex}`;
			};

			const scrollToBottom = () => {
				if (!enableAutoScroll.value) {
					return;
				}

				const query = uni.createSelectorQuery();
				query
					.select(".chat-container")
					.boundingClientRect((data) => {
						if (data) {
							viewportHeight.value = data.height;

							const messageQuery = uni.createSelectorQuery();
							messageQuery
								.selectAll(".message")
								.boundingClientRect((messages) => {
									if (messages && messages.length > 0) {
										contentHeight.value = messages.reduce(
											(sum, msg) => sum + msg.height,
											0
										);

										scrollTop.value = contentHeight.value;
										lastScrollTop.value = contentHeight.value;
									}
								})
								.exec();
						}
					})
					.exec();
			};

			const goBack = () => {
				uni.navigateBack({
					delta: 1,
				});
			};

			const showMore = () => {
				uni.showActionSheet({
					itemList: ["清空聊天记录", "设置", "关于"],
					success: (res) => {
						console.log("Selected option:", res.tapIndex);
					},
				});
			};

			const showAddOptions = () => {
				uni.showActionSheet({
					itemList: ["拍照", "从相册选择", "位置"],
					success: (res) => {
						console.log("Selected option:", res.tapIndex);
					},
				});
			};

			onMounted(() => {
				setTimeout(() => {
					scrollToBottom();
				}, 100);
			});

			const onScrollToUpper = () => {
				console.log("到达顶部");
			};

			const SCROLL_BOTTOM_THRESHOLD = 10;

			const onScroll = (e) => {
				const currentScrollTop = e.detail.scrollTop;

				const query = uni.createSelectorQuery();
				query
					.select(".chat-container")
					.boundingClientRect((data) => {
						if (data) {
							viewportHeight.value = data.height;

							const messageQuery = uni.createSelectorQuery();
							messageQuery
								.selectAll(".message")
								.boundingClientRect((messages) => {
									if (messages && messages.length > 0) {
										contentHeight.value = messages.reduce(
											(sum, msg) => sum + msg.height,
											0
										);

										const distanceFromBottom =
											contentHeight.value -
											(currentScrollTop + viewportHeight.value);
										if (distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD) {
											enableAutoScroll.value = true;
										} else {
											if (currentScrollTop > lastScrollTop.value) {
												enableAutoScroll.value = false;
											}
										}
									}
								})
								.exec();
						}
					})
					.exec();

				lastScrollTop.value = currentScrollTop;
			};

			return {
				inputMessage,
				scrollTop,
				scrollIntoView,
				enableAutoScroll,
				categories,
				chatMessages,
				updateCounter,
				globalUpdateKey,
				selectCategory,
				getCategoryName,
				sendMessage,
				navigatortopaymoent,
				scrollToBottom,
				onScrollToUpper,
				onScroll,
				handleItemClick,
				confirmTrip,
				goBack,
				showMore,
				showAddOptions,
				decodeUnicode,
			};
		},
	};
</script>

<style>
	/* 保留原有的样式 */
	.markdown-content {
		font-size: 28rpx;
		line-height: 1.6;
		color: #333;
		word-wrap: break-word;
	}

	.heading-1 {
		font-size: 40rpx;
		font-weight: bold;
		margin: 30rpx 0 20rpx;
		padding-bottom: 10rpx;
		border-bottom: 2rpx solid #eee;
	}

	.heading-2 {
		font-size: 36rpx;
		font-weight: bold;
		margin: 25rpx 0 15rpx;
	}

	.heading-3 {
		font-size: 32rpx;
		font-weight: bold;
		margin: 20rpx 0 10rpx;
	}

	.paragraph {
		margin: 16rpx 0;
	}

	.unordered-list,
	.ordered-list {
		margin: 16rpx 0;
		padding-left: 40rpx;
	}

	.list-item {
		margin: 8rpx 0;
	}

	.code-block {
		background-color: #f5f5f5;
		border-radius: 8rpx;
		padding: 20rpx;
		margin: 16rpx 0;
		font-family: monospace;
		white-space: pre-wrap;
		word-wrap: break-word;
		font-size: 24rpx;
	}

	.inline-code {
		background-color: #f5f5f5;
		padding: 4rpx 8rpx;
		border-radius: 4rpx;
		font-family: monospace;
		font-size: 24rpx;
	}

	.blockquote {
		border-left: 8rpx solid #ddd;
		padding: 16rpx 32rpx;
		margin: 16rpx 0;
		color: #666;
		background-color: #f9f9f9;
	}

	.table {
		width: 100%;
		margin: 16rpx 0;
		border-collapse: collapse;
	}

	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f5f5;
		padding: 0 10px;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 15px;
		height: 44px;
		background-color: #4285f4;
		color: #ffffff;
		position: relative;
	}

	.back-icon,
	.more-icon {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.title {
		font-size: 18px;
		font-weight: 500;
	}

	.chat-container {
		flex: 1;
		overflow-y: auto;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 4px;
		overflow: hidden;
		flex-shrink: 0;
	}

	.ai-avatar {
		background-color: #4285f4;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ai-avatar image {
		width: 22px;
		height: 22px;
		object-fit: contain;
	}

	.user-avatar {
		background-color: #4caf50;
	}

	.user-avatar image {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.category-item {
		width: 18%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 12px;
	}

	.response-image {
		width: 100%;
		border-radius: 8px;
		margin-bottom: 12px;
	}

	.itinerary-container {
		background-color: #ffffff;
		border-radius: 8px;
		padding: 16px;
		margin-top: 12px;
	}

	.itinerary-title {
		font-size: 12px;
		font-weight: bold;
		margin-bottom: 16px;
		color: #333333;
	}

	.itinerary-section {
		margin-bottom: 16px;
	}

	.section-title {
		font-weight: bold;
		display: block;
		margin-bottom: 12px;
		color: #333333;
	}

	.itinerary-item {
		margin-bottom: 10px;
		display: flex;
	}

	.time {
		font-weight: bold;
		margin-right: 8px;
		width: 45px;
		flex-shrink: 0;
		color: #333333;
	}

	.detail {
		flex: 1;
		color: #666666;
	}

	.highlight {
		color: #4285f4;
	}

	.recommendations {
		margin-bottom: 16px;
	}

	.recommendation-item {
		margin-bottom: 10px;
	}

	.place {
		font-weight: bold;
		color: #333333;
	}

	.description {
		color: #666666;
		margin-top: 4px;
		display: block;
	}

	.price-container {
		margin-top: 16px;
		margin-bottom: 16px;
		padding-top: 16px;
		border-top: 1px solid #eeeeee;
	}

	.price-info {
		display: flex;
		align-items: baseline;
	}

	.price {
		font-size: 24px;
		font-weight: bold;
		color: #4285f4;
	}

	.price-details {
		font-size: 12px;
		color: #999999;
		margin-left: 8px;
	}

	.discount {
		color: #ff6b6b;
		font-size: 14px;
		margin-top: 6px;
	}

	.confirm-button {
		background-color: #4285f4;
		color: #ffffff;
		border: none;
		border-radius: 6px;
		padding: 12px;
		font-size: 16px;
		width: 100%;
		margin-top: 12px;
	}

	.confirm-button:active {
		opacity: 0.9;
	}

	.input-container {
		display: flex;
		align-items: center;
		padding: 8px 12px;
		background-color: #ffffff;
		border-top: 1px solid #eeeeee;
	}

	.add-icon,
	.send-icon {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.add-icon .iconfont,
	.send-icon .iconfont {
		font-size: 24px;
		color: #4285f4;
	}

	.message {
		display: flex;
		margin-bottom: 16px;
		align-items: flex-start;
	}

	.ai-message {
		align-self: flex-start;
	}

	.user-message {
		align-self: flex-end;
		flex-direction: row-reverse;
	}

	.avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		overflow: hidden;
		flex-shrink: 0;
	}

	.message-content {
		max-width: 70%;
		margin: 0 12px;
		padding: 12px;
		border-radius: 12px;
		background-color: #ffffff;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
		font-size: 14px;
		line-height: 2;
	}

	.user-message .message-content {
		background-color: #4285f4;
		color: #ffffff;
	}

	.category-container {
		display: flex;
		flex-wrap: nowrap;
		justify-content: space-between;
		margin-top: 16px;
		background-color: #ffffff;
		border-radius: 8px;
		padding: 5px;
		width: 100%;
		overflow-x: auto;
	}

	.category-item {
		width: 18%;
		max-width: 60px;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-right: 2px;
		margin-bottom: 8px;
		border: 1px solid #eeeeee;
		border-radius: 8px;
		padding: 5px;
		background-color: #f9f9f9;
		font-size: 12px;
	}

	.category-item:active {
		transform: scale(0.98);
	}

	.category-item image {
		width: 40px;
		height: 40px;
		margin-bottom: 8px;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 15px;
		height: 44px;
		background-color: #4285f4;
		color: #ffffff;
		position: relative;
	}

	.back-icon,
	.more-icon {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #ffffff;
	}

	.title {
		font-size: 18px;
		font-weight: 500;
		color: #ffffff;
	}

	.input-container {
		display: flex;
		align-items: center;
		padding: 8px 12px;
		background-color: #ffffff;
		border-top: 1px solid #eeeeee;
	}

	.message-input {
		flex: 1;
		height: 36px;
		background-color: #f5f5f5;
		border-radius: 18px;
		padding: 0 16px;
		margin: 0 10px;
		font-size: 14px;
	}

	.add-icon,
	.send-icon {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #4285f4;
	}

	/* test.txt中的样式 */
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

	/* 修改 .clickable-span 样式，确保不换行 */
	.clickable-span {
		white-space: nowrap;
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

	/* 新增样式 */
	.total-amount {
		font-size: 18px;
		font-weight: bold;
		color: #4285f4;
		margin: 10px 0;
	}

	.confirm-trip-button {
		background-color: #42b983;
		color: white;
		border: none;
		border-radius: 4px;
		padding: 10px 20px;
		font-size: 16px;
		cursor: pointer;
		margin-top: 10px;
	}
</style>