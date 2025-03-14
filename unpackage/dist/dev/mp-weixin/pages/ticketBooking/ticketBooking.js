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
  __name: "ticketBooking",
  setup(__props) {
    const tickets = common_vendor.ref([
      {
        time: "08:30 - 09:30",
        duration: "约 1 小时",
        shipName: "海钻号 · 豪华客轮",
        price: "¥ 138 起",
        remain: 42
      },
      {
        time: "10:30 - 11:30",
        duration: "约 1 小时",
        shipName: "海星号 · 豪华客轮",
        price: "¥ 138 起",
        remain: 28
      },
      {
        time: "14:30 - 15:30",
        duration: "约 1 小时",
        shipName: "海豚号 · 豪华客轮",
        price: "¥ 138 起",
        remain: 56
      }
    ]);
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "refresh",
          size: "24",
          color: "#ffffff"
        }),
        b: common_vendor.p({
          type: "loop",
          size: "20",
          color: "#0066CC"
        }),
        c: common_vendor.p({
          type: "filter",
          size: "16",
          color: "#666666"
        }),
        d: common_vendor.p({
          type: "down",
          size: "16",
          color: "#666666"
        }),
        e: common_vendor.p({
          type: "down",
          size: "16",
          color: "#666666"
        }),
        f: common_vendor.f(tickets.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.time),
            b: common_vendor.t(item.duration),
            c: common_vendor.t(item.shipName),
            d: common_vendor.t(item.price),
            e: common_vendor.t(item.remain),
            f: index
          };
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/ticketBooking/ticketBooking.js.map
