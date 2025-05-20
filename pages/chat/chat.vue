<template>
	<view class="container" :key="globalUpdateKey">
		<!-- Header -->
		<view class="header" :style="{ paddingTop: `${Math.max(10, statusBarHeight/2)}px` }">
			<view class="back-icon avatar ai-avatar" @tap="goBack"></view>
			<view class="title">AI旅游助手</view>
			<view class="more-icon avatar ai-avatar" @tap="showMore">
				<image src="/static/chat/more.png"></image>
			</view>
		</view>

		<!-- Chat Container -->
		<scroll-view scroll-y class="chat-container" :scroll-top="scrollTop" scroll-with-animation
			:scroll-into-view="scrollIntoView" :scroll-anchoring="true" enhanced :show-scrollbar="false"
			@scrolltoupper="onScrollToUpper" @scroll="onScroll" style="margin-top: 10px">
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
									:class="{ typing: msg.typing && idx === msg.content.length - 1 }">
									<!-- 思考过程收纳组件 -->
									<view v-if="item.hasThinking && item.thinkingContent" class="thinking-container">
										<view class="thinking-header" :class="{ 'open': item.thinkingOpen }" @click="event => toggleThinking(item, event)">
											<text class="thinking-icon">{{ item.thinkingOpen ? '∧' : '∨' }}</text>
											<text class="thinking-title">AI思考过程</text>
											<view class="thinking-action">
												<text>{{ item.thinkingOpen ? '收起' : '展开' }}</text>
											</view>
										</view>
										<view v-show="item.thinkingOpen" class="thinking-content">{{ item.thinkingContent }}</view>
									</view>
                                    <!-- 分隔线，更清晰地区分思考和内容 -->
                                    <view v-if="item.hasThinking && item.thinkingContent" class="thinking-content-separator"></view>
									<!-- 主要内容 -->
									<span v-if="item.display === 'inline'" style="display:inline;">{{ item.content }}</span>
									<span v-else-if="item.content.includes('---')" class="content-with-dividers">
										<div v-for="(part, partIdx) in item.content.split('---')" :key="'divider-'+partIdx" class="divider-section">
											<div v-if="partIdx > 0" class="content-divider"></div>
											<div>{{ part.trim() }}</div>
										</div>
									</span>
									<span v-else-if="item.content.includes('\n') && item.content.match(/[\u00a9\u00ae\u2000-\u3300\ud83c\ud000-\ud83e\udfff]/)" class="emoji-content">
										<div class="emoji-line" v-for="(line, lineIdx) in item.content.split('\n')" :key="'emoji-'+lineIdx">
											<template v-if="line.trim().length > 0">
												<!-- 处理Emoji开头的行 -->
												<span v-if="line.match(/^[\u00a9\u00ae\u2000-\u3300\ud83c\ud000-\ud83e\udfff]/)">
													<span class="emoji-prefix">{{ line.match(/^[\u00a9\u00ae\u2000-\u3300\ud83c\ud000-\ud83e\udfff]+/)[0] }}</span>
													<span class="emoji-content-text">{{ line.substring(line.match(/^[\u00a9\u00ae\u2000-\u3300\ud83c\ud000-\ud83e\udfff]+/)[0].length) }}</span>
												</span>
												<!-- 处理普通行 -->
												<span v-else class="normal-line">{{ line }}</span>
											</template>
										</div>
									</span>
									<span v-else>{{ item.content }}</span>
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
								<view v-else-if="item.type === 'table'" class="trip-summary-container">
									<table class="trip-summary-table" v-if="item.content && item.content.length > 0">
										<thead>
											<tr>
												<th>{{ item.content[0]?.name || '项目' }}</th>
												<th>{{ item.content[0]?.price || '费用' }}</th>
												<th>{{ item.content[0]?.remark || '备注' }}</th>
											</tr>
										</thead>
										<tbody>
											<tr v-for="(row, rowIdx) in (item.content && item.content.length > 2 ? item.content.slice(1, -1) : [])" :key="rowIdx">
												<td>{{ row?.name || '' }}</td>
												<td class="price-column">{{ row?.price ? '¥'+row.price : '' }}</td>
												<td>{{ row?.remark || '' }}</td>
											</tr>
											<tr class="trip-summary-total" v-if="item.content && item.content.length > 1">
												<td>{{ item.content[item.content.length-1]?.name || '总计' }}</td>
												<td class="price-column">{{ item.content[item.content.length-1]?.price ? '¥'+item.content[item.content.length-1].price : '' }}</td>
												<td>{{ item.content[item.content.length-1]?.remark || '' }}</td>
											</tr>
										</tbody>
									</table>
									<view v-else class="error-message">表格数据格式错误</view>
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
	
	// 修正样式
	if (document && document.querySelectorAll) {
		setTimeout(() => {
			// 找到所有.trip-item元素并确保内联显示
			document.querySelectorAll('.trip-item').forEach(el => {
				el.style.display = 'inline';
			});
			
			// 找到所有活动、交通等元素并确保内联显示
			document.querySelectorAll('.transport, .accommodation, .restaurant, .activity, .attraction').forEach(el => {
				el.style.display = 'inline';
			});
		}, 100);
	}
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
		console.log("上一条消息类型:", typeof lastMessage, Array.isArray(lastMessage) ? "数组长度:" + lastMessage.length : "");
		
		let resultString = '';
		// 判断lastMessage是否为数组或对象，需要序列化
		if (Array.isArray(lastMessage)) {
			try {
				// 深拷贝数组，避免直接修改原数组
				const deepCopy = JSON.parse(JSON.stringify(lastMessage));
				// 将数组转换为JSON字符串
				resultString = JSON.stringify(deepCopy);
			} catch (e) {
				console.error("转换上一条数组消息时出错:", e);
				resultString = "[]"; // 错误时提供空数组字符串
			}
		} else if (typeof lastMessage === 'object' && lastMessage !== null) {
			try {
				// 深拷贝对象，避免直接修改原对象
				const deepCopy = JSON.parse(JSON.stringify(lastMessage));
				// 将对象转换为JSON字符串
				resultString = JSON.stringify(deepCopy);
			} catch (e) {
				console.error("转换上一条对象消息时出错:", e);
				resultString = "{}"; // 错误时提供空对象字符串
			}
		} else {
			// 处理字符串或其他类型的消息
			resultString = String(lastMessage || "");
		}

		console.log("上一条消息转String后的结果:", resultString);
		// 将上一条消息转String后的结果传递给AI接口作为参数
		callAIInterface2(chatMessages[chatMessages.length - 1].content, resultString);

	} else {  // 不存在上一条消息
		console.log("不存在上一条消息")
		// 直接调用AI接口
		callAIInterface(chatMessages[chatMessages.length - 1].content);
	}
};

