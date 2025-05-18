<template>
	<view class="container" :key="globalUpdateKey">
		<!-- Header -->
		<view class="header" :style="{ paddingTop: `${statusBarHeight}px` }">
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
				<view v-else class="message ai-message" :id="`msg-${index + 1}`">
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
							<block v-for="(item, idx) in msg.content" :key="idx">
								<!-- 打字机效果的文本内容（带闪烁光标） -->
								<view v-if="item.type === 'text'" class="text-content"
									:class="{ typing: msg.typing && idx === msg.content.length - 1 }"
									v-html="item.content"></view>
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

							<!-- AI生成标记和交互按钮 -->
							<view class="ai-interaction-container">


								<view class="ai-interaction-buttons">
									<view class="interaction-button like-button" hover-class="button-hover"
										hover-stay-time="50" @tap="likeMessage" @mouseover="showTooltip('点赞', $event)"
										@mouseout="hideTooltip">
										<text class="iconfont icon-like">👍</text>
									</view>
									<view class="interaction-button dislike-button" hover-class="button-hover"
										hover-stay-time="50" @tap="dislikeMessage"
										@mouseover="showTooltip('不喜欢', $event)" @mouseout="hideTooltip">
										<text class="iconfont icon-dislike">👎</text>
									</view>
									<view class="interaction-button copy-button" hover-class="button-hover"
										hover-stay-time="50" @tap="copyMessageContent"
										@mouseover="showTooltip('复制', $event)" @mouseout="hideTooltip">
										<text class="iconfont icon-copy">📋</text>
									</view>
									<view class="interaction-button collect-button" hover-class="button-hover"
										hover-stay-time="50" @tap="collectMessage"
										@mouseover="showTooltip('收藏', $event)" @mouseout="hideTooltip">
										<text class="iconfont icon-collect">❤️</text>
									</view>


								</view>

								<view class="ai-generated-mark">
									内容由AI生成，仅供参考</view>
							</view>
						</view>
					</view>
				</view>
			</block>
		</scroll-view>

		<!-- Input Area -->
		<view class="input-container">
			<view class="add-icon avatar ai-avatar" @tap="showAddOptions" style="background-color: #f5f5f5">
				<image src="/static/chat/add.png"></image>
			</view>
			<input class="message-input" type="text" v-model="inputMessage" placeholder="输入您的需求"
				@confirm="sendMessage" />
			<view class="send-icon avatar ai-avatar" @tap="sendMessage">
				<image src="/static/chat/send.png"></image>
			</view>
		</view>

		<view class="blank"></view>
		<Tabbar />

		<!-- 提示框 -->
		<view class="tooltip-container" v-if="showTooltipFlag"
			:style="{ left: `${tooltipPosition.left}px`, top: `${tooltipPosition.top}px` }">
			<view class="tooltip">{{ tooltipText }}</view>
		</view>
	</view>
</template>

<script setup>
import Tabbar from "../Tabbar/Tabbar.vue";
import { ref, reactive, onMounted, nextTick, computed } from "vue";
import { useUserStore } from "@/store";
import { marked } from "marked";

// 跨平台文件读取函数
const readTextFile = (filePath) => {
	return new Promise((resolve, reject) => {
		// #ifdef H5
		// H5环境下使用Fetch读取
		fetch(filePath)
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.text();
			})
			.then((text) => {
				try {
					const jsonData = JSON.parse(text);
					resolve(jsonData);
				} catch (error) {
					reject(new Error("JSON解析失败: " + error.message));
				}
			})
			.catch((error) => {
				reject(error);
			});
		// #endif

		// #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU
		// 小程序环境
		uni.downloadFile({
			url: filePath,
			success: (downloadResult) => {
				if (downloadResult.statusCode === 200) {
					uni.getFileSystemManager().readFile({
						filePath: downloadResult.tempFilePath,
						encoding: "utf8",
						success: (readResult) => {
							try {
								const jsonData = JSON.parse(readResult.data);
								resolve(jsonData);
							} catch (error) {
								reject(new Error("JSON解析失败: " + error.message));
							}
						},
						fail: (readError) => {
							reject(readError);
						},
					});
				} else {
					reject(new Error("下载文件失败"));
				}
			},
			fail: (downloadError) => {
				reject(downloadError);
			},
		});
		// #endif

		// #ifdef APP-PLUS
		// App环境
		plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
			entry.file((file) => {
				const reader = new plus.io.FileReader();
				reader.onloadend = (e) => {
					try {
						const jsonData = JSON.parse(e.target.result);
						resolve(jsonData);
					} catch (error) {
						reject(new Error("JSON解析失败: " + error.message));
					}
				};
				reader.onerror = (error) => {
					reject(error);
				};
				reader.readAsText(file);
			}, (error) => {
				reject(error);
			});
		}, (error) => {
			reject(error);
		});
		// #endif
	});
};

let button_msg1 = ref([]);
let button_msg2 = ref([]);

