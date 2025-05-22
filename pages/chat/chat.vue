<template>
	<view class="container">
		<view class="header">
			<view class="header-top">
				<image src="https://wlmtsys.obs.cn-south-1.myhuaweicloud.com/post/wlmtsys17170461054774894891ai顶部.png" mode="widthFix" class="logo"></image>
			</view>
			<view class="header-center">
				<p class="header-center-text">欢迎使用AI旅游助手!我可以帮您规划完美的海岛之旅。您可以选择以下热门选项，或直接告诉我您的需求。</p>
				<div class="header-center-function">
					<div class="function-item"  v-for="item in headerCenterFunction" :key="item.icon">
						<image :src="item.icon" mode="widthFix"></image>
						<text>{{item.text}}</text>
					</div>
				</div>
			</view>
			<view class="header-bottom">
				<div class="header-span">东澳岛2天行程</div>
			</view>
		</view>

		<div class="bottom">
			<div class="voiceMessage">
				<img class="voice-icon" src="/static/chat/ai图标-语音输入.svg" alt="语音输入">
				<div class="input-container">
					<input type="text" placeholder="请输入旅游目的地或旅游问题" v-model="message" @keyup.enter="sendMessage" />
					<img class="send-icon" @click="sendMessage" src="/static/chat/ai图标-发送.svg" alt="发送">
				</div>
			</div>
		</div>
		<Tabbar />
	</view>
	
</template>

<script setup >
import Tabbar from '../Tabbar/Tabbar.vue';

const headerCenterFunction = [
	{
		icon: '/static/chat/ai图标-海钓体验.svg',
		text: '海岛体验'
	},
	{
		icon: '/static/chat/ai图标-浮潜探索.svg',
		text: '浮潜探索'
	},
	{
		icon: '/static/chat/ai图标-亲子娱乐.svg',
		text: '亲子旅游'
	},
	{
		icon: '/static/chat/ai图标-休闲畅游.svg',
		text: '休闲畅游'
	},
	{
		icon: '/static/chat/ai图标-海岛介绍.svg',
		text: '海岛介绍'
	}
]
</script>

<style>
.container {
	min-height: 100vh;
	background-color: rgba(241, 252, 254);
	padding: 20px;
}
.header {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	border-radius: 10px;
}
.header-top{
	width: 100%;
}
.header-top image{
	width: 150px;
	height: 20px;
}
.header-center{
	background-color: #fff;
	border-radius: 15px;
	padding: 15px;
	font-size: 14px;
}
.header-center-text{
	margin-bottom: 12px;
}
.header-center-function{
	display: flex;
	align-items: center;
	flex-direction: row;	
	justify-content: space-between;
	border-radius: 10px;
	padding: 10px;
	width: 100%;
	margin: 0%;
}
.function-item{
	display: flex;
	align-items: center;
	flex-direction: column;	
	border-radius: 10px;
	padding: 0px;
}
.function-item image{
	width: 30px;
	height: 30px;
}
.function-item text{
	margin-top: 15px;
	font-size: 12px;
	width: 50px;
	color: #333;
}
.header-bottom{
	margin-top: 5px;
	padding: 10px;
}
.header-span{
	background-color: #fff;
	border-radius: 10px;
	padding: 10px;
	width: 50%;
	border: none;
}
.bottom{
	border-radius: 10px;
	width: 90%;
	position: fixed;
	bottom: 90px;
}
.voiceMessage{
	display: flex;
	align-items: center;
	flex-direction: row;
	gap: 10px;
}
.voice-icon {
	width: 40px;
	height: 40px;
	cursor: pointer;
	transition: transform 0.2s ease;
}
.voice-icon:hover {
	transform: scale(1.1);
}
.input-container {
	display: flex;
	align-items: center;
	border: 1.7px solid rgba(97, 209, 255);
	padding: 5px 15px;
	border-radius: 20px;
	flex: 1;
}
.input-container input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 14px;
}
.send-icon {
	width: 35px;
	height: 35px;
	cursor: pointer;
	transition: transform 0.2s ease;
}
.send-icon:hover {
	transform: scale(1.1);
}
</style>