"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 图片资源路径
      assets: {
        banner: "/static/route/beach2.jpg",
        wechatIcon: "/static/route/wechat.png",
        alipayIcon: "/static/route/alipay.png"
      },
      // 文本内容
      texts: {
        title: "浪漫双岛游报名",
        namePlaceholder: "请输入姓名",
        phonePlaceholder: "请输入手机号",
        codePlaceholder: "请输入验证码",
        idCardPlaceholder: "请输入身份证号",
        getCodeBtn: "获取验证码",
        selectTravelers: "选择出行人数",
        pricePerPerson: "¥3999/人",
        selectPaymentMethod: "选择支付方式",
        wechatPayment: "微信支付",
        alipayPayment: "支付宝",
        total: "总计",
        payNowBtn: "立即支付"
      },
      // 表单数据
      formData: {
        name: "",
        phone: "",
        code: "",
        idCard: "",
        people: 2,
        payment: "wechat"
      }
    };
  },
  computed: {
    totalAmount() {
      return 3999 * this.formData.people;
    }
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    sendCode() {
      common_vendor.index.showToast({
        title: "验证码已发送",
        icon: "none"
      });
    },
    decreasePeople() {
      if (this.formData.people > 1) {
        this.formData.people--;
      }
    },
    increasePeople() {
      this.formData.people++;
    },
    selectPayment(paymentMethod) {
      this.formData.payment = paymentMethod;
    },
    submitForm() {
      if (!this.formData.name || !this.formData.phone || !this.formData.code || !this.formData.idCard) {
        common_vendor.index.showToast({
          title: "请填写完整信息",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showToast({
        title: "报名成功",
        icon: "success",
        duration: 1500
      });
      setTimeout(() => {
        common_vendor.index.navigateTo({
          url: "/pages/routeRegistrationSuccess/routeRegistrationSuccess"
        });
      }, 1500);
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      type: "back",
      size: "24"
    }),
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.t($data.texts.title),
    d: $data.assets.banner,
    e: $data.texts.namePlaceholder,
    f: $data.formData.name,
    g: common_vendor.o(($event) => $data.formData.name = $event.detail.value),
    h: $data.texts.phonePlaceholder,
    i: $data.formData.phone,
    j: common_vendor.o(($event) => $data.formData.phone = $event.detail.value),
    k: $data.texts.codePlaceholder,
    l: $data.formData.code,
    m: common_vendor.o(($event) => $data.formData.code = $event.detail.value),
    n: common_vendor.t($data.texts.getCodeBtn),
    o: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args)),
    p: $data.texts.idCardPlaceholder,
    q: $data.formData.idCard,
    r: common_vendor.o(($event) => $data.formData.idCard = $event.detail.value),
    s: common_vendor.t($data.texts.selectTravelers),
    t: common_vendor.n({
      "disabled": $data.formData.people === 1
    }),
    v: common_vendor.o((...args) => $options.decreasePeople && $options.decreasePeople(...args)),
    w: $data.formData.people === 1 ? "#AAAAAA" : "#007AFF",
    x: common_vendor.t($data.formData.people),
    y: common_vendor.o((...args) => $options.increasePeople && $options.increasePeople(...args)),
    z: common_vendor.t($data.texts.pricePerPerson),
    A: common_vendor.t($data.formData.people),
    B: common_vendor.t($data.texts.selectPaymentMethod),
    C: $data.assets.wechatIcon,
    D: common_vendor.t($data.texts.wechatPayment),
    E: $data.formData.payment === "wechat",
    F: common_vendor.o(($event) => $options.selectPayment("wechat")),
    G: $data.assets.alipayIcon,
    H: common_vendor.t($data.texts.alipayPayment),
    I: $data.formData.payment === "alipay",
    J: common_vendor.o(($event) => $options.selectPayment("alipay")),
    K: common_vendor.t($data.texts.total),
    L: common_vendor.t($options.totalAmount),
    M: common_vendor.t($data.texts.payNowBtn),
    N: common_vendor.o((...args) => $options.submitForm && $options.submitForm(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5c4ed5bc"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/routeRegistration/routeRegistration.js.map
