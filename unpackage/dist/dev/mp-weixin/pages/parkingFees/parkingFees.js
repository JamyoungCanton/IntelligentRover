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
      { name: "微信支付", icon: "wallet", color: "#07C160", value: "wechat" },
      { name: "支付宝", icon: "wallet", color: "#1677FF", value: "alipay" }
    ]);
    const onHistoryClick = () => {
    };
    const onHelpClick = () => {
    };
    const onServiceClick = () => {
    };
    const onPayClick = () => {
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(onHistoryClick),
        b: common_vendor.p({
          type: "clock",
          size: "24",
          color: "#ffffff"
        }),
        c: plateProvince.value,
        d: common_vendor.o(($event) => plateProvince.value = $event.detail.value),
        e: plateNumber.value,
        f: common_vendor.o(($event) => plateNumber.value = $event.detail.value),
        g: common_vendor.p({
          type: "loop",
          size: "24",
          color: "#666666"
        }),
        h: common_vendor.f(historyPlates.value, (plate, index, i0) => {
          return {
            a: common_vendor.t(plate.text),
            b: index,
            c: common_vendor.n({
              active: plate.active
            })
          };
        }),
        i: common_vendor.f(paymentMethods.value, (item, index, i0) => {
          return {
            a: "0ee252ea-2-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: "24",
              color: item.color
            }),
            c: common_vendor.t(item.name),
            d: item.value,
            e: selectedPayment.value === item.value,
            f: common_vendor.o(($event) => selectedPayment.value = item.value, index),
            g: index
          };
        }),
        j: common_vendor.p({
          type: "help",
          size: "20",
          color: "#666666"
        }),
        k: common_vendor.o(onHelpClick),
        l: common_vendor.p({
          type: "phone",
          size: "20",
          color: "#666666"
        }),
        m: common_vendor.o(onServiceClick),
        n: common_vendor.o(onPayClick)
      };
    };
  }
});
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/parkingFees/parkingFees.js.map
