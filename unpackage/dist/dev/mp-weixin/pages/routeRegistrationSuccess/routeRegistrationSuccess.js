"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      safeArea: { top: 0, bottom: 0 },
      // 图片资源路径
      assets: {
        successIcon: "/static/route/success.png",
        infoIcon1: "/static/route/info1.png",
        infoIcon2: "/static/route/info2.png"
      },
      // 订单信息
      orderInfo: {
        orderId: "SD20230728001",
        tourName: "浪漫双岛游 2日1晚",
        departureDate: "2025年1月1日",
        travelers: 2
      },
      // 通知内容
      notifications: [
        "行程详情和注意事项已发送至您的手机：138****8888，请注意查收。",
        "导游将在出发前1天与您联系，确认集合地点和时间。"
      ],
      // 按钮文案
      buttons: {
        viewDetails: "查看订单详情",
        goHome: "返回首页"
      },
      // 温馨提示内容
      tips: {
        title: "温馨提示",
        items: [
          "• 请提前准备好必要的证件和物品",
          "• 如需修改或取消行程，请提前48小时联系客服",
          "• 遇到问题可随时拨打咨询热线：400-888-8888"
        ]
      }
    };
  },
  onLoad() {
    this.getSafeAreaInfo();
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    viewDetails() {
      common_vendor.index.showToast({
        title: "查看订单详情",
        icon: "none"
      });
    },
    goHome() {
      common_vendor.index.switchTab({
        url: "/pages/index/index"
      });
    },
    getSafeAreaInfo() {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      this.safeArea = systemInfo.safeArea || { top: 0, bottom: 0 };
    }
  }
};
const __injectCSSVars__ = () => {
  common_vendor.useCssVars((_ctx) => ({
    "2f918130": _ctx.safeArea.top + "px"
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
      type: "back",
      size: "24"
    }),
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: $data.assets.successIcon,
    d: common_vendor.t($data.orderInfo.orderId),
    e: common_vendor.t($data.orderInfo.tourName),
    f: common_vendor.t($data.orderInfo.departureDate),
    g: common_vendor.t($data.orderInfo.travelers),
    h: $data.assets.infoIcon1,
    i: common_vendor.t($data.notifications[0]),
    j: $data.assets.infoIcon2,
    k: common_vendor.t($data.notifications[1]),
    l: common_vendor.t($data.buttons.viewDetails),
    m: common_vendor.o((...args) => $options.viewDetails && $options.viewDetails(...args)),
    n: common_vendor.t($data.buttons.goHome),
    o: common_vendor.o((...args) => $options.goHome && $options.goHome(...args)),
    p: common_vendor.t($data.tips.title),
    q: common_vendor.f($data.tips.items, (tip, index, i0) => {
      return {
        a: common_vendor.t(tip),
        b: index
      };
    }),
    r: common_vendor.s(_ctx.__cssVars())
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4178867a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/routeRegistrationSuccess/routeRegistrationSuccess.js.map
