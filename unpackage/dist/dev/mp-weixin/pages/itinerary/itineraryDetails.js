"use strict";
const common_vendor = require("../../common/vendor.js");
const uniIcons = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
const _sfc_main = {
  components: {
    uniIcons
  },
  data() {
    return {
      currentItinerary: {},
      dates: [
        { name: "周一", date: "12/11" },
        { name: "周二", date: "12/12" },
        { name: "周三", date: "12/13" },
        { name: "周四", date: "12/14" },
        { name: "周五", date: "12/15" }
      ],
      currentStep: 1
      // 当前进行到哪一步
    };
  },
  onLoad(options) {
    const id = parseInt(options.id);
    this.loadItineraryById(id);
  },
  methods: {
    loadItineraryById(id) {
      const mockData = {
        id: 2,
        title: "碧海鱼排",
        date: "2024.01.18",
        details: [
          { time: "08:00", title: "乘坐'万山号'摆渡车前往'碧海渔排'", location: "万山海景酒店门口", description: "" },
          { time: "09:00", title: "在'碧海渔排'进行海钓活动", location: "碧海渔排", description: "享受自助烹饪服务" },
          { time: "14:00", title: "在'碧海渔排'享用午餐", location: "碧海渔排餐厅", description: "" },
          { time: "15:00", title: "乘坐'万山号'摆渡车返回酒店", location: "万山海景酒店", description: "" },
          { time: "16:30", title: "金沙滩海滩漫步", location: "金沙滩海滩", description: "" },
          { time: "18:00", title: "海景餐吧晚餐", location: "海景餐吧", description: "观看夕阳下的海边美景" }
        ]
      };
      this.currentItinerary = mockData;
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
    c: common_vendor.p({
      type: "notification",
      size: "24"
    }),
    d: common_vendor.f($data.dates, (date, index, i0) => {
      return {
        a: common_vendor.t(date.name),
        b: common_vendor.t(date.date),
        c: index
      };
    }),
    e: common_vendor.f($data.currentItinerary.details, (item, index, i0) => {
      return common_vendor.e({
        a: index < $data.currentStep ? 1 : "",
        b: common_vendor.t(item.time),
        c: common_vendor.t(item.title),
        d: "6c1ca550-2-" + i0,
        e: common_vendor.t(item.location),
        f: item.description
      }, item.description ? {
        g: common_vendor.t(item.description)
      } : {}, {
        h: "6c1ca550-3-" + i0,
        i: index
      });
    }),
    f: common_vendor.p({
      type: "location",
      size: "16",
      color: "#666"
    }),
    g: common_vendor.p({
      type: "notification",
      size: "20",
      color: "#1989fa"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6c1ca550"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/itinerary/itineraryDetails.js.map
