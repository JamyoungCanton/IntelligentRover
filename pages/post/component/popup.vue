<template>
	<view class="create-post-container app-container">
		<!-- 输入标题 -->
		<view class="input-title">
			<u-input type="text" v-model="post.title" maxlength="30" placeholder="请输入标题..."></u-input>
		</view>
		<!-- ai创作提示 -->
		<view class="ai-write-tips" v-if="writeTips.title.show">
			<view class="tips-title">
				<text>AI标题建议</text>
				<u-icon name="close" size="14" color="#999" @click="handleTipClose('title')"></u-icon>
			</view>
			<view class="tips-content">{{ writeTips.title.content }}</view>
			<view class="tips-copy" @click="handleTipCopy('title')">
				<image src="@/static/copy.png" />
				复制
			</view>
		</view>
		<!-- 选择分区 -->
		<view class="select-area">
			<u-cell title="板块分区" :value="post.area" isLink @click="showAreaOptions = true"></u-cell>
		</view>
		<!-- 输入内容 -->
		<view class="input-content">
			<u-textarea v-model="post.content" autoHeight placeholder="分享你的游戏体验..." maxlength="1200" count></u-textarea>
		</view>
		<!-- ai创作提示 -->
		<view class="ai-write-tips" v-if="writeTips.title.show">
			<view class="tips-title">
				<text>AI内容建议</text>
				<u-icon name="close" size="14" color="#999" @click="handleTipClose('content')"></u-icon>
			</view>
			<view class="tips-content">{{ writeTips.content.content }}</view>
			<view class="tips-copy" @click="handleTipCopy('content')">
				<image src="@/static/copy.png" />
				复制
			</view>
		</view>
		<!-- 上传图片 -->
		<view class="image-upload">
			<u-upload :fileList="imageList" @afterRead="handleAfterRead" @delete="handleDeleteImage" name="1" multiple :maxCount="9"> </u-upload>
		</view>
		<!-- AI代写 -->
		<view class="ai-write">
			<view class="ai-write-title">
				<image src="@/static/ai-fill.png" />
				<text>AI写作助手</text>
			</view>
			<view v-if="!AIwriteLoading" class="ai-write-subtitle">让 AI 帮你生成高质量的桌游攻略内容</view>
			<view v-else class="ai-write-subtitle">AI正在努力协作中... <u-loading-icon size="16"></u-loading-icon></view>
			<view :class="AIwriteLoading ? 'ai-write-button-disable' : 'ai-write-button'" @click="handleAIWrite"
				><u-icon name="edit-pen-fill" size="20" color="#fff"></u-icon> AI代写</view
			>
		</view>
		<!-- 发布 -->
		<view class="submit-button">
			<u-button :color="themeColor" @click="submitPost">发布</u-button>
		</view>

		<Popup :show="showAreaOptions" @close="showAreaOptions = false">
			<view class="area-options">
				<view
					v-for="item in areaOptions"
					:key="item.title"
					@click="handleChangeArea(item)"
					:class="{ option: true, 'option-active': post.area == item.title }"
				>
					<view class="option-title">{{ item.title }}</view>
					<view class="option-description">{{ item.description }}</view>
				</view>
			</view>
		</Popup>
	</view>
</template>

