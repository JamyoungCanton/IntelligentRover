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
  __name: "my",
  setup(__props) {
    const gridItems = common_vendor.ref([
      {
        icon: "https://ai-public.mastergo.com/ai/img_res/4192a970e1156a95833445f64fb4c1ba.jpg",
        text: "收藏行程"
      },
      {
        icon: "https://ai-public.mastergo.com/ai/img_res/76778fc2a8a40ed9c6e1b9e5fc87f4e5.jpg",
        text: "历史订单"
      },
      {
        icon: "https://ai-public.mastergo.com/ai/img_res/dab4ae9b672cb2e2be0c9e1ff722477b.jpg",
        text: "待出行"
      },
      {
        icon: "https://ai-public.mastergo.com/ai/img_res/c2d8fdc4258102ea814c9a54ec7e97f3.jpg",
        text: "客服中心"
      }
    ]);
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        b: common_vendor.f(gridItems.value, (item, index, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.text),
            c: index
          };
        }),
        c: common_vendor.p({
          type: "list",
          size: "18",
          color: "#3B82F6"
        }),
        d: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        e: common_vendor.p({
          type: "gear",
          size: "18",
          color: "#3B82F6"
        }),
        f: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        g: common_vendor.p({
          type: "notification",
          size: "18",
          color: "#3B82F6"
        }),
        h: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        i: common_vendor.p({
          type: "spinner-cycle",
          size: "18",
          color: "#3B82F6"
        }),
        j: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        k: common_vendor.p({
          type: "chatboxes",
          size: "18",
          color: "#3B82F6"
        }),
        l: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        m: common_vendor.p({
          type: "info",
          size: "18",
          color: "#3B82F6"
        }),
        n: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        })
      };
    };
  }
});
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map
