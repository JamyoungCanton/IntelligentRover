<template>
	<view class="content">
		<!-- 可点击的盒子，包含图片 -->
		<view class="clickable-box" @click="goToChat">
			<image class="box-image" src="/static/demo-image.jpg" mode="aspectFill"></image>
			<view class="box-overlay">
				<text class="box-text">点击进入AI旅游助手</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { useRouter } from 'vue-router';

// 跳转到聊天页面的方法
const goToChat = () => {
  uni.navigateTo({ // 使用 uni.navigateTo 进行页面跳转
    url: '/pages/chat/chat'
  });
};
</script>

<style scoped>
.content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 20px;
}

/* 可点击的盒子样式 */
.clickable-box {
	position: relative;
	width: 300px;
	height: 200px;
	overflow: hidden;
	border-radius: 10px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	transition: transform 0.3s ease;
}

.clickable-box:hover {
	transform: translateY(-5px);
}

/* 盒子内的图片 */
.box-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

/* 盒子上的覆盖层和文字 */
.box-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 18px;
	opacity: 0;
	transition: opacity 0.3s ease;
}

.clickable-box:hover .box-overlay {
	opacity: 1;
}
</style>