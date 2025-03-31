// import { useUserStore } from '@/store/modules/user.js';

// // 页面白名单，不受拦截
// const whiteList = [
//     'pages/index/index',  // 首页
//     'pages/itinary/itinary', // 行程
//     'pages/order/order', // 订单
//     'pages/my/my', // 我的
//     'pages/attractionGuide/attractionGuide', // 景点攻略
//     'pages/ticketBooking/ticketBooking', // 船票预订
//     'pages/chat/chat', // 智能客服
//     'pages/foodRecommendation/foodRecommendation', // 美食推荐
//     'pages/hotelBooking/hotelBooking', // 住宿预订
//     'pages/parkingFees/parkingFees', // 停车收费
//     'pages/ticketPoints/ticketPoints', // 小票积分
//     'pages/transportationGuide/transportationGuide', // 交通指南
//     'pages/moreServices/moreServices', // 更多服务
//     'pages/activity/activity', // 热门活动
//     'pages/route/route', // 精选路线
//     'pages/chat/chat'
// ];

// console.log(whiteList);

// // 检查是否需要登录
// const checkLogin = () => {
//     // 获取当前页面栈
//     const pages = getCurrentPages();
//     if (!pages.length) return true;

//     // 获取当前页面的实例
//     const currentPage = pages[pages.length - 1];

//     // 获取当前页面的路由
//     const currentRoute = currentPage.route;
//     // console.log(currentPage);

//     // 检查当前页面是否在白名单中
//     if (whiteList.includes(currentRoute) ||
//         currentRoute === 'pages/login/login' ||
//         currentRoute === 'pages/register/register') {
//         // 白名单页面，无需登录，直接返回
//         return true;
//     }

//     // 检查用户是否已登录（这里假设 token 存储在本地存储中）
//     const userStore = useUserStore();
//     if (userStore.token) return true;

//     // 避免重复跳转
//     if (currentRoute === 'pages/login/login') return false;

//     // 用户未登录，需要跳转到登录页面
//     // 获取查询参数
//     const getQueryString = (params) => {
//         return Object.keys(params)
//            .map(key => key + '=' + params[key])
//            .join('&');
//     };

//     // 获取完整的 URL (包含查询参数)
//     const currentUrl = '/' + currentPage.route + '?' + getQueryString(currentPage.options || {});

//     console.log("currentUrl", currentUrl);

//     // 保存到本地存储
//     uni.setStorage({
//         key: 'loginRedirectUrl',
//         data: currentUrl,
//         success: () => {
//             console.log("存储成功");
//             // 跳转到登录页面
//             uni.navigateTo({
//                 url: '/pages/login/login'
//             });
//         },
//         fail: (err) => {
//             console.error("存储失败：", err);
//             uni.showToast({
//                 title: '存储失败，请稍后重试',
//                 icon: 'none'
//             });
//         }
//     });

//     return false;
// };

// // 单独导出 checkLogin 函数
// export { checkLogin };