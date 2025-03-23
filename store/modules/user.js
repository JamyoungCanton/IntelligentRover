console.log('user.js');
import { ref } from 'vue';

import { defineStore } from 'pinia';
export const useUserStore = defineStore('user', () => {
  const userInfo = ref({
    name: '张三',
    age: 18,
  });

  function updateUserInfo(newUserInfo) {
    userInfo.value = newUserInfo;
    console.log('userInfo', userInfo.value);
    
  }

  // 在 Store 初始化时手动存储初始值
  uni.setStorageSync('userInfo', JSON.stringify(userInfo.value));

  return { userInfo, updateUserInfo };
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