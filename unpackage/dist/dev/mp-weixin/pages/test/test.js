"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      inputText: "",
      result: ""
    };
  },
  methods: {
    sendRequest() {
      if (!this.inputText.trim()) {
        this.result = "请输入内容再发送";
        return;
      }
      const url = "http://47.106.243.134:7181/island/front/ai/chat/chatMessage";
      const data = {
        conversation_id: "",
        inputs: {
          original_intention: "unknown",
          recommended_plan: "unknown"
        },
        query: this.inputText,
        user: "abc-123"
      };
      common_vendor.index.request({
        url,
        method: "POST",
        header: {
          "Content-Type": "application/json"
        },
        data: JSON.stringify(data),
        success: (res) => {
          if (res.data.success) {
            this.result = `成功：${JSON.stringify(res.data.result.answer)}`;
          } else {
            this.result = `失败：${res.data.message}`;
          }
        },
        fail: (err) => {
          this.result = `请求失败：${err.errMsg}`;
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.inputText,
    b: common_vendor.o(($event) => $data.inputText = $event.detail.value),
    c: common_vendor.o((...args) => $options.sendRequest && $options.sendRequest(...args)),
    d: common_vendor.t($data.result)
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/test/test.js.map
