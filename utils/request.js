// // utils/request.js
// import { ref } from 'vue';
// import { useUserStore } from '@/store/modules/user'; // 确保引入 userStore

// const userStore = useUserStore(); // 获取用户存储

// // 基地址
// const BASE_URL = 'https://island.zhangshuiyi.com';

// // 请求拦截器
// const request = (options) => {
//   return new Promise((resolve, reject) => {
//     // 添加统一的请求头
//     const header = { ...options.header };
//     header['Content-Type'] = 'application/x-www-form-urlencoded'; // 设置为表单格式
//     header['X-Access-Token'] = userStore.token; // 添加 token

//     // 处理数据为 URL 编码格式
//     const data = new URLSearchParams(options.data).toString();

//     // 发起请求
//     uni.request({
//       ...options,
//       url: `${BASE_URL}${options.url}`, // 拼接完整请求地址
//       header,
//       data, // 使用处理后的数据
//       success: (res) => {
//         if (res.data.success === true) {
//           resolve(res.data.result || res.data); // 请求成功，返回数据
//         } else {
//           // 处理其他状态码
//           uni.showToast({
//             title: `请求失败，状态码：${res.data.code}`,
//             icon: 'none',
//           });
//           reject(res.data);
//         }
//       },
//       fail: (err) => {
//         // 请求失败
//         uni.showToast({
//           title: '请求失败，请稍后再试',
//           icon: 'none',
//         });
//         reject(err);
//       },
//     });
//   });
// };

// // 统一处理响应
// const handleResponse = async (response) => {
//   console.log('进入 handleResponse,响应数据：', response);
//   if (response && response.code === 401) {
//     // 如果返回状态码为401，提示并跳转到登录页
//     uni.showToast({
//       title: '未登录或登录已过期，请重新登录',
//       icon: 'none',
//     });
//     setTimeout(() => {
//       uni.redirectTo({ url: '/pages/login/login' }); // 假设登录页路径为 /pages/login/login
//     }, 1500);
//     return Promise.reject(response);
//   }
//   return response;
// };

// // 封装请求方法
// const http = {
//   get: (url, data = {}) => request({ url, method: 'GET', data }).then(handleResponse),
//   post: (url, data = {}) => request({ url, method: 'POST', data }).then(handleResponse),
//   put: (url, data = {}) => request({ url, method: 'PUT', data }).then(handleResponse),
//   delete: (url, data = {}) => request({ url, method: 'DELETE', data }).then(handleResponse),
// };

// export default http;