// 确保marked是可用的
const markdownParser = typeof marked === "function" ? marked : (text) => text;

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
const safeAreaInsets = ref({});
const statusBarHeight = ref(0);

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
const categories = reactive([
	{
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

// Chat messages
const chatMessages = reactive([]);

// 提示文本
const tooltipText = ref("");
// 提示位置
const tooltipPosition = ref({ left: 0, top: 0 });
// 是否显示提示
const showTooltipFlag = ref(false);

// 显示提示
const showTooltip = (text, event) => {
	tooltipText.value = text;
	showTooltipFlag.value = true;

	// 获取鼠标位置
	const { clientX, clientY } = event;
	// 设置提示框位置（鼠标右下角）
	tooltipPosition.value = {
		left: clientX + 10, // 右偏移10px
		top: clientY + 10, // 下偏移10px
	};
};

// 隐藏提示
const hideTooltip = () => {
	showTooltipFlag.value = false;
};

// 点赞
const likeMessage = () => {
	console.log("点赞")
}

// 点踩
const dislikeMessage = () => {
	console.log("点踩")
}

// 复制消息内容
const copyMessageContent = () => {
	// 获取最后一条AI消息的文本内容
	const lastAIMessage = chatMessages.filter((msg) => msg.type === "ai").pop();

	if (lastAIMessage && lastAIMessage.content) {
		// 如果是数组形式的内容，需要提取文本
		let textContent = "";
		if (Array.isArray(lastAIMessage.content)) {
			textContent = lastAIMessage.content
				// 排除 thinking 状态和非文本类型的内容
				.filter(item =>
					item.type === 'text' &&
					!item.content.includes('<') &&
					!item.content.includes('>')
				)
				.map(item => item.content)
				.join("\n")
				// 去除可能的 HTML 标签
				.replace(/<[^>]*>/g, '');
		} else {
			textContent = lastAIMessage.content;
		}

		// 去除多余的空白字符
		textContent = textContent.trim();

		// 如果没有有效内容，提示用户
		if (!textContent) {
			uni.showToast({
				title: "没有可复制的纯文本内容",
				icon: "none",
			});
			return;
		}

		// 复制到剪贴板
		uni.setClipboardData({
			data: textContent,
			success: () => {
				uni.showToast({
					title: "已复制",
					icon: "none",
				});
			},
			fail: () => {
				uni.showToast({
					title: "复制失败",
					icon: "none",
				});
			},
		});
	} else {
		uni.showToast({
			title: "没有可复制的内容",
			icon: "none",
		});
	}
};

// 收藏
const collectMessage = () => {
	console.log("收藏")
}

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

// 确认行程并弹出提示框
const confirmTrip = () => {
	// 弹出提示框
	uni.showModal({
		title: "确认行程",
		content: "您确定要确认此行程吗？",
		success: (res) => {
			if (res.confirm) {
				console.log("用户点击了确认");

				// 调用封装函数处理数据
				const processedData = processAIMessageData();

				if (processedData && processedData.length > 0) {
					// 打印处理后的数据
					for (let i = 0; i < processedData.length; i++) {
						const { id, type } = processedData[i];
						console.log(`ID: ${id}, 类型: ${type}`);
						// 创建订单数据
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
										schedule: new Date().toISOString().split('T')[0] || '12:00'
									},
									productId: id,  // ID
									productType: type,  // 类型
									quantity: 1,  // 预订数量
								}
							]
						};
						createOrder(orderData)
					}

					// 跳转到订单页面
					uni.switchTab({
						url: "/pages/order/order",
					});
				} else {
					console.log("没有找到有效的 AI 回复内容或 ID");
				}
			} else if (res.cancel) {
				console.log("用户点击了取消");
			}
		},
	});
};

// 创建订单函数
const createOrder = (orderData) => {

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
				// setTimeout(() => {
				// 	uni.navigateTo({
				// 		url: '/pages/order/order'
				// 	});
				// }, 2000);
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

// 封装函数：获取最后一条 AI 消息的内容，提取所有 ID 及对应的类型，并替换特定类型
const processAIMessageData = () => {
	// 获取最后一条 AI 消息的内容
	const lastAIMessage = chatMessages.filter((msg) => msg.type === "ai").pop();

	if (!lastAIMessage || !Array.isArray(lastAIMessage.content)) {
		console.log("没有找到有效的 AI 回复内容");
		return null;
	}

	// 提取所有 ID 及对应的类型
	const idWithType = lastAIMessage.content
		.filter((item) => item.id && item.type) // 确保 item.id 和 item.type 存在
		.map((item) => ({
			id: item.id,
			type: item.type,
		})); // 提取 ID 和类型

	console.log("AI 回复框中的所有 ID 及对应的类型:", idWithType);

	// 替换特定类型
	const typeMapping = {
		Activity: "Activities",
		Transport: "Transportation",
		Accommodation: "Accommodations",
		Restaurant: "Dining",
	};

	// 处理类型替换
	const processedData = idWithType.map((item) => ({
		id: item.id,
		type: typeMapping[item.type] || item.type, // 如果有映射则替换，否则保持原类型
	}));

	console.log("处理后的数据:", processedData);

	return processedData;
};

// Methods
// 显示动态点动画
const showThinkingAnimation = (duration = 3000) => {
	return new Promise((resolve) => {
		const dots = [".", "..", "...", ""];
		let count = 0;
		let dotCount = 0;

		// 添加思考中消息
		const messageId = Date.now();
		chatMessages.push({
			type: "ai",
			content: "正在思考中",
			id: messageId,
			thinking: true
		});
		scrollToLatestMessage();

		// 启动动画
		const interval = setInterval(() => {
			const messageIndex = chatMessages.findIndex(msg => msg.id === messageId);
			if (messageIndex !== -1) {
				dotCount = (dotCount + 1) % dots.length;
				chatMessages[messageIndex].content = `正在思考中${dots[dotCount]}`;
				updateCounter.value++;
			}

			count += 200;
			if (count >= duration) {
				clearInterval(interval);

				// 移除动画消息
				const removeIndex = chatMessages.findIndex(msg => msg.id === messageId);
				if (removeIndex !== -1) {
					chatMessages.splice(removeIndex, 1);
				}
				resolve();
			}
		}, 200);
	});
};

const selectCategory = async (category) => {
	console.log("Selected category:", category);
	chatMessages.push({
		type: "user",
		content: `我想了解${getCategoryName(category)}的详细信息`,
	});
	scrollToLatestMessage();

	// 从json中获取响应数据
	let fullContent = [];
	switch (category) {
		case "fishing":
			fullContent = button_msg1["海钓体验"];
			break;
		case "snorkeling":
			fullContent = button_msg1["浮潜探索"];
			break;
		case "family":
			fullContent = button_msg1["亲子娱乐"];
			break;
		case "leisure":
			fullContent = button_msg1["休闲畅游"];
			break;
		case "island":
			fullContent = button_msg1["海岛介绍"];
			break;
	}

	// 先显示3秒思考动画
	await showThinkingAnimation(3000);

	// 然后显示AI回复
	AIAnswerThinking(fullContent);
};

const getCategoryName = (categoryId) => {
	const category = categories.find((item) => item.id === categoryId);
	return category ? category.name : "";
};


// 输入框左侧那个加号
const showAddOptions = () => {
	console.log("加号")
}

// 输入框输入提问
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
		type: "user",
		content: inputMessage.value,
	});

	// 清空输入框并滚动到最新消息
	inputMessage.value = "";
	scrollToLatestMessage();

	console.log("最新消息:", chatMessages[chatMessages.length - 1].content)


	// 判断上一条消息是否存在，初始的时候chatMessages.length为0
	if (chatMessages.length > 1) {  // 存在上一条消息
		let lastMessage = chatMessages[chatMessages.length - 2].content
		console.log("上一条消息:", lastMessage)
		// 将 Proxy 转换为普通数组
		const normalArray = Array.from(lastMessage);
		// 将每个对象转换为字符串形式
		const stringifiedObjects = normalArray.map(item => {
			return JSON.stringify(item);
		});
		// 将所有字符串连接成一个字符串
		const resultString = stringifiedObjects.join(',');

		console.log("上一条消息转String后的结果:", resultString);
		// 将上一条消息转String后的结果传递给AI接口作为参数
		callAIInterface2(chatMessages[chatMessages.length - 1].content, resultString);


	} else {  // 不存在上一条消息
		console.log("不存在上一条消息")
		// 直接调用AI接口
		callAIInterface(chatMessages[chatMessages.length - 1].content);
	}
};

