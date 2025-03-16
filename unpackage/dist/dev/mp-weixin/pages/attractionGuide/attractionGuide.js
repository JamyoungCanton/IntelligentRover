"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_rate2 = common_vendor.resolveComponent("uni-rate");
  (_easycom_uni_icons2 + _easycom_uni_rate2)();
}
const _easycom_uni_icons = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
const _easycom_uni_rate = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-rate/uni-rate.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_rate)();
}
const _sfc_main = {
  __name: "attractionGuide",
  setup(__props) {
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "heart",
          size: "24",
          color: "#FFFFFF"
        }),
        b: common_vendor.p({
          type: "arrow-right",
          size: "24",
          color: "#FFFFFF"
        }),
        c: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999999"
        }),
        d: common_vendor.p({
          type: "bottom",
          size: "12",
          color: "#666666"
        }),
        e: common_vendor.p({
          type: "filter",
          size: "12",
          color: "#666666"
        }),
        f: common_vendor.p({
          value: "4.8",
          size: "10",
          readonly: true
        }),
        g: common_vendor.p({
          type: "location",
          size: "12",
          color: "#999999"
        }),
        h: common_vendor.p({
          value: "4.2",
          size: "10",
          readonly: true
        }),
        i: common_vendor.p({
          type: "location",
          size: "12",
          color: "#999999"
        }),
        j: common_vendor.p({
          value: "4.9",
          size: "10",
          readonly: true
        }),
        k: common_vendor.p({
          type: "location",
          size: "12",
          color: "#999999"
        }),
        l: common_vendor.p({
          value: "4.3",
          size: "10",
          readonly: true
        }),
        m: common_vendor.p({
          type: "location",
          size: "12",
          color: "#999999"
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/attractionGuide/attractionGuide.js.map
