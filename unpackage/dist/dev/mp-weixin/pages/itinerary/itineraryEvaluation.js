"use strict";
const common_vendor = require("../../common/vendor.js");
const itinerary = require("../../itinerary.js");
const _sfc_main = {
  data() {
    return {
      satisfactionOptions: [
        { value: 4, label: "非常满意", icon: "very-satisfied.png" },
        { value: 3, label: "满意", icon: "satisfied.png" },
        { value: 2, label: "一般", icon: "general.png" },
        { value: 1, label: "不满意", icon: "dissatisfied.png" }
      ],
      ratingItems: [
        { name: "行程安排", ratings: 4 },
        { name: "导游服务", ratings: 5 },
        { name: "餐饮体验", ratings: 3 }
      ],
      feedbackText: "",
      uploadedPhotos: [],
      isVoiceInputActive: false,
      selectedSatisfaction: null
    };
  },
  methods: {
    getImagePath(imageName) {
      return itinerary.getImagePath(imageName);
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
    c: common_vendor.f($data.satisfactionOptions, (option, k0, i0) => {
      return {
        a: $options.getImagePath(option.icon),
        b: common_vendor.t(option.label),
        c: option.value,
        d: common_vendor.o(($event) => $options.selectSatisfaction(option.value), option.value)
      };
    }),
    d: common_vendor.f($data.ratingItems, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: common_vendor.f(5, (n, k1, i1) => {
          return {
            a: $options.getImagePath(item.ratings >= n ? "star.png" : "no-star.png"),
            b: n,
            c: common_vendor.o(($event) => $options.rate(item.name, n), n)
          };
        }),
        c: item.name
      };
    }),
    e: $data.feedbackText,
    f: common_vendor.o(($event) => $data.feedbackText = $event.detail.value),
    g: $options.getImagePath($data.isVoiceInputActive ? "voice-active.png" : "voice-inactive.png"),
    h: common_vendor.o((...args) => $options.toggleVoiceInput && $options.toggleVoiceInput(...args)),
    i: $options.getImagePath("camera.png"),
    j: common_vendor.o((...args) => $options.openPhotoLibrary && $options.openPhotoLibrary(...args)),
    k: common_vendor.f($data.uploadedPhotos, (photo, index, i0) => {
      return {
        a: photo.url,
        b: common_vendor.o(($event) => $options.deletePhoto(index), index),
        c: index
      };
    }),
    l: $options.getImagePath("close.png"),
    m: common_vendor.o((...args) => $options.submitFeedback && $options.submitFeedback(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4b8447a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/itinerary/itineraryEvaluation.js.map