// 检测并分离思考过程的函数
const processThinkingContent = (content) => {
	if (typeof content !== 'string') return { mainContent: content, thinkingContent: '' };
	
	// 第一步: 查找行程正式内容的起始位置
	// 这些是标志着正式行程内容开始的标记
	const contentMarkers = [
		'✅', '📝', '🗺️', '📊', '📅', '🌴', 
		'行程概览', '行程安排', '旅行计划', '推荐行程', '**地图/行程**'
	];
	
	let contentStart = content.length; // 默认为内容末尾
	let emojiLineStart = -1; // emoji行开始的位置
	
	// 找到第一个emoji开头的行
	const emojiRegex = /^[\u00a9\u00ae\u2000-\u3300\ud83c\ud000-\ud83e\udfff]/m;
	const emojiMatch = content.match(emojiRegex);
	
	if (emojiMatch && emojiMatch.index !== undefined) {
		emojiLineStart = emojiMatch.index;
	}
	
	// 判断哪些标记出现在文本中，并找到最早出现的位置
	for (const marker of contentMarkers) {
		const pos = content.indexOf(marker);
		if (pos !== -1 && pos < contentStart) {
			contentStart = pos;
		}
	}
	
	// 如果找到了emoji行且在所有内容标记之前，将其视为行程开始
	if (emojiLineStart !== -1 && (emojiLineStart < contentStart || contentStart === content.length)) {
		contentStart = emojiLineStart;
	}
	
	// 思考过程的开始标记
	const thinkingPhrases = [
		'我需要', '让我思考', '思考过程', '首先', 
		'根据您的', '基于您的', '基于你的', '根据你的需求',
		'考虑到', '我来分析', '我将为您', '我将为你'
	];
	
	// 查找思考过程开始的位置
	let thinkingStart = -1;
	for (const phrase of thinkingPhrases) {
		const pos = content.indexOf(phrase);
		if (pos !== -1 && (thinkingStart === -1 || pos < thinkingStart)) {
			thinkingStart = pos;
		}
	}
	
	// 确定主内容和思考内容
	let mainContent = '';
	let thinkingContent = '';
	
	// 情况1: 找到了思考内容和主内容的分界点
	if (thinkingStart !== -1 && contentStart < content.length) {
		// 如果思考在前，行程在后
		if (thinkingStart < contentStart) {
			thinkingContent = content.substring(0, contentStart).trim();
			mainContent = content.substring(contentStart).trim();
		} 
		// 如果行程在前，思考在后 (不太可能，但处理一下)
		else {
			// 这种情况比较特殊，可能是"行程推荐"在前，然后是解释/思考
			mainContent = content.substring(0, thinkingStart).trim();
			thinkingContent = content.substring(thinkingStart).trim();
		}
	}
	// 情况2: 只找到了思考内容的开始
	else if (thinkingStart !== -1) {
		thinkingContent = content.trim();
		mainContent = '';
	}
	// 情况3: 只找到了主内容的开始
	else if (contentStart < content.length) {
		// 所有内容都是主内容
		mainContent = content.trim();
		thinkingContent = '';
	}
	// 情况4: 两者都没找到，尝试基于内容特征识别
	else {
		// 如果内容较长，且不直接以emoji开头，可能是思考过程
		if (content.length > 200 && !content.match(/^[\u00a9\u00ae\u2000-\u3300\ud83c\ud000-\ud83e\udfff]/)) {
			thinkingContent = content.trim();
			mainContent = '';
		} else {
			// 默认整个内容都是主内容
			mainContent = content.trim();
			thinkingContent = '';
		}
	}
	
	// 清理思考内容中的HTML标签
	if (thinkingContent) {
		thinkingContent = thinkingContent.replace(/<\/?[^>]+(>|$)/g, '');
	}
	
	// 如果主内容为空但思考内容不为空，则主内容置为空字符串而不是undefined
	if (!mainContent && thinkingContent) {
		mainContent = '';
	}
	
	return { mainContent, thinkingContent };
};

// 将具有思考过程的内容拆分为两部分：思考过程和主要内容
// 在typewriterEffect函数中的contentArray处理之后添加以下代码
const processContentWithThinking = (contentArray) => {
	if (!Array.isArray(contentArray)) return contentArray;
	
	// 处理数组中的每个项目
	return contentArray.map(item => {
		if (!item) return { type: 'text', content: '' };
		
		if (item.type === 'text' && item.content) {
			const { mainContent, thinkingContent } = processThinkingContent(item.content);
			
			// 如果检测到思考过程，分离成两个项目
			if (thinkingContent) {
				return {
					...item,
					content: mainContent || '',
					thinkingContent: thinkingContent,
					hasThinking: true,
					thinkingOpen: false  // 默认收缩状态
				};
			}
		} else if (item.type === 'table' && item.content) {
			// 确保表格数据有效
			if (!Array.isArray(item.content)) {
				console.warn('表格数据不是数组格式', item.content);
				item.content = [];
			}
		}
		return item;
	});
};

// 修改AIAnswerThinking函数，确保思考过程收缩
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

	// 处理fullContent，检测并分离思考过程，并确保思考内容默认收缩
	console.log("处理AI回复内容...");
	let processedContent;
	if (Array.isArray(fullContent)) {
		// 首先处理分离思考内容
		processedContent = processContentWithThinking(fullContent);
		// 再次确保思考内容默认收缩
		processedContent = processedContent.map(item => {
			if (item && item.hasThinking) {
				console.log("设置思考内容默认收缩");
				return { 
					...item, 
					thinkingOpen: false // 强制设置为收缩状态
				};
			}
			return item;
		});
	} else {
		processedContent = fullContent;
	}
	
	console.log("内容处理完成，思考内容默认收缩状态");

	// 使用打字机效果显示内容
	typewriterEffect(chatMessages[messageIndex], processedContent);

	// 确保消息框立即可见
	nextTick(() => {
		scrollToBottom();
		
		// 添加额外保障，确保思考内容收缩
		setTimeout(() => {
			try {
				// 直接操作DOM强制收缩
				const thinkingContents = document.querySelectorAll('.thinking-content');
				thinkingContents.forEach(el => {
					el.style.display = 'none';
				});
				
				// 确保消息对象中的状态也是关闭的
				if (chatMessages[messageIndex] && 
					Array.isArray(chatMessages[messageIndex].content)) {
					chatMessages[messageIndex].content.forEach(item => {
						if (item && item.hasThinking) {
							item.thinkingOpen = false;
						}
					});
				}
				
				// 更新视图
				globalUpdateKey.value = Date.now();
			} catch (e) {
				console.error('强制收缩思考内容失败:', e);
			}
		}, 100);
	});
};

// 优化后的打字机效果函数（解决抖动问题）
let isTypingScroll = false;
let lastContentHeight = 0;
let scrollAnimationFrame = null;

