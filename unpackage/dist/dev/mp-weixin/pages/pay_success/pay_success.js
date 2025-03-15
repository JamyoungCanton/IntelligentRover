"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + Navbar)();
}
const Navbar = () => "../navbar/navbar2.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "pay_success",
  setup(__props) {
    const navigatortoOrders = () => {
      common_vendor.index.navigateTo({
        url: "/pages/Orders/Orders"
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "checkmarkempty",
          size: "80",
          color: "#4CAF50"
        }),
        b: common_vendor.o(navigatortoOrders)
      };
    };
  }
});
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/pay_success/pay_success.js.map
