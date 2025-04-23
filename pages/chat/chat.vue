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
const selectCategory = (category) => {
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

    //
	AIAnswerThinking(fullContent)

	// 模拟AI回复
	// callAIInterface2(chatMessages[chatMessages.length - 1].content);
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
		type: "user",
		content: inputMessage.value,
	});

	// 清空输入框并滚动到最新消息
	inputMessage.value = "";
	scrollToLatestMessage();

	callAIInterface2(chatMessages[chatMessages.length - 1].content);
};

// 在sendMessage中使用此方法会让ai回复一个正在思考中...
const AIAnswerThinking = function (fullContent) {
	// 创建一个空的AI消息
	const aiMessage = {
		type: "ai",
		content: "正在思考中...", // 初始文本，带点
		id: Date.now(),
		thinking: true, // 标记是否为思考状态
		startTime: Date.now(), // 记录开始时间
	};
	// chatMessages.push(aiMessage);
	aiMessage.thinking = false;

	// 响应数据
	aiMessage.content = fullContent;
	aiMessage.typing = true; // 标记正在打字中

	// 直接输出到ai回复框中
	chatMessages.push(aiMessage);

	// 立即触发视图更新
	globalUpdateKey.value = Date.now();
	updateCounter.value++;

	// 确保消息框立即可见
	nextTick(() => {
		scrollToBottom();
	});
};

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

const callAIInterface2 = async (userQuery, retryCount = 0) => {
	const url = "http://island.zhangshuiyi.com/island/front/ai/chat/chatMessage-stream-flux";
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

	const reader = response.body.getReader();
	const decoder = new TextDecoder();

	let str = '';
	while (true) {
		const { value } = await reader.read();
		const chunk = decoder.decode(value);
		str += chunk;
		if (chunk.indexOf('message_end') != -1) {
			console.log("================= 接收结束 开始处理 ===============");
			const chunks = str.split('data:');
			let wantData = '';
			for (let i = 0; i < chunks.length; i++) {
				if (chunks[i].indexOf('workflow_finished') != -1) {
					const jsonData = JSON.parse(chunks[i]);
					const answer = jsonData.data.outputs.answer;
					if (answer) {
						const decodedAnswer = JSON.parse((answer));
						console.log(`事件[${jsonData.event}] 解码后的答案:`, decodedAnswer);

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
			break;
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

	// 读取button_1.txt文件并打印
	const filePath = "/pages/chat/button_1.txt"; // 注意修改为正确的静态资源路径
	readTextFile(filePath)
		.then((jsonData) => {
			console.log("成功读取button_1.txt文件:", jsonData);
			// 判断jsonData是否已经是对象，如果是则直接赋值，如果是字符串则解析
			button_msg1 = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
		})
		.catch((error) => {
			console.error("读取文件失败:", error);
		});
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