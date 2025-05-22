   // @ts-ignore
import { ref } from 'vue';
import { defineStore } from 'pinia';

/**
 * @typedef {Object} UserInfo
 * @property {string} realname
 * @property {string} phone
 * @property {string} idCardNo
 */

export const useUserStore = defineStore('user', () => {
  /** @type {import('vue').Ref<UserInfo>} */
  const userInfo = ref({
    realname: '',
    phone: '',
    idCardNo: ''
  });

  function updateUserInfo(newUserInfo) {
    userInfo.value = newUserInfo;
  }

  // 获取token
  const token = ref('');
  function setToken(newToken) {
    token.value = newToken;
  }

  return { userInfo, updateUserInfo, token, setToken };
}, {
  persist: {
    storage: {
      getItem(key) {
        try {
          const value = uni.getStorageSync(key);
          return value;
        } catch (error) {
          console.error(`Error getting item from storage: ${key}, error:`, error);
        }
      },
      setItem(key, value) {
        try {
          console.log(`Setting item in storage: ${key}, value:`, value);
          uni.setStorageSync(key, value);
        } catch (error) {
          console.error(`Error setting item from storage: ${key}, error:`, error);
        }
      },
    }
  },
});
