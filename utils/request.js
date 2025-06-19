/**
 * axios封装
 * 请求拦截、响应拦截、错误统一处理
 */

import { useUserStore } from '@/store/modules/user';
const userStore = useUserStore();

export const baseurl = 'https://island.zhangshuiyi.com/island'; // 服务器

const exceptUrl = []; // 不需要token的接口

const request = (url, data = {}, method = 'GET') => {
	let header = {
		'Content-Type': 'application/json'
	};
	if (userStore.token) {
		header['X-Access-Token'] = userStore.token;
	}

	return new Promise((resolve, reject) => {
		uni.request({
			url: baseurl + url, //接口地址
			data,
			method,
			header,
			success: (res) => {
				resolve(res.data.result);
			},
			fail: (res) => {
				console.error(res);
				reject(res);
			}
		});
	});
};

export default request;

export const StreamRequest = (url, data = {}, method = 'GET', callbackMethod) => {
	let header = {
		'Content-Type': 'application/json',
		'Accept': 'text/event-stream'
	};
	if (userStore.token) {
		header['X-Access-Token'] = userStore.token;
	}

	return new Promise(async (resolve, reject) => {
		// 实际API调用示例
		const task = await uni.request({
			url: baseurl + url,
			data,
			method,
			// 启用流式响应
			enableChunked: true, //开启 transfer-encoding chunked
			responseType: 'arraybuffer', //设置响应的数据类型。合法值：text、arraybuffer
			timeout: 300000, //超时时间，单位ms，5分钟
			header,
			success: (res) => {
				resolve(res);
			},
			fail: (err) => {
				console.error('AI响应错误:', err);
			}
		});
		task.onChunkReceived((response) => {
			try {
				// 二进制转字符串
				const uint8Array = new Uint8Array(response.data);
				const chunkStr = new TextDecoder('utf-8').decode(uint8Array);

				// 切割字符串，只获取data:data:部分
				let dataList = chunkStr.split("data:").map(item => item.trim()).filter(item => item !== "");

				dataList.forEach((item, index) => {
					// 分步输出
					if (item && item.length > 1) {
						setTimeout(() => {
							callbackMethod(item);
						}, index * 10);
					}
				})
			} catch (e) {
				console.error('解析异常:', e);
			}
		});
	});

};