// 修复typewriterEffect函数中的边界检查问题
const typewriterEffect = (message, fullContent, delay = 30) => {
	if (!message || !fullContent) {
		console.error("typewriterEffect: 无效的参数", { message, fullContent });
		return;
	}
	
	// 标准化输入内容，确保每个内容项具有合法结构并清理内容
	const contentArray = Array.isArray(fullContent)
		? fullContent.map(item => {
			// 确保每个项目是有效对象
			if (!item) return { type: 'text', content: '' };
			
			try {
				// 清理文本内容
				let cleanedContent = '';
				if (item.type === 'text') {
					if (typeof item.content === 'string') {
						cleanedContent = cleanAIContent(item.content);
					} else if (item.content === undefined || item.content === null) {
						cleanedContent = '';
					} else {
						cleanedContent = String(item.content);
					}
				} else if (item.type === 'table') {
					// 确保表格内容是数组
					if (!Array.isArray(item.content)) {
						console.warn('表格内容非数组格式，已创建空数组', item);
						item.content = [];
					}
					cleanedContent = item.content;
				} else {
					cleanedContent = item.content || '';
				}
				
				// 确保内容项包含display属性
				return {
					type: item.type || 'text',
					id: item.id || '',
					content: cleanedContent,
					display: item.type !== 'text' ? 'inline' : 'block' // 非文本类型设置为内联显示
				};
			} catch (error) {
				console.error('处理内容项出错:', error, item);
				return { type: 'text', content: '内容处理错误' };
			}
		})
		: [{ type: 'text', content: String(fullContent || '数据加载出错') }];

	// 安全地初始化消息内容
	try {
	message.content = contentArray.map(item => ({
		type: item.type || 'text',
		id: item.id || '',
		content: ''
	}));
	} catch (e) {
		console.error("初始化消息内容失败:", e);
		// 失败时使用简单文本
		message.content = [{
			type: 'text',
			content: ''
		}];
	}

	let currentIndex = 0;
	let currentChar = 0;
	let lastScrollTime = 0;

	const typeNext = () => {
		if (!message || !message.content) {
			console.error("typeNext: 消息或内容已不存在");
			return;
		}
		
			if (currentIndex >= contentArray.length) {
		message.typing = false;
		isTypingScroll = false;
		
		console.log("打字机效果完成，强制收缩所有思考内容");
		
		// 确保所有思考内容都是收起状态 - 直接操作DOM确保视觉效果正确
		const forceCollapseAllThinking = () => {
			// 1. 先处理数据模型
			if (message.content && Array.isArray(message.content)) {
				message.content.forEach(item => {
					if (item && item.hasThinking) {
						item.thinkingOpen = false;
					}
				});
			}
			
			// 2. 直接操作DOM元素确保视觉状态正确
			setTimeout(() => {
				try {
					// 查找所有thinking-content元素并隐藏
					const thinkingContents = document.querySelectorAll('.thinking-content');
					thinkingContents.forEach(el => {
						el.style.display = 'none';
					});
					
					// 移除所有header的open类
					const thinkingHeaders = document.querySelectorAll('.thinking-header');
					thinkingHeaders.forEach(header => {
						header.classList.remove('open');
					});
					
					console.log(`强制收缩完成: 处理了 ${thinkingHeaders.length} 个思考标题`);
				} catch (e) {
					console.error("DOM操作失败:", e);
				}
			}, 50);
		};
		
		// 应用强制收缩
		forceCollapseAllThinking();
		
		// 强制更新视图
		globalUpdateKey.value = Date.now() + 1;
		
		// 最终确保滚动到底部
		setTimeout(() => {
			// 再次尝试收缩(双重保险)
			forceCollapseAllThinking();
			scrollToBottom();
			globalUpdateKey.value = Date.now() + 2;
		}, 200);
			return;
		}
		
		// 检查数组边界
		if (currentIndex >= contentArray.length || !contentArray[currentIndex]) {
			currentIndex++;
			currentChar = 0;
			setTimeout(typeNext, delay * 3);
			return;
		}

		const currentItem = contentArray[currentIndex];
		if (!currentItem) {
			// 跳过无效项
			currentIndex++;
			setTimeout(typeNext, delay);
			return;
		}
		
		// 确保text是字符串类型
		const text = typeof currentItem.content === 'string' ? currentItem.content : 
					 (currentItem.content === null || currentItem.content === undefined) ? '' : 
					 String(currentItem.content);

		if (currentChar < text.length) {
			// 确保数组边界和对象存在
			if (message.content && 
				Array.isArray(message.content) && 
				currentIndex < message.content.length && 
				message.content[currentIndex]) {
				
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

				// 使用setTimeout代替requestAnimationFrame优化滚动性能
			if (scrollAnimationFrame) {
					clearTimeout(scrollAnimationFrame);
			}
				scrollAnimationFrame = setTimeout(() => {
				const now = Date.now();
				if (!isTypingScroll || now - lastScrollTime > 150) { // 延长节流时间到150ms
					isTypingScroll = true;
					lastScrollTime = now;
					scrollToBottom();
				}
				}, 16); // 约等于60fps的刷新率

			setTimeout(typeNext, delay);
			} else {
				// 如果内容数组不匹配，跳到下一个
				currentIndex++;
				currentChar = 0;
				setTimeout(typeNext, delay * 3);
			}
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
	// 先检查是否已有思考中消息，有则删除
	const existingThinkingIndex = chatMessages.findIndex(msg => msg.thinking === true);
	if (existingThinkingIndex !== -1) {
		chatMessages.splice(existingThinkingIndex, 1);
	}
	
	const messageId = Date.now();
	const dots = ['', '.', '..', '...'];
	let dotIndex = 0;
	let isCleared = false;

	// 添加思考中消息
	const thinkingIndex = chatMessages.push({
		type: "ai",
		content: `正在思考中${dots[dotIndex]}`,
		id: messageId,
		thinking: true
	}) - 1;
	scrollToLatestMessage();

	// 启动点动画
	const intervalId = setInterval(() => {
		// 检查是否已被清除
		if (isCleared) {
			clearInterval(intervalId);
			return;
		}
		
		dotIndex = (dotIndex + 1) % dots.length;
		// 找到消息的位置，只匹配ID即可，思考状态可能被改变
		const msgIndex = chatMessages.findIndex(msg => msg.id === messageId);
		if (msgIndex !== -1 && chatMessages[msgIndex].thinking) {
			chatMessages[msgIndex].content = `正在思考中${dots[dotIndex]}`;
			updateCounter.value++;
		} else {
			// 如果找不到消息或不再处于思考状态，清理定时器
			clearInterval(intervalId);
		}
	}, 300);

	// 返回清除函数 - 确保完全清除思考消息
	return () => {
		isCleared = true;
		clearInterval(intervalId);
		
		// 再次查找消息位置(可能已经改变)，只匹配ID
		const msgIndex = chatMessages.findIndex(msg => msg.id === messageId);
		if (msgIndex !== -1) {
			// 检查是否仍是思考状态，避免删除已转换的消息
			if (chatMessages[msgIndex].thinking) {
				chatMessages.splice(msgIndex, 1);
				// 强制更新视图
				globalUpdateKey.value = Date.now();
			}
		}
	};
};

// 优化cleanAIContent函数，更好地处理emoji和思考过程
const cleanAIContent = (content) => {
	if (typeof content !== 'string') return content;
	
	try {
		// 替换Unicode编码的表情符号
		let cleaned = content.replace(/U\+([0-9A-F]{4,})/g, (match, codePoint) => {
			try {
				return String.fromCodePoint(parseInt(codePoint, 16));
			} catch (e) {
				return match;
			}
		});
		
		// 保留思考过程，但移除<details>标签
		cleaned = cleaned.replace(/<\/?details.*?>/g, '');
		cleaned = cleaned.replace(/<\/?summary.*?>/g, '');
		
		// 移除<ask>标签及其内容
		cleaned = cleaned.replace(/<ask>.*?<\/ask>/gs, '');
		
		// 处理分隔符---，替换为换行（在渲染时会处理为分隔符）
		cleaned = cleaned.replace(/---/g, '\n\n---\n\n');
		
		// 确保emoji行的处理 - 前面留出空行
		cleaned = cleaned.replace(/\n([\u00a9\u00ae\u2000-\u3300\ud83c\ud000-\ud83e\udfff][^\n]*)/g, '\n\n$1');
		
		// 确保所有emoji前都有换行（除了行首）
		const emojiRegex = /(^|[^\n])([^\n]*)([\u00a9\u00ae\u2000-\u3300\ud83c\ud000-\ud83e\udfff]+)([^\n]*\n)/g;
		cleaned = cleaned.replace(emojiRegex, (match, start, before, emoji, after) => {
			// 如果emoji前的内容不是空的，并且emoji不在行首，添加换行
			if (before.trim() && start !== '\n') {
				return `${start}${before}\n${emoji}${after}`;
			}
			return match;
		});
		
		// 特殊处理常见的特定格式（如"行程安排："后面的内容）
		const formatMarkers = ['行程安排：', '行程概览：', '行程详情：', '推荐行程：'];
		formatMarkers.forEach(marker => {
			if (cleaned.includes(marker)) {
				// 确保标记后有换行
				cleaned = cleaned.replace(new RegExp(`${marker}([^\n])`, 'g'), `${marker}\n$1`);
			}
		});
		
		console.log('清理后的内容:', cleaned.substring(0, 50) + '...');
		
		// 处理景点名称后的emoji
		cleaned = cleaned.replace(/(景点|玩法|攻略)([\u00a9\u00ae\u2000-\u3300\ud83c\ud000-\ud83e\udfff]+)/g, '$1<span class="inline-emoji">$2</span>');
		
		// 清理其他HTML标签，但保留我们添加的emoji内联标签
		cleaned = cleaned.replace(/<(?!\/?span class="inline-emoji")[^>]+(>|$)/g, '');
		
		return cleaned.trim();
	} catch (e) {
		console.error("清理AI内容出错:", e);
		return content;  // 出错时返回原始内容
	}
};

// 海钓相关的备用数据
const FISHING_MOCK_DATA = [
  {
    "type": "text",
    "id": "",
    "content": "📌 根据您的海钓需求，我推荐以下万山岛2日行程："
  },
  {
    "type": "text",
    "id": "",
    "content": "🗓️ 第1天"
  },
  {
    "type": "text",
    "id": "",
    "content": "⏰ 08:00 从珠海九洲港乘坐"
  },
  {
    "type": "Transport",
    "id": "2",
    "content": "船"
  },
  {
    "type": "text",
    "id": "",
    "content": "前往万山岛（约100元/人）"
  },
  {
    "type": "text",
    "id": "",
    "content": "⏰ 12:00 到达万山岛并在"
  },
  {
    "type": "Restaurant",
    "id": "10",
    "content": "岛上美食坊"
  },
  {
    "type": "text",
    "id": "",
    "content": "享用午餐（约180元/人）"
  },
  {
    "type": "text",
    "id": "",
    "content": "⏰ 14:00-18:00 参加专业"
  },
  {
    "type": "Activity",
    "id": "1",
    "content": "海钓"
  },
  {
    "type": "text",
    "id": "",
    "content": "活动（约800元/次，含设备和指导）"
  },
  {
    "type": "text",
    "id": "",
    "content": "⏰ 19:00 入住"
  },
  {
    "type": "Accommodation",
    "id": "5",
    "content": "万山岛海滨酒店"
  },
  {
    "type": "text",
    "id": "",
    "content": "（标准间约450元/晚）"
  },
  {
    "type": "text",
    "id": "",
    "content": "⏰ 20:00 在"
  },
  {
    "type": "Restaurant",
    "id": "4",
    "content": "海鲜酒家"
  },
  {
    "type": "text",
    "id": "",
    "content": "享用晚餐（约250元/人）"
  },
  {
    "type": "text",
    "id": "",
    "content": "🗓️ 第2天"
  },
  {
    "type": "text",
    "id": "",
    "content": "⏰ 07:00 在"
  },
  {
    "type": "Restaurant",
    "id": "7",
    "content": "咖啡小屋"
  },
  {
    "type": "text",
    "id": "",
    "content": "享用早餐（约60元/人）"
  },
  {
    "type": "text",
    "id": "",
    "content": "⏰ 08:00-12:00 进行第二次"
  },
  {
    "type": "Activity",
    "id": "1",
    "content": "海钓"
  },
  {
    "type": "text",
    "id": "",
    "content": "活动（可选不同的钓点）"
  },
  {
    "type": "text",
    "id": "",
    "content": "⏰ 13:30 乘坐"
  },
  {
    "type": "Transport",
    "id": "2",
    "content": "船"
  },
  {
    "type": "text",
    "id": "",
    "content": "返回珠海（约100元/人）"
  },
  {
    "type": "text",
    "id": "",
    "content": "💰 费用概算："
  },
  {
    "type": "text",
    "id": "",
    "content": "- 交通：200元（往返船票）"
  },
  {
    "type": "text",
    "id": "",
    "content": "- 住宿：450元（一晚标准间）"
  },
  {
    "type": "text",
    "id": "",
    "content": "- 餐饮：490元（含早中晚餐）"
  },
  {
    "type": "text",
    "id": "",
    "content": "- 活动：800元（一次海钓体验）"
  },
  {
    "type": "text",
    "id": "",
    "content": "总计：约1940元/人"
  },
  {
    "type": "text",
    "id": "",
    "content": "⚠️ 注意事项："
  },
  {
    "type": "text",
    "id": "",
    "content": "1. 请提前预订船票和住宿"
  },
  {
    "type": "text",
    "id": "",
    "content": "2. 建议携带防晒和防风装备"
  },
  {
    "type": "text",
    "id": "",
    "content": "3. 海钓活动需视天气情况而定"
  }
];

// 修改callAIInterface函数，确保思考动画和响应处理的顺序正确
const callAIInterface = async (userQuery, retryCount = 0) => {
	const url = "https://island.zhangshuiyi.com/island/front/ai/chat/chatMessage-stream-flux";
	const data = {
		conversation_id: '',
		inputs: {
			original_intention: '',
			recommended_plan: ''
		},
		query: userQuery,
		webMode: 'MAPP-小程序'
	};

	// 显示思考动画
	const clearAnimation = showThinkingAnimation2();
	
	try {
		// 使用Promise包装请求，以便更好地控制流程
		new Promise((resolve, reject) => {
			uni.request({
				url: url,
			method: 'POST',
				header: {
				'X-Access-Token': token.value,
					'Content-Type': 'application/json'
				},
				data: data,
				timeout: 90000, // 90秒超时
				success: (response) => {
					resolve(response);
				},
				fail: (error) => {
					reject(error);
				}
			});
		})
		.then(response => {
			// 确保思考动画已清除
			clearAnimation();
			
			// 获取完整响应数据
			const responseData = response.data;
			console.log("响应数据类型:", typeof responseData);
			
			if (typeof responseData === 'string') {
				console.log("收到字符串形式的响应，进行解析");
				
				// 查找最后一个workflow_finished事件
				const dataChunks = responseData.split('data:');
				let finalAnswer = null;
				
				// 从后向前查找有效的workflow_finished事件
				for (let i = dataChunks.length - 1; i >= 0; i--) {
					const chunk = dataChunks[i].trim();
					if (!chunk) continue;
					
					try {
						const jsonData = JSON.parse(chunk);
						if (jsonData.event === 'workflow_finished' && 
							jsonData.data && jsonData.data.outputs && 
							jsonData.data.outputs.answer) {
							
							try {
								// 尝试解析答案
								const answerData = jsonData.data.outputs.answer;
								
									// 处理不同类型的答案数据
						if (typeof answerData === 'string') {
							try {
								finalAnswer = JSON.parse(answerData);
								console.log("找到最终答案(来自字符串JSON)", finalAnswer);
								
								// 额外验证确保表格数据结构正确
								if (Array.isArray(finalAnswer)) {
									finalAnswer = finalAnswer.map(item => {
										if (item && item.type === 'table') {
											if (!Array.isArray(item.content)) {
												console.warn('表格内容不是数组，重置为空数组', item);
												return { ...item, content: [] };
											}
										}
										return item;
									});
								}
							} catch (parseError) {
								console.error("解析答案字符串为JSON失败:", parseError);
								// 若无法解析为JSON，则创建简单文本内容
								finalAnswer = [{ type: 'text', content: answerData }];
							}
						} else if (Array.isArray(answerData)) {
							finalAnswer = answerData;
							console.log("找到最终答案(来自数组)", finalAnswer);
							
							// 同样验证表格数据
							finalAnswer = finalAnswer.map(item => {
								if (item && item.type === 'table') {
									if (!Array.isArray(item.content)) {
										console.warn('表格内容不是数组，重置为空数组');
										return { ...item, content: [] };
									}
								}
								return item;
							});
						} else if (typeof answerData === 'object' && answerData !== null) {
							finalAnswer = [answerData];
							console.log("找到最终答案(来自对象)", finalAnswer);
							
							// 检查单个对象
							if (answerData.type === 'table' && !Array.isArray(answerData.content)) {
								console.warn('表格内容不是数组，尝试转换', answerData.content);
								try {
									// 如果内容是字符串，尝试解析为JSON
									if (typeof answerData.content === 'string') {
										try {
											const parsed = JSON.parse(answerData.content);
											if (Array.isArray(parsed)) {
												answerData.content = parsed;
											} else if (typeof parsed === 'object') {
												// 如果解析出来是对象而不是数组，尝试从对象中提取数据
												const rows = [];
												if (parsed.header) {
													rows.push(parsed.header);
												} else {
													rows.push({"name": "项目", "price": "费用", "remark": "备注"});
												}
												
												if (parsed.rows && Array.isArray(parsed.rows)) {
													rows.push(...parsed.rows);
												} else if (parsed.items && Array.isArray(parsed.items)) {
													rows.push(...parsed.items);
												}
												
												if (parsed.total) {
													rows.push(parsed.total);
												}
												
												if (rows.length > 1) {
													answerData.content = rows;
												} else {
													answerData.content = [];
												}
											} else {
												answerData.content = [];
											}
										} catch (e) {
											console.error('解析表格字符串失败:', e);
											answerData.content = [];
										}
									} else if (typeof answerData.content === 'object' && answerData.content !== null) {
										// 如果内容是对象而非数组，尝试构建表格结构
										const rows = [];
										rows.push({"name": "项目", "price": "费用", "remark": "备注"});
										
										// 尝试从对象的不同属性中提取数据
										const extractItems = (obj) => {
											const result = [];
											for (const key in obj) {
												if (typeof obj[key] === 'object' && obj[key] !== null) {
													if (obj[key].name || obj[key].price || obj[key].remark) {
														result.push({
															name: obj[key].name || key,
															price: obj[key].price || '',
															remark: obj[key].remark || ''
														});
													}
												} else {
													result.push({
														name: key,
														price: obj[key] || '',
														remark: ''
													});
												}
											}
											return result;
										};
										
										const items = extractItems(answerData.content);
										if (items.length > 0) {
											rows.push(...items);
											
											// 添加总计行
											let totalPrice = 0;
											items.forEach(item => {
												const price = parseFloat(item.price);
												if (!isNaN(price)) {
													totalPrice += price;
												}
											});
											
											rows.push({
												name: "总计",
												price: totalPrice.toString(),
												remark: "合计费用"
											});
											
											answerData.content = rows;
										} else {
											answerData.content = [];
										}
									} else {
										answerData.content = [];
									}
									finalAnswer = [{ ...answerData }];
								} catch (error) {
									console.error('处理表格内容失败:', error);
									finalAnswer = [{ ...answerData, content: [] }];
								}
							}
						} else {
							console.log("找到未知类型的答案:", typeof answerData);
							finalAnswer = [{ type: 'text', content: String(answerData) }];
						}
								
								break; // 找到有效答案后退出循环
							} catch (parseError) {
								console.error("处理答案数据失败:", parseError);
							}
						}
					} catch (e) {
						// 忽略无效JSON
						console.log("解析JSON失败:", e);
					}
				}
				
				// 只有在找到有效答案后才进行处理
				if (finalAnswer && Array.isArray(finalAnswer)) {
					// 对数据进行安全处理
					const safeAnswer = finalAnswer.map(item => {
						// 确保每个项目都有有效的类型和内容
						if (!item) return { type: 'text', content: '' };
						
						// 特别处理表格类型数据
						if (item.type === 'table') {
							// 保留数组类型的表格内容
							return {
								type: item.type,
								id: item.id || '',
								content: Array.isArray(item.content) ? item.content : []
							};
						}
						
						// 处理其他类型的内容
						return {
							type: item.type || 'text',
							id: item.id || '',
							content: typeof item.content === 'string' ? item.content : (item.content === undefined ? '' : String(item.content))
						};
					}).filter(item => item); // 过滤掉null/undefined
					
					console.log("处理后的安全答案:", safeAnswer);
					
					// 确保至少有一个有效的内容项
					if (safeAnswer.length > 0) {
						// 创建AI消息对象
							const aiMessage = {
								type: 'ai',
							content: [],
							id: Date.now(),
							thinking: false,
								typing: true
							};
						
							// 添加到消息列表
							const messageIndex = chatMessages.push(aiMessage) - 1;
						
						// 由于之前已经清除了思考动画，可以直接开始打字机效果
						try {
							// 使用安全的数据进行渲染
							typewriterEffect(chatMessages[messageIndex], safeAnswer);
							scrollToLatestMessage();
						} catch (typeError) {
							console.error("打字机效果出错:", typeError);
							
							// 出错时简单赋值
							try {
								chatMessages[messageIndex].content = safeAnswer;
								chatMessages[messageIndex].typing = false;
								globalUpdateKey.value = Date.now();
								scrollToLatestMessage();
							} catch (e) {
								console.error("直接设置内容也失败:", e);
								showErrorMessage("显示内容失败，请重试");
							}
						}
					} else {
						showErrorMessage("未找到有效的内容");
					}
				} else {
					showErrorMessage("无法获取完整的响应");
				}
			} else if (typeof responseData === 'object') {
				// 对象响应的处理 - 使用相同的安全处理逻辑
				console.log("收到对象形式的响应");
				
				if (responseData.data && responseData.data.outputs && responseData.data.outputs.answer) {
					try {
						// 解析答案
						const answer = responseData.data.outputs.answer;
						let parsedAnswer;
						
						if (typeof answer === 'string') {
							try {
								parsedAnswer = JSON.parse(answer);
								console.log("成功解析答案字符串为JSON对象:", parsedAnswer);
							} catch (e) {
								console.error("解析答案字符串失败:", e);
								// 尝试对特殊格式进行清理后再解析
								try {
									// 处理可能的转义问题
									const cleanedAnswer = answer.replace(/\\"/g, '"');
									parsedAnswer = JSON.parse(cleanedAnswer);
									console.log("清理后成功解析答案:", parsedAnswer);
								} catch (e2) {
									console.error("清理后解析仍然失败:", e2);
									// 如果解析失败，创建简单文本内容
									parsedAnswer = [{ type: 'text', content: answer }];
								}
							}
						} else if (Array.isArray(answer)) {
							parsedAnswer = answer;
							console.log("答案已是数组格式:", parsedAnswer);
						} else {
							parsedAnswer = [{ type: 'text', content: String(answer) }];
							console.log("将非字符串非数组答案转为文本:", parsedAnswer);
						}
      
						// 安全处理数据
						const safeAnswer = parsedAnswer.map(item => {
							if (!item) return { type: 'text', content: '' };
							
							// 特别处理表格类型数据
							if (item.type === 'table') {
								// 保留数组类型的表格内容
								return {
									type: item.type,
									id: item.id || '',
									content: Array.isArray(item.content) ? item.content : []
								};
							}
							
							// 处理其他类型的内容
							return {
								type: item.type || 'text',
								id: item.id || '',
								content: typeof item.content === 'string' ? item.content : (item.content === undefined ? '' : String(item.content))
							};
						}).filter(item => item);
						
						// 创建消息并显示
						if (safeAnswer.length > 0) {
							const aiMessage = {
								type: 'ai',
								content: [],
								id: Date.now(),
								thinking: false,
								typing: true
							};
							
							const messageIndex = chatMessages.push(aiMessage) - 1;
							
							try {
								typewriterEffect(chatMessages[messageIndex], safeAnswer);
								scrollToLatestMessage();
							} catch (e) {
								chatMessages[messageIndex].content = safeAnswer;
								chatMessages[messageIndex].typing = false;
								globalUpdateKey.value = Date.now();
								scrollToLatestMessage();
							}
						} else {
							showErrorMessage("解析的内容为空");
						}
					} catch (e) {
						console.error("处理对象响应失败:", e);
						showErrorMessage("处理响应数据失败");
					}
				} else {
					showErrorMessage("响应数据不完整");
				}
			} else {
				showErrorMessage("收到未知类型的响应");
			}
		})
		.catch(error => {
			// 清除思考动画并显示错误
			clearAnimation();
			console.error("请求失败:", error);
			
			if (retryCount < 2) {
			console.log(`重试第 ${retryCount + 1} 次...`);
				setTimeout(() => {
					callAIInterface(userQuery, retryCount + 1);
				}, 1000);
		} else {
				showErrorMessage("网络请求失败，请重试");
			}
		});
	} catch (error) {
		clearAnimation();
		console.error("执行请求发生错误:", error);
		showErrorMessage("请求执行错误，请重试");
	}
};

// 辅助函数 - 显示错误消息
const showErrorMessage = (message) => {
	const aiMessage = {
		type: 'ai',
		content: [{
			type: 'text',
			content: `抱歉，${message}`
		}],
		id: Date.now(),
		thinking: false,
		typing: false
	};
	
	chatMessages.push(aiMessage);
	globalUpdateKey.value = Date.now();
	scrollToLatestMessage();
	
	uni.showToast({
		title: message,
		icon: "none",
		duration: 2000
	});
};

// 实现callAIInterface2方法
const callAIInterface2 = async (userQuery, lastMessage, retryCount = 0) => {
  const url = "https://island.zhangshuiyi.com/island/front/ai/chat/chatMessage-stream-flux";
  
  // 确保lastMessage是有效的JSON字符串
  let parsedLastMessage = lastMessage;
  
  const data = {
    conversation_id: '',
    inputs: {
      original_intention: '',
      recommended_plan: parsedLastMessage
    },
    query: userQuery,
    webMode: 'MAPP-小程序'
  };

  console.log("AI接口函数2，请求数据:", data);

  // 显示思考动画
  const clearAnimation = showThinkingAnimation2();
  
  try {
    // 发送请求
    uni.request({
      url: url,
      method: 'POST',
      header: {
        'X-Access-Token': token.value,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      data: data,
      timeout: 90000, // 90秒超时
      
      success: (response) => {
        // 清除思考动画
        clearAnimation();
        
        // 获取响应数据
        const responseData = response.data;
        console.log("响应数据类型:", typeof responseData);
        
        let finalAnswer = null;
        
        // 处理字符串形式的响应
        if (typeof responseData === 'string') {
          console.log("收到字符串形式的响应，进行解析");
          
          try {
            // 查找最终答案
            const dataChunks = responseData.split('\n');
            
            for (const chunk of dataChunks) {
              if (!chunk.trim().startsWith('data:')) continue;
              
              try {
                const jsonStr = chunk.trim().substring(5);
                const jsonData = JSON.parse(jsonStr);
                
                if (jsonData.event === 'workflow_finished' && 
                    jsonData.data?.outputs?.answer) {
                  
                  try {
                    finalAnswer = JSON.parse(jsonData.data.outputs.answer);
                    break;
                  } catch (e) {
                    console.error("解析JSON答案失败:", e);
                  }
                }
              } catch (e) {
                console.error("解析数据块失败:", e);
              }
            }
          } catch (e) {
            console.error("处理字符串响应失败:", e);
          }
        } 
        // 处理对象形式的响应
        else if (typeof responseData === 'object') {
          console.log("收到对象形式的响应");
          
          if (responseData.data?.outputs?.answer) {
            const answer = responseData.data.outputs.answer;
            
            try {
              if (typeof answer === 'string') {
                try {
                  finalAnswer = JSON.parse(answer);
                } catch (e) {
                  console.error("解析答案字符串失败:", e);
                  finalAnswer = [{ type: 'text', content: answer }];
                }
              } else if (Array.isArray(answer)) {
                finalAnswer = answer;
              } else if (typeof answer === 'object' && answer !== null) {
                finalAnswer = [answer];
              } else {
                finalAnswer = [{ type: 'text', content: String(answer || '无内容') }];
              }
            } catch (e) {
              console.error("处理对象响应失败:", e);
            }
          }
        }
                
        // 处理最终答案
        if (finalAnswer && Array.isArray(finalAnswer) && finalAnswer.length > 0) {
          // 过滤并处理内容
          const processedAnswer = finalAnswer
            .filter(item => item != null) // 过滤空项
            .map(item => {
              try {
                if (item.type === 'text' && typeof item.content === 'string') {
                  // 清理内容
                  const cleanedContent = cleanAIContent(item.content);
                  // 检测并分离思考过程
                  const { mainContent, thinkingContent } = processThinkingContent(cleanedContent);
                  
                  return {
                    ...item,
                    content: mainContent || cleanedContent,
                    thinkingContent: thinkingContent,
                    hasThinking: !!thinkingContent
                  };
                } else if (item.type === 'table') {
                  // 确保表格内容是有效数组
                  if (!Array.isArray(item.content)) {
                    console.warn('表格内容不是数组，将创建空数组', item);
                    return { ...item, content: [] };
                  }
                }
                return item;
              } catch (error) {
                console.error('处理答案项出错:', error, item);
                return { type: 'text', content: '内容处理错误' };
              }
            })
            .filter(item => 
              item != null && 
              (item.type !== 'text' || (item.content && item.content.trim() !== ''))
            );

          // 在此处创建消息并添加到列表
          const aiMessage = {
            type: 'ai',
            content: [], // 初始为空数组
            id: Date.now(),
            thinking: false,
            typing: true
          };
          
          // 添加消息并获取索引
          const messageIndex = chatMessages.push(aiMessage) - 1;
          
          // 使用打字机效果显示内容
          try {
            typewriterEffect(chatMessages[messageIndex], processedAnswer);
            // 更新视图
            globalUpdateKey.value = Date.now();
            // 滚动到最新消息
            scrollToLatestMessage();
          } catch (error) {
            console.error("显示消息内容时出错:", error);
            // 错误情况下显示简单消息
            chatMessages[messageIndex].content = [{
              type: 'text',
              content: '显示内容时出错，请重试。'
            }];
            chatMessages[messageIndex].typing = false;
            globalUpdateKey.value = Date.now();
          }
        } else {
          // 未找到有效答案或格式不匹配
          console.error("未找到有效答案或格式不匹配");
          
          // 创建错误消息
          const aiMessage = {
            type: 'ai',
            content: [{
              type: 'text',
              content: '抱歉，无法获取有效回复。请稍后再试。'
            }],
            id: Date.now(),
            thinking: false,
            typing: false
          };
          
          chatMessages.push(aiMessage);
          globalUpdateKey.value = Date.now();
          scrollToLatestMessage();
          
          uni.showToast({
            title: "无法获取有效响应",
            icon: "none",
            duration: 2000
          });
        }
      },
      fail: (error) => {
        // 清除思考动画
        clearAnimation();
        console.error("请求失败:", error);
        
        // 创建错误消息
        const aiMessage = {
          type: 'ai',
          content: [{
            type: 'text',
            content: '网络请求失败，请检查您的网络连接并稍后再试。'
          }],
          id: Date.now(),
          thinking: false,
          typing: false
        };
        
        chatMessages.push(aiMessage);
        globalUpdateKey.value = Date.now();
        scrollToLatestMessage();
        
        if (retryCount < 2) {
          console.log(`重试第 ${retryCount + 1} 次...`);
          setTimeout(() => {
            callAIInterface2(userQuery, lastMessage, retryCount + 1);
          }, 1000);
        } else {
          uni.showToast({
            title: "网络请求失败",
            icon: "none",
            duration: 2000
          });
        }
      }
    });
  } catch (error) {
    // 清除思考动画
    clearAnimation();
    console.error("执行请求发生错误:", error);
    
    // 创建错误消息
    const aiMessage = {
      type: 'ai',
      content: [{
        type: 'text',
        content: '执行请求时发生错误，请稍后再试。'
      }],
      id: Date.now(),
      thinking: false,
      typing: false
    };
    
    chatMessages.push(aiMessage);
    globalUpdateKey.value = Date.now();
    scrollToLatestMessage();
    
    if (retryCount < 2) {
      setTimeout(() => {
        callAIInterface2(userQuery, lastMessage, retryCount + 1);
      }, 1000);
    }
  }
};

onMounted(() => {
	const { statusBarHeight: sbHeight, safeAreaInsets: insets } = uni.getSystemInfoSync();
	statusBarHeight.value = sbHeight;
	safeAreaInsets.value = insets;
	setTimeout(() => {
		scrollToBottom();
		
		// 修复样式：确保所有交互元素内联显示
		const fixInlineDisplay = () => {
			// 使用uni查询选择器
			const query = uni.createSelectorQuery();
			query.selectAll('.trip-item, .transport, .accommodation, .restaurant, .activity, .attraction').fields({
				id: true,
				dataset: true,
				rect: true,
				size: true,
				properties: ['className']
			}, (res) => {
				console.log('找到元素数量:', res ? res.length : 0);
				if (res && res.length) {
					// 通过样式类更新来触发重新渲染
					globalUpdateKey.value = Date.now();
				}
			}).exec();
		};
		
		// 初始化时执行一次
		fixInlineDisplay();
		
		// 设置一个定时器，每隔1秒检查一次
		setInterval(fixInlineDisplay, 1000);
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
				"type": "table",
				"id": "",
				"content": [
					{"name": "项目", "price": "费用 (元)", "remark": "备注"},
					{"name": "交通", "price": "200", "remark": "往返船票"},
					{"name": "住宿", "price": "450", "remark": "一晚标准间"},
					{"name": "餐饮", "price": "490", "remark": "含早中晚餐"},
					{"name": "活动", "price": "800", "remark": "海钓体验"},
					{"name": "总计", "price": "1940", "remark": "每人"}
				]
			},
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

// 添加toggleThinking函数，用于展开/收起思考过程
const toggleThinking = (item, event) => {
	// 防止事件冒泡
	if (event) {
		event.stopPropagation();
		event.preventDefault();
	}
	
	// 使用Vue的响应式机制添加或切换thinkingOpen属性
	if (item.thinkingOpen === undefined) {
		item.thinkingOpen = false; // 默认收起
	} else {
		item.thinkingOpen = !item.thinkingOpen;
	}
	
	// 处理header的class
	if (event && event.currentTarget) {
		try {
			if (item.thinkingOpen) {
				event.currentTarget.classList.add('open');
			} else {
				event.currentTarget.classList.remove('open');
			}
		} catch (e) {
			console.error('更新class失败:', e);
		}
	}
	
	// 强制更新视图
	globalUpdateKey.value = Date.now();
	
	// 收缩后通知
	console.log('思考内容状态:', item.thinkingOpen ? '已展开' : '已收缩');
	
	// 内容展开后调整滚动
	if (item.thinkingOpen) {
		nextTick(() => {
			scrollToBottom();
		});
	} else {
		// 收缩后也更新视图
		nextTick(() => {
			globalUpdateKey.value = Date.now();
			
			// 直接操作DOM确保内容被收起
			setTimeout(() => {
				try {
					// 查找对应的thinking-content元素
					const contentElem = event.currentTarget.nextElementSibling;
					if (contentElem && contentElem.classList.contains('thinking-content')) {
						contentElem.style.display = 'none';
					}
				} catch (e) {
					console.error('DOM收缩操作失败:', e);
				}
			}, 10);
		});
	}
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
	height: 36px;
	background-color: #4285f4;
	color: #ffffff;
	position: relative;
}

.back-icon,
.more-icon {
	width: 22px;
	height: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.title {
	font-size: 16px;
	font-weight: 500;
}

.chat-container {
	flex: 1;
	overflow-y: auto;
	padding-bottom: 30px; /* 减少底部填充 */
	margin-bottom: 10px; /* 减少底部边距 */
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
	max-width: 85%;
	margin: 0 10px;
	padding: 16px;
	border-radius: 12px;
	background-color: #ffffff;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	font-size: 16px;
	line-height: 1.8;
	width: calc(100% - 90px); /* 考虑头像和边距 */
}

.user-message .message-content {
	background-color: #4285f4;
	color: #ffffff;
	max-width: 80%;
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

.content-divider {
	height: 1px;
	background-color: #eee;
	margin: 10px 0;
	width: 100%;
}

.trip-summary-table {
	width: 100%;
	border-collapse: collapse;
	margin: 15px 0;
	border-radius: 8px;
	overflow: hidden;
	box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.trip-summary-table th {
	background-color: #f0f7ff;
	color: #4285f4;
	text-align: left;
	padding: 10px;
	font-size: 15px;
	border-bottom: 1px solid #e0e0e0;
}

.trip-summary-table td {
	padding: 10px;
	border-bottom: 1px solid #eeeeee;
	font-size: 15px;
}

.trip-summary-table tr:last-child td {
	border-bottom: none;
}

.trip-summary-table .price-column {
	color: #4285f4;
	font-weight: bold;
	text-align: right;
}

.trip-summary-total {
	background-color: #f0f7ff;
	font-weight: bold;
}

.error-message {
	color: #ff6b6b;
	padding: 10px;
	background-color: #fff0f0;
	border-radius: 6px;
	text-align: center;
	margin: 10px 0;
}

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 15px;
	height: 22px;
	background-color: #4285f4;
	color: #ffffff;
	position: relative;
}

.back-icon,
.more-icon {
	width: 22px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #ffffff;
}

.title {
	font-size: 16px;
	font-weight: 500;
	color: #ffffff;
}

.input-container {
	display: flex;
	align-items: center;
	padding: 6px 12px;
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
	display: inline;
	white-space: normal;
	word-wrap: break-word;
	font-size: 16px;
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
	display: inline;
	/* 确保内联显示 */
	font-size: 16px;
	/* 增大字体 */
}

.transport,
.accommodation,
.restaurant,
.activity {
	cursor: pointer;
	padding: 5px;
	border-radius: 4px;
	display: inline;
	/* 确保内联显示 */
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
	height: 140rpx;
	/* 减小占位高度，增加内容区域 */
}

/* 思考过程样式 */
.thinking-container {
	margin: 12px 0;
	border-radius: 6px;
	background-color: #f0f5ff;
	border: 1px solid #d0e0ff;
	overflow: hidden;
	width: 100%;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.thinking-header {
	padding: 10px 14px;
	display: flex;
	align-items: center;
	background-color: #e5efff;
	cursor: pointer;
	user-select: none;
	transition: all 0.2s;
	position: relative;
}

.thinking-header:hover {
	background-color: #d5e5ff;
}

.thinking-header:after {
	content: '';
	position: absolute;
	right: 50px;
	width: 6px;
	height: 6px;
	border-right: 2px solid #4285f4;
	border-bottom: 2px solid #4285f4;
	transform: rotate(45deg);
	transition: transform 0.2s;
}

.thinking-header.open:after {
	transform: rotate(-135deg);
}

.thinking-icon {
	font-size: 14px;
	color: #4285f4;
	margin-right: 8px;
}

.thinking-title {
	font-size: 15px;
	font-weight: 500;
	color: #4285f4;
	flex: 1;
}

.thinking-action {
	font-size: 13px;
	color: #ffffff;
	padding: 3px 10px;
	border-radius: 12px;
	background-color: #4285f4;
	margin-left: auto;
	transition: opacity 0.2s;
}

.thinking-action:hover {
	opacity: 0.9;
}

.thinking-action text {
	color: #ffffff;
	font-weight: 500;
}

.thinking-content {
	padding: 14px 16px;
	font-size: 15px;
	line-height: 1.8;
	color: #333;
	white-space: pre-wrap;
	background-color: #fff;
	max-height: 400px;
	overflow-y: auto;
	border-top: 1px solid #d0e0ff;
}

.emoji-content {
	display: block;
	white-space: normal;
	margin-top: 10px;
}

.emoji-line {
	display: block;
	margin: 12px 0;
	line-height: 1.6;
	font-size: 16px;
	white-space: normal;
	word-break: break-word;
}

.emoji-prefix {
	display: block;
	font-size: 24px;
	margin-bottom: 8px;
	line-height: 1.4;
}

.emoji-content-text {
	display: block;
	padding-left: 12px;
	padding-top: 4px;
	padding-bottom: 4px;
	border-left: 3px solid #4285f4;
	margin-left: 3px;
	line-height: 1.6;
}

.normal-line {
	display: block;
	margin: 4px 0;
}

.inline-emoji {
	display: inline;
	white-space: nowrap;
	margin-left: 2px;
}

.thinking-content-separator {
	height: 1px;
	background: linear-gradient(to right, #4285f4, transparent);
	margin: 12px 0;
	opacity: 0.5;
}

.emoji-content .emoji-line .emoji-inline {
	display: inline;
	white-space: nowrap;
	font-size: 16px;
}

.content-divider {
	height: 1px;
	background-color: #eee;
	margin: 10px 0;
	width: 100%;
}

.divider-section {
	margin: 8px 0;
}

.trip-summary-container {
	margin: 15px 0;
}

.trip-summary-table {
	width: 100%;
	border-collapse: collapse;
	margin: 15px 0;
	border-radius: 8px;
	overflow: hidden;
	box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.trip-summary-table th {
	background-color: #f0f7ff;
	color: #4285f4;
	text-align: left;
	padding: 10px;
	font-size: 14px;
	border-bottom: 1px solid #e0e0e0;
}

.trip-summary-table td {
	padding: 10px;
	border-bottom: 1px solid #eeeeee;
	font-size: 14px;
}

.trip-summary-table tr:last-child td {
	border-bottom: none;
}

.trip-summary-table .price-column {
	color: #4285f4;
	font-weight: bold;
	text-align: right;
}

.trip-summary-total {
	background-color: #f0f7ff;
	font-weight: bold;
}
</style>