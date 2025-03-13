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
  __name: "foodRecommendation",
  setup(__props) {
    const currentTab = common_vendor.ref(0);
    const filterTags = common_vendor.ref([
      { name: "全部", active: true },
      { name: "海鲜", active: false },
      { name: "粤式", active: false },
      { name: "特色小吃", active: false },
      { name: "农家菜", active: false }
    ]);
    const tabItems = [
      { icon: "home", text: "首页" },
      { icon: "location", text: "行程" },
      { icon: "scan", text: "一码通" },
      { icon: "file", text: "订单" },
      { icon: "person", text: "我的" }
    ];
    const restaurants = common_vendor.ref([
      {
        image: "https://ai-public.mastergo.com/ai/img_res/a256aeabf41e28db3c1c0b25aec7373c.jpg",
        name: "万山渔港海鲜餐厅",
        rating: "4.8",
        monthlySales: "2380",
        averagePrice: "188",
        distance: "1.2",
        tag: "人气网红",
        tagType: "popular"
      },
      {
        image: "https://ai-public.mastergo.com/ai/img_res/6dcb4b894c7f14fcac90ab68d7dc378e.jpg",
        name: "粤海味道",
        rating: "4.6",
        monthlySales: "1680",
        averagePrice: "128",
        distance: "0.8",
        tag: "特色推荐",
        tagType: "featured"
      }
    ]);
    const selectTag = (index) => {
      filterTags.value.forEach((tag, i) => {
        tag.active = i === index;
      });
    };
    const switchTab = (index) => {
      currentTab.value = index;
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const onSearch = () => {
      common_vendor.index.showToast({
        title: "搜索功能开发中",
        icon: "none"
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          type: "back",
          size: "24",
          color: "#333"
        }),
        c: common_vendor.o(onSearch),
        d: common_vendor.p({
          type: "search",
          size: "24",
          color: "#333"
        }),
        e: common_vendor.f(filterTags.value, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag.name),
            b: index,
            c: common_vendor.n({
              active: tag.active
            }),
            d: common_vendor.o(($event) => selectTag(index), index)
          };
        }),
        f: common_vendor.p({
          type: "down",
          size: "12",
          color: "#999"
        }),
        g: common_vendor.f(restaurants.value, (restaurant, index, i0) => {
          return {
            a: restaurant.image,
            b: common_vendor.t(restaurant.tag),
            c: common_vendor.n(restaurant.tagType),
            d: common_vendor.t(restaurant.name),
            e: "0bc455be-3-" + i0,
            f: common_vendor.t(restaurant.rating),
            g: common_vendor.t(restaurant.monthlySales),
            h: common_vendor.t(restaurant.averagePrice),
            i: common_vendor.t(restaurant.distance),
            j: index
          };
        }),
        h: common_vendor.p({
          type: "star-filled",
          size: "14",
          color: "#FFA500"
        }),
        i: common_vendor.p({
          type: "calendar",
          size: "24",
          color: "#FFFFFF"
        }),
        j: common_vendor.f(tabItems, (item, index, i0) => {
          return {
            a: "0bc455be-5-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: "20",
              color: currentTab.value === index ? "#0066FF" : "#999"
            }),
            c: common_vendor.t(item.text),
            d: common_vendor.n({
              active: currentTab.value === index
            }),
            e: index,
            f: common_vendor.o(($event) => switchTab(index), index)
          };
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/foodRecommendation/foodRecommendation.js.map