// 在sendMessage中使用此方法会让ai回复一个正在思考中...
const AIAnswerThinking = function (fullContent) {
	// 创建一个空的AI消息
	const aiMessage = {
		type: "ai",
		content: Array.isArray(fullContent)
			? fullContent.map(item => ({
				type: item.type || 'text',
				id: item.id || '',
				content: ''
			}))
			: [{ type: 'text', content: '' }],
		id: Date.now(),
		thinking: false,
		typing: true
	};

	// 添加到消息列表
	const messageIndex = chatMessages.push(aiMessage) - 1;

	// 使用打字机效果显示内容
	typewriterEffect(chatMessages[messageIndex], fullContent);


	// 确保消息框立即可见
	nextTick(() => {
		scrollToBottom();
	});
};

// 优化后的打字机效果函数（解决抖动问题）
let isTypingScroll = false;
let lastContentHeight = 0;
let scrollAnimationFrame = null;

const typewriterEffect = (message, fullContent, delay = 30) => {
	// 标准化输入内容
	const contentArray = Array.isArray(fullContent)
		? fullContent
		: [{ type: 'text', content: String(fullContent) }];

	// 初始化消息内容
	message.content = contentArray.map(item => ({
		type: item.type || 'text',
		id: item.id || '',
		content: ''
	}));

	let currentIndex = 0;
	let currentChar = 0;
	let lastScrollTime = 0;

	const typeNext = () => {
		if (currentIndex >= contentArray.length) {
			message.typing = false;
			isTypingScroll = false;
			// 最终确保滚动到底部
			requestAnimationFrame(() => {
				scrollToBottom();
			});
			return;
		}

		const currentItem = contentArray[currentIndex];
		const text = currentItem.content || '';

		if (currentChar < text.length) {
			message.content[currentIndex].content = text.substring(0, currentChar + 1);
			currentChar++;
			updateCounter.value++;

			// 只在内容高度变化超过50px时才触发全局更新
			const query = uni.createSelectorQuery();
			query.select('.chat-container').boundingClientRect(data => {
				if (data && Math.abs(data.height - lastContentHeight) > 50) {
					globalUpdateKey.value = Date.now();
					lastContentHeight = data.height;
				}
			}).exec();

			// 使用requestAnimationFrame优化滚动性能
			if (scrollAnimationFrame) {
				cancelAnimationFrame(scrollAnimationFrame);
			}
			scrollAnimationFrame = requestAnimationFrame(() => {
				const now = Date.now();
				if (!isTypingScroll || now - lastScrollTime > 150) { // 延长节流时间到150ms
					isTypingScroll = true;
					lastScrollTime = now;
					scrollToBottom();
				}
			});

			setTimeout(typeNext, delay);
		} else {
			currentIndex++;
			currentChar = 0;
			setTimeout(typeNext, delay * 3);
		}
	};

	// 开始打字效果
	message.typing = true;
	isTypingScroll = true;
	typeNext();
};

const scrollToLatestMessage = () => {
	const lastIndex = chatMessages.length;
	scrollIntoView.value = `msg-${lastIndex}`;
};

