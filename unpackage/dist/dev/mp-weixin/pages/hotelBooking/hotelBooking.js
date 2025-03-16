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
  __name: "hotelBooking",
  setup(__props) {
    const hotelList = common_vendor.ref([
      {
        name: "海景湾度假酒店",
        score: "4.8",
        location: "万山群岛 · 距离海滩200米",
        price: "688",
        image: "https://ai-public.mastergo.com/ai/img_res/b5b1594fa97ff73ddb1bf17fc90a7a62.jpg"
      },
      {
        name: "蓝湾精品酒店",
        score: "4.6",
        location: "万山群岛 · 商业中心区",
        price: "528",
        image: "https://ai-public.mastergo.com/ai/img_res/4330171583e81cbb88de3465393ec235.jpg"
      },
      {
        name: "阳光海岸度假公寓",
        score: "4.7",
        location: "万山群岛 · 临近码头",
        price: "458",
        image: "https://ai-public.mastergo.com/ai/img_res/58cf3d2730faf6aa3c2bab809d9811ca.jpg"
      }
    ]);
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999999"
        }),
        b: common_vendor.p({
          type: "mic-filled",
          size: "20",
          color: "#1B4B98"
        }),
        c: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#1B4B98"
        }),
        d: common_vendor.p({
          type: "person",
          size: "16",
          color: "#1B4B98"
        }),
        e: common_vendor.f(hotelList.value, (hotel, index, i0) => {
          return {
            a: hotel.image,
            b: common_vendor.t(hotel.name),
            c: common_vendor.t(hotel.score),
            d: common_vendor.f(5, (n, k1, i1) => {
              return {
                a: n,
                b: "6f18fadf-4-" + i0 + "-" + i1
              };
            }),
            e: "6f18fadf-5-" + i0,
            f: common_vendor.t(hotel.location),
            g: common_vendor.t(hotel.price),
            h: index
          };
        }),
        f: common_vendor.p({
          type: "star-filled",
          size: "14",
          color: "#FFCD3C"
        }),
        g: common_vendor.p({
          type: "location",
          size: "14",
          color: "#666666"
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/hotelBooking/hotelBooking.js.map
