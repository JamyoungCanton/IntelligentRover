"use strict";
const common_vendor = require("../../common/vendor.js");
const uniIcons = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
function getImagePath(imageName) {
  return `/static/itinerary/${imageName}`;
}
const _sfc_main = {
  components: {
    uniIcons
  },
  data() {
    return {
      safeArea: { top: 0, bottom: 0 },
      // 文本内容
      texts: {
        title: "行程满意度评价",
        overallSatisfaction: "整体满意度",
        itineraryRating: "行程评分",
        detailedFeedback: "详细反馈",
        feedbackPlaceholder: "请详细描述您的行程体验，帮助我们提供更好的服务...",
        photoLimit: "最多上传9张图片，支持 jpg、png 格式",
        submitButton: "提交反馈"
      },
      // 图标和图片资源
      icons: {
        back: "back",
        notification: "notification",
        location: "location",
        starFilled: "star.png",
        starEmpty: "no-star.png",
        voiceActive: "voice-active.png",
        voiceInactive: "voice-inactive.png",
        camera: "camera.png",
        close: "close.png"
      },
      // 图标大小和颜色
      iconsSize: 24,
      iconsSizeSmall: 16,
      iconsColor: "#666",
      // 满意度选项
      satisfactionOptions: [
        { value: 4, label: "非常满意", icon: "very-satisfied.png" },
        { value: 3, label: "满意", icon: "satisfied.png" },
        { value: 2, label: "一般", icon: "general.png" },
        { value: 1, label: "不满意", icon: "dissatisfied.png" }
      ],
      // 评分项目
      ratingItems: [
        { name: "行程安排", ratings: 4 },
        { name: "导游服务", ratings: 5 },
        { name: "餐饮体验", ratings: 3 }
      ],
      // 反馈内容
      feedbackText: "",
      uploadedPhotos: [],
      isVoiceInputActive: false,
      selectedSatisfaction: null
    };
  },
  onLoad() {
    this.getSafeAreaInfo();
  },
  methods: {
    getImagePath(imageName) {
      return getImagePath(imageName);
    },
    selectSatisfaction(value) {
      this.selectedSatisfaction = value;
    },
    rate(itemName, score) {
      this.ratingItems.find((item) => item.name === itemName).ratings = score;
    },
    toggleVoiceInput() {
      this.isVoiceInputActive = !this.isVoiceInputActive;
      common_vendor.index.showToast({
        title: this.isVoiceInputActive ? "语音输入已开启" : "语音输入已关闭",
        icon: "none"
      });
    },
    deletePhoto(index) {
      this.uploadedPhotos.splice(index, 1);
    },
    openPhotoLibrary() {
      common_vendor.index.showToast({
        title: "请上传图片",
        icon: "none"
      });
    },
    submitFeedback() {
      if (!this.selectedSatisfaction) {
        common_vendor.index.showToast({
          title: "请选择整体满意度",
          icon: "none"
        });
        return;
      }
      if (!this.feedbackText.trim()) {
        common_vendor.index.showToast({
          title: "请输入详细反馈",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "确认提交",
        content: "您确定要提交反馈吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({
              title: "提交成功",
              icon: "success"
            });
            this.resetForm();
          }
        }
      });
    },
    resetForm() {
      this.selectedSatisfaction = null;
      this.ratingItems.forEach((item) => item.ratings = 0);
      this.feedbackText = "";
      this.uploadedPhotos = [];
      this.isVoiceInputActive = false;
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    getSafeAreaInfo() {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      this.safeArea = systemInfo.safeArea || { top: 0, bottom: 0 };
    }
  }
};
const __injectCSSVars__ = () => {
  common_vendor.useCssVars((_ctx) => ({
    "6a7c3893": _ctx.safeArea.top + "px"
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
      size: $data.iconsSize
    }),
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.t($data.texts.title),
    d: common_vendor.t($data.texts.overallSatisfaction),
    e: common_vendor.f($data.satisfactionOptions, (option, k0, i0) => {
      return {
        a: $options.getImagePath(option.icon),
        b: common_vendor.t(option.label),
        c: option.value,
        d: common_vendor.o(($event) => $options.selectSatisfaction(option.value), option.value)
      };
    }),
    f: common_vendor.t($data.texts.itineraryRating),
    g: common_vendor.f($data.ratingItems, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: common_vendor.f(5, (n, k1, i1) => {
          return {
            a: $options.getImagePath(item.ratings >= n ? $data.icons.starFilled : $data.icons.starEmpty),
            b: n,
            c: common_vendor.o(($event) => $options.rate(item.name, n), n)
          };
        }),
        c: item.name
      };
    }),
    h: common_vendor.t($data.texts.detailedFeedback),
    i: $data.texts.feedbackPlaceholder,
    j: $data.feedbackText,
    k: common_vendor.o(($event) => $data.feedbackText = $event.detail.value),
    l: $options.getImagePath($data.isVoiceInputActive ? $data.icons.voiceActive : $data.icons.voiceInactive),
    m: common_vendor.o((...args) => $options.toggleVoiceInput && $options.toggleVoiceInput(...args)),
    n: $options.getImagePath($data.icons.camera),
    o: common_vendor.o((...args) => $options.openPhotoLibrary && $options.openPhotoLibrary(...args)),
    p: common_vendor.t($data.texts.photoLimit),
    q: common_vendor.f($data.uploadedPhotos, (photo, index, i0) => {
      return {
        a: photo.url,
        b: common_vendor.o(($event) => $options.deletePhoto(index), index),
        c: index
      };
    }),
    r: $options.getImagePath($data.icons.close),
    s: common_vendor.t($data.texts.submitButton),
    t: common_vendor.o((...args) => $options.submitFeedback && $options.submitFeedback(...args)),
    v: common_vendor.s(_ctx.__cssVars())
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7a6c9b14"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/itineraryEvaluation/itineraryEvaluation.js.map
