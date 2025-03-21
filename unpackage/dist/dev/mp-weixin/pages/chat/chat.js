"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  setup() {
    const inputMessage = common_vendor.ref("");
    const scrollTop = common_vendor.ref(0);
    const scrollIntoView = common_vendor.ref("");
    const categories = common_vendor.reactive([
      {
        id: "fishing",
        name: "海钓体验",
        icon: "/static/chat/fishing.jpg"
      },
      {
        id: "snorkeling",
        name: "浮潜探索",
        icon: "/static/chat/snorkeling.jpg"
      },
      {
        id: "family",
        name: "亲子娱乐",
        icon: "/static/chat/family.jpg"
      },
      {
        id: "leisure",
        name: "休闲畅游",
        icon: "/static/chat/leisure.jpg"
      },
      {
        id: "island",
        name: "海岛介绍",
        icon: "/static/chat/island.jpg"
      }
    ]);
    const chatMessages = common_vendor.reactive([
      {
        type: "user",
        content: "我想了解海钓体验的详细行程"
      },
      {
        type: "ai",
        image: true,
        itinerary: {
          title: "海钓体验行程安排",
          schedule: [
            { time: "上午", detail: '抵达海岛，前往<span class="highlight">海钓基地A</span>，享受专业海钓服务。' },
            { time: "中午", detail: '在<span class="highlight">海钓餐厅</span>享用海鲜午餐。' },
            { time: "下午", detail: '继续海钓，或参观<span class="highlight">海岛渔村</span>。' },
            { time: "晚上", detail: '返回<span class="highlight">海景酒店B</span>休息。' }
          ],
          recommendations: [
            { place: "海钓基地A", description: "提供专业设备租赁和导游服务。" },
            { place: "海钓餐厅", description: "特色海鲜套餐，价格区间: 200-300元/人。" },
            { place: "海景酒店B", description: "舒适海景房，价格: 500元/晚。" }
          ],
          price: {
            amount: "988",
            details: "含往返交通、住宿、活动费用",
            discount: "428"
          }
        }
      }
    ]);
    common_vendor.ref("");
    const selectCategory = (categoryId) => {
      common_vendor.index.__f__("log", "at pages/chat/chat.vue:220", "Selected category:", categoryId);
      chatMessages.push({
        type: "user",
        content: `我想了解${getCategoryName(categoryId)}的详细信息`
      });
      scrollToLatestMessage();
    };
    const getCategoryName = (categoryId) => {
      const category = categories.find((item) => item.id === categoryId);
      return category ? category.name : "";
    };
    const sendMessage = () => {
      if (!inputMessage.value.trim())
        return;
      chatMessages.push({
        type: "user",
        content: inputMessage.value
      });
      inputMessage.value = "";
      scrollToLatestMessage();
      callAIInterface(chatMessages[chatMessages.length - 1].content);
    };
    const callAIInterface = (userQuery) => {
      const url = "http://47.106.243.134:7181/island/front/ai/chat/chatMessage-stream";
      const data = {
        conversation_id: "",
        inputs: {
          original_intention: "unknown",
          recommended_plan: "unknown"
        },
        query: userQuery,
        user: "abc-123"
      };
      const requestTask = common_vendor.index.request({
        url,
        method: "POST",
        header: {
          "Content-Type": "application/json"
        },
        data: JSON.stringify(data),
        responseType: "text",
        // 设置响应类型为文本
        enableChunked: true,
        // 启用分块传输模式
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/chat/chat.vue:269", "请求成功:", res);
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/chat/chat.vue:272", "请求失败:", err);
          chatMessages.push({
            type: "ai",
            content: "请求失败:很抱歉，我暂时无法回答您的问题，请稍后再试。"
          });
          scrollToLatestMessage();
        }
      });
      requestTask.onChunkReceived((res) => {
        try {
          const uint8Array = new Uint8Array(res.data);
          const decoder = new TextDecoder("utf-8");
          const text = decoder.decode(uint8Array);
          if (text.startsWith("data:")) {
            const jsonStr = text.substring(5).trim();
            try {
              const jsonData = JSON.parse(jsonStr);
              common_vendor.index.__f__("log", "at pages/chat/chat.vue:297", "解析到的JSON数据:", jsonData);
              if (jsonData.event === "message" && jsonData.answer !== void 0) {
                const decodedAnswer = decodeUnicode(jsonData.answer);
                common_vendor.index.__f__("log", "at pages/chat/chat.vue:303", "解码后的答案:", decodedAnswer);
                const aiMessage = chatMessages[chatMessages.length - 1];
                aiMessage.content = (aiMessage.content || "") + decodedAnswer;
                scrollToLatestMessage();
              } else if (jsonData.event === "node_finished") {
                messageComplete.value = true;
                common_vendor.index.__f__("log", "at pages/chat/chat.vue:317", "对话完成");
              }
            } catch (jsonError) {
              common_vendor.index.__f__("warn", "at pages/chat/chat.vue:320", "JSON解析错误:", jsonError);
            }
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/chat/chat.vue:324", "数据处理失败:", e);
        }
      });
    };
    const decodeUnicode = (str) => {
      if (!str)
        return "";
      try {
        if (typeof str === "string") {
          return str.replace(
            /\\u([0-9a-fA-F]{4})/g,
            (_, hex) => String.fromCharCode(parseInt(hex, 16))
          );
        }
        return str;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:359", "Unicode 解码失败:", e);
        return str;
      }
    };
    const formatResponse = (responseText) => {
      let formattedText = responseText.replace(/\n/g, "<br>");
      return formattedText;
    };
    const navigatortopaymoent = () => {
      common_vendor.index.navigateTo({
        url: "/pages/payment/payment"
      });
    };
    const scrollToLatestMessage = () => {
      common_vendor.nextTick$1(() => {
        const lastIndex = chatMessages.length;
        scrollIntoView.value = `msg-${lastIndex}`;
      });
    };
    const formatItineraryText = (text) => {
      return text;
    };
    const goBack = () => {
      common_vendor.index.navigateBack({
        delta: 1
      });
    };
    const showMore = () => {
      common_vendor.index.showActionSheet({
        itemList: ["清空聊天记录", "设置", "关于"],
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/chat/chat.vue:402", "Selected option:", res.tapIndex);
        }
      });
    };
    const showAddOptions = () => {
      common_vendor.index.showActionSheet({
        itemList: ["拍照", "从相册选择", "位置"],
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/chat/chat.vue:411", "Selected option:", res.tapIndex);
        }
      });
    };
    common_vendor.onMounted(() => {
      scrollToLatestMessage();
    });
    return {
      inputMessage,
      scrollTop,
      scrollIntoView,
      categories,
      chatMessages,
      selectCategory,
      getCategoryName,
      sendMessage,
      navigatortopaymoent,
      formatResponse,
      formatItineraryText,
      goBack,
      showMore,
      showAddOptions
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $setup.goBack && $setup.goBack(...args)),
    c: common_assets._imports_1$1,
    d: common_vendor.o((...args) => $setup.showMore && $setup.showMore(...args)),
    e: common_assets._imports_2,
    f: common_vendor.f($setup.categories, (item, index, i0) => {
      return {
        a: item.icon,
        b: common_vendor.t(item.name),
        c: index,
        d: common_vendor.o(() => $setup.selectCategory(item.id), index)
      };
    }),
    g: common_vendor.f($setup.chatMessages, (msg, index, i0) => {
      return common_vendor.e({
        a: msg.type === "user"
      }, msg.type === "user" ? {
        b: common_assets._imports_3$1,
        c: common_vendor.t(msg.content),
        d: `msg-${index + 1}`
      } : common_vendor.e({
        e: common_assets._imports_2,
        f: msg.image
      }, msg.image ? {
        g: common_assets._imports_4$1
      } : {}, {
        h: msg.content
      }, msg.content ? {
        i: msg.content
      } : {}, {
        j: msg.itinerary
      }, msg.itinerary ? common_vendor.e({
        k: common_vendor.t(msg.itinerary.title),
        l: common_vendor.f(msg.itinerary.schedule, (item, idx, i1) => {
          return {
            a: common_vendor.t(item.time),
            b: $setup.formatItineraryText(item.detail),
            c: idx
          };
        }),
        m: msg.itinerary.recommendations
      }, msg.itinerary.recommendations ? {
        n: common_vendor.f(msg.itinerary.recommendations, (rec, idx, i1) => {
          return {
            a: common_vendor.t(rec.place),
            b: common_vendor.t(rec.description),
            c: idx
          };
        })
      } : {}, {
        o: msg.itinerary.price
      }, msg.itinerary.price ? common_vendor.e({
        p: common_vendor.t(msg.itinerary.price.amount),
        q: common_vendor.t(msg.itinerary.price.details),
        r: msg.itinerary.price.discount
      }, msg.itinerary.price.discount ? {
        s: common_vendor.t(msg.itinerary.price.discount)
      } : {}) : {}, {
        t: msg.itinerary.price
      }, msg.itinerary.price ? {
        v: common_vendor.o((...args) => $setup.navigatortopaymoent && $setup.navigatortopaymoent(...args), index)
      } : {}) : {}, {
        w: `msg-${index + 1}`
      }), {
        x: index
      });
    }),
    h: $setup.scrollTop,
    i: $setup.scrollIntoView,
    j: common_vendor.o((...args) => $setup.showAddOptions && $setup.showAddOptions(...args)),
    k: common_vendor.o((...args) => $setup.sendMessage && $setup.sendMessage(...args)),
    l: $setup.inputMessage,
    m: common_vendor.o(($event) => $setup.inputMessage = $event.detail.value),
    n: common_vendor.o((...args) => $setup.sendMessage && $setup.sendMessage(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/chat/chat.js.map