const scrollToBottom = () => {
	if (!enableAutoScroll.value) {
		return;
	}

	// 使用更平滑的滚动方式
	uni.pageScrollTo({
		scrollTop: 999999, // 足够大的值确保滚动到底部
		duration: 200, // 平滑滚动动画
		selector: '.chat-container',
		fail: () => {
			// 备用方案
			const query = uni.createSelectorQuery();
			query.select('.chat-container').boundingClientRect(rect => {
				if (rect) {
					scrollTop.value = rect.height;
				}
			}).exec();
		}
	});
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

// 显示思考动画2 - 带点动画效果
const showThinkingAnimation2 = () => {
	const messageId = Date.now();
	const dots = ['', '.', '..', '...'];
	let dotIndex = 0;

	// 添加思考中消息
	chatMessages.push({
		type: "ai",
		content: `正在思考中${dots[dotIndex]}`,
		id: messageId,
		thinking: true
	});
	scrollToLatestMessage();

	// 启动点动画
	const intervalId = setInterval(() => {
		dotIndex = (dotIndex + 1) % dots.length;
		const msgIndex = chatMessages.findIndex(msg => msg.id === messageId);
		if (msgIndex !== -1) {
			chatMessages[msgIndex].content = `正在思考中${dots[dotIndex]}`;
			updateCounter.value++;
		}
	}, 300);

	// 返回清除函数
	return () => {
		clearInterval(intervalId);
		const msgIndex = chatMessages.findIndex(msg => msg.id === messageId);
		if (msgIndex !== -1) {
			chatMessages.splice(msgIndex, 1);
		}
	};
};

// AI接口调用
const callAIInterface = async (userQuery, retryCount = 0) => {
	const url = "https://island.zhangshuiyi.com/island/front/ai/chat/chatMessage-stream-flux"; // 修复了 URL 格式
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

	// 显示思考动画
	const clearAnimation = showThinkingAnimation2();
	let response;
	try {
		response = await fetch(url, {
			method: 'POST',
			headers: {
				'X-Access-Token': token.value,
				'Content-Type': 'application/json', // 必须与 Body 格式匹配
			},
			body: body, // 可以是字符串、FormData、Blob 等
		});

		const reader = response.body.getReader();
		const decoder = new TextDecoder();

		let str = '';
		while (true) {
			const { value } = await reader.read();
			const chunk = decoder.decode(value);
			str += chunk;
			if (chunk.indexOf('message_end') != -1) {
				// 数据接收完成，清除动画
				clearAnimation();
				console.log("================= 接收结束 开始处理 ===============");
				const chunks = str.split('data:');
				let wantData = '';
				for (let i = 0; i < chunks.length; i++) {
					if (chunks[i].indexOf('workflow_finished') != -1) {
						const jsonData = JSON.parse(chunks[i]);
						const answer = jsonData.data.outputs.answer;
						if (answer) {
							const decodedAnswer = JSON.parse(answer);
							console.log(`事件[${jsonData.event}] 解码后的答案:`, decodedAnswer);

							// 先创建空消息对象
							const aiMessage = {
								type: 'ai',
								content: Array.isArray(decodedAnswer)
									? decodedAnswer.map(item => ({
										type: item.type,
										id: item.id || '',
										content: ''
									}))
									: [{ type: 'text', content: '' }],
								typing: true
							};
							// 添加到消息列表
							const messageIndex = chatMessages.push(aiMessage) - 1;
							console.log("chatMessages =>", chatMessages);
							// 使用打字机效果填充内容
							typewriterEffect(chatMessages[messageIndex], decodedAnswer);
							scrollToLatestMessage();
						}
						break;
					}
				}
				console.log("chunks 数组 =>", chunks);
				console.log("================= 接收结束 处理完成开始渲染 ===============");
				break;
			}
		}
	} catch (error) {
		// 添加错误处理逻辑
		console.error("发生错误:", error);
		if (retryCount < 3) { // 添加重试逻辑
			console.log(`重试第 ${retryCount + 1} 次...`);
			return callAIInterface(userQuery, retryCount + 1);
		} else {
			console.error("达到最大重试次数，请求失败");
			// 处理最终失败的情况，例如显示错误消息给用户
		}
	}
};

// AI接口调用的基础上，需要传递上一次AI返回的数据
const callAIInterface2 = async (userQuery, lastMessage, retryCount = 0) => {
	const url = "https://island.zhangshuiyi.com/island/front/ai/chat/chatMessage-stream-flux";
	const data = {
		conversation_id: '',
		inputs: {
			original_intention: '',
			recommended_plan: lastMessage
		},
		query: userQuery,
		webMode: ''
	};

	const body = JSON.stringify(data);
	console.log("AI接口函数2，请求数据：", body);

	// 显示思考动画
	const clearAnimation = showThinkingAnimation2();
	
	try {
		// 先创建一个空的AI消息对象
		const aiMessage = {
			type: 'ai',
			content: [], // 初始为空数组
			id: Date.now(),
			thinking: false,
			typing: true
		};
		
		// 添加到消息列表
		const messageIndex = chatMessages.push(aiMessage) - 1;
		scrollToLatestMessage();
		
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'X-Access-Token': token.value,
				'Content-Type': 'application/json',
			},
			body: body,
		});

		// 清除思考动画
		clearAnimation();
		
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		
		// 存储接收到的数据块
		let buffer = '';
		
		while (true) {
			const { value, done } = await reader.read();
			
			if (done) {
				console.log("流读取完成");
				break;
			}
			
			// 解码新接收的数据
			const chunk = decoder.decode(value, { stream: true });
			buffer += chunk;
			
			// 处理接收到的数据
			const dataLines = buffer.split('\n');
			
			// 保留最后一行，可能是不完整的
			buffer = dataLines.pop() || '';
			
			for (const line of dataLines) {
				if (!line.trim() || !line.startsWith('data:')) continue;
				
				try {
					const content = line.substring(5); // 移除 'data:' 前缀
					const jsonData = JSON.parse(content);
					
					// 根据事件类型处理数据
					if (jsonData.event === 'workflow_started') {
						console.log("流式响应开始");
					} 
					else if (jsonData.event === 'workflow_step') {
						// 处理中间步骤数据（如果有）
					} 
					else if (jsonData.event === 'agent_step' && jsonData.data && jsonData.data.outputs && jsonData.data.outputs.answer) {
						// 处理中间的回答数据，添加到消息中
						try {
							const answerData = JSON.parse(jsonData.data.outputs.answer);
							
							// 更新消息内容
							if (Array.isArray(answerData)) {
								// 确保初始化消息内容结构
								if (chatMessages[messageIndex].content.length === 0) {
									chatMessages[messageIndex].content = answerData.map(item => ({
										type: item.type || 'text',
										id: item.id || '',
										content: item.content || ''
									}));
								} else {
									// 使用流式数据更新已有内容
									answerData.forEach((item, idx) => {
										if (idx < chatMessages[messageIndex].content.length) {
											chatMessages[messageIndex].content[idx].content = item.content || '';
										} else {
											chatMessages[messageIndex].content.push({
												type: item.type || 'text',
												id: item.id || '',
												content: item.content || ''
											});
										}
									});
								}
								
								// 强制更新视图
								globalUpdateKey.value = Date.now();
								scrollToBottom();
							}
						} catch (e) {
							console.error("解析agent_step数据失败:", e);
						}
					} 
					else if (jsonData.event === 'workflow_finished' && jsonData.data && jsonData.data.outputs && jsonData.data.outputs.answer) {
						// 处理最终答案
						try {
							const finalAnswer = JSON.parse(jsonData.data.outputs.answer);
							
							// 更新消息的最终内容
							if (Array.isArray(finalAnswer)) {
								chatMessages[messageIndex].content = finalAnswer.map(item => ({
									type: item.type || 'text',
									id: item.id || '',
									content: item.content || ''
								}));
								
								// 标记打字效果完成
								chatMessages[messageIndex].typing = false;
								
								// 强制更新视图并滚动到底部
								globalUpdateKey.value = Date.now();
								scrollToBottom();
							}
						} catch (e) {
							console.error("解析最终答案失败:", e);
						}
					}
				} catch (e) {
					console.error("解析数据行失败:", e, line);
				}
			}
		}
	} catch (error) {
		clearAnimation();
		console.error("发生错误:", error);
		
		if (retryCount < 3) {
			console.log(`重试第 ${retryCount + 1} 次...`);
			return callAIInterface2(userQuery, lastMessage, retryCount + 1);
		} else {
			console.error("达到最大重试次数，请求失败");
			// 显示错误消息
			uni.showToast({
				title: '请求失败，请稍后重试',
				icon: 'none',
				duration: 2000
			});
		}
	}
};

