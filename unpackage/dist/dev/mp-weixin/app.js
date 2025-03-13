"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/itinerary/itinerary.js";
  "./pages/oneCodePass/oneCodePass.js";
  "./pages/order/order.js";
  "./pages/my/my.js";
  "./pages/foodRecommendation/foodRecommendation.js";
  "./pages/chat/chat.js";
  "./pages/moreServices/moreServices.js";
  "./pages/transportationGuide/transportationGuide.js";
  "./pages/parkingFees/parkingFees.js";
  "./pages/ticketBooking/ticketBooking.js";
  "./pages/attractionGuide/attractionGuide.js";
  "./pages/hotelBooking/hotelBooking.js";
  "./pages/navbar/navbar.js";
  "./pages/ticketPoints/ticketPoints.js";
  "./pages/itineraryDetails/itineraryDetails.js";
  "./pages/itineraryEvaluation/itineraryEvaluation.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "App Launch");
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:7", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:10", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
