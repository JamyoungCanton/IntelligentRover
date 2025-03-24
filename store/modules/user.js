
import { ref } from 'vue';

import { defineStore } from 'pinia';
export const useUserStore = defineStore('user', () => {
  const userInfo = ref('');

  function updateUserInfo(newUserInfo) {
    userInfo.value = newUserInfo;
    
  }

  // 获取token
  const token = ref('');
  function setToken(newToken){
    token.value = newToken;
  }




  return { userInfo, updateUserInfo,token ,setToken };
}, {
  persist: {
    storage: {
      getItem(key) {
        try {
          const value = uni.getStorageSync(key);
          console.log(`Getting item from storage: ${key}, value:`, value);
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
          console.error(`Error setting item in storage: ${key}, error:`, error);
        }
      },
    }
  },
});