onMounted(() => {
	const { statusBarHeight: sbHeight, safeAreaInsets: insets } = uni.getSystemInfoSync();
	statusBarHeight.value = sbHeight;
	safeAreaInsets.value = insets;
	setTimeout(() => {
		scrollToBottom();
	}, 100);

	// 本地测试：读取button_1.txt文件并打印
	// const filePath = "/pages/chat/button_1.txt"; // 注意修改为正确的静态资源路径
	// readTextFile(filePath)
	// 	.then((jsonData) => {
	// 		console.log("成功读取button_1.txt文件:", jsonData);
	// 		// 判断jsonData是否已经是对象，如果是则直接赋值，如果是字符串则解析
	// 		button_msg1 = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
	// 	})
	// 	.catch((error) => {
	// 		console.error("读取文件失败:", error);
	// 	});

	// 直接赋值
	button_msg1 = {
		"海钓体验": [
			{
				"type": "text",
				"id": "",
				"content": "根据您的需求，我建议如下行程：✅"
			},
			{
				"type": "text",
				"id": "",
				"content": "📝 根据您的需求，我为您设计了一份专注于海钓体验的万山岛旅游行程推荐。以下是详细安排："
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "🗺️ 行程概览"
			},
			{
				"type": "text",
				"id": "",
				"content": "本次行程以海钓为核心，结合万山岛的特色，为您提供一次难忘的体验。"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "⏰ 行程天数"
			},
			{
				"type": "text",
				"id": "",
				"content": "建议安排 1-2天，具体可根据您的停留时间调整。"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "Activity",
				"id": "1",
				"content": "海钓"
			},
			{
				"type": "text",
				"id": "",
				"content": "🎣 海钓体验"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 时长：3-4小时"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 难度：中等"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 价格：800元"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 亮点：在万山岛周边海域体验专业海钓，享受与海洋亲密接触的乐趣。"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "Transport",
				"id": "1",
				"content": "船"
			},
			{
				"type": "text",
				"id": "",
				"content": "🚤 交通安排"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 出发时间：8:00、10:00、14:00"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 费用：100元"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 建议：选择适合您时间的班次前往万山岛。"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "Accommodation",
				"id": "5",
				"content": "万山岛海滨酒店"
			},
			{
				"type": "text",
				"id": "",
				"content": "🏨 住宿推荐"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 房型：标准间"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 价格：450元/晚"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 评分：4.1"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 亮点：靠近海边，方便参与海钓活动。"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "Restaurant",
				"id": "10",
				"content": "岛上美食坊"
			},
			{
				"type": "text",
				"id": "",
				"content": "🍽️ 餐饮推荐"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 营业时间：10:00-21:00"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 人均消费：180元"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 亮点：提供新鲜海鲜，适合海钓后享用。"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "❓ 注意事项"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 海钓活动需提前预约，建议联系当地旅行社或酒店安排。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 请根据天气情况准备防晒、防风装备。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 若需延长停留时间，可考虑增加其他活动或景点游览。"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "💬 总结"
			},
			{
				"type": "text",
				"id": "",
				"content": "本次行程以海钓为核心，结合交通、住宿和餐饮推荐，为您提供一次轻松愉快的万山岛之旅。如有其他需求，欢迎随时咨询！"
			},
			{
				"type": "text",
				"id": "",
				"content": "✅ 祝您旅途愉快！"
			}
		],
		"浮潜探索": [
			{
				"type": "text",
				"id": "",
				"content": "根据您的需求，我建议如下行程：✅"
			},
			{
				"type": "text",
				"id": "",
				"content": "📝 行程概述："
			},
			{
				"type": "text",
				"id": "",
				"content": "您对浮潜活动表现出浓厚兴趣，因此我将为您设计一个以浮潜为核心的万山岛探索行程。以下是基于现有数据的推荐："
			},
			{
				"type": "text",
				"id": "",
				"content": "🗺️ 行程安排："
			},
			{
				"type": "text",
				"id": "",
				"content": "Day 1:"
			},
			{
				"type": "text",
				"id": "",
				"content": "⏰ 上午：抵达万山岛"
			},
			{
				"type": "text",
				"id": "",
				"content": "🚗 交通：建议乘坐"
			},
			{
				"type": "Transport",
				"id": "1",
				"content": "船"
			},
			{
				"type": "text",
				"id": "",
				"content": "，从出发地前往万山岛，预计航程约2小时。"
			},
			{
				"type": "text",
				"id": "",
				"content": "📍 活动：抵达后，前往"
			},
			{
				"type": "Accommodation",
				"id": "3",
				"content": "万山渔家乐"
			},
			{
				"type": "text",
				"id": "",
				"content": "办理入住，稍作休息。"
			},
			{
				"type": "text",
				"id": "",
				"content": "🍽️ 午餐：在"
			},
			{
				"type": "Restaurant",
				"id": "1",
				"content": "海鲜大排档"
			},
			{
				"type": "text",
				"id": "",
				"content": "享用当地海鲜。"
			},
			{
				"type": "text",
				"id": "",
				"content": "⏰ 下午：浮潜初体验"
			},
			{
				"type": "text",
				"id": "",
				"content": "📍 活动：前往"
			},
			{
				"type": "Activity",
				"id": "2",
				"content": "浮潜"
			},
			{
				"type": "text",
				"id": "",
				"content": "，在专业教练的指导下，探索万山岛周边的海底世界，预计活动时间2-3小时。"
			},
			{
				"type": "text",
				"id": "",
				"content": "🍽️ 晚餐：在"
			},
			{
				"type": "Restaurant",
				"id": "4",
				"content": "海鲜酒家"
			},
			{
				"type": "text",
				"id": "",
				"content": "品尝更多海鲜美食。"
			},
			{
				"type": "text",
				"id": "",
				"content": "Day 2:"
			},
			{
				"type": "text",
				"id": "",
				"content": "⏰ 上午：继续浮潜探索"
			},
			{
				"type": "text",
				"id": "",
				"content": "📍 活动：再次体验"
			},
			{
				"type": "Activity",
				"id": "2",
				"content": "浮潜"
			},
			{
				"type": "text",
				"id": "",
				"content": "，深入探索不同的浮潜点，发现更多海洋生物。"
			},
			{
				"type": "text",
				"id": "",
				"content": "🍽️ 午餐：在"
			},
			{
				"type": "Restaurant",
				"id": "10",
				"content": "岛上美食坊"
			},
			{
				"type": "text",
				"id": "",
				"content": "享用午餐。"
			},
			{
				"type": "text",
				"id": "",
				"content": "⏰ 下午：自由活动"
			},
			{
				"type": "text",
				"id": "",
				"content": "📍 活动：您可以选择在岛上自由活动，或者再次体验浮潜。"
			},
			{
				"type": "text",
				"id": "",
				"content": "🍽️ 晚餐：在"
			},
			{
				"type": "Restaurant",
				"id": "2",
				"content": "岛上咖啡馆"
			},
			{
				"type": "text",
				"id": "",
				"content": "享用晚餐。"
			},
			{
				"type": "text",
				"id": "",
				"content": "Day 3:"
			},
			{
				"type": "text",
				"id": "",
				"content": "⏰ 上午：离开万山岛"
			},
			{
				"type": "text",
				"id": "",
				"content": "🚗 交通：乘坐"
			},
			{
				"type": "Transport",
				"id": "2",
				"content": "船"
			},
			{
				"type": "text",
				"id": "",
				"content": "返回出发地，结束愉快的万山岛之旅。"
			},
			{
				"type": "text",
				"id": "",
				"content": "💡 注意事项："
			},
			{
				"type": "text",
				"id": "",
				"content": "1. 浮潜活动需要一定的体力和水性，请根据自身情况选择是否参与。"
			},
			{
				"type": "text",
				"id": "",
				"content": "2. 建议提前预订浮潜活动和住宿，以确保行程顺利。"
			},
			{
				"type": "text",
				"id": "",
				"content": "3. 请关注天气情况，合理安排行程。"
			},
			{
				"type": "text",
				"id": "",
				"content": "🗣️ 总结："
			},
			{
				"type": "text",
				"id": "",
				"content": "以上行程以浮潜为核心，结合了万山岛的特色美食和舒适住宿，为您打造一个难忘的海岛探索之旅。希望这份推荐能够满足您的需求，祝您旅途愉快！"
			}
		],
		"亲子娱乐": [
			{
				"type": "text",
				"id": "",
				"content": "根据您的需求，我建议如下行程：✅"
			},
			{
				"type": "text",
				"id": "",
				"content": "📝 行程概述："
			},
			{
				"type": "text",
				"id": "",
				"content": "您计划与家人（带儿童）一起前往万山岛，主要关注亲子娱乐活动。以下是为您设计的详细行程，确保适合家庭出游，并包含丰富的亲子体验。"
			},
			{
				"type": "text",
				"id": "",
				"content": "🗺️ 行程安排："
			},
			{
				"type": "text",
				"id": "",
				"content": "📅 建议天数：3天2夜"
			},
			{
				"type": "text",
				"id": "",
				"content": "📌 第一天："
			},
			{
				"type": "text",
				"id": "",
				"content": "- 上午：从出发地乘船前往万山岛。"
			},
			{
				"type": "Transport",
				"id": "1",
				"content": "船"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 中午：抵达后入住"
			},
			{
				"type": "Accommodation",
				"id": "3",
				"content": "万山渔家乐"
			},
			{
				"type": "text",
				"id": "",
				"content": "，享用午餐"
			},
			{
				"type": "Restaurant",
				"id": "1",
				"content": "海鲜大排档"
			},
			{
				"type": "text",
				"id": "",
				"content": "。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 下午：前往"
			},
			{
				"type": "Attraction",
				"id": "2",
				"content": "南沙湾"
			},
			{
				"type": "text",
				"id": "",
				"content": "，享受沙滩浴场，适合儿童玩耍。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 晚上：在"
			},
			{
				"type": "Restaurant",
				"id": "4",
				"content": "海鲜酒家"
			},
			{
				"type": "text",
				"id": "",
				"content": "享用晚餐。"
			},
			{
				"type": "text",
				"id": "",
				"content": "📌 第二天："
			},
			{
				"type": "text",
				"id": "",
				"content": "- 上午：参加"
			},
			{
				"type": "Activity",
				"id": "2",
				"content": "浮潜"
			},
			{
				"type": "text",
				"id": "",
				"content": "，适合亲子一起体验海洋生物。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 中午：在"
			},
			{
				"type": "Restaurant",
				"id": "10",
				"content": "岛上美食坊"
			},
			{
				"type": "text",
				"id": "",
				"content": "享用午餐。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 下午：前往"
			},
			{
				"type": "Attraction",
				"id": "10",
				"content": "珊瑚礁区"
			},
			{
				"type": "text",
				"id": "",
				"content": "，观赏美丽的珊瑚礁。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 晚上：返回酒店休息，享用晚餐"
			},
			{
				"type": "Restaurant",
				"id": "7",
				"content": "咖啡小屋"
			},
			{
				"type": "text",
				"id": "",
				"content": "。"
			},
			{
				"type": "text",
				"id": "",
				"content": "📌 第三天："
			},
			{
				"type": "text",
				"id": "",
				"content": "- 上午：参加"
			},
			{
				"type": "Activity",
				"id": "3",
				"content": "徒步"
			},
			{
				"type": "text",
				"id": "",
				"content": "，探索岛屿的自然风光。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 中午：在"
			},
			{
				"type": "Restaurant",
				"id": "2",
				"content": "岛上咖啡馆"
			},
			{
				"type": "text",
				"id": "",
				"content": "享用午餐。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 下午：乘船返回出发地。"
			},
			{
				"type": "Transport",
				"id": "2",
				"content": "船"
			},
			{
				"type": "text",
				"id": "",
				"content": "🚗 交通建议："
			},
			{
				"type": "text",
				"id": "",
				"content": "- 往返万山岛可选择"
			},
			{
				"type": "Transport",
				"id": "1",
				"content": "船"
			},
			{
				"type": "text",
				"id": "",
				"content": "或"
			},
			{
				"type": "Transport",
				"id": "2",
				"content": "船"
			},
			{
				"type": "text",
				"id": "",
				"content": "，具体时间根据您的出发地安排。"
			},
			{
				"type": "text",
				"id": "",
				"content": "🏨 住宿建议："
			},
			{
				"type": "text",
				"id": "",
				"content": "- 推荐入住"
			},
			{
				"type": "Accommodation",
				"id": "3",
				"content": "万山渔家乐"
			},
			{
				"type": "text",
				"id": "",
				"content": "，提供海景房，适合家庭入住。"
			},
			{
				"type": "text",
				"id": "",
				"content": "🍽️ 餐饮建议："
			},
			{
				"type": "text",
				"id": "",
				"content": "- 推荐尝试"
			},
			{
				"type": "Restaurant",
				"id": "1",
				"content": "海鲜大排档"
			},
			{
				"type": "text",
				"id": "",
				"content": "和"
			},
			{
				"type": "Restaurant",
				"id": "4",
				"content": "海鲜酒家"
			},
			{
				"type": "text",
				"id": "",
				"content": "，提供丰富的海鲜选择。"
			},
			{
				"type": "text",
				"id": "",
				"content": "❓ 注意事项："
			},
			{
				"type": "text",
				"id": "",
				"content": "- 请提前确认船票和住宿预订，确保行程顺利。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 亲子活动如浮潜和徒步，请根据儿童年龄和体力情况选择适合的活动。"
			},
			{
				"type": "text",
				"id": "",
				"content": "💬 总结："
			},
			{
				"type": "text",
				"id": "",
				"content": "以上行程专为家庭设计，包含丰富的亲子娱乐活动，确保您和孩子们在万山岛度过一个愉快的假期。如有其他需求或问题，请随时联系我。"
			}
		],
		"休闲畅游": [
			{
				"type": "text",
				"id": "",
				"content": "根据您的需求，我建议如下行程：✅"
			},
			{
				"type": "text",
				"id": "",
				"content": "✅ 根据您的需求，我为您设计了一份万山岛休闲畅游的行程推荐。以下是详细信息："
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "🗺️ 行程概览"
			},
			{
				"type": "text",
				"id": "",
				"content": "本次行程以放松和享受自然为主，适合休闲旅行者。以下是每日安排："
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "📅 第一天：抵达与探索"
			},
			{
				"type": "text",
				"id": "",
				"content": "🕒 时间：全天"
			},
			{
				"type": "text",
				"id": "",
				"content": "📍 地点：万山岛"
			},
			{
				"type": "text",
				"id": "",
				"content": "🚗 交通：建议选择"
			},
			{
				"type": "Transport",
				"id": "1",
				"content": "船"
			},
			{
				"type": "text",
				"id": "",
				"content": "或"
			},
			{
				"type": "Transport",
				"id": "2",
				"content": "船"
			},
			{
				"type": "text",
				"id": "",
				"content": "前往万山岛。"
			},
			{
				"type": "text",
				"id": "",
				"content": "🏨 住宿：推荐入住"
			},
			{
				"type": "Accommodation",
				"id": "3",
				"content": "万山渔家乐"
			},
			{
				"type": "text",
				"id": "",
				"content": "或"
			},
			{
				"type": "Accommodation",
				"id": "5",
				"content": "万山岛海滨酒店"
			},
			{
				"type": "text",
				"id": "",
				"content": "，享受舒适的海景房。"
			},
			{
				"type": "text",
				"id": "",
				"content": "🍽️ 餐饮：晚餐可选择"
			},
			{
				"type": "Restaurant",
				"id": "1",
				"content": "海鲜大排档"
			},
			{
				"type": "text",
				"id": "",
				"content": "，品尝新鲜的海鲜。"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "📅 第二天：自然与活动"
			},
			{
				"type": "text",
				"id": "",
				"content": "🕒 时间：全天"
			},
			{
				"type": "text",
				"id": "",
				"content": "📍 地点：万山岛"
			},
			{
				"type": "text",
				"id": "",
				"content": "🎯 活动："
			},
			{
				"type": "text",
				"id": "",
				"content": "- 上午：体验"
			},
			{
				"type": "Activity",
				"id": "2",
				"content": "浮潜"
			},
			{
				"type": "text",
				"id": "",
				"content": "，探索海底世界。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 下午：选择"
			},
			{
				"type": "Activity",
				"id": "3",
				"content": "徒步"
			},
			{
				"type": "text",
				"id": "",
				"content": "，感受岛上的自然风光。"
			},
			{
				"type": "text",
				"id": "",
				"content": "🍽️ 餐饮：午餐可在"
			},
			{
				"type": "Restaurant",
				"id": "10",
				"content": "岛上美食坊"
			},
			{
				"type": "text",
				"id": "",
				"content": "享用，晚餐推荐"
			},
			{
				"type": "Restaurant",
				"id": "4",
				"content": "海鲜酒家"
			},
			{
				"type": "text",
				"id": "",
				"content": "。"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "📅 第三天：放松与返程"
			},
			{
				"type": "text",
				"id": "",
				"content": "🕒 时间：上午"
			},
			{
				"type": "text",
				"id": "",
				"content": "📍 地点：万山岛"
			},
			{
				"type": "text",
				"id": "",
				"content": "🎯 活动："
			},
			{
				"type": "text",
				"id": "",
				"content": "- 上午：在岛上悠闲散步，享受宁静的海岛时光。"
			},
			{
				"type": "text",
				"id": "",
				"content": "🚗 交通：选择"
			},
			{
				"type": "Transport",
				"id": "1",
				"content": "船"
			},
			{
				"type": "text",
				"id": "",
				"content": "或"
			},
			{
				"type": "Transport",
				"id": "2",
				"content": "船"
			},
			{
				"type": "text",
				"id": "",
				"content": "返回。"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "📊 费用估算"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 交通：约200元/人（往返船票）。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 住宿：约500-800元/晚（根据选择）。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 餐饮：约200-250元/人/天。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 活动：浮潜约300元/人，徒步免费。"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "❓ 注意事项"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 请提前确认船班时间，避免延误。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 建议携带防晒用品和舒适的徒步鞋。"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "💬 总结"
			},
			{
				"type": "text",
				"id": "",
				"content": "这份行程以休闲为主，结合自然探索和放松活动，适合希望在万山岛度过轻松假期的旅行者。如需进一步调整，请随时告知！"
			}
		],
		"海岛介绍": [
			{
				"type": "text",
				"id": "",
				"content": "根据您的需求，我为您整理了关于万山岛的详细介绍：✅"
			},
			{
				"type": "text",
				"id": "",
				"content": "📝 根据您的需求，我为您整理了关于万山岛的详细介绍，以下是基于现有数据库信息的内容："
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "🗺️ 万山岛简介"
			},
			{
				"type": "text",
				"id": "",
				"content": "万山岛是珠海市万山群岛中的一座美丽岛屿，以其自然风光和丰富的海洋资源而闻名。以下是关于万山岛的具体信息："
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "📊 万山岛基本信息"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 岛屿名称：万山岛"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 岛屿ID：102"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "🏖️ 推荐景点"
			},
			{
				"type": "text",
				"id": "",
				"content": "目前数据库中关于万山岛的景点信息暂未提供，但您可以期待以下类型的体验："
			},
			{
				"type": "text",
				"id": "",
				"content": "- 自然景观：如海滩、礁石、森林等。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 文化地标：如灯塔、渔村等。"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "🎣 推荐活动"
			},
			{
				"type": "text",
				"id": "",
				"content": "万山岛适合以下活动（基于数据库中的通用活动推荐）："
			},
			{
				"type": "text",
				"id": "",
				"content": "- "
			},
			{
				"type": "Activity",
				"id": "1",
				"content": "海钓"
			},
			{
				"type": "text",
				"id": "",
				"content": "：适合喜欢钓鱼的游客，价格约800元，时长3-4小时。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- "
			},
			{
				"type": "Activity",
				"id": "2",
				"content": "浮潜"
			},
			{
				"type": "text",
				"id": "",
				"content": "：适合探索海底世界，价格约300元，时长2-3小时。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- "
			},
			{
				"type": "Activity",
				"id": "3",
				"content": "徒步"
			},
			{
				"type": "text",
				"id": "",
				"content": "：适合欣赏自然风光，免费，时长4-8小时。"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "🏨 推荐住宿"
			},
			{
				"type": "text",
				"id": "",
				"content": "以下是万山岛附近的住宿推荐："
			},
			{
				"type": "text",
				"id": "",
				"content": "- "
			},
			{
				"type": "Accommodation",
				"id": "3",
				"content": "万山渔家乐"
			},
			{
				"type": "text",
				"id": "",
				"content": "：海景房，价格500元，评分4.2。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- "
			},
			{
				"type": "Accommodation",
				"id": "5",
				"content": "万山岛海滨酒店"
			},
			{
				"type": "text",
				"id": "",
				"content": "：标准间，价格450元，评分4.1。"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "🍽️ 推荐餐饮"
			},
			{
				"type": "text",
				"id": "",
				"content": "以下是万山岛附近的餐饮推荐："
			},
			{
				"type": "text",
				"id": "",
				"content": "- "
			},
			{
				"type": "Restaurant",
				"id": "1",
				"content": "海鲜大排档"
			},
			{
				"type": "text",
				"id": "",
				"content": "：价格约200元，营业时间11:00-21:00。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- "
			},
			{
				"type": "Restaurant",
				"id": "4",
				"content": "海鲜酒家"
			},
			{
				"type": "text",
				"id": "",
				"content": "：价格约250元，营业时间11:30-21:30。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- "
			},
			{
				"type": "Restaurant",
				"id": "10",
				"content": "岛上美食坊"
			},
			{
				"type": "text",
				"id": "",
				"content": "：价格约180元，营业时间10:00-21:00。"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "🚢 推荐交通"
			},
			{
				"type": "text",
				"id": "",
				"content": "前往万山岛的交通方式主要为船，以下是推荐选项："
			},
			{
				"type": "text",
				"id": "",
				"content": "- "
			},
			{
				"type": "Transport",
				"id": "1",
				"content": "船"
			},
			{
				"type": "text",
				"id": "",
				"content": "：价格100元，出发时间8:00、10:00、14:00。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- "
			},
			{
				"type": "Transport",
				"id": "2",
				"content": "船"
			},
			{
				"type": "text",
				"id": "",
				"content": "：价格100元，出发时间9:30、13:30。"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "❓ 注意事项"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 目前数据库中关于万山岛的景点信息较少，建议您进一步咨询当地旅游部门或导游以获取更多详细信息。"
			},
			{
				"type": "text",
				"id": "",
				"content": "- 活动价格和交通时间可能因季节或天气变化而调整，请提前确认。"
			},
			{
				"type": "text",
				"id": "",
				"content": "---"
			},
			{
				"type": "text",
				"id": "",
				"content": "📢 如果您有更多具体需求（如预算、旅行日期、人数等），请告诉我，我可以为您进一步优化推荐！"
			}
		]
	}
});
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
	padding-bottom: 60px;
	/* 增加底部间距，为输入框和消息之间留出更多空间 */
	margin-bottom: 20px;
	/* 在聊天容器和输入框之间增加间隔 */
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

