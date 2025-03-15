"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "moreServices",
  setup(__props) {
    const commonServices = common_vendor.ref([
      { icon: "location", name: "景点攻略" },
      { icon: "ticket", name: "船票预定" },
      { icon: "shop", name: "美食推荐" },
      { icon: "home", name: "住宿预定" },
      { icon: "flag", name: "停车收费" },
      { icon: "paperplane", name: "小票积分" },
      { icon: "staff", name: "交通指南" }
    ]);
    const otherServices = common_vendor.ref([
      { icon: "shield", name: "旅游保险" },
      { icon: "person", name: "导游服务" },
      { icon: "chat", name: "翻译服务" },
      { icon: "car", name: "租车服务" },
      { icon: "gift", name: "快递服务" },
      { icon: "help", name: "医疗援助" }
    ]);
    const tabBarList = common_vendor.ref([
      { icon: "home", text: "首页" },
      { icon: "calendar", text: "行程" },
      { icon: "scan", text: "一码通" },
      { icon: "file", text: "订单" },
      { icon: "person", text: "我的" }
    ]);
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "search",
          size: "22",
          color: "#666666"
        }),
        b: common_vendor.p({
          type: "phone-filled",
          size: "20",
          color: "#FFFFFF"
        }),
        c: common_vendor.p({
          type: "car",
          size: "24",
          color: "#0066FF"
        }),
        d: common_vendor.p({
          type: "refreshempty",
          size: "24",
          color: "#0066FF"
        }),
        e: common_vendor.p({
          type: "notification",
          size: "24",
          color: "#0066FF"
        }),
        f: common_vendor.p({
          type: "help",
          size: "24",
          color: "#0066FF"
        }),
        g: common_vendor.f(commonServices.value, (item, index, i0) => {
          return {
            a: "1d0c339b-6-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: "24",
              color: "#0066FF"
            }),
            c: common_vendor.t(item.name),
            d: index
          };
        }),
        h: common_vendor.f(otherServices.value, (item, index, i0) => {
          return {
            a: "1d0c339b-7-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: "24",
              color: "#0066FF"
            }),
            c: common_vendor.t(item.name),
            d: index
          };
        }),
        i: common_vendor.f(tabBarList.value, (item, index, i0) => {
          return {
            a: "1d0c339b-8-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: "20",
              color: "#999999"
            }),
            c: common_vendor.t(item.text),
            d: index
          };
        })
      };
    };
  }
});
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/moreServices/moreServices.js.map
