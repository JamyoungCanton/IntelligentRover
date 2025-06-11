import { defineStore } from 'pinia';

export const useCommentStore = defineStore('comment', {
  state: () => ({
    pendingComment: {
      type: '',
      productId: ''
    }
  }),
  actions: {
    setPendingComment(type, productId) {
      this.pendingComment.type = type;
      this.pendingComment.productId = productId;
    },
    clearPendingComment() {
      this.pendingComment.type = '';
      this.pendingComment.productId = '';
    }
  }
});