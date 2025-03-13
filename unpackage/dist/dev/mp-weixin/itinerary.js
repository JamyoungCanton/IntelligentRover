"use strict";
const itineraryData = [
  {
    id: 1,
    title: "两天精选海岛行程",
    date: "2024.01.15 - 2024.01.16",
    days: 2,
    price: 1288,
    type: "海岛游",
    status: "未开始",
    coverImage: "island.jpg",
    // 图片名称，实际路径在组件中处理
    details: [
      { time: "08:00", title: "乘坐摆渡车前往海岛", location: "酒店门口", description: "" },
      { time: "09:00", title: "海岛游览", location: "海岛", description: "享受海滩美景" },
      { time: "14:00", title: "享用午餐", location: "海岛餐厅", description: "" },
      { time: "15:00", title: "返回酒店", location: "酒店", description: "" }
    ]
  },
  {
    id: 2,
    title: "碧海鱼排",
    date: "2024.01.18",
    days: 1,
    price: 398,
    type: "海鲜美食",
    status: "未开始",
    coverImage: "fish-pier.jpg",
    // 图片名称，实际路径在组件中处理
    details: [
      { time: "08:00", title: "乘坐'万山号'摆渡车前往'碧海渔排'", location: "万山海景酒店门口", description: "" },
      { time: "09:00", title: "在'碧海渔排'进行海钓活动", location: "碧海渔排", description: "享受自助烹饪服务" },
      { time: "14:00", title: "在'碧海渔排'享用午餐", location: "碧海渔排餐厅", description: "" },
      { time: "15:00", title: "乘坐'万山号'摆渡车返回酒店", location: "万山海景酒店", description: "" },
      { time: "16:30", title: "金沙滩海滩漫步", location: "金沙滩海滩", description: "" },
      { time: "18:00", title: "海景餐吧晚餐", location: "海景餐吧", description: "观看夕阳下的海边美景" }
    ]
  }
];
function getImagePath(imageName) {
  return `/static/itinerary/${imageName}`;
}
exports.getImagePath = getImagePath;
exports.itineraryData = itineraryData;
//# sourceMappingURL=../.sourcemap/mp-weixin/itinerary.js.map
