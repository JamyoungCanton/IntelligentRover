"use strict";
const common_vendor = require("../../common/vendor.js");
const uniIcons = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
const itineraryData = [
  {
    id: 1,
    title: "两天精选海岛行程",
    date: "2024.01.15 - 2024.01.16",
    days: 2,
    price: 1288,
    type: "海岛游",
    status: "未开始",
    coverImage: "island.jpg",
    // 图片名称，实际路径在组件中处理
    details: [
      { time: "08:00", title: "乘坐摆渡车前往海岛", location: "酒店门口", description: "" },
      { time: "09:00", title: "海岛游览", location: "海岛", description: "享受海滩美景" },
      { time: "14:00", title: "享用午餐", location: "海岛餐厅", description: "" },
      { time: "15:00", title: "返回酒店", location: "酒店", description: "" }
    ]
  },
  {
    id: 2,
    title: "碧海鱼排",
    date: "2024.01.18",
    days: 1,
    price: 398,
    type: "海鲜美食",
    status: "未开始",
    coverImage: "fish-pier.jpg",
    // 图片名称，实际路径在组件中处理
    details: [
      { time: "08:00", title: "乘坐'万山号'摆渡车前往'碧海渔排'", location: "万山海景酒店门口", description: "" },
      { time: "09:00", title: "在'碧海渔排'进行海钓活动", location: "碧海渔排", description: "享受自助烹饪服务" },
      { time: "14:00", title: "在'碧海渔排'享用午餐", location: "碧海渔排餐厅", description: "" },
      { time: "15:00", title: "乘坐'万山号'摆渡车返回酒店", location: "万山海景酒店", description: "" },
      { time: "16:30", title: "金沙滩海滩漫步", location: "金沙滩海滩", description: "" },
      { time: "18:00", title: "海景餐吧晚餐", location: "海景餐吧", description: "观看夕阳下的海边美景" }
    ]
  }
];
function getImagePath(imageName) {
  return `/static/itinerary/${imageName}`;
}
const _sfc_main = {
  components: {
    uniIcons
  },
  data() {
    return {
      // 文本内容
      texts: {
        title: "我的行程"
      },
      // 图标类型和样式
      icons: {
        search: "search",
        plus: "+",
        calendar: "calendar",
        contact: "contact",
        location: "location",
        edit: "edit",
        share: "share",
        trash: "trash"
      },
      // 图标大小和颜色
      iconsSize: 24,
      iconsSizeSmall: 16,
      iconsSizeMedium: 18,
      iconsColor: "#666",
      iconsColorDark: "#333",
      // 标签页配置
      tabs: [
        { label: "全部", value: "all" },
        { label: "进行中", value: "ongoing" },
        { label: "未开始", value: "upcoming" },
        { label: "已完成", value: "completed" }
      ],
      activeTab: "all",
      // 行程数据
      itineraries: itineraryData,
      // 安全区域信息
      safeArea: {
        top: 0,
        bottom: 0
      }
    };
  },
  computed: {
    filteredItineraries() {
      if (this.activeTab === "all")
        return this.itineraries;
      return this.itineraries.filter((item) => {
        if (this.activeTab === "upcoming")
          return item.status === "未开始";
        return true;
      });
    }
  },
  onLoad() {
    this.getSafeAreaInfo();
  },
  methods: {
    getImagePath(imageName) {
      return getImagePath(imageName);
    },
    getSafeAreaInfo() {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      this.safeArea = systemInfo.safeArea || { top: 0, bottom: 0 };
    },
    changeTab(value) {
      this.activeTab = value;
    },
    editItinerary(id) {
      common_vendor.index.showToast({
        title: `编辑行程 ${id}`,
        icon: "none"
      });
    },
    shareItinerary(id) {
      common_vendor.index.showToast({
        title: `分享行程 ${id}`,
        icon: "none"
      });
    },
    deleteItinerary(id) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除行程 ${id} 吗？`,
        success: (res) => {
          if (res.confirm) {
            this.itineraries = this.itineraries.filter((item) => item.id !== id);
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
          }
        }
      });
    },
    addNewItinerary() {
      common_vendor.index.showToast({
        title: "添加新行程",
        icon: "none"
      });
    }
  }
};
const __injectCSSVars__ = () => {
  common_vendor.useCssVars((_ctx) => ({
    "69fdd735": _ctx.safeArea.top + "px"
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
    a: common_vendor.t($data.texts.title),
    b: common_vendor.p({
      type: $data.icons.search,
      size: $data.iconsSize,
      color: $data.iconsColor
    }),
    c: common_vendor.t($data.icons.plus),
    d: common_vendor.o((...args) => $options.addNewItinerary && $options.addNewItinerary(...args)),
    e: common_vendor.f($data.tabs, (tab, k0, i0) => {
      return {
        a: common_vendor.t(tab.label),
        b: $data.activeTab === tab.value ? 1 : "",
        c: tab.value,
        d: common_vendor.o(($event) => $options.changeTab(tab.value), tab.value)
      };
    }),
    f: common_vendor.f($options.filteredItineraries, (item, k0, i0) => {
      return {
        a: $options.getImagePath(item.coverImage),
        b: common_vendor.t(item.status),
        c: `/pages/itineraryDetails/itineraryDetails?id=${item.id}`,
        d: common_vendor.t(item.title),
        e: `/pages/itineraryDetails/itineraryDetails?id=${item.id}`,
        f: common_vendor.t(item.date),
        g: "9bfb8cb3-1-" + i0,
        h: common_vendor.t(item.days),
        i: "9bfb8cb3-2-" + i0,
        j: common_vendor.t(item.price),
        k: "9bfb8cb3-3-" + i0,
        l: common_vendor.t(item.type),
        m: "9bfb8cb3-4-" + i0,
        n: common_vendor.o(($event) => $options.editItinerary(item.id), item.id),
        o: "9bfb8cb3-5-" + i0,
        p: common_vendor.o(($event) => $options.shareItinerary(item.id), item.id),
        q: "9bfb8cb3-6-" + i0,
        r: common_vendor.o(($event) => $options.deleteItinerary(item.id), item.id),
        s: item.id
      };
    }),
    g: common_vendor.p({
      type: $data.icons.calendar,
      size: $data.iconsSizeSmall,
      color: $data.iconsColor
    }),
    h: common_vendor.p({
      type: $data.icons.contact,
      size: $data.iconsSizeSmall,
      color: $data.iconsColor
    }),
    i: common_vendor.p({
      type: $data.icons.location,
      size: $data.iconsSizeSmall,
      color: $data.iconsColor
    }),
    j: common_vendor.p({
      type: $data.icons.edit,
      size: $data.iconsSizeMedium,
      color: $data.iconsColorDark
    }),
    k: common_vendor.p({
      type: $data.icons.share,
      size: $data.iconsSizeMedium,
      color: $data.iconsColorDark
    }),
    l: common_vendor.p({
      type: $data.icons.trash,
      size: $data.iconsSizeMedium,
      color: $data.iconsColorDark
    }),
    m: common_vendor.s(_ctx.__cssVars())
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9bfb8cb3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/itinerary/itinerary.js.map
