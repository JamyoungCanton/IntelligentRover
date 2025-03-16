"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache) {
  return {
    a: common_vendor.p({
      type: "list",
      size: "24",
      color: "#ffffff"
    }),
    b: common_vendor.p({
      type: "gift",
      size: "24",
      color: "#ffffff"
    }),
    c: common_vendor.p({
      type: "camera",
      size: "20",
      color: "#ffffff"
    }),
    d: common_vendor.p({
      type: "refresh",
      size: "20",
      color: "#1E88E5"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/ticketPoints/ticketPoints.js.map
