"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  setup() {
    const item = common_vendor.reactive({
      title: "海钓体验行程安排",
      schedule: [
        { time: "上午", detail: '前往"珊瑚海滩"，享受浮潜服务' },
        { time: "中午", detail: '在"海滩餐厅"享用午餐' },
        { time: "下午", detail: '参观"海岛文化博物馆"' },
        { time: "晚上", detail: '返回"海景酒店B"休息' }
      ],
      costDetails: [
        { name: "浮潜服务", price: "¥200/人" },
        { name: "午餐套餐", price: "¥150/人" },
        { name: "海景酒店住宿", price: "¥500/晚" }
      ],
      originalPrice: "¥850",
      discount: "-¥100",
      finalPrice: "¥750"
    });
    const userPhone = common_vendor.ref("");
    const notes = common_vendor.ref("");
    const selectedPayment = common_vendor.ref("wechat");
    const validatePhone = (phone) => {
      const phoneRegex = /^1[3-9]\d{9}$/;
      return phoneRegex.test(phone);
    };
    const selectPaymentMethod = (method) => {
      selectedPayment.value = method;
    };
    const showToast = (options) => {
      try {
        common_vendor.index.showToast(options);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/payment/payment.vue:141", "显示提示框失败:", error);
      }
    };
    const showModal = (options, callback) => {
      try {
        common_vendor.index.showModal({
          ...options,
          success: (res) => {
            if (res.confirm && typeof callback === "function") {
              callback();
            }
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/payment/payment.vue:157", "显示模态框失败:", error);
      }
    };
    const confirmPayment = () => {
      if (!userPhone.value) {
        showToast({ title: "请输入手机号码", icon: "none" });
        return;
      }
      if (!validatePhone(userPhone.value)) {
        showToast({ title: "请输入有效的手机号码", icon: "none" });
        return;
      }
      showModal(
        {
          title: "确认支付",
          content: `您确认支付 ${item.finalPrice} 吗？`
        },
        () => {
          showToast({ title: "支付成功！", icon: "success" });
        }
      );
    };
    return {
      item,
      userPhone,
      notes,
      selectedPayment,
      selectPaymentMethod,
      confirmPayment
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$1,
    b: common_vendor.f($setup.item.schedule, (scheduleItem, index, i0) => {
      return {
        a: common_vendor.t(scheduleItem.time),
        b: common_vendor.t(scheduleItem.detail),
        c: index
      };
    }),
    c: common_assets._imports_1$1,
    d: common_vendor.f($setup.item.costDetails, (costItem, index, i0) => {
      return {
        a: common_vendor.t(costItem.name),
        b: common_vendor.t(costItem.price),
        c: index
      };
    }),
    e: common_vendor.t($setup.item.originalPrice),
    f: common_vendor.t($setup.item.discount),
    g: common_vendor.t($setup.item.finalPrice),
    h: common_assets._imports_2$1,
    i: $setup.userPhone,
    j: common_vendor.o(($event) => $setup.userPhone = $event.detail.value),
    k: common_assets._imports_3$1,
    l: $setup.notes,
    m: common_vendor.o(($event) => $setup.notes = $event.detail.value),
    n: common_assets._imports_4$1,
    o: common_assets._imports_5,
    p: $setup.selectedPayment === "wechat"
  }, $setup.selectedPayment === "wechat" ? {
    q: common_assets._imports_6
  } : {}, {
    r: common_vendor.o(($event) => $setup.selectPaymentMethod("wechat")),
    s: common_assets._imports_7,
    t: $setup.selectedPayment === "alipay"
  }, $setup.selectedPayment === "alipay" ? {
    v: common_assets._imports_6
  } : {}, {
    w: common_vendor.o(($event) => $setup.selectPaymentMethod("alipay")),
    x: common_vendor.t($setup.item.finalPrice),
    y: common_vendor.o((...args) => $setup.confirmPayment && $setup.confirmPayment(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/payment/payment.js.map
