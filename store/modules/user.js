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
    avatar: '',
    username: '',
    phone: '',
    bio: '',
    gender: 0,
    birthday: '',
    email: '',
    realname: '',
    idCardNo: ''
  });

  function updateUserInfo(newUserInfo) {
    // 过滤掉 token 字段，避免 userInfo 里有 token
    const { token, ...pureUserInfo } = newUserInfo || {};
    userInfo.value = pureUserInfo;
  }

  // 获取token
  const token = ref('');
  function setToken(newToken) {
    token.value = newToken;
  }

  function clearUser() {
    token.value = '';
    userInfo.value = {
      avatar: '',
      username: '',
      phone: '',
      bio: '',
      gender: 0,
      birthday: '',
      email: '',
      realname: '',
      idCardNo: ''
    };
  }

  return { userInfo, updateUserInfo, token, setToken, clearUser };
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