<script>
import request from '@/api/http.js';
import { baseurl } from '@/api/http.js';
import Popup from '../components/Popup.vue';
export default {
	components: {
		Popup
	},
	data() {
		return {
			post: {
				title: '',
				content: '',
				area: '日常交流',
				images: []
			},
			imageList: [],
			areaOptions: [
				{
					title: '日常交流',
					description: '交流桌游、提问、心情等日常'
				},
				{
					title: '桌游攻略',
					description: '桌游的详细信息、教学、技巧'
				},
				{
					title: '情报速递',
					description: '新的桌游、展会、公司的情报'
				},
				{
					title: '桌游战报',
					description: '分享桌游对局中的细节与快乐'
				}
			],
			showAreaOptions: false,
			AIwriteLoading: false,
			writeTips: {
				title: {
					content: '',
					show: false
				},
				content: {
					content: '',
					show: false
				}
			}
		};
	},
	methods: {
		// 改变板块分区
		handleChangeArea(option) {
			this.post.area = option.title;
		},
		// 提交帖子
		async submitPost() {
			this.post.images = this.imageList.map((item) => {
				if (item.status == 'success') {
					return item.obsUrl;
				}
			});

			let res = await request('/forum/createPost', this.post, 'POST');
			uni.navigateBack();
		},
		// 上传图片全逻辑
		async handleAfterRead(event) {
			console.log(event);
			// 上传图片不能超过10MB
			let imageList = event.file
				.filter((item) => item.size <= 1024 * 1024 * 10)
				.map((item) => {
					return {
						status: 'uploading',
						message: '上传中',
						...item
					};
				});
			if (event.file.length > imageList.length) {
				console.log('有文件太大！');
			}
			// 跳过已上传文件
			let imageListLen = this.imageList.length;
			this.imageList = [...this.imageList, ...imageList];
			this.imageList.forEach(async (item, index) => {
				if (index >= imageListLen) {
					let localUrl = item.url;
					let obsUrl = await this.handleUploadImage(item.url);
					this.imageList.forEach((item, index) => {
						if (localUrl == item.url) {
							this.imageList[index].status = 'success';
							this.imageList[index].message = '';
							this.imageList[index].obsUrl = obsUrl;
						}
					});
				}
			});
		},
		// 上传图片
		handleUploadImage(url) {
			return new Promise((resolve, reject) => {
				const token = uni.getStorageSync('token');
				const userId = uni.getStorageSync('userId');
				let p = uni.uploadFile({
					url: `${baseurl}/forum/uploadImage`, //仅为示例，非真实的接口地址
					header: {
						authentication: token,
						id: userId
					},
					filePath: url,
					name: 'file',
					formData: {
						postId: 'test'
					},
					success: (res) => {
						let url = JSON.parse(res.data).data;
						resolve(url);
					}
				});
			});
		},
		// 删除图片
		handleDeleteImage(event) {
			this.imageList.splice(event.index, 1);
		},
		// AI代写
		async handleAIWrite() {
			if (this.AIwriteLoading) return;

			let images = this.imageList.map((item) => {
				if (item.status == 'success') {
					return item.obsUrl;
				}
			});
			this.AIwriteLoading = true;
			const res = await request('/forum/chat', { title: this.post.title, content: this.post.content, images: images }, 'POST');
			this.writeTips = {
				title: {
					content: res.data.title,
					show: true
				},
				content: {
					content: res.data.content,
					show: true
				}
			};
			this.AIwriteLoading = false;
		},
		handleTipClose(e) {
			this.writeTips[e].show = false;
		},
		handleTipCopy(e) {
			if (e == 'title') {
				this.post.title = this.writeTips.title.content;
			} else {
				this.post.content = this.writeTips.content.content;
			}
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: #f8f8f8;
}

.create-post-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 20rpx;

	.input-title {
		width: calc(100% - 40rpx);
		background-color: #fff;
		padding: 20rpx;
		border-radius: 25rpx;

		.u-input {
			border: none;
		}
	}

	.ai-write-tips {
		width: calc(100% - 80rpx);
		background-color: #fff8f3;
		border: solid 1px #f1780054;
		padding: 20rpx 40rpx;
		border-radius: 25rpx;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		color: #333;

		.tips-title {
			font-size: 32rpx;
			font-weight: bold;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.tips-content {
			font-size: $font-size-base;
			color: #666;
			gap: 10rpx;
		}

		.tips-copy {
			display: flex;
			align-items: center;
			gap: 10rpx;
			font-size: $font-size-base;
			color: $theme-color;

			image {
				width: 32rpx;
				height: 32rpx;
			}
		}
	}

	.select-area {
		width: calc(100% - 40rpx);
		background-color: #fff;
		padding: 10rpx 20rpx;
		border-radius: 25rpx;

		.u-cell {
			padding: 0;
		}

		.u-line {
			display: none;
		}
	}

	.input-content {
		width: calc(100% - 40rpx);
		background-color: #fff;
		padding: 20rpx;
		border-radius: 25rpx;

		.u-textarea {
			min-height: 300rpx;
			border: none;
		}
	}

	.image-upload {
		width: calc(100% - 40rpx);
		background-color: #fff;
		padding: 20rpx;
		border-radius: 25rpx;

		/deep/ .u-upload__wrap {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			margin-right: -10px;
			margin-bottom: -10px;

			image {
				width: 100% !important;
			}
		}
	}

	.ai-write {
		width: calc(100% - 80rpx);
		background-color: #fff8f3;
		border: solid 1px #f1780054;
		padding: 20rpx 40rpx;
		border-radius: 25rpx;
		display: flex;
		flex-direction: column;
		gap: 20rpx;

		.ai-write-title {
			font-size: 32rpx;
			font-weight: bold;
			display: flex;
			align-items: center;

			image {
				width: 48rpx;
				height: 48rpx;
				margin-right: 20rpx;
			}
		}

		.ai-write-subtitle {
			display: flex;
			align-items: center;
			gap: 20rpx;
			font-size: $font-size-base;
			margin-left: 68rpx;
			color: #666;
		}

		.ai-write-button {
			background-color: $theme-color;
			color: #fff;
			border-radius: 8rpx;
			padding: 20rpx 20rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 10rpx;
			font-size: $font-size-base;
			margin-left: 68rpx;
			width: 150rpx;

			&-disable {
				background-color: $theme-color;
				opacity: 0.5;
				color: #fff;
				border-radius: 8rpx;
				padding: 20rpx 20rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 10rpx;
				font-size: $font-size-base;
				margin-left: 68rpx;
				width: 150rpx;
			}

			&:active {
				background-color: $theme-color-dark;
			}
		}
	}

	.submit-button {
		width: calc(100% - 80rpx);
		margin-top: 50rpx;
	}
}

.area-options {
	$padding-width: 10rpx;
	$padding-height: 20rpx;

	width: 730rpx;
	padding: $padding-height $padding-width;
	padding-top: 50rpx;
	display: grid;
	grid-template-rows: 1fr 1fr;
	grid-template-columns: 1fr 1fr;
	gap: 10rpx;
	justify-items: center;

	.option {
		width: 340rpx;
		background-color: #eee;
		border-radius: 8rpx;
		padding: 10rpx;
		text-align: center;
		transition: all 0.3s;

		&-title {
			font-size: $font-size-base;
			font-weight: bold;
		}

		&-description {
			font-size: $font-size-small;
		}

		&-active {
			background-color: $theme-color-bg;
		}
	}
}
</style>
