"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      safeArea: { top: 0, bottom: 0 },
      // 图标和图片路径
      icons: {
        back: "back",
        calendar: "calendar",
        location: "location"
      },
      // 活动图片
      registrationImage: "/static/activity/diving2.jpg",
      // 表单数据
      form: {
        name: "",
        phone: "",
        participants: 1
      },
      // 是否同意协议
      agreed: false,
      // 页面标题
      title: "活动报名",
      // 活动信息
      activityName: "深海潜水体验",
      activityTime: "2024年3月15日 09:00-12:00",
      activityLocation: "万山群岛 东澳岛潜水基地",
      // 价格信息
      price: "¥399",
      priceUnit: "/人",
      // 按钮文本
      buttons: {
        minus: "-",
        plus: "+",
        submit: "立即报名"
      },
      // 表单标签和占位符
      labels: {
        name: "姓名",
        phone: "手机号码",
        participants: "参与人数"
      },
      placeholders: {
        name: "请输入真实姓名",
        phone: "请输入手机号码"
      },
      // 协议文本
      agreements: {
        text: "我已阅读并同意《活动协议》和《免责声明》"
      },
      // 费用名称
      costNames: {
        activity: "活动费用",
        insurance: "保险费用"
      },
      // 分段标题
      sections: {
        form: "报名信息",
        cost: "费用明细"
      }
    };
  },
  onLoad() {
    this.getSafeAreaInfo();
  },
  computed: {
    // 活动费用
    activityCost() {
      return 399 * this.form.participants;
    },
    // 保险费用
    insuranceCost() {
      return 50 * this.form.participants;
    }
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    decreaseParticipants() {
      if (this.form.participants > 1) {
        this.form.participants--;
      }
    },
    getSafeAreaInfo() {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      this.safeArea = systemInfo.safeArea || { top: 0, bottom: 0 };
    },
    increaseParticipants() {
      this.form.participants++;
    },
    toggleAgreement() {
      this.agreed = !this.agreed;
    },
    submitRegistration() {
      if (!this.form.name) {
        common_vendor.index.showToast({
          title: "请输入姓名",
          icon: "none"
        });
        return;
      }
      if (!this.form.phone) {
        common_vendor.index.showToast({
          title: "请输入手机号码",
          icon: "none"
        });
        return;
      }
      if (!this.agreed) {
        common_vendor.index.showToast({
          title: "请阅读并同意协议",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showToast({
        title: "报名成功",
        icon: "success"
      });
      common_vendor.index.__f__("log", "at pages/activityRegistration/activityRegistration.vue:210", "报名信息:", this.form);
    }
  }
};
const __injectCSSVars__ = () => {
  common_vendor.useCssVars((_ctx) => ({
    "f81af104": _ctx.safeArea.top + "px"
  }));
};
const __setup__ = _sfc_main.setup;
_sfc_main.setup = __setup__ ? (props, ctx) => {
  __injectCSSVars__();
  return __setup__(props, ctx);
} : __injectCSSVars__;
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
      type: $data.icons.back,
      size: "24"
    }),
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.t($data.title),
    d: $data.registrationImage,
    e: common_vendor.t($data.activityName),
    f: common_vendor.p({
      type: $data.icons.calendar,
      size: "16",
      color: "#666"
    }),
    g: common_vendor.t($data.activityTime),
    h: common_vendor.p({
      type: $data.icons.location,
      size: "16",
      color: "#666"
    }),
    i: common_vendor.t($data.activityLocation),
    j: common_vendor.t($data.price),
    k: common_vendor.t($data.priceUnit),
    l: common_vendor.t($data.sections.form),
    m: common_vendor.t($data.labels.name),
    n: $data.placeholders.name,
    o: $data.form.name,
    p: common_vendor.o(($event) => $data.form.name = $event.detail.value),
    q: common_vendor.t($data.labels.phone),
    r: $data.placeholders.phone,
    s: $data.form.phone,
    t: common_vendor.o(($event) => $data.form.phone = $event.detail.value),
    v: common_vendor.t($data.labels.participants),
    w: common_vendor.t($data.buttons.minus),
    x: common_vendor.o((...args) => $options.decreaseParticipants && $options.decreaseParticipants(...args)),
    y: $data.form.participants === 1,
    z: $data.form.participants === 1 ? 1 : "",
    A: common_vendor.t($data.form.participants),
    B: common_vendor.t($data.buttons.plus),
    C: common_vendor.o((...args) => $options.increaseParticipants && $options.increaseParticipants(...args)),
    D: common_vendor.t($data.sections.cost),
    E: common_vendor.t($data.costNames.activity),
    F: common_vendor.t($options.activityCost),
    G: common_vendor.t($data.form.participants),
    H: common_vendor.t($data.costNames.insurance),
    I: common_vendor.t($options.insuranceCost),
    J: common_vendor.t($data.form.participants),
    K: $data.agreed,
    L: common_vendor.o((...args) => $options.toggleAgreement && $options.toggleAgreement(...args)),
    M: common_vendor.t($data.agreements.text),
    N: common_vendor.t($data.buttons.submit),
    O: common_vendor.o((...args) => $options.submitRegistration && $options.submitRegistration(...args)),
    P: !$data.agreed,
    Q: common_vendor.s(_ctx.__cssVars())
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-600b90d9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/activityRegistration/activityRegistration.js.map
