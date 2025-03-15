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
  __name: "payment",
  setup(__props) {
    const phone = common_vendor.ref("13800138000");
    const remark = common_vendor.ref("");
    const selectedPayment = common_vendor.ref("wechat");
    const clearPhone = () => {
      phone.value = "";
    };
    const selectPayment = (payment) => {
      selectedPayment.value = payment;
    };
    const handleConfirmPayment = () => {
      common_vendor.index.navigateTo({
        url: "/pages/pay_success/pay_success"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "calendar",
          size: "20",
          color: "#3B82F6"
        }),
        b: common_vendor.p({
          type: "list",
          size: "20",
          color: "#3B82F6"
        }),
        c: common_vendor.p({
          type: "person",
          size: "20",
          color: "#3B82F6"
        }),
        d: phone.value,
        e: common_vendor.o(($event) => phone.value = $event.detail.value),
        f: phone.value
      }, phone.value ? {
        g: common_vendor.p({
          type: "clear",
          size: "20",
          color: "#999"
        }),
        h: common_vendor.o(clearPhone)
      } : {}, {
        i: common_vendor.p({
          type: "chatboxes",
          size: "20",
          color: "#3B82F6"
        }),
        j: remark.value,
        k: common_vendor.o(($event) => remark.value = $event.detail.value),
        l: common_vendor.p({
          type: "wallet",
          size: "20",
          color: "#3B82F6"
        }),
        m: common_vendor.p({
          type: "weixin",
          size: "24",
          color: "#07C160"
        }),
        n: selectedPayment.value === "wechat"
      }, selectedPayment.value === "wechat" ? {
        o: common_vendor.p({
          type: "checkbox-filled",
          size: "20",
          color: "#3B82F6"
        })
      } : {}, {
        p: selectedPayment.value === "wechat" ? 1 : "",
        q: common_vendor.o(($event) => selectPayment("wechat")),
        r: common_vendor.p({
          type: "wallet",
          size: "24",
          color: "#1677FF"
        }),
        s: selectedPayment.value === "alipay"
      }, selectedPayment.value === "alipay" ? {
        t: common_vendor.p({
          type: "checkbox-filled",
          size: "20",
          color: "#3B82F6"
        })
      } : {}, {
        v: selectedPayment.value === "alipay" ? 1 : "",
        w: common_vendor.o(($event) => selectPayment("alipay")),
        x: common_vendor.o(handleConfirmPayment)
      });
    };
  }
});
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/payment/payment.js.map
