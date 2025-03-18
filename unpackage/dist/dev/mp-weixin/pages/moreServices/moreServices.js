"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
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
      { icon: "location", name: "船票预定" },
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
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "search",
          size: "22",
          color: "#666666"
        }),
        b: common_assets._imports_0,
        c: common_assets._imports_1,
        d: common_assets._imports_2$1,
        e: common_assets._imports_3,
        f: common_vendor.p({
          type: "phone-filled",
          size: "20",
          color: "#FFFFFF"
        }),
        g: common_assets._imports_4,
        h: common_vendor.p({
          type: "refreshempty",
          size: "24",
          color: "#0066FF"
        }),
        i: common_vendor.p({
          type: "notification",
          size: "24",
          color: "#0066FF"
        }),
        j: common_vendor.p({
          type: "help",
          size: "24",
          color: "#0066FF"
        }),
        k: common_vendor.f(commonServices.value, (item, index, i0) => {
          return {
            a: "6588999f-5-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: "24",
              color: "#0066FF"
            }),
            c: common_vendor.t(item.name),
            d: index
          };
        }),
        l: common_vendor.f(otherServices.value, (item, index, i0) => {
          return {
            a: "6588999f-6-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: "24",
              color: "#0066FF"
            }),
            c: common_vendor.t(item.name),
            d: index
          };
        })
      };
    };
  }
});
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/moreServices/moreServices.js.map
