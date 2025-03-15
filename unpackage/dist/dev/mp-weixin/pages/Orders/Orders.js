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
const _sfc_main = {
  __name: "Orders",
  setup(__props) {
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          type: "back",
          size: "24",
          color: "#333"
        }),
        c: common_vendor.p({
          type: "heart",
          size: "24",
          color: "#333"
        }),
        d: common_assets._imports_0$1,
        e: common_vendor.f(5, (n, k0, i0) => {
          return {
            a: n,
            b: "b43921d6-2-" + i0
          };
        }),
        f: common_vendor.p({
          type: "star-filled",
          size: "20",
          color: "#FFD700"
        }),
        g: common_assets._imports_1$1,
        h: common_assets._imports_2$1,
        i: common_assets._imports_3$1,
        j: common_assets._imports_4$1,
        k: common_assets._imports_5$1
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b43921d6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Orders/Orders.js.map
