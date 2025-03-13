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
  __name: "order",
  setup(__props) {
    const tabs = ["全部", "待支付", "待出行", "进行中", "已完成"];
    const currentTab = common_vendor.ref(0);
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999"
        }),
        b: common_vendor.p({
          type: "settings",
          size: "20",
          color: "#1890FF"
        }),
        c: common_vendor.f(tabs, (tab, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(tab),
            b: currentTab.value === index
          }, currentTab.value === index ? {} : {}, {
            c: index,
            d: currentTab.value === index ? 1 : "",
            e: common_vendor.o(($event) => _ctx.handleTabClick(index), index)
          });
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/order.js.map
