"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      safeArea: { top: 0, bottom: 0 },
      // 文本内容
      texts: {
        title: "浪漫双岛游",
        routeName: "浪漫双岛游",
        routeDesc: "东澳岛-外伶仃岛 2日游",
        scheduleTitle: "行程安排",
        costTitle: "费用说明",
        costIncluded: "费用包含",
        costExcluded: "费用不含",
        notesTitle: "注意事项",
        registerText: "立即预订"
      },
      // 价格信息
      priceInfo: {
        price: "¥688",
        priceUnit: "起/人",
        totalLabel: "起价",
        totalValue: "¥688"
      },
      // 特色
      features: ["含住宿", "含餐饮", "含门票"],
      // 行程安排
      schedule: [
        {
          dayName: "第一天：东澳岛",
          activities: [
            '08:00 乘坐"万山号"摆渡车前往"碧海渔排"',
            "09:00 海钓活动，享受自助烹饪服务",
            "14:00 返回酒店休息"
          ]
        },
        {
          dayName: "第二天：外伶仃岛",
          activities: [
            "08:00 浮潜活动",
            "12:00 海鲜午餐",
            "14:00 返程"
          ]
        }
      ],
      // 费用说明
      costs: {
        included: ["• 往返交通费用", "• 住宿费用（标准双人间）", "• 行程中标明的用餐", "• 景点门票"],
        excluded: ["• 个人消费", "• 行程外项目"]
      },
      // 注意事项
      notes: ["• 请携带有效身份证件", "• 建议携带防晒用品", "• 请遵守导游安排", "• 注意安全，听从工作人员指挥"],
      // 图片资源路径
      assets: {
        banner: "/static/route/beach.jpg"
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
    goToRegistration() {
      common_vendor.index.navigateTo({
        url: "/pages/routeRegistration/routeRegistration"
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
    "0529dfd8": _ctx.safeArea.top + "px"
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
    c: common_vendor.t($data.texts.title),
    d: $data.assets.banner,
    e: common_vendor.t($data.texts.routeName),
    f: common_vendor.t($data.texts.routeDesc),
    g: common_vendor.t($data.priceInfo.price),
    h: common_vendor.t($data.priceInfo.priceUnit),
    i: common_vendor.f($data.features, (feature, index, i0) => {
      return {
        a: common_vendor.t(feature),
        b: index
      };
    }),
    j: common_vendor.t($data.texts.scheduleTitle),
    k: common_vendor.f($data.schedule, (day, index, i0) => {
      return {
        a: common_vendor.t(day.dayName),
        b: common_vendor.f(day.activities, (activity, idx, i1) => {
          return {
            a: common_vendor.t(activity),
            b: idx
          };
        }),
        c: index
      };
    }),
    l: common_vendor.t($data.texts.costTitle),
    m: common_vendor.t($data.texts.costIncluded),
    n: common_vendor.f($data.costs.included, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: index
      };
    }),
    o: common_vendor.t($data.texts.costExcluded),
    p: common_vendor.f($data.costs.excluded, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: index
      };
    }),
    q: common_vendor.t($data.texts.notesTitle),
    r: common_vendor.f($data.notes, (note, index, i0) => {
      return {
        a: common_vendor.t(note),
        b: index
      };
    }),
    s: common_vendor.t($data.priceInfo.totalLabel),
    t: common_vendor.t($data.priceInfo.totalValue),
    v: common_vendor.t($data.texts.registerText),
    w: common_vendor.o((...args) => $options.goToRegistration && $options.goToRegistration(...args)),
    x: common_vendor.s(_ctx.__cssVars())
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9b6e348a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/route/route.js.map
