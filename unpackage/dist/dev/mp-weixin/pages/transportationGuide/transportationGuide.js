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
const _sfc_main = {
  __name: "transportationGuide",
  setup(__props) {
    const safeAreaInsets = common_vendor.index.getSystemInfoSync().safeAreaInsets;
    common_vendor.index.__f__("log", "at pages/transportationGuide/transportationGuide.vue:73", safeAreaInsets);
    const currentTab = common_vendor.ref(0);
    const tabs = ["公交", "出租车", "租车", "自驾"];
    const stations = common_vendor.ref([
      {
        name: "万山码头公交站",
        distance: "300m",
        lines: [1, 2, 5]
      },
      {
        name: "海岛旅游中心站",
        distance: "500m",
        lines: [3, 6]
      },
      {
        name: "渔人码头站",
        distance: "800m",
        lines: [1, 4]
      }
    ]);
    const changeTab = (index) => {
      currentTab.value = index;
    };
    const startNavigation = () => {
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          type: "back",
          size: "24",
          color: "#333333"
        }),
        c: common_vendor.p({
          type: "search",
          size: "24",
          color: "#333333"
        }),
        d: common_vendor.unref(safeAreaInsets).top + "px",
        e: common_vendor.p({
          type: "location-filled",
          size: "16",
          color: "#1E88E5"
        }),
        f: common_vendor.o(startNavigation),
        g: common_vendor.f(tabs, (tab, index, i0) => {
          return {
            a: common_vendor.t(tab),
            b: index,
            c: common_vendor.n({
              active: currentTab.value === index
            }),
            d: common_vendor.o(($event) => changeTab(index), index)
          };
        }),
        h: common_vendor.f(stations.value, (station, index, i0) => {
          return {
            a: common_vendor.t(station.name),
            b: common_vendor.t(station.distance),
            c: "11a4dc5d-3-" + i0,
            d: common_vendor.f(station.lines, (line, lineIndex, i1) => {
              return {
                a: common_vendor.t(line),
                b: lineIndex
              };
            }),
            e: index
          };
        }),
        i: common_vendor.p({
          type: "right",
          size: "14",
          color: "#1E88E5"
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/transportationGuide/transportationGuide.js.map
