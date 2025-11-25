/**
 * axios封装
 * 请求拦截、响应拦截、错误统一处理
 */

import { useUserStore } from '@/store/modules/user';
const userStore = useUserStore();

export const baseurl = 'https://island.zhangshuiyi.com/island'; // 服务器

const exceptUrl = []; // 不需要token的接口

const utf8Decode = (uint8Array) => {
	let text = '';
	let i = 0;
	const len = uint8Array.length;
	while (i < len) {
		let byte = uint8Array[i];
		if (byte < 0x80) {
			text += String.fromCharCode(byte);
			i++;
		} else if (byte >= 0xC0 && byte < 0xE0) {
			const byte2 = uint8Array[i + 1];
			text += String.fromCharCode(((byte & 0x1F) << 6) | (byte2 & 0x3F));
			i += 2;
		} else if (byte >= 0xE0 && byte < 0xF0) {
			const byte2 = uint8Array[i + 1];
			const byte3 = uint8Array[i + 2];
			text += String.fromCharCode(((byte & 0x0F) << 12) | ((byte2 & 0x3F) << 6) | (byte3 & 0x3F));
			i += 3;
		} else if (byte >= 0xF0 && byte < 0xF8) {
			const byte2 = uint8Array[i + 1];
			const byte3 = uint8Array[i + 2];
			const byte4 = uint8Array[i + 3];
			const codePoint = ((byte & 0x07) << 18) | ((byte2 & 0x3F) << 12) | ((byte3 & 0x3F) << 6) | (byte4 & 0x3F);
			text += String.fromCodePoint(codePoint);
			i += 4;
		} else {
			i++;
		}
	}
	return text;
}

const handleUnauthorized = () => {
	uni.showToast({
	  title: '登录过期，请重新登录',
	  icon: 'none',
	  duration: 2000
	});
	userStore.token = ''; // 清除 token
	uni.reLaunch({
	  url: '/pages/login/login' // 假设登录页路径，按需修改
	});
  };

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
				// resolve(res.data.result);
				console.log(res)
				if (res.code === 401) {
					handleUnauthorized();
					return;
				}
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
				if (err.errMsg && err.errMsg.includes('401')) {
					uni.showModal({
						title: '提示',
						content: '登录过期，请重新登录',
						showCancel: false,
						success: (res) => {
							if (res.confirm) {
								handleUnauthorized();
							}
						}
					});
					return;
				  }
				  console.error('AI响应错误:', err);
				  reject(err);
				console.error('AI响应错误:', err);
			}
		});
		task.onChunkReceived((response) => {
			try {
				// 二进制转字符串
				const uint8Array = new Uint8Array(response.data);
				const chunkStr = utf8Decode(uint8Array);
				console.log('收到数据块:', chunkStr);
				
				// 切割字符串，只获取data:data:部分
				let dataList = chunkStr.split("data:").map(item => item.trim()).filter(item => item !== "");

				// 立即处理所有数据块，移除延迟以提升响应速度
				if (dataList.length > 0) {
					console.log(`处理 ${dataList.length} 个数据块`);
					dataList.forEach((item) => {
						// 立即处理，不延迟
						if (item && item.length > 1) {
							try {
								const testContent = item.slice(0, 3);
								callbackMethod(item);
							} catch (callbackError) {
								console.error('回调函数执行错误:', callbackError, '数据:', item);
							}
						}
					})
				} else {
					console.warn('数据块为空或格式不正确');
				}
			} catch (e) {
				console.error('解析异常:', e, '响应数据:', response);
			}
		});
	});

};
