"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      safeArea: { top: 0, bottom: 0 },
      isFavorite: false,
      data: {
        // 图标和图片路径
        icons: {
          back: "back",
          share: "share",
          star: "star-filled",
          favorite: "/static/activity/heart.png",
          favoriteFilled: "/static/activity/heart_filled.png",
          checkmark: "√",
          close: "close",
          time: "/static/activity/time.png",
          swim: "/static/activity/swim.png",
          food: "/static/activity/food.png"
        },
        // 图标大小
        iconSize: 24,
        // 活动图片
        activityImage: "/static/activity/diving.jpg",
        // 文本内容
        title: "深潜探索",
        activityName: "海底世界深潜体验",
        price: "¥368",
        priceUnit: "起/人",
        ratingText: "4.8 (1280人评价)",
        starColor: "#FFD700",
        favoriteText: "收藏",
        sections: {
          schedule: "活动流程",
          precautions: "注意事项",
          cost: "费用说明"
        },
        costSections: {
          included: "费用包含",
          notIncluded: "费用不含"
        },
        priceLabel: "起始价格",
        registerText: "立即报名",
        // 列表内容
        ratingStars: 5,
        schedules: [
          {
            time: "09:00 集合出发",
            description: "在指定地点集合，进行安全说明",
            icon: "/static/activity/time.png"
          },
          {
            time: "10:00 潜水培训",
            description: "专业教练指导潜水技巧和安全知识",
            icon: "/static/activity/swim.png"
          },
          {
            time: "12:00 午餐休息",
            description: "享用精致午餐，补充体力",
            icon: "/static/activity/food.png"
          }
        ],
        precautions: [
          "参与者需年满18周岁，请携带有效身份证件",
          "活动期间请听从教练指导，确保安全",
          "建议穿着轻便泳装，可自备防晒用品"
        ],
        costs: {
          included: [
            "专业潜水装备租赁",
            "专业教练一对一指导",
            "午餐及饮用水"
          ],
          notIncluded: [
            "往返交通费用",
            "个人消费项目"
          ]
        },
        // 颜色配置
        closeColor: "#FF6B6B"
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
        url: "/pages/activityRegistration/activityRegistration"
      });
    },
    toggleFavorite() {
      this.isFavorite = !this.isFavorite;
    },
    getSafeAreaInfo() {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      this.safeArea = systemInfo.safeArea || { top: 0, bottom: 0 };
    }
  }
};
const __injectCSSVars__ = () => {
  common_vendor.useCssVars((_ctx) => ({
    "0ebdcfcf": _ctx.safeArea.top + "px"
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
      type: $data.data.icons.back,
      size: $data.data.iconSize
    }),
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.t($data.data.title),
    d: common_vendor.p({
      type: $data.data.icons.share,
      size: $data.data.iconSize
    }),
    e: $data.data.activityImage,
    f: common_vendor.t($data.data.activityName),
    g: common_vendor.t($data.data.price),
    h: common_vendor.t($data.data.priceUnit),
    i: common_vendor.f($data.data.ratingStars, (star, index, i0) => {
      return {
        a: index,
        b: "da48f91d-2-" + i0
      };
    }),
    j: common_vendor.p({
      type: $data.data.icons.star,
      size: $data.data.iconSize,
      color: $data.data.starColor
    }),
    k: common_vendor.t($data.data.ratingText),
    l: $data.isFavorite ? $data.data.icons.favoriteFilled : $data.data.icons.favorite,
    m: common_vendor.t($data.data.favoriteText),
    n: common_vendor.n($data.isFavorite ? "active" : ""),
    o: common_vendor.o((...args) => $options.toggleFavorite && $options.toggleFavorite(...args)),
    p: common_vendor.t($data.data.sections.schedule),
    q: common_vendor.f($data.data.schedules, (schedule, index, i0) => {
      return {
        a: schedule.icon,
        b: common_vendor.t(schedule.time),
        c: common_vendor.t(schedule.description),
        d: index
      };
    }),
    r: common_vendor.t($data.data.sections.precautions),
    s: common_vendor.f($data.data.precautions, (precaution, index, i0) => {
      return {
        a: common_vendor.t(precaution),
        b: index
      };
    }),
    t: common_vendor.t($data.data.sections.cost),
    v: common_vendor.t($data.data.costSections.included),
    w: common_vendor.f($data.data.costs.included, (included, index, i0) => {
      return {
        a: common_vendor.t(included),
        b: index
      };
    }),
    x: common_vendor.t($data.data.icons.checkmark),
    y: common_vendor.t($data.data.costSections.notIncluded),
    z: common_vendor.f($data.data.costs.notIncluded, (notIncluded, index, i0) => {
      return {
        a: "da48f91d-3-" + i0,
        b: common_vendor.t(notIncluded),
        c: index
      };
    }),
    A: common_vendor.p({
      type: $data.data.icons.close,
      size: $data.data.iconSize,
      color: $data.data.closeColor
    }),
    B: common_vendor.t($data.data.priceLabel),
    C: common_vendor.t($data.data.price),
    D: common_vendor.t($data.data.priceUnit),
    E: common_vendor.t($data.data.registerText),
    F: common_vendor.o((...args) => $options.goToRegistration && $options.goToRegistration(...args)),
    G: common_vendor.s(_ctx.__cssVars())
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-da48f91d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/activity/activity.js.map
