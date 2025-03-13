"use strict";
const common_vendor = require("../../common/vendor.js");
<<<<<<< HEAD
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const aiPopup = common_vendor.ref();
    const showAiDialog = () => {
      aiPopup.value.open();
    };
    const gridItems = [
      {
        image: "https://ai-public.mastergo.com/ai/img_res/298a09126b167b2389171cf1732d0efd.jpg",
        text: "景点攻略"
      },
      {
        image: "https://ai-public.mastergo.com/ai/img_res/67e82bbc342b0532a7d47d9a9495e4e6.jpg",
        text: "船票预订"
      },
      {
        image: "https://ai-public.mastergo.com/ai/img_res/a46f5a2748b96ebacfead5f2ce9a2d23.jpg",
        text: "美食推荐",
        path: "/pages/foodRecommendation/foodRecommendation"
      },
      {
        image: "https://ai-public.mastergo.com/ai/img_res/d4eaef4d2ae27ea58ef90ce8114cbbc0.jpg",
        text: "住宿预订"
      },
      {
        image: "https://ai-public.mastergo.com/ai/img_res/6e3b763c2b9b0240282a50a27279cc92.jpg",
        text: "停车收费"
      },
      {
        image: "https://ai-public.mastergo.com/ai/img_res/868a88ac3f0c7165d1ff7e4edcd8c6de.jpg",
        text: "小票积分"
      },
      {
        image: "https://ai-public.mastergo.com/ai/img_res/ff98fe41d0920a84166f2cb230b71b03.jpg",
        text: "交通指南"
      },
      {
        image: "https://ai-public.mastergo.com/ai/img_res/a23f3a06a4a4106ad0a8dbe37d4ba3c8.jpg",
        text: "更多服务"
      }
    ];
    const activities = [
      {
        image: "https://ai-public.mastergo.com/ai/img_res/8b2e19990586b743036f49f399c57074.jpg",
        title: "海钓体验",
        price: "¥288/人起"
      },
      {
        image: "https://ai-public.mastergo.com/ai/img_res/553e2a3f698900f0619f5ee2615903a9.jpg",
        title: "深潜探索",
        price: "¥368/人起"
      }
    ];
    const navigateTo = (path) => {
      common_vendor.index.navigateTo({
        url: path
=======
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const goToChat = () => {
      common_vendor.index.navigateTo({
        // 使用 uni.navigateTo 进行页面跳转
        url: "/pages/chat/chat"
>>>>>>> dc365678fe3177494b018fe3d2788f1c58f66a50
      });
    };
    return (_ctx, _cache) => {
      return {
<<<<<<< HEAD
        a: common_vendor.p({
          type: "spinner-cycle",
          size: "24",
          color: "#4CAF50"
        }),
        b: common_vendor.p({
          type: "spinner-cycle",
          size: "24",
          color: "#FFD700"
        }),
        c: common_vendor.p({
          type: "spinner-cycle",
          size: "24",
          color: "#FFD700"
        }),
        d: common_vendor.p({
          type: "spinner-cycle",
          size: "24",
          color: "#4CAF50"
        }),
        e: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999"
        }),
        f: common_vendor.f(gridItems, (item, index, i0) => {
          return {
            a: item.image,
            b: common_vendor.t(item.text),
            c: index,
            d: common_vendor.o(($event) => navigateTo(item.path), index)
          };
        }),
        g: common_vendor.f(activities, (activity, index, i0) => {
          return {
            a: activity.image,
            b: common_vendor.t(activity.title),
            c: common_vendor.t(activity.price),
            d: index
          };
        }),
        h: common_vendor.p({
          type: "spinner-cycle",
          size: "24",
          color: "#FFFFFF"
        }),
        i: common_vendor.o(showAiDialog)
      };
    };
  }
});
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
=======
        a: common_assets._imports_0,
        b: common_vendor.o(goToChat)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
>>>>>>> dc365678fe3177494b018fe3d2788f1c58f66a50
