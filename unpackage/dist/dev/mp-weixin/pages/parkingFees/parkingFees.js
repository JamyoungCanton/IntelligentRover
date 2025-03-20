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
  __name: "parkingFees",
  setup(__props) {
    const plateProvince = common_vendor.ref("");
    const plateNumber = common_vendor.ref("");
    const selectedPayment = common_vendor.ref("wechat");
    const historyPlates = common_vendor.ref([
      { text: "粤 A12345", active: true },
      { text: "粤 B67890", active: false }
    ]);
    const paymentMethods = common_vendor.ref([
      { name: "微信支付", icon: "/static/parkingFees/weixin.png", color: "#07C160", value: "wechat" },
      { name: "支付宝", icon: "/static/parkingFees/zhifubao.png", color: "#1677FF", value: "alipay" }
    ]);
    const safeAreaInsets = common_vendor.index.getSystemInfoSync().safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const onPayClick = () => {
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          type: "back",
          size: "24",
          color: "#333333"
        }),
        c: common_vendor.p({
          type: "search",
          size: "24",
          color: "#333333"
        }),
        d: common_vendor.unref(safeAreaInsets).top ? common_vendor.unref(safeAreaInsets).top + "px" : "0px",
        e: plateProvince.value,
        f: common_vendor.o(($event) => plateProvince.value = $event.detail.value),
        g: plateNumber.value,
        h: common_vendor.o(($event) => plateNumber.value = $event.detail.value),
        i: common_vendor.p({
          type: "loop",
          size: "24",
          color: "#666666"
        }),
        j: common_vendor.f(historyPlates.value, (plate, index, i0) => {
          return {
            a: common_vendor.t(plate.text),
            b: index,
            c: common_vendor.n({
              active: plate.active
            })
          };
        }),
        k: common_vendor.f(paymentMethods.value, (item, index, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.name),
            c: item.value,
            d: selectedPayment.value === item.value,
            e: common_vendor.o(($event) => selectedPayment.value = item.value, index),
            f: index
          };
        }),
        l: common_vendor.o(onPayClick)
      };
    };
  }
});
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/parkingFees/parkingFees.js.map
