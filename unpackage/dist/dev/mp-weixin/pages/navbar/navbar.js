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
const _sfc_main = {
  __name: "navbar",
  setup(__props) {
    const tabBarItems = [
      { icon: "home", text: "首页" },
      { icon: "paperplane", text: "行程" },
      { icon: "scan", text: "一码通" },
      { icon: "list", text: "订单" },
      { icon: "person", text: "我的" }
    ];
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(tabBarItems, (item, index, i0) => {
          return {
            a: "7464d045-0-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: "24",
              color: "#999999"
            }),
            c: common_vendor.t(item.text),
            d: index
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7464d045"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/navbar/navbar.js.map