/* iconfont 样式 */
.ai-interaction-container {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 30px;
}

.ai-generated-mark {
	font-size: 12px;
	color: #999;
	position: relative;
	white-space: nowrap;
	display: inline-block;
	top: 60px;
	left: -240px;
}

.ai-interaction-buttons {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	gap: 10px;
	margin-left: auto;
}

.iconfont {
	font-family: "iconfont" !important;
	font-size: 22px;
	font-style: normal;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.icon-like:before {
	color: #4285f4;
}

.icon-dislike:before {
	color: #ff6b6b;
}

.icon-copy:before {
	color: #666;
}

.icon-collect:before {
	color: #ffc107;
}

.interaction-button {
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 10px;
	border-radius: 50%;
	background-color: rgba(0, 0, 0, 0.05);
	transition: background-color 0.3s;
	cursor: pointer;
	position: relative;
}

.interaction-button:hover {
	background-color: rgba(0, 0, 0, 0.1);
}

.interaction-button:active {
	background-color: rgba(0, 0, 0, 0.15);
}



/* 提示文本样式 */
.tooltip-container {
	position: fixed;
	pointer-events: none;
	z-index: 100;
}

.tooltip {
	position: absolute;
	background-color: rgba(0, 0, 0, 0.7);
	color: white;
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 12px;
	white-space: nowrap;
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
	position: fixed;
	bottom: 80px;
	/* Tabbar高度 */
	left: 0;
	right: 0;
	z-index: 100;
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

/* 修改 .trip-item 样式，确保不换行、蓝色字体、下划线、无背景色 */
.trip-item {
	white-space: nowrap;
	/* 不换行 */
	color: #4285f4;
	/* 蓝色字体 */
	text-decoration: underline;
	/* 下划线 */
	cursor: pointer;
	background-color: transparent;
	/* 无背景色 */
}

.transport,
.accommodation,
.restaurant,
.activity {
	cursor: pointer;
	padding: 5px;
	border-radius: 4px;
}

/* .transport {
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
} */

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

/* 占位的 */
.blank {
	height: 100rpx;
	/* 与Tabbar高度一致，使用rpx单位 */
}
</style>